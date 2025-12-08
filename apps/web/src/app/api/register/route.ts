import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

import { db, schema } from "@my-badminton/db/client";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const username =
    typeof body?.username === "string" ? body.username.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!username || !password) {
    return NextResponse.json({ error: "用户名和密码必填" }, { status: 400 });
  }

  const [existing] =
    (await db
      .select({ id: schema.users.id })
      .from(schema.users)
      .where(eq(schema.users.username, username))
      .limit(1)) ?? [];

  if (existing) {
    return NextResponse.json({ error: "用户名已存在" }, { status: 409 });
  }

  const hash = await bcrypt.hash(password, 10);
  await db.insert(schema.users).values({
    username,
    passwordHash: hash,
  });

  return NextResponse.json({ ok: true });
}
