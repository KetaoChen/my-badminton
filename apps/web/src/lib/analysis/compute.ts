import { db, schema } from "@my-badminton/db/client";
import { and, desc, eq, sql } from "drizzle-orm";

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

  const [totals] =
    (await db
      .select({
        matchCount: sql<number>`count(distinct ${schema.matches.id})`,
        rallyCount: sql<number>`count(${schema.rallies.id})`,
        wins: sql<number>`sum(case when ${schema.rallies.result} = 'win' then 1 else 0 end)`,
        losses: sql<number>`sum(case when ${schema.rallies.result} = 'lose' then 1 else 0 end)`,
      })
      .from(schema.rallies)
      .innerJoin(schema.matches, eq(schema.matches.id, schema.rallies.matchId))
      .where(rallyWhere)) ?? [];

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

  const [abilities] =
    (await db
      .select({
        serve: sql<number>`avg(${schema.rallies.serveScore})`,
        tactic: sql<number>`avg(${schema.rallies.tacticUsed}::int)`,
      })
      .from(schema.rallies)
      .innerJoin(schema.matches, eq(schema.matches.id, schema.rallies.matchId))
      .where(rallyWhere)) ?? [];

  const opponentStats = await db
    .select({
      opponentId: schema.matches.opponentId,
      opponentName: sql<string>`coalesce(${schema.opponents.name}, ${schema.matches.opponent})`,
      wins: sql<number>`sum(case when ${schema.rallies.result} = 'win' then 1 else 0 end)`,
      losses: sql<number>`sum(case when ${schema.rallies.result} = 'lose' then 1 else 0 end)`,
      total: sql<number>`count(*)`,
    })
    .from(schema.rallies)
    .innerJoin(schema.matches, eq(schema.matches.id, schema.rallies.matchId))
    .leftJoin(
      schema.opponents,
      eq(schema.opponents.id, schema.matches.opponentId)
    )
    .where(rallyWhere)
    .groupBy(
      schema.matches.opponentId,
      schema.opponents.name,
      schema.matches.opponent
    )
    .orderBy(desc(sql<number>`count(*)`))
    .limit(10);

  const abilitySeries = await abilitySeriesQuery(conditions);

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

  const totalWinPoints =
    winTotalsByMatch.reduce((acc, row) => acc + Number(row.total ?? 0), 0) || 0;
  const totalLosePoints =
    loseTotalsByMatch.reduce((acc, row) => acc + Number(row.total ?? 0), 0) ||
    0;

  const winReasonTotals = new Map<string, number>();
  for (const row of winByMatchReason) {
    const key = row.reason ?? "未填写";
    winReasonTotals.set(
      key,
      (winReasonTotals.get(key) ?? 0) + Number(row.count ?? 0)
    );
  }

  const loseReasonTotals = new Map<string, number>();
  for (const row of loseByMatchReason) {
    const key = row.reason ?? "未填写";
    loseReasonTotals.set(
      key,
      (loseReasonTotals.get(key) ?? 0) + Number(row.count ?? 0)
    );
  }

  const winReasonShares = Array.from(winReasonTotals.entries()).map(
    ([reason, count]) => ({
      reason,
      avgShare: totalWinPoints === 0 ? 0 : count / totalWinPoints,
      matches: winTotalsByMatch.length,
    })
  );

  const loseReasonShares = Array.from(loseReasonTotals.entries()).map(
    ([reason, count]) => ({
      reason,
      avgShare: totalLosePoints === 0 ? 0 : count / totalLosePoints,
      matches: loseTotalsByMatch.length,
    })
  );

  const reasonColors = [
    "#0ea5e9",
    "#22c55e",
    "#f59e0b",
    "#6366f1",
    "#ef4444",
    "#14b8a6",
  ];

  const topWinReasons = [...winReasonShares]
    .sort((a, b) => b.avgShare - a.avgShare)
    .slice(0, 5);
  const topLoseReasons = [...loseReasonShares]
    .sort((a, b) => b.avgShare - a.avgShare)
    .slice(0, 5);

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

  const labelForMatch = (m: { matchDate: string | null; title: string }) =>
    `${m.matchDate ?? "无日期"} · ${m.title}`;

  const winReasonSeries = topWinReasons.map((r, idx) => ({
    label: r.reason,
    color: reasonColors[idx % reasonColors.length],
    points: abilitySeries.map((m) => ({
      label: labelForMatch(m),
      value: winShareByMatchReason.get(m.id)?.get(r.reason) ?? 0,
    })),
  }));

  const loseReasonSeries = topLoseReasons.map((r, idx) => ({
    label: r.reason,
    color: reasonColors[idx % reasonColors.length],
    points: abilitySeries.map((m) => ({
      label: labelForMatch(m),
      value: loseShareByMatchReason.get(m.id)?.get(r.reason) ?? 0,
    })),
  }));

  const rallyCount = Number(totals?.rallyCount ?? 0);
  const wins = Number(totals?.wins ?? 0);
  const losses = Number(totals?.losses ?? 0);

  let matchWins = 0;
  let matchLosses = 0;
  for (const m of matchOutcomes) {
    const mw = Number(m.wins ?? 0);
    const ml = Number(m.losses ?? 0);
    if (mw > ml) matchWins += 1;
    else if (ml > mw) matchLosses += 1;
  }
  const matchCount = Number(totals?.matchCount ?? 0);
  const winRate =
    matchCount === 0 ? 0 : Math.round((matchWins / matchCount) * 1000) / 10;

  return {
    matchCount,
    matchWins,
    matchLosses,
    rallyCount,
    wins,
    losses,
    winRate,
    winReasonShares,
    loseReasonShares,
    winReasonSeries,
    loseReasonSeries,
    abilities: {
      serve: Number(abilities?.serve ?? 0),
      tactic: Number(abilities?.tactic ?? 0),
    },
    opponentStats: opponentStats.map((o) => ({
      opponentId: o.opponentId,
      opponentName: o.opponentName ?? "未填写",
      wins: Number(o.wins ?? 0),
      losses: Number(o.losses ?? 0),
      total: Number(o.total ?? 0),
      winRate:
        Number(o.total ?? 0) === 0
          ? 0
          : Math.round((Number(o.wins ?? 0) / Number(o.total ?? 1)) * 1000) / 10,
    })),
    abilityTimeSeries: abilitySeries.map((m) => ({
      id: m.id,
      title: m.title,
      matchDate: m.matchDate,
      opponentName: m.opponentName ?? "未填写",
      serve: Number(m.serve ?? 0),
      tactic: Number(m.tactic ?? 0),
    })),
  };
}

