"use client";

import { deleteMatch } from "@/lib/actions";
import { Button, Popconfirm } from "antd";

type Props = {
  matchId: string;
};

export function DeleteMatchButton({ matchId }: Props) {
  return (
    <Popconfirm
      title="删除比赛"
      description="删除比赛将同时删除其所有回合数据，操作不可恢复，确定继续吗？"
      okText="确认删除"
      cancelText="取消"
      okButtonProps={{ danger: true }}
      onConfirm={async () => {
        await deleteMatch(matchId);
      }}
    >
      <Button danger ghost>
        删除比赛
      </Button>
    </Popconfirm>
  );
}
