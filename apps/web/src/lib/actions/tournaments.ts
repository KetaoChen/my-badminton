"use server";

import { db, schema } from "@my-badminton/db/client";
import { desc, eq } from "drizzle-orm";

import { requireAuth } from "@/lib/auth";

export async function listTournaments() {
  const userId = await requireAuth();
  return db
    .select()
    .from(schema.tournaments)
    .where(eq(schema.tournaments.userId, userId))
    .orderBy(desc(schema.tournaments.createdAt));
}

