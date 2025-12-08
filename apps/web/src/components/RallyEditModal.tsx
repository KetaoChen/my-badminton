"use client";

import { useState } from "react";

import { updateRally } from "@/lib/actions";
import { Button, Checkbox, Input, InputNumber, Space } from "antd";
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
  excludeFromScore?: boolean | null;
};

type Props = {
  rally: Rally;
};

export function RallyEditModal({ rally }: Props) {
  const [open, setOpen] = useState(false);

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

          <Checkbox
            name="excludeFromScore"
            defaultChecked={!!rally.excludeFromScore}
          >
            不计入比分
          </Checkbox>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1">
              <span className="text-[11px] uppercase tracking-wide text-slate-500">
                战术得分
              </span>
              <InputNumber
                name="tacticScore"
                min={0}
                max={10}
                className="w-full"
                defaultValue={rally.tacticScore ?? undefined}
                placeholder="0-10"
              />
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

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1">
              <span className="text-[11px] uppercase tracking-wide text-slate-500">
                球到位
              </span>
              <InputNumber
                name="placementScore"
                min={0}
                max={10}
                className="w-full"
                defaultValue={rally.placementScore ?? undefined}
                placeholder="0-10"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[11px] uppercase tracking-wide text-slate-500">
                站位/步伐
              </span>
              <InputNumber
                name="footworkScore"
                min={0}
                max={10}
                className="w-full"
                defaultValue={rally.footworkScore ?? undefined}
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
            />
          </label>

          <Space className="flex justify-end w-full pt-2" size={8}>
            <Button onClick={() => setOpen(false)}>取消</Button>
            <Button type="primary" htmlType="submit">
              保存修改
            </Button>
          </Space>
        </form>
      </Modal>
    </>
  );
}

