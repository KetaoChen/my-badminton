import { db, schema } from "@my-badminton/db/client";
import { desc, eq, or } from "drizzle-orm";

export async function getAnalysisFilters() {
  const opponents = await db
    .select({
      id: schema.opponents.id,
      name: schema.opponents.name,
    })
    .from(schema.opponents)
    .where(
      or(
        eq(schema.opponents.training, true),
        eq(schema.opponents.notes, "训练对手")
      )
    )
    .orderBy(desc(schema.opponents.createdAt));

  const tournaments = await db
    .select({
      id: schema.tournaments.id,
      name: schema.tournaments.name,
    })
    .from(schema.tournaments)
    .orderBy(desc(schema.tournaments.createdAt))
    .limit(50);

  return { opponents, tournaments };
}

