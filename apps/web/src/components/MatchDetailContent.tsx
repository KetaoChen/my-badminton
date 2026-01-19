"use client";

import { Card } from "antd";

import { MatchHeaderActions } from "./match/MatchHeaderActions";
import { MatchSummaryCard } from "./match/MatchSummaryCard";
import { RallyForm } from "./match/RallyForm";
import { RallyEventChart } from "./match/RallyEventChart";
import { RallyTable } from "./match/RallyTable";
import { ReasonDistribution } from "./match/ReasonDistribution";
import {
  type Match,
  type ReasonCount,
  type Summary,
  type Rally,
} from "./match/types";
import { AppHeader } from "./AppHeader";

type Props = {
  match: Match;
  opponents: { id: string; name: string }[];
  tournaments: { id: string; name: string }[];
  rallies: Rally[];
  summary: Summary;
  winReasons: [string, ReasonCount][];
  loseReasons: [string, ReasonCount][];
};

function formatInputDate(value?: string | Date | null) {
  if (!value) return "";
  const d = typeof value === "string" ? new Date(value) : value;
  return d.toISOString().slice(0, 10);
}

export function MatchDetailContent({
  match,
  opponents,
  tournaments,
  rallies,
  summary,
  winReasons,
  loseReasons,
}: Props) {
  const displayTitle = [
    match.tournamentName,
    match.title,
    match.opponentName ?? undefined,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <AppHeader
        activeKey="home"
        title={displayTitle || match.title}
        description={`日期：${
          formatInputDate(match.matchDate) || "未填写"
        } · 对手：${match.opponentName || "未填写"} · 赛事：${
          match.tournamentName || "未填写"
        }`}
        extra={
          <MatchHeaderActions
            match={match}
            opponents={opponents}
            tournaments={tournaments}
          />
        }
      />

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-6">
        <section className="grid gap-6 md:grid-cols-[1.1fr_1fr]">
          <div className="flex flex-col gap-6">
            <MatchSummaryCard match={match} summary={summary} />
            <ReasonDistribution
              winReasons={winReasons}
              loseReasons={loseReasons}
            />
          </div>

          <Card title="新增回合" className="shadow-sm">
            <RallyForm
              matchId={match.id}
              rallies={rallies}
              defaultReason="对手失误"
            />
          </Card>
        </section>

        <Card title="回合事件" className="shadow-sm">
          <RallyEventChart rallies={rallies} />
        </Card>

        <Card title="回合列表" className="shadow-md">
          <RallyTable matchId={match.id} rallies={rallies} />
        </Card>
      </main>
    </div>
  );
}
