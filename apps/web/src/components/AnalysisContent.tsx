"use client";

import { useRouter } from "next/navigation";
import { Card, Col, Row } from "antd";
import { AppHeader } from "./AppHeader";
import { AbilityAverageCard } from "./analysis/AbilityAverageCard";
import { AbilitySeriesCard } from "./analysis/AbilitySeriesCard";
import { AnalysisFilterForm } from "./analysis/AnalysisFilterForm";
import { ReasonSeriesCard } from "./analysis/ReasonSeriesCard";
import { ReasonShareCard } from "./analysis/ReasonShareCard";
import { StatsOverview } from "./analysis/StatsOverview";
import { type Analysis, type Filters, type Option, type FilterFormValues } from "./analysis/types";

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

        <StatsOverview analysis={analysis} />

        <Row gutter={16}>
          <Col xs={24} lg={12}>
            <ReasonShareCard
              title="得分原因（均值占比）"
              reasons={analysis.winReasonShares}
              color="green"
            />
          </Col>
          <Col xs={24} lg={12}>
            <ReasonShareCard
              title="失分原因（均值占比）"
              reasons={analysis.loseReasonShares}
              color="red"
            />
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} lg={12}>
            <ReasonSeriesCard
              title="得分原因随时间"
              series={analysis.winReasonSeries}
            />
          </Col>
          <Col xs={24} lg={12}>
            <ReasonSeriesCard
              title="失分原因随时间"
              series={analysis.loseReasonSeries}
            />
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} lg={12}>
            <AbilityAverageCard abilities={analysis.abilities} />
          </Col>
          <Col xs={24} lg={12}>
            <AbilitySeriesCard series={analysis.abilityTimeSeries} />
          </Col>
        </Row>
      </main>
    </div>
  );
}
