import { act, render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";
import { HomePageContent } from "../components/HomePageContent";

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={typeof href === "string" ? href : href?.pathname ?? ""}>{children}</a>
  ),
}));
vi.mock("../lib/actions", () => ({
  createMatch: vi.fn(),
}));

const opponents = [
  { id: "o1", name: "Opponent A" },
  { id: "o2", name: "Opponent B" },
];

const tournaments = [{ id: "t1", name: "Tournament A" }];

describe("HomePageContent", () => {
  it("renders win/lose/draw markers with corresponding background colors", async () => {
    const matches = [
      {
        id: "m1",
        title: "Win Match",
        matchDate: "2025-01-01",
        opponentName: "A",
        wins: 5,
        losses: 2,
        notes: null,
        tournamentName: "Cup",
      },
      {
        id: "m2",
        title: "Lose Match",
        matchDate: "2025-01-02",
        opponentName: "B",
        wins: 1,
        losses: 4,
        notes: "Tough day",
        tournamentName: "Cup",
      },
      {
        id: "m3",
        title: "Draw Match",
        matchDate: "2025-01-03",
        opponentName: "C",
        wins: 3,
        losses: 3,
        notes: null,
        tournamentName: null,
      },
    ];

    let container: HTMLElement | undefined;
    await act(async () => {
      const rendered = render(
        <HomePageContent
          matches={matches}
          opponents={opponents}
          tournaments={tournaments}
        />
      );
      container = rendered.container;
    });

    const winTag = screen.getByText("胜");
    const loseTag = screen.getByText("负");
    const drawTag = screen.getByText("平");

    const winCard = winTag.closest(".ant-card");
    const loseCard = loseTag.closest(".ant-card");
    const drawCard = drawTag.closest(".ant-card");

    expect(winCard?.querySelector(".ant-card-body")).toHaveStyle({
      backgroundColor: "#ecfdf3",
    });
    expect(loseCard?.querySelector(".ant-card-body")).toHaveStyle({
      backgroundColor: "#fff1f2",
    });
    expect(drawCard?.querySelector(".ant-card-body")).toHaveStyle({
      backgroundColor: "#f8fafc",
    });

    // Ensure notes render and layout stays intact
    expect(screen.getByText("Tough day")).toBeInTheDocument();
    // The form section still present
    expect(container?.querySelector("form")).toBeInTheDocument();
  });
});

