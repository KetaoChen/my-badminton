"use client";

import { Checkbox, Input, Typography, Button } from "antd";

import { createMatch } from "@/lib/actions";
import { type Option } from "./types";

type Props = {
  opponents: Option[];
  tournaments: Option[];
};

export function MatchCreateForm({ opponents, tournaments }: Props) {
  return (
    <form action={createMatch} className="flex flex-col gap-5">
      <div className="space-y-3">
        <Typography.Text strong>比赛名称 *</Typography.Text>
        <Input
          name="title"
          required
          placeholder="例如：周末练习赛 / 俱乐部内部赛"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
        <div className="space-y-3">
          <Typography.Text strong>日期</Typography.Text>
          <Input type="date" name="matchDate" />
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <Typography.Text strong>对手（可选已有或手填）</Typography.Text>
        <select
          name="opponentId"
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-inner focus:border-slate-400 focus:outline-none"
          defaultValue=""
        >
          <option value="">选择已有对手</option>
          {opponents.map((opponent) => (
            <option key={opponent.id} value={opponent.id}>
              {opponent.name}
            </option>
          ))}
        </select>
        <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <Input
            name="opponent"
            placeholder="或手动输入对手名称/备注"
          />
          <Checkbox name="trainingOpponent">标记为训练对手</Checkbox>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <Typography.Text strong>
          赛事名称（填或选则视为正式赛）
        </Typography.Text>
        <div className="flex flex-col gap-3">
          <select
            name="tournamentId"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-inner focus:border-slate-400 focus:outline-none"
            defaultValue=""
          >
            <option value="">选择已有赛事</option>
            {tournaments.map((tournament) => (
              <option key={tournament.id} value={tournament.id}>
                {tournament.name}
              </option>
            ))}
          </select>
          <Input
            name="tournamentName"
            placeholder="如：俱乐部公开赛、联赛等"
          />
        </div>
      </div>
      <div className="space-y-3">
        <Typography.Text strong>备注</Typography.Text>
        <Input.TextArea
          name="notes"
          rows={3}
          placeholder="场地、球拍、当天状态等信息"
        />
      </div>
      <Button type="primary" htmlType="submit" block>
        保存比赛
      </Button>
    </form>
  );
}

