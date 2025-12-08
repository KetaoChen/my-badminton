"use client";

import { Button, Empty, Space, Table, Tag } from "antd";

import { deleteRally } from "@/lib/actions";
import { RallyEditModal } from "../RallyEditModal";
import { type Rally } from "./types";

type Props = {
  matchId: string;
  rallies: Rally[];
};

export function RallyTable({ matchId, rallies }: Props) {
  const rallyData = rallies.map((r) => ({
    ...r,
    tacticUsed: r.tacticUsed ?? null,
    serveScore: r.serveScore ?? null,
  }));

  const columns = [
    {
      title: "编号",
      dataIndex: "sequence",
      key: "sequence",
      align: "center" as const,
      render: (val: number | null) => val ?? "—",
      width: 2,
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
      width: 2,
    },
    {
      title: "得失分原因",
      dataIndex: "pointReason",
      key: "pointReason",
      align: "center" as const,
      render: (val: string | null) => val || "未填写",
      width: 3,
    },
    {
      title: "使用战术",
      dataIndex: "tacticUsed",
      key: "tacticUsed",
      align: "center" as const,
      width: 3,
      render: (val: boolean | null) =>
        val ? "是" : val === false ? "否" : "—",
    },
    {
      title: "发球到位",
      dataIndex: "serveScore",
      key: "serveScore",
      align: "center" as const,
      width: 3,
      render: (val: number | null) => (val ?? "—").toString(),
    },
    {
      title: "比分",
      key: "score",
      align: "center" as const,
      render: (_: unknown, rally: Rally) =>
        rally.endScoreSelf != null && rally.endScoreOpponent != null
          ? `${rally.endScoreSelf}:${rally.endScoreOpponent}`
          : rally.startScoreSelf != null && rally.startScoreOpponent != null
            ? `${rally.startScoreSelf}:${rally.startScoreOpponent}`
            : "未记录",
      width: 2,
    },
    {
      title: "备注",
      dataIndex: "notes",
      key: "notes",
      align: "center" as const,
      width: 12,
      render: (val: string | null) => <div>{val || "—"}</div>,
    },
    {
      title: "操作",
      key: "actions",
      align: "center" as const,
      width: 3,
      render: (_: unknown, rally: Rally) => (
        <Space size={8}>
          <RallyEditModal
            rally={{
              id: rally.id,
              matchId,
              result: rally.result,
              pointReason: rally.pointReason,
              tacticUsed: rally.tacticUsed,
              serveScore: rally.serveScore,
              notes: rally.notes,
              excludeFromScore: rally.excludeFromScore,
            }}
          />
          <form action={deleteRally} className="inline-flex" style={{ marginLeft: 4 }}>
            <input type="hidden" name="matchId" value={matchId} />
            <input type="hidden" name="rallyId" value={rally.id} />
            <Button htmlType="submit" type="link" danger size="small">
              删除
            </Button>
          </form>
        </Space>
      ),
    },
  ];

  return (
    <Table
      dataSource={rallyData}
      columns={columns}
      rowKey="id"
      pagination={false}
      scroll={{ x: 1000 }}
      tableLayout="fixed"
      size="middle"
      locale={{ emptyText: <Empty description="暂无回合记录" /> }}
    />
  );
}

