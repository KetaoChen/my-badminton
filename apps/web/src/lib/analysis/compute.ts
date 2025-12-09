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

  const labelForMatch = (m: { matchDate: string | null; title: string }) =>
    `${m.matchDate ?? "无日期"} · ${m.title}`;

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

  const aggregateFromMatches = (selected: typeof matches) => {
    const rallyCount = selected.reduce(
      (acc, m) => acc + (m.wins + m.losses),
      0
    );
    const winsSum = selected.reduce((acc, m) => acc + m.wins, 0);
    const lossesSum = selected.reduce((acc, m) => acc + m.losses, 0);
    let matchWins = 0;
    let matchLosses = 0;
    for (const m of selected) {
      if (m.wins > m.losses) matchWins += 1;
      else if (m.losses > m.wins) matchLosses += 1;
    }
    const matchCount = selected.length;
    const winRate =
      matchCount === 0 ? 0 : Math.round((matchWins / matchCount) * 1000) / 10;

    const winReasonShareSum = new Map<string, number>();
    const loseReasonShareSum = new Map<string, number>();

    for (const m of selected) {
      if (m.winTotal > 0) {
        for (const [reason, share] of Object.entries(m.winReasons)) {
          const val = Number(share ?? 0);
          winReasonShareSum.set(
            reason,
            (winReasonShareSum.get(reason) ?? 0) + val
          );
        }
      }
      if (m.loseTotal > 0) {
        for (const [reason, share] of Object.entries(m.loseReasons)) {
          const val = Number(share ?? 0);
          loseReasonShareSum.set(
            reason,
            (loseReasonShareSum.get(reason) ?? 0) + val
          );
        }
      }
    }

    const winReasonShares = Array.from(winReasonShareSum.entries()).map(
      ([reason, sum]) => {
        return {
          reason,
          avgShare: matchCount === 0 ? 0 : sum / matchCount,
          matches: matchCount,
        };
      }
    );
    const loseReasonShares = Array.from(loseReasonShareSum.entries()).map(
      ([reason, sum]) => {
        return {
          reason,
          avgShare: matchCount === 0 ? 0 : sum / matchCount,
          matches: matchCount,
        };
      }
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

    const winReasonSeries = topWinReasons.map((r, idx) => ({
      label: r.reason,
      color: reasonColors[idx % reasonColors.length],
      points: selected.map((m) => ({
        label: labelForMatch(m),
        value: m.winReasons[r.reason] ?? 0,
      })),
    }));

    const loseReasonSeries = topLoseReasons.map((r, idx) => ({
      label: r.reason,
      color: reasonColors[idx % reasonColors.length],
      points: selected.map((m) => ({
        label: labelForMatch(m),
        value: m.loseReasons[r.reason] ?? 0,
      })),
    }));

    const serveSum = selected.reduce((acc, m) => acc + m.serveSum, 0);
    const serveCount = selected.reduce((acc, m) => acc + m.serveCount, 0);
    const tacticSum = selected.reduce((acc, m) => acc + m.tacticSum, 0);
    const errorSum = selected.reduce((acc, m) => acc + m.errorCount, 0);

    const abilities = {
      serve: serveCount === 0 ? 0 : serveSum / serveCount,
      tactic: matchCount === 0 ? 0 : tacticSum / matchCount,
      error: matchCount === 0 ? 0 : errorSum / matchCount,
    };

    const abilityTimeSeries = selected.map((m) => ({
      id: m.id,
      title: m.title,
      matchDate: m.matchDate,
      opponentName: m.opponentName ?? "未填写",
      serve: m.serveCount === 0 ? 0 : m.serveSum / m.serveCount,
      tactic: m.tacticSum,
      error: m.errorCount,
    }));

    return {
      matchCount,
      matchWins,
      matchLosses,
      rallyCount,
      wins: winsSum,
      losses: lossesSum,
      winRate,
      winReasonShares,
      loseReasonShares,
      winReasonSeries,
      loseReasonSeries,
      abilities,
      abilityTimeSeries,
    };
  };

  const aggregated = aggregateFromMatches(matches);

  return {
    ...aggregated,
    matches,
  };
}
