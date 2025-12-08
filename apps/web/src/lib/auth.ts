import { db, schema } from "@my-badminton/db/client";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import NextAuth, { type AuthOptions, type Session } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getServerSession } from "next-auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "用户名", type: "text" },
        password: { label: "密码", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials?.username || !credentials.password) return null;
        const [user] =
          (await db
            .select()
            .from(schema.users)
            .where(eq(schema.users.username, credentials.username))
            .limit(1)) ?? [];

        if (!user) return null;
        const ok = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );
        if (!ok) return null;
        return { id: user.id, name: user.username };
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (token?.id && session.user) {
        (session.user as Session["user"] & { id: string }).id =
          token.id as string;
      }
      return session;
    },
  },
};

export const authHandler = NextAuth(authOptions);

export async function requireAuth() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    const currentUrl = (await headers()).get("referer") ?? "/";
    const loginUrl = new URL(
      "/login",
      process.env.NEXTAUTH_URL || "http://localhost:3000"
    );
    loginUrl.searchParams.set("callbackUrl", currentUrl);
    redirect(loginUrl.toString());
  }
  return userId;
}
