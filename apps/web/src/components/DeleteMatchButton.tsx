"use client";

import { Button, Popconfirm } from "antd";
import { useRouter } from "next/navigation";

import { deleteMatch } from "@/lib/actions";
import { runClientAction } from "@/lib/clientActions";

type Props = {
  matchId: string;
};

export function DeleteMatchButton({ matchId }: Props) {
  const router = useRouter();

  return (
    <Popconfirm
      title="删除比赛"
      description="删除比赛将同时删除其所有回合数据，操作不可恢复，确定继续吗？"
      okText="确认删除"
      cancelText="取消"
      okButtonProps={{ danger: true }}
      onConfirm={async () => {
        const ok = await runClientAction(() => deleteMatch(matchId), {
          successMessage: "比赛已删除",
        });
        if (ok) router.push("/");
      }}
    >
      <Button danger ghost>
        删除比赛
      </Button>
    </Popconfirm>
  );
}
