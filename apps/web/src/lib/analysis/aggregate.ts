import {
  type AggregatedStats,
  type Analysis,
} from "@/components/analysis/types";

const reasonColors = [
  "#0ea5e9",
  "#22c55e",
  "#f59e0b",
  "#6366f1",
  "#ef4444",
  "#14b8a6",
  "#a855f7",
  "#f97316",
  "#10b981",
  "#3b82f6",
];

export function aggregateMatches(
  matches: Analysis["matches"]
): AggregatedStats {
  const matchCount = matches.length;
  const rallyCount = matches.reduce((acc, m) => acc + (m.wins + m.losses), 0);
  const wins = matches.reduce((acc, m) => acc + m.wins, 0);
  const losses = matches.reduce((acc, m) => acc + m.losses, 0);
  let matchWins = 0;
  let matchLosses = 0;
  for (const m of matches) {
    if (m.wins > m.losses) matchWins += 1;
    else if (m.losses > m.wins) matchLosses += 1;
  }
  const winRate =
    matchCount === 0 ? 0 : Math.round((matchWins / matchCount) * 1000) / 10;

  const winReasonTotals = new Map<string, number>();
  const loseReasonTotals = new Map<string, number>();
  for (const m of matches) {
    for (const [reason, val] of Object.entries(m.winReasons)) {
      const count = Number(val ?? 0);
      winReasonTotals.set(reason, (winReasonTotals.get(reason) ?? 0) + count);
    }
    for (const [reason, val] of Object.entries(m.loseReasons)) {
      const count = Number(val ?? 0);
      loseReasonTotals.set(
        reason,
        (loseReasonTotals.get(reason) ?? 0) + count
      );
    }
  }

  const winReasonShares = Array.from(winReasonTotals.entries())
    .filter(([reason]) => reason !== "其他")
    .map(([reason, shareSum]) => ({
      reason,
      avgShare: matchCount === 0 ? 0 : shareSum / matchCount,
      matches: matchCount,
    }));
  const loseReasonShares = Array.from(loseReasonTotals.entries()).map(
    ([reason, shareSum]) => ({
      reason,
      avgShare: matchCount === 0 ? 0 : shareSum / matchCount,
      matches: matchCount,
    })
  );

  const winReasonList = [...winReasonShares].sort(
    (a, b) => b.avgShare - a.avgShare
  );
  const loseReasonList = [...loseReasonShares].sort(
    (a, b) => b.avgShare - a.avgShare
  );

  const labelForMatch = (m: (typeof matches)[number]) =>
    `${m.matchDate ?? "无日期"} · ${m.title}`;

  const winReasonSeries = winReasonList.map((r, idx) => ({
    label: r.reason,
    color: reasonColors[idx % reasonColors.length],
    points: matches.map((m) => ({
      label: labelForMatch(m),
      value: m.winReasons[r.reason] ?? 0,
    })),
  }));

  const loseReasonSeries = loseReasonList.map((r, idx) => ({
    label: r.reason,
    color: reasonColors[idx % reasonColors.length],
    points: matches.map((m) => ({
      label: labelForMatch(m),
      value: m.loseReasons[r.reason] ?? 0,
    })),
  }));

  const serveMatches = matches.filter((m) => m.serveSum > 0);
  const serveSum = serveMatches.reduce((acc, m) => acc + m.serveSum, 0);
  const serveCount = serveMatches.reduce((acc, m) => acc + m.serveCount, 0);
  const tacticSum = matches.reduce((acc, m) => acc + m.tacticSum, 0);
  const errorSum = matches.reduce((acc, m) => acc + m.errorCount, 0);

  const abilities = {
    serve: serveCount === 0 ? 0 : serveSum / serveCount,
    tactic: matchCount === 0 ? 0 : tacticSum / matchCount,
    error: matchCount === 0 ? 0 : errorSum / matchCount,
  };

  const abilityTimeSeries = matches.map((m) => ({
    id: m.id,
    title: m.title,
    matchDate: m.matchDate,
    opponentName: m.opponentName,
    serve:
      m.serveSum > 0 && m.serveCount > 0 ? m.serveSum / m.serveCount : null,
    tactic: m.tacticSum,
    error: m.errorCount,
  }));

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
    abilities,
    abilityTimeSeries,
  };
}

