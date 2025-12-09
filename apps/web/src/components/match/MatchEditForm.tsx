"use client";

import { useMemo, useState, useTransition } from "react";

import { Button, Input, Select } from "antd";

import { type Option } from "../home/types";
import { type EditableMatch } from "./types";
import { useRunClientAction } from "@/lib/clientActions";

type Props = {
  match: EditableMatch;
  opponents: Option[];
  tournaments: Option[];
  action: (formData: FormData) => Promise<void>;
  onSubmitted?: () => void;
};

function formatInputDate(value?: string | null) {
  if (!value) return "";
  const d = new Date(value);
  return isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
}

export function MatchEditForm({
  match,
  opponents,
  tournaments,
  action,
  onSubmitted,
}: Props) {
  const [opponentId, setOpponentId] = useState<string>(match.opponentId ?? "");
  const [tournamentId, setTournamentId] = useState<string>(
    match.tournamentId ?? ""
  );
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const runClientAction = useRunClientAction();

  const tournamentNameDefault = useMemo(
    () => (match.tournamentId ? "" : ""),
    [match.tournamentId]
  );

  return (
    <form
      action={action}
      onSubmit={(event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const formData = new FormData(form);
        setError(null);
        startTransition(async () => {
          const ok = await runClientAction(() => action(formData), {
            onErrorMessage: (msg) => setError(msg),
            successMessage: "比赛已更新",
          });
          if (!ok) return;
          onSubmitted?.();
        });
      }}
      className="grid gap-4 md:grid-cols-2"
    >
      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
          比赛名称
        </span>
        <Input
          name="title"
          defaultValue={match.title}
          required
          disabled={pending}
        />
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
          日期
        </span>
        <Input
          type="date"
          name="matchDate"
          defaultValue={formatInputDate(match.matchDate)}
          disabled={pending}
        />
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
          对手
        </span>
        <Select
          value={opponentId}
          onChange={(value) => setOpponentId(value ?? "")}
          allowClear
          placeholder="选择已有对手"
          options={opponents.map((o) => ({ label: o.name, value: o.id }))}
          classNames={{ popup: { root: "select-dropdown-light" } }}
          disabled={pending}
        />
        <input type="hidden" name="opponentId" value={opponentId} />
        <Input
          name="opponent"
          defaultValue={match.opponent ?? ""}
          placeholder="手动输入对手（留空则仅使用下拉选择）"
          disabled={pending}
        />
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
          赛事
        </span>
        <Select
          value={tournamentId}
          onChange={(value) => setTournamentId(value ?? "")}
          allowClear
          placeholder="选择已有赛事"
          options={tournaments.map((t) => ({ label: t.name, value: t.id }))}
          classNames={{ popup: { root: "select-dropdown-light" } }}
          disabled={pending}
        />
        <input type="hidden" name="tournamentId" value={tournamentId} />
        <Input
          name="tournamentName"
          defaultValue={tournamentNameDefault}
          placeholder="赛事名称（填或选即为正式赛）"
          disabled={pending}
        />
      </div>

      <div className="md:col-span-2 flex flex-col gap-1">
        <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
          备注
        </span>
        <Input.TextArea
          name="notes"
          defaultValue={match.notes ?? ""}
          rows={3}
          placeholder="可选"
          disabled={pending}
        />
      </div>

      {error ? (
        <div className="md:col-span-2 text-sm text-red-600" role="alert">
          {error}
        </div>
      ) : null}

      <div className="md:col-span-2 flex justify-end gap-2 pt-2">
        <Button onClick={onSubmitted} disabled={pending}>
          取消
        </Button>
        <Button
          type="primary"
          htmlType="submit"
          loading={pending}
          disabled={pending}
        >
          保存
        </Button>
      </div>
    </form>
  );
}
