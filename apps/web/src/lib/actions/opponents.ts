"use server";

import { db, schema } from "@my-badminton/db/client";
import { desc, eq, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { opponentFormSchema } from "./schemas";

export async function listOpponents() {
  return db
    .select()
    .from(schema.opponents)
    .where(
      or(
        eq(schema.opponents.training, true),
        eq(schema.opponents.notes, "训练对手")
      )
    )
    .orderBy(desc(schema.opponents.createdAt));
}

export async function createOpponent(formData: FormData): Promise<void> {
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
  });

  revalidatePath("/");
}

