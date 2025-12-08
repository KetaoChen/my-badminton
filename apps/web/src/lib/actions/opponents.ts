"use server";

import { db, schema } from "@my-badminton/db/client";
import { and, desc, eq, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { requireAuth } from "@/lib/auth";
import { opponentFormSchema } from "./schemas";

export async function listOpponents() {
  const userId = await requireAuth();
  return db
    .select()
    .from(schema.opponents)
    .where(
      and(
        or(
          eq(schema.opponents.training, true),
          eq(schema.opponents.notes, "训练对手")
        ),
        eq(schema.opponents.userId, userId)
      )
    )
    .orderBy(desc(schema.opponents.createdAt));
}

export async function createOpponent(formData: FormData): Promise<void> {
  const userId = await requireAuth();
  const parsed = opponentFormSchema.safeParse({
    name: formData.get("name"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    console.error(parsed.error.flatten().formErrors);
    return;
  }

  const { name, notes } = parsed.data;

  await db.insert(schema.opponents).values({
    name,
    notes: notes || null,
    userId,
  });

  revalidatePath("/");
}

