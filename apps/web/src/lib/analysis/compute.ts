import { db, schema } from "@my-badminton/db/client";
import { and, eq, sql } from "drizzle-orm";

import { requireAuth } from "@/lib/auth";
import { abilitySeriesQuery } from "./series";

type Condition = Parameters<typeof and>[number];

export type AnalysisFilters = {
  tournamentOnly?: boolean;
  tournamentId?: string;
  opponentId?: string;
  startDate?: string;
  endDate?: string;
};

export async function getAnalysis(filters: AnalysisFilters) {
  const userId = await requireAuth();
  const conditions: Condition[] = [];
  conditions.push(eq(schema.matches.userId, userId));
  if (filters.tournamentId) {
    conditions.push(eq(schema.matches.tournamentId, filters.tournamentId));
  }
  if (filters.opponentId) {
    conditions.push(eq(schema.matches.opponentId, filters.opponentId));
  }
  if (filters.startDate) {
    conditions.push(
      sql`coalesce(${schema.matches.matchDate}, ${schema.matches.createdAt}) >= ${filters.startDate}`
    );
  }
  if (filters.endDate) {
    conditions.push(
      sql`coalesce(${schema.matches.matchDate}, ${schema.matches.createdAt}) <= ${filters.endDate}`
    );
  }

  const whereMatches = conditions.length > 0 ? and(...conditions) : undefined;
  const rallyScored = eq(schema.rallies.excludeFromScore, false);
  const rallyWhere =
    whereMatches === undefined ? rallyScored : and(whereMatches, rallyScored);

  const matchOutcomes =
    (await db
      .select({
        matchId: schema.matches.id,
        wins: sql<number>`sum(case when ${schema.rallies.result} = 'win' then 1 else 0 end)`,
        losses: sql<number>`sum(case when ${schema.rallies.result} = 'lose' then 1 else 0 end)`,
      })
      .from(schema.matches)
      .leftJoin(schema.rallies, eq(schema.matches.id, schema.rallies.matchId))
      .where(rallyWhere)
      .groupBy(schema.matches.id)) ?? [];

  const abilitySeries = await abilitySeriesQuery(conditions);
  const matchOutcomeMap = new Map<string, { wins: number; losses: number }>();
  for (const m of matchOutcomes) {
    matchOutcomeMap.set(m.matchId, {
      wins: Number(m.wins ?? 0),
      losses: Number(m.losses ?? 0),
    });
  }

  const winWhere =
    whereMatches === undefined
      ? and(eq(schema.rallies.result, "win"), rallyScored)
      : and(eq(schema.rallies.result, "win"), rallyScored, whereMatches);

  const loseWhere =
    whereMatches === undefined
      ? and(eq(schema.rallies.result, "lose"), rallyScored)
      : and(eq(schema.rallies.result, "lose"), rallyScored, whereMatches);

  const winTotalsByMatch = await db
    .select({
      matchId: schema.rallies.matchId,
      total: sql<number>`count(*)`,
    })
    .from(schema.rallies)
    .innerJoin(schema.matches, eq(schema.matches.id, schema.rallies.matchId))
    .where(winWhere)
    .groupBy(schema.rallies.matchId);

  const winByMatchReason = await db
    .select({
      matchId: schema.rallies.matchId,
      reason: schema.rallies.pointReason,
      count: sql<number>`count(*)`,
    })
    .from(schema.rallies)
    .innerJoin(schema.matches, eq(schema.matches.id, schema.rallies.matchId))
    .where(winWhere)
    .groupBy(schema.rallies.matchId, schema.rallies.pointReason);

  const loseTotalsByMatch = await db
    .select({
      matchId: schema.rallies.matchId,
      total: sql<number>`count(*)`,
    })
    .from(schema.rallies)
    .innerJoin(schema.matches, eq(schema.matches.id, schema.rallies.matchId))
    .where(loseWhere)
    .groupBy(schema.rallies.matchId);

  const loseByMatchReason = await db
    .select({
      matchId: schema.rallies.matchId,
      reason: schema.rallies.pointReason,
      count: sql<number>`count(*)`,
    })
    .from(schema.rallies)
    .innerJoin(schema.matches, eq(schema.matches.id, schema.rallies.matchId))
    .where(loseWhere)
    .groupBy(schema.rallies.matchId, schema.rallies.pointReason);

  const winTotalMap = new Map<string, number>();
  for (const row of winTotalsByMatch) {
    winTotalMap.set(row.matchId, Number(row.total ?? 0));
  }

  const loseTotalMap = new Map<string, number>();
  for (const row of loseTotalsByMatch) {
    loseTotalMap.set(row.matchId, Number(row.total ?? 0));
  }

  const winShareByMatchReason = new Map<string, Map<string, number>>();
  for (const row of winByMatchReason) {
    const total = winTotalMap.get(row.matchId) ?? 0;
    if (total === 0) continue;
    const key = row.reason ?? "未填写";
    const map = winShareByMatchReason.get(row.matchId) ?? new Map();
    map.set(key, Number(row.count ?? 0) / total);
    winShareByMatchReason.set(row.matchId, map);
  }

  const loseShareByMatchReason = new Map<string, Map<string, number>>();
  for (const row of loseByMatchReason) {
    const total = loseTotalMap.get(row.matchId) ?? 0;
    if (total === 0) continue;
    const key = row.reason ?? "未填写";
    const map = loseShareByMatchReason.get(row.matchId) ?? new Map();
    map.set(key, Number(row.count ?? 0) / total);
    loseShareByMatchReason.set(row.matchId, map);
  }

  const errorCountByMatch = await db
    .select({
      matchId: schema.rallies.matchId,
      count: sql<number>`count(*)`,
    })
    .from(schema.rallies)
    .innerJoin(schema.matches, eq(schema.matches.id, schema.rallies.matchId))
    .where(
      whereMatches === undefined
        ? and(
            eq(schema.rallies.result, "lose"),
            eq(schema.rallies.pointReason, "我方失误"),
            rallyScored
          )
        : and(
            eq(schema.rallies.result, "lose"),
            eq(schema.rallies.pointReason, "我方失误"),
            rallyScored,
            whereMatches
          )
    )
    .groupBy(schema.rallies.matchId);

  const errorCountMap = new Map<string, number>();
  for (const row of errorCountByMatch) {
    errorCountMap.set(row.matchId, Number(row.count ?? 0));
  }

  const matches = abilitySeries.map((m) => {
    const outcome = matchOutcomeMap.get(m.id) ?? { wins: 0, losses: 0 };
    const winTotal = winTotalMap.get(m.id) ?? 0;
    const loseTotal = loseTotalMap.get(m.id) ?? 0;
    const winReasonsMap = winShareByMatchReason.get(m.id) ?? new Map();
    const loseReasonsMap = loseShareByMatchReason.get(m.id) ?? new Map();
    const errorCount = errorCountMap.get(m.id) ?? 0;
    return {
      id: m.id,
      title: m.title,
      matchDate: m.matchDate,
      matchNumber: m.matchNumber ?? null,
      opponentName: m.opponentName ?? "未填写",
      wins: outcome.wins,
      losses: outcome.losses,
      total: outcome.wins + outcome.losses,
      winTotal,
      loseTotal,
      winReasons: Object.fromEntries(
        Array.from(winReasonsMap.entries()).map(([key, val]) => [key, val])
      ),
      loseReasons: Object.fromEntries(
        Array.from(loseReasonsMap.entries()).map(([key, val]) => [key, val])
      ),
      serveSum: Number(m.serveSum ?? 0),
      serveCount: Number(m.serveCount ?? 0),
      tacticSum: Number(m.tacticSum ?? 0),
      tacticCount: Number(m.tacticCount ?? 0),
      errorCount,
    };
  });

  return {
    matches,
  };
}
