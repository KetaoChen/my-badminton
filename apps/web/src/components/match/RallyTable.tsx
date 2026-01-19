"use client";

import { useState } from "react";

import { Button, Empty, Popconfirm, Space, Table, Tag } from "antd";

import { deleteRally } from "@/lib/actions";
import { useRunClientAction } from "@/lib/clientActions";
import { RallyEditModal } from "../RallyEditModal";
import { RallyInsertModal } from "../RallyInsertModal";
import { type Rally } from "./types";

type Props = {
  matchId: string;
  rallies: Rally[];
};

export function RallyTable({ matchId, rallies }: Props) {
  const [pendingId, setPendingId] = useState<string | null>(null);

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
      width: 60,
      fixed: "left" as const,
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
      width: 80,
    },
    {
      title: "得失分原因",
      dataIndex: "pointReason",
      key: "pointReason",
      align: "center" as const,
      render: (val: string | null) => val || "未填写",
      width: 120,
    },
    {
      title: "使用战术",
      dataIndex: "tacticUsed",
      key: "tacticUsed",
      align: "center" as const,
      width: 100,
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
      width: 100,
      render: (_: unknown, rally: Rally) =>
        rally.endScoreSelf != null && rally.endScoreOpponent != null
          ? `${rally.endScoreSelf}:${rally.endScoreOpponent}`
          : rally.startScoreSelf != null && rally.startScoreOpponent != null
          ? `${rally.startScoreSelf}:${rally.startScoreOpponent}`
          : "未记录",
    },
    {
      title: "备注",
      dataIndex: "notes",
      key: "notes",
      align: "left" as const,
      width: 200,
      ellipsis: true,
      render: (val: string | null) => <div>{val || "—"}</div>,
    },
    {
      title: "操作",
      key: "actions",
      align: "center" as const,
      width: 200,
      fixed: "right" as const,
      render: (_: unknown, rally: Rally, index: number) => {
        // 在此行之前插入，所以插入位置是当前sequence
        const insertPosition = rally.sequence ?? index + 1;
        return (
          <Space size={4} wrap>
            <RallyInsertModal
              matchId={matchId}
              insertPosition={insertPosition}
              rallies={rallies}
            />
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
        );
      },
    },
  ];

  const maxSequence = rallies.length > 0
    ? Math.max(...rallies.map((r) => r.sequence ?? 0))
    : 0;
  const insertAtEndPosition = maxSequence + 1;

  return (
    <div className="flex flex-col gap-2">
      <Table
        dataSource={rallyData}
        columns={columns}
        rowKey="id"
        pagination={false}
        scroll={{ x: 960 }}
        tableLayout="fixed"
        size="middle"
        locale={{ emptyText: <Empty description="暂无回合记录" /> }}
      />
      {rallies.length > 0 && (
        <div className="flex justify-end">
          <RallyInsertModal
            matchId={matchId}
            insertPosition={insertAtEndPosition}
            rallies={rallies}
          />
        </div>
      )}
    </div>
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
