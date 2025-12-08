"use client";

import { useState } from "react";

import { deleteMatch } from "@/lib/actions";
import { Modal } from "./Modal";

type Props = {
  matchId: string;
};

export function DeleteMatchButton({ matchId }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600"
      >
        删除比赛
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="确认删除比赛"
        maxWidthClass="max-w-md"
      >
        <div className="space-y-4 text-sm text-slate-700">
          <p>删除比赛将同时删除其所有回合数据，操作不可恢复，确定继续吗？</p>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              取消
            </button>
            <form
              action={async () => {
                await deleteMatch(matchId);
              }}
            >
              <button
                type="submit"
                className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600"
              >
                确认删除
              </button>
            </form>
          </div>
        </div>
      </Modal>
    </>
  );
}

