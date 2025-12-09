"use client";

import { useState, useTransition } from "react";

import { Button, Checkbox, Input, InputNumber, Space } from "antd";

import { updateRally } from "@/lib/actions";
import { runClientAction } from "@/lib/clientActions";
import { Modal } from "./Modal";
import { ResultReasonFields } from "./ResultReasonFields";

type Rally = {
  id: string;
  matchId: string;
  result: "win" | "lose";
  pointReason: string | null;
  tacticUsed: boolean | null;
  serveScore: number | null;
  notes: string | null;
  excludeFromScore?: boolean | null;
};

type Props = {
  rally: Rally;
};

export function RallyEditModal({ rally }: Props) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <>
      <Button
        type="link"
        size="small"
        onClick={() => setOpen(true)}
        className="p-0"
      >
        编辑
      </Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={`编辑回合 #${rally.id.slice(0, 6)}`}
      >
        <form
          onSubmit={(event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            setError(null);
            startTransition(async () => {
              const ok = await runClientAction(() => updateRally(formData), {
                onErrorMessage: (msg) => setError(msg),
                successMessage: "回合已更新",
              });
              if (!ok) return;
              setOpen(false);
            });
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

          <Checkbox
            name="excludeFromScore"
            defaultChecked={!!rally.excludeFromScore}
          >
            不计入比分
          </Checkbox>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1">
              <span className="text-[11px] uppercase tracking-wide text-slate-500">
                使用战术
              </span>
              <Checkbox name="tacticUsed" defaultChecked={!!rally.tacticUsed}>
                是
              </Checkbox>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[11px] uppercase tracking-wide text-slate-500">
                发球到位
              </span>
              <InputNumber
                name="serveScore"
                min={0}
                max={10}
                className="w-full"
                defaultValue={rally.serveScore ?? undefined}
                placeholder="0-10"
              />
            </label>
          </div>

          <label className="flex flex-col gap-1">
            <span className="text-[11px] uppercase tracking-wide text-slate-500">
              备注
            </span>
            <Input.TextArea
              name="notes"
              defaultValue={rally.notes ?? ""}
              rows={3}
              placeholder="如击球模式、弱点、战术等"
              disabled={pending}
            />
          </label>

          {error ? (
            <div className="text-sm text-red-600" role="alert">
              {error}
            </div>
          ) : null}

          <Space className="flex justify-end w-full pt-2" size={8}>
            <Button onClick={() => setOpen(false)} disabled={pending}>
              取消
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={pending}
              disabled={pending}
            >
              保存修改
            </Button>
          </Space>
        </form>
      </Modal>
    </>
  );
}
