"use client";

import { useMemo, useState } from "react";

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

  const tournamentNameDefault = useMemo(
    () => (match.tournamentId ? "" : ""),
    [match.tournamentId]
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
      >
        编辑比赛
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="编辑比赛信息"
        maxWidthClass="max-w-3xl"
      >
        <form
          action={action}
          onSubmit={() => setOpen(false)}
          className="grid gap-4 md:grid-cols-2"
        >
          <div className="flex flex-col">
            <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
              比赛名称
            </label>
            <input
              name="title"
              defaultValue={match.title}
              required
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-inner focus:border-slate-400 focus:outline-none"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
              日期
            </label>
            <input
              type="date"
              name="matchDate"
              defaultValue={formatInputDate(match.matchDate)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-inner focus:border-slate-400 focus:outline-none"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
              对手
            </label>
            <select
              name="opponentId"
              defaultValue={match.opponentId ?? ""}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-inner focus:border-slate-400 focus:outline-none"
            >
              <option value="">选择已有对手</option>
              {opponents.map((opponent) => (
                <option key={opponent.id} value={opponent.id}>
                  {opponent.name}
                </option>
              ))}
            </select>
            <input
              name="opponent"
              defaultValue={match.opponent ?? ""}
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-inner focus:border-slate-400 focus:outline-none"
              placeholder="手动输入对手（留空则仅使用下拉选择）"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
              赛事
            </label>
            <div className="flex gap-2">
              <select
                name="tournamentId"
                defaultValue={match.tournamentId ?? ""}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-inner focus:border-slate-400 focus:outline-none"
              >
                <option value="">选择已有赛事</option>
                {tournaments.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <input
              name="tournamentName"
              defaultValue={tournamentNameDefault}
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-inner focus:border-slate-400 focus:outline-none"
              placeholder="赛事名称（填或选即为正式赛）"
            />
          </div>

          <div className="md:col-span-2 flex flex-col">
            <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
              备注
            </label>
            <textarea
              name="notes"
              defaultValue={match.notes ?? ""}
              rows={3}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-inner focus:border-slate-400 focus:outline-none"
              placeholder="可选"
            />
          </div>

          <div className="md:col-span-2 flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              取消
            </button>
            <button
              type="submit"
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
            >
              保存
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}

