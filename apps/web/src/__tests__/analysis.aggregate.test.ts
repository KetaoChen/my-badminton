import { describe, expect, it } from "vitest";

import { aggregateMatches } from "@/lib/analysis/aggregate";
import { type Analysis } from "@/components/analysis/types";

describe("aggregateMatches", () => {
  const matches: Analysis["matches"] = [
    {
      id: "m1",
      title: "Match 1",
      matchDate: "2024-01-01",
      matchNumber: 1,
      opponentName: "A",
      wins: 6,
      losses: 4,
      total: 10,
      winTotal: 6,
      loseTotal: 4,
      winReasons: { 拉吊: 0.5, 突击: 0.5 },
      loseReasons: { 我方失误: 1 },
      serveSum: 6,
      serveCount: 3,
      tacticSum: 4,
      tacticCount: 4,
      errorCount: 3,
    },
    {
      id: "m2",
      title: "Match 2",
      matchDate: "2024-01-02",
      matchNumber: 2,
      opponentName: "B",
      wins: 3,
      losses: 5,
      total: 8,
      winTotal: 3,
      loseTotal: 5,
      winReasons: { 拉吊: 0.2 },
      loseReasons: { 我方失误: 0.3, 失分: 0.7 },
      serveSum: 0,
      serveCount: 0,
      tacticSum: 2,
      tacticCount: 2,
      errorCount: 1,
    },
  ];

  it("aggregates counts, reasons, abilities and time series", () => {
    const result = aggregateMatches(matches);

    expect(result.matchCount).toBe(2);
    expect(result.rallyCount).toBe(18);
    expect(result.wins).toBe(9);
    expect(result.losses).toBe(9);
    expect(result.matchWins).toBe(1);
    expect(result.matchLosses).toBe(1);
    expect(result.winRate).toBe(50);

    const winReasons = Object.fromEntries(
      result.winReasonShares.map((r) => [r.reason, r.avgShare])
    );
    expect(winReasons["拉吊"]).toBeCloseTo(0.35);
    expect(winReasons["突击"]).toBeCloseTo(0.25);

    const loseReasons = Object.fromEntries(
      result.loseReasonShares.map((r) => [r.reason, r.avgShare])
    );
    expect(loseReasons["我方失误"]).toBeCloseTo(0.65);
    expect(loseReasons["失分"]).toBeCloseTo(0.35);

    expect(result.abilities.serve).toBeCloseTo(2);
    expect(result.abilities.tactic).toBeCloseTo(3);
    expect(result.abilities.error).toBeCloseTo(2);

    expect(result.abilityTimeSeries).toHaveLength(2);
    expect(result.abilityTimeSeries[0].serve).toBeCloseTo(2);
    expect(result.abilityTimeSeries[1].serve).toBeNull();
    expect(result.abilityTimeSeries[0].tactic).toBe(4);
    expect(result.abilityTimeSeries[1].tactic).toBe(2);
    expect(result.abilityTimeSeries[0].error).toBe(3);
    expect(result.abilityTimeSeries[1].error).toBe(1);

    expect(result.winReasonSeries[0].label).toBe("拉吊");
    expect(result.winReasonSeries[0].points.map((p) => p.value)).toEqual([
      0.5, 0.2,
    ]);

    expect(result.loseReasonSeries[0].label).toBe("我方失误");
    expect(result.loseReasonSeries[0].points.map((p) => p.value)).toEqual([
      1, 0.3,
    ]);
  });
});
