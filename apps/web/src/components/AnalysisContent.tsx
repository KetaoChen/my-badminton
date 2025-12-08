"use client";

import { useRouter } from "next/navigation";
import {
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Progress,
  Row,
  Select,
  Space,
  Statistic,
  Switch,
  Typography,
} from "antd";
import dayjs from "dayjs";
import { useMemo } from "react";

import { AbilityLineChart } from "./AbilityLineChart";
import { ReasonShareLineChart } from "./ReasonShareLineChart";
import { AppHeader } from "./AppHeader";

type Filters = {
  tournamentOnly: boolean;
  opponentId?: string;
  tournamentId?: string;
  startDate?: string;
  endDate?: string;
};

type Analysis = Awaited<ReturnType<typeof import("@/lib/analysis").getAnalysis>>;

type Option = { id: string; name: string };

type FilterFormValues = {
  opponentId?: string;
  tournamentId?: string;
  tournamentOnly?: boolean;
  dateRange?: [dayjs.Dayjs, dayjs.Dayjs];
};

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

  const initialValues = useMemo(
    () => ({
      opponentId: filters.opponentId ?? "",
      tournamentId: filters.tournamentId ?? "",
      tournamentOnly: filters.tournamentOnly,
      dateRange:
        filters.startDate && filters.endDate
          ? [dayjs(filters.startDate), dayjs(filters.endDate)]
          : undefined,
    }),
    [filters],
  );

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
          <Form
            layout="vertical"
            initialValues={initialValues}
            onFinish={onFinish}
          >
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item label="对手" name="opponentId">
                  <Select
                    allowClear
                    placeholder="全部对手"
                    options={opponents.map((o) => ({
                      value: o.id,
                      label: o.name,
                    }))}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="赛事（正式赛）" name="tournamentId">
                  <Select
                    allowClear
                    placeholder="全部赛事"
                    options={tournaments.map((t) => ({
                      value: t.id,
                      label: t.name,
                    }))}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="日期范围" name="dateRange">
                  <DatePicker.RangePicker allowClear className="w-full" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="仅正式赛" name="tournamentOnly" valuePropName="checked">
                  <Switch />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                应用筛选
              </Button>
            </Form.Item>
          </Form>
        </Card>

        <Card className="shadow-sm">
          <Row gutter={12}>
            <Col xs={12} md={6}>
              <Statistic title="总比赛" value={analysis.matchCount} />
            </Col>
            <Col xs={12} md={6}>
              <Statistic
                title="胜率(按场)"
                value={Number(analysis.winRate.toFixed(1))}
                suffix="%"
              />
            </Col>
            <Col xs={12} md={6}>
              <Statistic title="场次 胜 / 负" value={`${analysis.matchWins} / ${analysis.matchLosses}`} />
            </Col>
            <Col xs={12} md={6}>
              <Statistic title="回合 胜 / 负" value={`${analysis.wins} / ${analysis.losses}`} />
            </Col>
          </Row>
        </Card>

        <Row gutter={16}>
          <Col xs={24} lg={12}>
            <Card title="得分原因（均值占比）" className="shadow-sm">
              {analysis.winReasonShares.length === 0 ? (
                <EmptyText />
              ) : (
                <Space direction="vertical" className="w-full">
                  {analysis.winReasonShares.map((r) => (
                    <ReasonBar key={r.reason} label={r.reason} value={r.avgShare * 100} />
                  ))}
                </Space>
              )}
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="失分原因（均值占比）" className="shadow-sm">
              {analysis.loseReasonShares.length === 0 ? (
                <EmptyText />
              ) : (
                <Space direction="vertical" className="w-full">
                  {analysis.loseReasonShares.map((r) => (
                    <ReasonBar key={r.reason} label={r.reason} value={r.avgShare * 100} color="red" />
                  ))}
                </Space>
              )}
            </Card>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} lg={12}>
            <Card title="得分原因随时间" className="shadow-sm">
              {analysis.winReasonSeries.length === 0 ? (
                <EmptyText />
              ) : (
                <ReasonShareLineChart series={analysis.winReasonSeries} />
              )}
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="失分原因随时间" className="shadow-sm">
              {analysis.loseReasonSeries.length === 0 ? (
                <EmptyText />
              ) : (
                <ReasonShareLineChart series={analysis.loseReasonSeries} />
              )}
            </Card>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} lg={12}>
            <Card title="能力平均分" className="shadow-sm">
              <Space direction="vertical" className="w-full">
                <ScoreBar label="发球" value={analysis.abilities.serve} />
                <ScoreBar label="战术" value={analysis.abilities.tactic} />
              </Space>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="能力分随时间（最近 12 场）" className="shadow-sm">
              {analysis.abilityTimeSeries.length === 0 ? (
                <EmptyText />
              ) : (
                <AbilityLineChart data={analysis.abilityTimeSeries} />
              )}
            </Card>
          </Col>
        </Row>
      </main>
    </div>
  );
}

function ReasonBar({
  label,
  value,
  color = "green",
}: {
  label: string;
  value: number;
  color?: "green" | "red";
}) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-xs text-slate-600">
        <span className="truncate">{label}</span>
        <span className="font-medium text-slate-800">{value.toFixed(1)}%</span>
      </div>
      <Progress
        percent={Number(value.toFixed(1))}
        showInfo={false}
        strokeColor={color === "green" ? "#22c55e" : "#f87171"}
      />
    </div>
  );
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  const clamped = Math.max(0, Math.min(10, value || 0));
  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-xs text-slate-600">
        <span>{label}</span>
        <span className="font-medium text-slate-800">{clamped.toFixed(1)}</span>
      </div>
      <Progress percent={Number(((clamped / 10) * 100).toFixed(1))} showInfo={false} strokeColor="#0ea5e9" />
    </div>
  );
}

function EmptyText() {
  return <Typography.Text type="secondary">暂无数据</Typography.Text>;
}

