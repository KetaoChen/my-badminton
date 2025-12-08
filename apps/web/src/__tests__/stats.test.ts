import { describe, expect, it } from "vitest";
import { summarizeMatch, type Rally } from "../lib/stats";

function rally(partial: Partial<Rally>): Rally {
  return {
    id: "r",
    matchId: "m",
    result: "win",
    serveScore: null,
    tacticUsed: null,
    pointReason: null,
    excludeFromScore: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...partial,
  } as Rally;
}

describe("summarizeMatch", () => {
  it("counts wins/losses and reasons, skipping excluded rallies", () => {
    const summary = summarizeMatch([
      rally({ result: "win", pointReason: "Smash" }),
      rally({ result: "lose", pointReason: "  Smash " }),
      rally({ result: "win", pointReason: "Net" }),
      rally({ result: "lose", pointReason: "Unforced" }),
      rally({ result: "win", pointReason: null, excludeFromScore: true }),
    ]);

    expect(summary.total).toBe(5);
    expect(summary.wins).toBe(2);
    expect(summary.losses).toBe(2);
    expect(summary.winRate).toBeCloseTo(40.0);

    expect(summary.reasons["Smash"]).toEqual({ wins: 1, losses: 1 });
    expect(summary.reasons["Net"]).toEqual({ wins: 1, losses: 0 });
    expect(summary.reasons["Unforced"]).toEqual({ wins: 0, losses: 1 });
    expect(summary.reasons["Unspecified"]).toBeUndefined();
  });

  it("handles empty rally list", () => {
    const summary = summarizeMatch([]);
    expect(summary).toEqual({
      total: 0,
      wins: 0,
      losses: 0,
      winRate: 0,
      reasons: {},
    });
  });
});

