"use client";

import { useState } from "react";

import { Button, Empty, Popconfirm, Space, Table, Tag } from "antd";

import { deleteRally } from "@/lib/actions";
import { useRunClientAction } from "@/lib/clientActions";
import { RallyEditModal } from "../RallyEditModal";
import { type Rally } from "./types";

type Props = {
  matchId: string;
  rallies: Rally[];
};

export function RallyTable({ matchId, rallies }: Props) {
  const [pendingId, setPendingId] = useState<string | null>(null);
  const runClientAction = useRunClientAction();

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
          <DeleteRallyButton
            matchId={matchId}
            rallyId={rally.id}
            loading={pendingId === rally.id}
            onStart={() => setPendingId(rally.id)}
            onDone={() => setPendingId(null)}
          />
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

function DeleteRallyButton({
  matchId,
  rallyId,
  loading,
  onStart,
  onDone,
}: {
  matchId: string;
  rallyId: string;
  loading: boolean;
  onStart: () => void;
  onDone: () => void;
}) {
  const runClientAction = useRunClientAction();

  return (
    <Popconfirm
      title="确定删除该回合？"
      okText="删除"
      cancelText="取消"
      onConfirm={async () => {
        onStart();
        const formData = new FormData();
        formData.append("matchId", matchId);
        formData.append("rallyId", rallyId);
        await runClientAction(() => deleteRally(formData), {
          successMessage: "回合已删除",
        });
        onDone();
      }}
    >
      <Button
        type="link"
        danger
        size="small"
        loading={loading}
        style={{ marginLeft: 4 }}
      >
        删除
      </Button>
    </Popconfirm>
  );
}
