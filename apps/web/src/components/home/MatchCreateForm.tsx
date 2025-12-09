"use client";

import { useState, useTransition } from "react";

import { Checkbox, Input, Typography, Button, Select } from "antd";

import { createMatch } from "@/lib/actions";
import { useRunClientAction } from "@/lib/clientActions";
import { type Option } from "./types";

type Props = {
  opponents: Option[];
  tournaments: Option[];
};

export function MatchCreateForm({ opponents, tournaments }: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [opponentId, setOpponentId] = useState<string>("");
  const [tournamentId, setTournamentId] = useState<string>("");
  const runClientAction = useRunClientAction();

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const formData = new FormData(form);
        formData.set("opponentId", opponentId);
        formData.set("tournamentId", tournamentId);
        setError(null);
        startTransition(async () => {
          const ok = await runClientAction(() => createMatch(formData), {
            onErrorMessage: (msg) => setError(msg),
            successMessage: "比赛已创建",
          });
          if (!ok) return;
          form.reset();
          setOpponentId("");
          setTournamentId("");
        });
      }}
    >
      <div className="space-y-3">
        <Typography.Text strong>比赛名称 *</Typography.Text>
        <Input
          name="title"
          required
          placeholder="例如：周末练习赛 / 俱乐部内部赛"
          disabled={pending}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
        <div className="space-y-3">
          <Typography.Text strong>日期</Typography.Text>
          <Input type="date" name="matchDate" disabled={pending} />
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <Typography.Text strong>对手（可选已有或手填）</Typography.Text>
        <Select
          value={opponentId || undefined}
          onChange={(v) => setOpponentId(v ?? "")}
          allowClear
          placeholder="选择已有对手"
          options={opponents.map((opponent) => ({
            label: opponent.name,
            value: opponent.id,
          }))}
          classNames={{ popup: { root: "select-dropdown-light" } }}
          disabled={pending}
        />
        <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <Input
            name="opponent"
            placeholder="或手动输入对手名称/备注"
            disabled={pending}
          />
          <Checkbox name="trainingOpponent" disabled={pending}>
            标记为训练对手
          </Checkbox>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <Typography.Text strong>赛事名称（填或选则视为正式赛）</Typography.Text>
        <div className="flex flex-col gap-3">
          <Select
            value={tournamentId || undefined}
            onChange={(v) => setTournamentId(v ?? "")}
            allowClear
            placeholder="选择已有赛事"
            options={tournaments.map((tournament) => ({
              label: tournament.name,
              value: tournament.id,
            }))}
            classNames={{ popup: { root: "select-dropdown-light" } }}
            disabled={pending}
          />
          <Input
            name="tournamentName"
            placeholder="如：俱乐部公开赛、联赛等"
            disabled={pending}
          />
        </div>
      </div>
      <div className="space-y-3">
        <Typography.Text strong>备注</Typography.Text>
        <Input.TextArea
          name="notes"
          rows={3}
          placeholder="场地、球拍、当天状态等信息"
          disabled={pending}
        />
      </div>

      {error ? (
        <div className="text-sm text-red-600" role="alert">
          {error}
        </div>
      ) : null}

      <Button
        type="primary"
        htmlType="submit"
        block
        loading={pending}
        disabled={pending}
      >
        保存比赛
      </Button>
    </form>
  );
}
