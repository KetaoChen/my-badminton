import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";

import { MatchCreateForm } from "./MatchCreateForm";

vi.mock("@/lib/actions", () => ({
  createMatch: vi.fn(),
}));

const opponents = [
  { id: "o1", name: "Opponent A" },
  { id: "o2", name: "Opponent B" },
];

const tournaments = [{ id: "t1", name: "Tournament A" }];

describe("MatchCreateForm", () => {
  it("submits form data via createMatch", async () => {
    const { container } = render(
      <MatchCreateForm opponents={opponents} tournaments={tournaments} />
    );
    const createMatch = (await import("@/lib/actions")).createMatch as ReturnType<
      typeof vi.fn
    >;

    fireEvent.input(screen.getByPlaceholderText("例如：周末练习赛 / 俱乐部内部赛"), {
      target: { value: "My Match" },
    });
    fireEvent.input(screen.getByPlaceholderText("如：俱乐部公开赛、联赛等"), {
      target: { value: "Tour" },
    });

    fireEvent.submit(container.querySelector("form")!);

    await waitFor(() => expect(createMatch).toHaveBeenCalled());
  });
});

