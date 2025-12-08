"use client";

import Link from "next/link";
import {
  Button,
  Card,
  Col,
  Flex,
  Input,
  InputNumber,
  Checkbox,
  Row,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
  Form,
  Empty,
} from "antd";

import { createRally, deleteRally, updateMatch } from "@/lib/actions";
import { DeleteMatchButton } from "./DeleteMatchButton";
import { MatchEditModal } from "./MatchEditModal";
import { RallyEditModal } from "./RallyEditModal";
import { ResultReasonFields } from "./ResultReasonFields";
import { AppHeader } from "./AppHeader";

type Match = {
  id: string;
  title: string;
  matchDate: string | null;
  opponentId: string | null;
  opponent: string | null;
  opponentName: string | null;
  tournamentId: string | null;
  tournamentName: string | null;
  notes: string | null;
};

type Rally = {
  id: string;
  sequence: number | null;
  result: "win" | "lose";
  pointReason: string | null;
  tacticUsed: boolean | null;
  serveScore: number | null;
  notes: string | null;
  excludeFromScore?: boolean | null;
  startScoreSelf?: number | null;
  startScoreOpponent?: number | null;
  endScoreSelf?: number | null;
  endScoreOpponent?: number | null;
};

type ReasonCount = {
  wins: number;
  losses: number;
};

type Summary = {
  total: number;
  wins: number;
  losses: number;
  winRate: number;
};

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

  const columns = [
    {
      title: "编号",
      dataIndex: "sequence",
      key: "sequence",
      align: "center" as const,
      render: (val: number | null) => val ?? "—",
      width: 80,
    },
    {
      title: "结果",
      dataIndex: "result",
      key: "result",
      align: "center" as const,
      render: (val: Rally["result"]) => (
        <Tag color={val === "win" ? "green" : "red"}>
          {val === "win" ? "得分" : "失分"}
        </Tag>
      ),
      width: 90,
    },
    {
      title: "得失分原因",
      dataIndex: "pointReason",
      key: "pointReason",
      align: "center" as const,
      render: (val: string | null) => val || "未填写",
    },
    {
      title: "使用战术",
      dataIndex: "tacticUsed",
      key: "tacticUsed",
      align: "center" as const,
      width: 120,
      render: (val: boolean | null) =>
        val ? "是" : val === false ? "否" : "—",
    },
    {
      title: "发球到位",
      dataIndex: "serveScore",
      key: "serveScore",
      align: "center" as const,
      width: 100,
      render: (val: number | null) => (val ?? "—").toString(),
    },
    {
      title: "比分",
      key: "score",
      align: "center" as const,
      render: (_: unknown, rally: Rally) =>
        rally.startScoreSelf != null &&
        rally.startScoreOpponent != null &&
        rally.endScoreSelf != null &&
        rally.endScoreOpponent != null
          ? `${rally.startScoreSelf}:${rally.startScoreOpponent} → ${rally.endScoreSelf}:${rally.endScoreOpponent}`
          : "未记录",
      width: 180,
    },
    {
      title: "备注",
      dataIndex: "notes",
      key: "notes",
      align: "center" as const,
      render: (val: string | null) => val || "—",
      ellipsis: true,
    },
    {
      title: "操作",
      key: "actions",
      fixed: "right" as const,
      width: 140,
      render: (_: unknown, rally: Rally) => (
        <Space size={8}>
          <RallyEditModal
            rally={{
              id: rally.id,
              matchId: match.id,
              result: rally.result,
              pointReason: rally.pointReason,
              tacticUsed: rally.tacticUsed,
              serveScore: rally.serveScore,
              notes: rally.notes,
              excludeFromScore: rally.excludeFromScore,
            }}
          />
          <form
            action={deleteRally}
            className="inline-flex"
            style={{ marginLeft: 4 }}
          >
            <input type="hidden" name="matchId" value={match.id} />
            <input type="hidden" name="rallyId" value={rally.id} />
            <Button htmlType="submit" type="link" danger size="small">
              删除
            </Button>
          </form>
        </Space>
      ),
    },
  ];

  const rallyData = rallies.map((r) => ({
    ...r,
    tacticUsed: r.tacticUsed ?? null,
    serveScore: r.serveScore ?? null,
  }));

  const headerActions = (
    <Space>
      <MatchEditModal
        match={match}
        opponents={opponents}
        tournaments={tournaments}
        action={updateMatch.bind(null, match.id)}
      />
      <div className="hidden sm:block">
        <DeleteMatchButton matchId={match.id} />
      </div>
      <Button>
        <Link href={`/matches/${match.id}/export`}>导出 CSV</Link>
      </Button>
      <Button type="link">
        <Link href="/">返回列表</Link>
      </Button>
    </Space>
  );

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
        extra={headerActions}
      />

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-6">
        <section className="grid gap-6 md:grid-cols-[1.1fr_1fr]">
          <div className="space-y-4">
            <Card title="总览" className="shadow-sm">
              <Typography.Title level={4}>{match.title}</Typography.Title>
              {match.notes ? (
                <Typography.Paragraph type="secondary">
                  {match.notes}
                </Typography.Paragraph>
              ) : null}
              <Row gutter={12} className="mt-2">
                <Col span={8}>
                  <Statistic title="总回合" value={summary.total} />
                </Col>
                <Col span={8}>
                  <Statistic title="赢球" value={summary.wins} />
                </Col>
                <Col span={8}>
                  <Statistic title="输球" value={summary.losses} />
                </Col>
              </Row>
              <Card size="small" className="mt-3">
                <Statistic
                  title="赢球率"
                  value={`${summary.winRate.toFixed(1)}%`}
                />
              </Card>
            </Card>

            <Card title="得失分原因分布" className="shadow-sm">
              <Row gutter={12}>
                <Col span={12}>
                  <Typography.Text type="success" className="text-xs uppercase">
                    得分原因
                  </Typography.Text>
                  <Space direction="vertical" className="mt-2 w-full">
                    {winReasons.length === 0 ? (
                      <Typography.Text type="secondary">
                        暂无得分记录。
                      </Typography.Text>
                    ) : (
                      winReasons.map(([reason, counts]) => (
                        <Card
                          key={reason}
                          size="small"
                          className="bg-emerald-50 border-emerald-100"
                        >
                          <Flex align="center" justify="space-between">
                            <Typography.Text strong>{reason}</Typography.Text>
                            <Tag color="green">+{counts.wins}</Tag>
                          </Flex>
                        </Card>
                      ))
                    )}
                  </Space>
                </Col>
                <Col span={12}>
                  <Typography.Text type="danger" className="text-xs uppercase">
                    失分原因
                  </Typography.Text>
                  <Space direction="vertical" className="mt-2 w-full">
                    {loseReasons.length === 0 ? (
                      <Typography.Text type="secondary">
                        暂无失分记录。
                      </Typography.Text>
                    ) : (
                      loseReasons.map(([reason, counts]) => (
                        <Card
                          key={reason}
                          size="small"
                          className="bg-rose-50 border-rose-100"
                        >
                          <Flex align="center" justify="space-between">
                            <Typography.Text strong>{reason}</Typography.Text>
                            <Tag color="red">-{counts.losses}</Tag>
                          </Flex>
                        </Card>
                      ))
                    )}
                  </Space>
                </Col>
              </Row>
            </Card>
          </div>

          <Card title="新增回合" className="shadow-sm">
            <Form
              layout="vertical"
              component="form"
              action={createRally}
              size="middle"
              className="space-y-2"
            >
              <input type="hidden" name="matchId" value={match.id} />

              <ResultReasonFields
                key={`create-${rallies.length}`}
                defaultResult="win"
                defaultReason="对手失误"
              />

              <Form.Item
                name="excludeFromScore"
                valuePropName="checked"
                className="!mb-3"
              >
                <Checkbox name="excludeFromScore">不计入比分</Checkbox>
              </Form.Item>

              <Row gutter={12}>
                <Col span={12}>
                  <Form.Item
                    name="tacticUsed"
                    valuePropName="checked"
                    className="!mb-3"
                  >
                    <Checkbox name="tacticUsed">使用战术</Checkbox>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="发球到位得分" className="!mb-3">
                    <InputNumber
                      name="serveScore"
                      min={0}
                      max={10}
                      className="w-full"
                      placeholder="0-10"
                      controls={false}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item label="备注" className="!mb-3">
                <Input.TextArea
                  name="notes"
                  rows={3}
                  placeholder="如击球模式、弱点、战术等"
                />
              </Form.Item>

              <Form.Item className="!mb-0">
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  style={{ paddingInline: 16 }}
                >
                  保存回合
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </section>

        <Card title="回合列表" className="shadow-sm">
          <Table
            dataSource={rallyData}
            columns={columns}
            rowKey="id"
            pagination={false}
            scroll={{ x: 1100 }}
            tableLayout="fixed"
            size="middle"
            locale={{ emptyText: <Empty description="暂无回合记录" /> }}
          />
        </Card>
      </main>
    </div>
  );
}
