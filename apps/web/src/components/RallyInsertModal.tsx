"use client";

import { useState, useTransition } from "react";

import { Button, Checkbox, Input, InputNumber, Space } from "antd";

import { createRally } from "@/lib/actions";
import { useRunClientAction } from "@/lib/clientActions";
import { Modal } from "./Modal";
import { ResultReasonFields } from "./ResultReasonFields";
import { type Rally } from "./match/types";

type Props = {
  matchId: string;
  insertPosition: number;
  rallies: Rally[];
  defaultReason?: string;
};

export function RallyInsertModal({
  matchId,
  insertPosition,
  rallies,
  defaultReason = "对手失误",
}: Props) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [resultValue, setResultValue] = useState<"win" | "lose">("win");
  const [reasonValue, setReasonValue] = useState<string>(defaultReason);
  const runClientAction = useRunClientAction();

  const maxSequence = rallies.length > 0
    ? Math.max(...rallies.map((r) => r.sequence ?? 0))
    : 0;

  return (
    <>
      <Button
        type="link"
        size="small"
        onClick={() => setOpen(true)}
        className="p-0"
      >
        {insertPosition > (rallies.length > 0
          ? Math.max(...rallies.map((r) => r.sequence ?? 0))
          : 0)
          ? "末尾插入"
          : "插入"}
      </Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={`在第 ${insertPosition} 个位置插入回合`}
      >
        <form
          onSubmit={(event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            formData.set("matchId", matchId);
            formData.set("result", resultValue);
            formData.set("pointReason", reasonValue);
            formData.set("insertPosition", String(insertPosition));
            setError(null);
            startTransition(async () => {
              const ok = await runClientAction(() => createRally(formData), {
                onErrorMessage: (msg) => setError(msg),
                successMessage: "回合已插入",
              });
              if (!ok) return;
              setOpen(false);
            });
          }}
          className="space-y-3 text-sm"
        >
          <input type="hidden" name="matchId" value={matchId} />
          <input type="hidden" name="insertPosition" value={insertPosition} />

          <div className="rounded-md bg-slate-50 p-3 text-sm text-slate-600">
            将在第 <strong>{insertPosition}</strong> 个位置插入新回合
            {maxSequence > 0 && `（当前共 ${maxSequence} 个回合）`}
          </div>

          <ResultReasonFields
            defaultResult="win"
            defaultReason={defaultReason}
            resultName="result"
            reasonName="pointReason"
            onChange={({ result, reason }) => {
              setResultValue(result);
              setReasonValue(reason);
            }}
          />

          <Checkbox name="excludeFromScore" defaultChecked={false}>
            不计入比分
          </Checkbox>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1">
              <span className="text-[11px] uppercase tracking-wide text-slate-500">
                使用战术
              </span>
              <Checkbox name="tacticUsed" defaultChecked={false}>
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
                placeholder="0-10"
                controls={false}
              />
            </label>
          </div>

          <label className="flex flex-col gap-1">
            <span className="text-[11px] uppercase tracking-wide text-slate-500">
              备注
            </span>
            <Input.TextArea
              name="notes"
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
              插入回合
            </Button>
          </Space>
        </form>
      </Modal>
    </>
  );
}
