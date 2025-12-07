"use client";

import { useState } from "react";

import { updateRally } from "@/lib/actions";
import { Modal } from "./Modal";
import { ResultReasonFields } from "./ResultReasonFields";

type Rally = {
  id: string;
  matchId: string;
  result: "win" | "lose";
  pointReason: string | null;
  tacticScore: number | null;
  serveScore: number | null;
  placementScore: number | null;
  footworkScore: number | null;
  notes: string | null;
};

type Props = {
  rally: Rally;
};

export function RallyEditModal({ rally }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs font-semibold text-slate-600 underline-offset-4 hover:underline"
      >
        编辑
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={`编辑回合 #${rally.id.slice(0, 6)}`}
      >
        <form
          action={async (formData) => {
            await updateRally(formData);
            setOpen(false);
          }}
          className="space-y-3 text-sm"
        >
          <input type="hidden" name="rallyId" value={rally.id} />
          <input type="hidden" name="matchId" value={rally.matchId} />

          <ResultReasonFields
            defaultResult={rally.result}
            defaultReason={
              rally.pointReason ??
              (rally.result === "win" ? "对手失误" : "我方失误")
            }
            resultName="result"
            reasonName="pointReason"
          />

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1">
              <span className="text-[11px] uppercase tracking-wide text-slate-500">
                战术得分
              </span>
              <input
                name="tacticScore"
                type="number"
                min={0}
                max={10}
                defaultValue={rally.tacticScore ?? ""}
                className="rounded border border-slate-200 px-3 py-2 shadow-inner focus:border-slate-400 focus:outline-none"
                placeholder="0-10"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[11px] uppercase tracking-wide text-slate-500">
                发球到位
              </span>
              <input
                name="serveScore"
                type="number"
                min={0}
                max={10}
                defaultValue={rally.serveScore ?? ""}
                className="rounded border border-slate-200 px-3 py-2 shadow-inner focus:border-slate-400 focus:outline-none"
                placeholder="0-10"
              />
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1">
              <span className="text-[11px] uppercase tracking-wide text-slate-500">
                球到位
              </span>
              <input
                name="placementScore"
                type="number"
                min={0}
                max={10}
                defaultValue={rally.placementScore ?? ""}
                className="rounded border border-slate-200 px-3 py-2 shadow-inner focus:border-slate-400 focus:outline-none"
                placeholder="0-10"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[11px] uppercase tracking-wide text-slate-500">
                站位/步伐
              </span>
              <input
                name="footworkScore"
                type="number"
                min={0}
                max={10}
                defaultValue={rally.footworkScore ?? ""}
                className="rounded border border-slate-200 px-3 py-2 shadow-inner focus:border-slate-400 focus:outline-none"
                placeholder="0-10"
              />
            </label>
          </div>

          <label className="flex flex-col gap-1">
            <span className="text-[11px] uppercase tracking-wide text-slate-500">
              备注
            </span>
            <textarea
              name="notes"
              defaultValue={rally.notes ?? ""}
              rows={3}
              className="rounded border border-slate-200 px-3 py-2 shadow-inner focus:border-slate-400 focus:outline-none"
              placeholder="如击球模式、弱点、战术等"
            />
          </label>

          <div className="flex justify-end gap-2 pt-2">
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
              保存修改
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}

