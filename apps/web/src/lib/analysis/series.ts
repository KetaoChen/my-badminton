import { db, schema } from "@my-badminton/db/client";
import { and, eq, sql } from "drizzle-orm";

type Condition = Parameters<typeof and>[number];

export function abilitySeriesQuery(conditions: Condition[]) {
  const whereMatches = conditions.length > 0 ? and(...conditions) : undefined;
  const rallyScored = eq(schema.rallies.excludeFromScore, false);
  const rallyWhere =
    whereMatches === undefined ? rallyScored : and(whereMatches, rallyScored);
  return db
    .select({
      id: schema.matches.id,
      title: schema.matches.title,
      matchDate: schema.matches.matchDate,
      matchNumber: schema.matches.matchNumber,
      opponentName: sql<string>`coalesce(${schema.opponents.name}, ${schema.matches.opponent})`,
      serveAvg: sql<number>`avg(${schema.rallies.serveScore})`,
      serveSum: sql<number>`sum(${schema.rallies.serveScore})`,
      serveCount: sql<number>`count(${schema.rallies.serveScore})`,
      tacticAvg: sql<number>`avg(${schema.rallies.tacticUsed}::int)`,
      tacticSum: sql<number>`sum(${schema.rallies.tacticUsed}::int)`,
      tacticCount: sql<number>`count(${schema.rallies.tacticUsed}::int)`,
    })
    .from(schema.rallies)
    .innerJoin(schema.matches, eq(schema.matches.id, schema.rallies.matchId))
    .leftJoin(
      schema.opponents,
      eq(schema.opponents.id, schema.matches.opponentId)
    )
    .where(rallyWhere)
    .groupBy(
      schema.matches.id,
      schema.matches.title,
      schema.matches.matchDate,
      schema.matches.matchNumber,
      schema.opponents.name,
      schema.matches.opponent
    )
    .orderBy(
      sql`coalesce(${schema.matches.matchDate}, ${schema.matches.createdAt}) asc`,
      schema.matches.matchNumber
    )
    .limit(200);
}
