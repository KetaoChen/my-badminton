import { db, schema } from "@my-badminton/db/client";
import { and, desc, eq, or } from "drizzle-orm";

import { requireAuth } from "@/lib/auth";

export async function getAnalysisFilters() {
  const userId = await requireAuth();
  const opponents = await db
    .select({
      id: schema.opponents.id,
      name: schema.opponents.name,
    })
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

  const tournaments = await db
    .select({
      id: schema.tournaments.id,
      name: schema.tournaments.name,
    })
    .from(schema.tournaments)
    .where(eq(schema.tournaments.userId, userId))
    .orderBy(desc(schema.tournaments.createdAt))
    .limit(50);

  return { opponents, tournaments };
}

