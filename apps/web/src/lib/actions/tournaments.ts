"use server";

import { db, schema } from "@my-badminton/db/client";
import { desc } from "drizzle-orm";

export async function listTournaments() {
  return db
    .select()
    .from(schema.tournaments)
    .orderBy(desc(schema.tournaments.createdAt));
}

