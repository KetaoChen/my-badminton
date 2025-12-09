"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Col, Row } from "antd";
import { AppHeader } from "./AppHeader";
import { AbilityAverageCard } from "./analysis/AbilityAverageCard";
import { AbilitySeriesCard } from "./analysis/AbilitySeriesCard";
import { AnalysisFilterForm } from "./analysis/AnalysisFilterForm";
import { MatchSelector } from "./analysis/MatchSelector";
import { ReasonSeriesCard } from "./analysis/ReasonSeriesCard";
import { ReasonShareCard } from "./analysis/ReasonShareCard";
import { StatsOverview } from "./analysis/StatsOverview";
import {
  type Analysis,
  type Filters,
  type Option,
  type FilterFormValues,
} from "./analysis/types";

type Props = {
  filters: Filters;
  opponents: Option[];
  tournaments: Option[];
  analysis: Analysis;
};

export function AnalysisContent({
  filters,
  opponents,
  tournaments,
  analysis,
}: Props) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>(
    analysis.matches.map((m) => m.id)
  );

  const matchIdsKey = analysis.matches.map((m) => m.id).join(",");
  useEffect(() => {
    setSelectedIds(analysis.matches.map((m) => m.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchIdsKey]);

  const onFinish = (values: FilterFormValues) => {
    const params = new URLSearchParams();
    if (values.opponentId) params.set("opponentId", values.opponentId);
    if (values.tournamentId) params.set("tournamentId", values.tournamentId);
    if (values.tournamentOnly) params.set("tournamentOnly", "on");
    if (values.dateRange && values.dateRange.length === 2) {
      params.set("startDate", values.dateRange[0].format("YYYY-MM-DD"));
      params.set("endDate", values.dateRange[1].format("YYYY-MM-DD"));
    }
    router.push(`/analysis?${params.toString()}`);
  };

  const selectedMatches = analysis.matches.filter((m) =>
    selectedIds.includes(m.id)
  );

  const aggregate = () => {
    const reasonColors = [
      "#0ea5e9",
      "#22c55e",
      "#f59e0b",
      "#6366f1",
      "#ef4444",
      "#14b8a6",
    ];
    const matchCount = selectedMatches.length;
    const rallyCount = selectedMatches.reduce(
      (acc, m) => acc + (m.wins + m.losses),
      0
    );
    const wins = selectedMatches.reduce((acc, m) => acc + m.wins, 0);
    const losses = selectedMatches.reduce((acc, m) => acc + m.losses, 0);
    let matchWins = 0;
    let matchLosses = 0;
    for (const m of selectedMatches) {
      if (m.wins > m.losses) matchWins += 1;
      else if (m.losses > m.wins) matchLosses += 1;
    }
    const winRate =
      matchCount === 0 ? 0 : Math.round((matchWins / matchCount) * 1000) / 10;

    const winReasonTotals = new Map<string, number>();
    const loseReasonTotals = new Map<string, number>();
    for (const m of selectedMatches) {
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

    const winReasonShares = Array.from(winReasonTotals.entries()).map(
      ([reason, shareSum]) => ({
        reason,
        avgShare: matchCount === 0 ? 0 : shareSum / matchCount,
        matches: matchCount,
      })
    );
    const loseReasonShares = Array.from(loseReasonTotals.entries()).map(
      ([reason, shareSum]) => ({
        reason,
        avgShare: matchCount === 0 ? 0 : shareSum / matchCount,
        matches: matchCount,
      })
    );

    const topWinReasons = [...winReasonShares]
      .sort((a, b) => b.avgShare - a.avgShare)
      .slice(0, 5);
    const topLoseReasons = [...loseReasonShares]
      .sort((a, b) => b.avgShare - a.avgShare)
      .slice(0, 5);

    const labelForMatch = (m: (typeof selectedMatches)[number]) =>
      `${m.matchDate ?? "无日期"} · ${m.title}`;

    const winReasonSeries = topWinReasons.map((r, idx) => ({
      label: r.reason,
      color: reasonColors[idx % reasonColors.length],
      points: selectedMatches.map((m) => ({
        label: labelForMatch(m),
        value: m.winReasons[r.reason] ?? 0,
      })),
    }));

    const loseReasonSeries = topLoseReasons.map((r, idx) => ({
      label: r.reason,
      color: reasonColors[idx % reasonColors.length],
      points: selectedMatches.map((m) => ({
        label: labelForMatch(m),
        value: m.loseReasons[r.reason] ?? 0,
      })),
    }));

    const serveSum = selectedMatches.reduce((acc, m) => acc + m.serveSum, 0);
    const serveCount = selectedMatches.reduce(
      (acc, m) => acc + m.serveCount,
      0
    );
    const tacticSum = selectedMatches.reduce((acc, m) => acc + m.tacticSum, 0);
    const errorSum = selectedMatches.reduce((acc, m) => acc + m.errorCount, 0);

    const abilities = {
      serve: serveCount === 0 ? 0 : serveSum / serveCount,
      tactic: matchCount === 0 ? 0 : tacticSum / matchCount,
      error: matchCount === 0 ? 0 : errorSum / matchCount,
    };

    const abilityTimeSeries = selectedMatches.map((m) => ({
      id: m.id,
      title: m.title,
      matchDate: m.matchDate,
      opponentName: m.opponentName,
      serve: m.serveCount === 0 ? 0 : m.serveSum / m.serveCount,
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
  };

  const aggregated = aggregate();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <AppHeader
        activeKey="analysis"
        title="比赛分析"
        description="按正式赛 / 对手过滤，默认展示全部比赛。"
      />

      <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6">
        <Card title="筛选" className="shadow-sm">
          <AnalysisFilterForm
            filters={filters}
            opponents={opponents}
            tournaments={tournaments}
            onFinish={onFinish}
          />
        </Card>

        <MatchSelector
          matches={analysis.matches}
          selectedIds={selectedIds}
          onChange={setSelectedIds}
        />

        <StatsOverview analysis={{ ...analysis, ...aggregated }} />

        <Row gutter={16}>
          <Col xs={24} lg={12}>
            <ReasonShareCard
              title="得分原因（均值占比）"
              reasons={aggregated.winReasonShares}
              color="green"
            />
          </Col>
          <Col xs={24} lg={12}>
            <ReasonShareCard
              title="失分原因（均值占比）"
              reasons={aggregated.loseReasonShares}
              color="red"
            />
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} lg={12}>
            <ReasonSeriesCard
              title="得分原因随时间"
              series={aggregated.winReasonSeries}
            />
          </Col>
          <Col xs={24} lg={12}>
            <ReasonSeriesCard
              title="失分原因随时间"
              series={aggregated.loseReasonSeries}
            />
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} lg={12}>
            <AbilityAverageCard abilities={aggregated.abilities} />
          </Col>
          <Col xs={24} lg={12}>
            <AbilitySeriesCard series={aggregated.abilityTimeSeries} />
          </Col>
        </Row>
      </main>
    </div>
  );
}
