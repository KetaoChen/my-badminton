import { db, schema } from "@my-badminton/db/client";
import { and, desc, eq, or, sql } from "drizzle-orm";

type Condition = Parameters<typeof and>[number];

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

export type AnalysisFilters = {
  tournamentOnly?: boolean;
  tournamentId?: string;
  opponentId?: string;
  startDate?: string;
  endDate?: string;
};

export async function getAnalysis(filters: AnalysisFilters) {
  const conditions: Condition[] = [];
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

  // Basic counts
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
      .where(whereMatches)) ?? [];

  const matchOutcomes =
    (await db
      .select({
        matchId: schema.matches.id,
        wins: sql<number>`sum(case when ${schema.rallies.result} = 'win' then 1 else 0 end)`,
        losses: sql<number>`sum(case when ${schema.rallies.result} = 'lose' then 1 else 0 end)`,
      })
      .from(schema.matches)
      .leftJoin(schema.rallies, eq(schema.matches.id, schema.rallies.matchId))
      .where(whereMatches)
      .groupBy(schema.matches.id)) ?? [];

  // Ability averages
  const [abilities] =
    (await db
      .select({
        serve: sql<number>`avg(${schema.rallies.serveScore})`,
        placement: sql<number>`avg(${schema.rallies.placementScore})`,
        footwork: sql<number>`avg(${schema.rallies.footworkScore})`,
        tactic: sql<number>`avg(${schema.rallies.tacticScore})`,
      })
      .from(schema.rallies)
      .innerJoin(schema.matches, eq(schema.matches.id, schema.rallies.matchId))
      .where(whereMatches)) ?? [];

  // Opponent stats
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
    .where(whereMatches)
    .groupBy(
      schema.matches.opponentId,
      schema.opponents.name,
      schema.matches.opponent
    )
    .orderBy(desc(sql<number>`count(*)`))
    .limit(10);

  const abilitySeries = await abilitySeriesQuery(conditions);

  // Reason share averages per match (win)
  const winWhere =
    whereMatches === undefined
      ? eq(schema.rallies.result, "win")
      : and(eq(schema.rallies.result, "win"), whereMatches);

  const loseWhere =
    whereMatches === undefined
      ? eq(schema.rallies.result, "lose")
      : and(eq(schema.rallies.result, "lose"), whereMatches);

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

  const winShareMap = new Map<string, { sumShare: number; matches: number }>();
  for (const row of winByMatchReason) {
    const total = winTotalMap.get(row.matchId) ?? 0;
    if (total === 0) continue;
    const share = Number(row.count ?? 0) / total;
    const key = row.reason ?? "未填写";
    const prev = winShareMap.get(key) ?? { sumShare: 0, matches: 0 };
    winShareMap.set(key, {
      sumShare: prev.sumShare + share,
      matches: prev.matches + 1,
    });
  }

  const loseShareMap = new Map<string, { sumShare: number; matches: number }>();
  for (const row of loseByMatchReason) {
    const total = loseTotalMap.get(row.matchId) ?? 0;
    if (total === 0) continue;
    const share = Number(row.count ?? 0) / total;
    const key = row.reason ?? "未填写";
    const prev = loseShareMap.get(key) ?? { sumShare: 0, matches: 0 };
    loseShareMap.set(key, {
      sumShare: prev.sumShare + share,
      matches: prev.matches + 1,
    });
  }

  const winReasonShares = Array.from(winShareMap.entries()).map(
    ([reason, { sumShare, matches }]) => ({
      reason,
      avgShare: matches === 0 ? 0 : sumShare / matches,
      matches,
    })
  );

  const loseReasonShares = Array.from(loseShareMap.entries()).map(
    ([reason, { sumShare, matches }]) => ({
      reason,
      avgShare: matches === 0 ? 0 : sumShare / matches,
      matches,
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

  const winReasonSeries = topWinReasons.map((r, idx) => ({
    label: r.reason,
    color: reasonColors[idx % reasonColors.length],
    points: abilitySeries.map((m) => ({
      label: m.matchDate ?? m.title,
      value: winShareByMatchReason.get(m.id)?.get(r.reason) ?? 0,
    })),
  }));

  const loseReasonSeries = topLoseReasons.map((r, idx) => ({
    label: r.reason,
    color: reasonColors[idx % reasonColors.length],
    points: abilitySeries.map((m) => ({
      label: m.matchDate ?? m.title,
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
      placement: Number(abilities?.placement ?? 0),
      footwork: Number(abilities?.footwork ?? 0),
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
          : Math.round((Number(o.wins ?? 0) / Number(o.total ?? 1)) * 1000) /
            10,
    })),
    abilityTimeSeries: abilitySeries.map((m) => ({
      id: m.id,
      title: m.title,
      matchDate: m.matchDate,
      opponentName: m.opponentName ?? "未填写",
      serve: Number(m.serve ?? 0),
      placement: Number(m.placement ?? 0),
      footwork: Number(m.footwork ?? 0),
      tactic: Number(m.tactic ?? 0),
    })),
  };
}

function abilitySeriesQuery(conditions: Condition[]) {
  const whereMatches = conditions.length > 0 ? and(...conditions) : undefined;
  return db
    .select({
      id: schema.matches.id,
      title: schema.matches.title,
      matchDate: schema.matches.matchDate,
      opponentName: sql<string>`coalesce(${schema.opponents.name}, ${schema.matches.opponent})`,
      serve: sql<number>`avg(${schema.rallies.serveScore})`,
      placement: sql<number>`avg(${schema.rallies.placementScore})`,
      footwork: sql<number>`avg(${schema.rallies.footworkScore})`,
      tactic: sql<number>`avg(${schema.rallies.tacticScore})`,
    })
    .from(schema.rallies)
    .innerJoin(schema.matches, eq(schema.matches.id, schema.rallies.matchId))
    .leftJoin(
      schema.opponents,
      eq(schema.opponents.id, schema.matches.opponentId)
    )
    .where(whereMatches)
    .groupBy(
      schema.matches.id,
      schema.matches.title,
      schema.matches.matchDate,
      schema.opponents.name,
      schema.matches.opponent
    )
    .orderBy(desc(schema.matches.matchDate ?? schema.matches.createdAt))
    .limit(12);
}
