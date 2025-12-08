"use client";

import { useState, useTransition } from "react";

import { Button, Checkbox, Form, Input, InputNumber } from "antd";

import { createRally } from "@/lib/actions";
import { ResultReasonFields } from "../ResultReasonFields";

type Props = {
  matchId: string;
  defaultReason?: string;
};

export function RallyForm({ matchId, defaultReason = "对手失误" }: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <Form
      layout="vertical"
      component="form"
      size="middle"
      className="space-y-2"
      onSubmitCapture={(event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const formData = new FormData(form);
        setError(null);
        startTransition(async () => {
          try {
            await createRally(formData);
            form.reset();
          } catch (e) {
            console.error(e);
            setError("保存失败，请重试");
          }
        });
      }}
    >
      <input type="hidden" name="matchId" value={matchId} />

      <ResultReasonFields
        key={`create-${matchId}`}
        defaultResult="win"
        defaultReason={defaultReason}
      />

      <Form.Item className="!mb-3">
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-700">发球到位程度</span>
          <InputNumber
            name="serveScore"
            min={0}
            max={10}
            className="w-28"
            placeholder="0-10"
            controls={false}
            disabled={pending}
          />
        </div>
      </Form.Item>

      <Form.Item
        name="excludeFromScore"
        valuePropName="checked"
        className="!mb-3"
      >
        <Checkbox name="excludeFromScore" disabled={pending}>
          不计入比分
        </Checkbox>
      </Form.Item>

      <div className="h-px w-full bg-slate-200" />

      <Form.Item name="tacticUsed" valuePropName="checked" className="!mb-3">
        <Checkbox name="tacticUsed" disabled={pending}>
          使用战术
        </Checkbox>
      </Form.Item>

      <div className="h-px w-full bg-slate-200" />

      <Form.Item label="备注" className="!mb-3">
        <Input.TextArea
          name="notes"
          rows={3}
          placeholder="如击球模式、弱点、战术等"
          disabled={pending}
        />
      </Form.Item>

      {error ? (
        <div className="text-sm text-red-600" role="alert">
          {error}
        </div>
      ) : null}

      <Form.Item className="!mb-0">
        <Button
          type="primary"
          htmlType="submit"
          block
          style={{ paddingInline: 16 }}
          loading={pending}
          disabled={pending}
        >
          保存回合
        </Button>
      </Form.Item>
    </Form>
  );
}
