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
      opponentName: sql<string>`coalesce(${schema.opponents.name}, ${schema.matches.opponent})`,
      serve: sql<number>`avg(${schema.rallies.serveScore})`,
      tactic: sql<number>`avg(${schema.rallies.tacticUsed}::int)`,
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
      schema.opponents.name,
      schema.matches.opponent
    )
    .orderBy(
      sql`coalesce(${schema.matches.matchDate}, ${schema.matches.createdAt}) asc`
    )
    .limit(200);
}

