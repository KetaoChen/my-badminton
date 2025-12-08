import { type InferSelectModel } from "drizzle-orm";

import { rallies } from "@my-badminton/db/schema";

export type Rally = InferSelectModel<typeof rallies>;

export type MatchSummary = {
  total: number;
  wins: number;
  losses: number;
  winRate: number;
  reasons: Record<
    string,
    {
      wins: number;
      losses: number;
    }
  >;
};

export function summarizeMatch(ralliesList: Rally[]): MatchSummary {
  const summary: MatchSummary = {
    total: ralliesList.length,
    wins: 0,
    losses: 0,
    winRate: 0,
    reasons: {},
  };

  for (const rally of ralliesList) {
    if (rally.excludeFromScore) continue;
    if (rally.result === "win") summary.wins += 1;
    if (rally.result === "lose") summary.losses += 1;

    const key = rally.pointReason?.trim() || "Unspecified";
    if (!summary.reasons[key]) {
      summary.reasons[key] = { wins: 0, losses: 0 };
    }
    if (rally.result === "win") {
      summary.reasons[key].wins += 1;
    } else {
      summary.reasons[key].losses += 1;
    }
  }

  summary.winRate =
    summary.total === 0 ? 0 : Math.round((summary.wins / summary.total) * 1000) / 10;

  return summary;
}

