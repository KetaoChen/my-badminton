"use client";

import { useMemo, useState } from "react";

import { Button, Input, Select } from "antd";
import { Modal } from "./Modal";

type Match = {
  id: string;
  title: string;
  matchDate: string | null;
  opponentId: string | null;
  opponent: string | null;
  tournamentId: string | null;
  notes: string | null;
};

type Option = {
  id: string;
  name: string;
};

type Props = {
  match: Match;
  opponents: Option[];
  tournaments: Option[];
  action: (formData: FormData) => Promise<void>;
};

function formatInputDate(value?: string | null) {
  if (!value) return "";
  const d = new Date(value);
  return isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
}

export function MatchEditModal({
  match,
  opponents,
  tournaments,
  action,
}: Props) {
  const [open, setOpen] = useState(false);
  const [opponentId, setOpponentId] = useState<string>(match.opponentId ?? "");
  const [tournamentId, setTournamentId] = useState<string>(
    match.tournamentId ?? "",
  );

  const tournamentNameDefault = useMemo(
    () => (match.tournamentId ? "" : ""),
    [match.tournamentId]
  );

  return (
    <>
      <Button onClick={() => setOpen(true)}>编辑比赛</Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="编辑比赛信息"
      >
        <form action={action} onSubmit={() => setOpen(false)} className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
              比赛名称
            </span>
            <Input name="title" defaultValue={match.title} required />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
              日期
            </span>
            <Input
              type="date"
              name="matchDate"
              defaultValue={formatInputDate(match.matchDate)}
            />
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
              对手
            </span>
            <Select
              value={opponentId}
              onChange={(value) => setOpponentId(value)}
              allowClear
              placeholder="选择已有对手"
              options={opponents.map((o) => ({ label: o.name, value: o.id }))}
            />
            <input type="hidden" name="opponentId" value={opponentId} />
            <Input
              name="opponent"
              defaultValue={match.opponent ?? ""}
              placeholder="手动输入对手（留空则仅使用下拉选择）"
            />
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
              赛事
            </span>
            <Select
              value={tournamentId}
              onChange={(value) => setTournamentId(value)}
              allowClear
              placeholder="选择已有赛事"
              options={tournaments.map((t) => ({ label: t.name, value: t.id }))}
            />
            <input type="hidden" name="tournamentId" value={tournamentId} />
            <Input
              name="tournamentName"
              defaultValue={tournamentNameDefault}
              placeholder="赛事名称（填或选即为正式赛）"
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
            />
          </div>

          <div className="md:col-span-2 flex justify-end gap-2 pt-2">
            <Button onClick={() => setOpen(false)}>取消</Button>
            <Button type="primary" htmlType="submit">
              保存
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}

