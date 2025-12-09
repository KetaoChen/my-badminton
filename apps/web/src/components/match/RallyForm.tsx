"use client";

import { useState, useTransition } from "react";

import { Button, Checkbox, Form, Input, InputNumber } from "antd";

import { createRally } from "@/lib/actions";
import { runClientAction } from "@/lib/clientActions";
import { ResultReasonFields } from "../ResultReasonFields";

type Props = {
  matchId: string;
  defaultReason?: string;
};

export function RallyForm({ matchId, defaultReason = "对手失误" }: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [form] = Form.useForm();
  const [resetKey, setResetKey] = useState(0);
  const [resultValue, setResultValue] = useState<"win" | "lose">("win");
  const [reasonValue, setReasonValue] = useState<string>(defaultReason);

  return (
    <Form
      form={form}
      layout="vertical"
      component="form"
      size="middle"
      className="space-y-2"
      initialValues={{
        serveScore: undefined,
        excludeFromScore: false,
        tacticUsed: false,
        notes: "",
      }}
      onSubmitCapture={(event) => {
        event.preventDefault();
        const formEl = event.currentTarget;
        const formData = new FormData(formEl);
        formData.set("matchId", matchId);
        formData.set("result", resultValue);
        formData.set("pointReason", reasonValue);
        const values = form.getFieldsValue();
        formData.set("excludeFromScore", values.excludeFromScore ? "on" : "");
        formData.set("tacticUsed", values.tacticUsed ? "on" : "");
        formData.set(
          "serveScore",
          values.serveScore !== undefined && values.serveScore !== null
            ? String(values.serveScore)
            : ""
        );
        formData.set("notes", values.notes ?? "");
        setError(null);
        startTransition(async () => {
          const ok = await runClientAction(() => createRally(formData), {
            onErrorMessage: (msg) => setError(msg),
            successMessage: "回合已保存",
          });
          if (!ok) return;
          form.resetFields([
            "serveScore",
            "excludeFromScore",
            "tacticUsed",
            "notes",
          ]);
          setResetKey((key) => key + 1);
          setResultValue("win");
          setReasonValue(defaultReason);
        });
      }}
    >
      <input type="hidden" name="matchId" value={matchId} />

      <ResultReasonFields
        key={`create-${matchId}-${resetKey}`}
        defaultResult="win"
        defaultReason={defaultReason}
        onChange={({ result, reason }) => {
          setResultValue(result);
          setReasonValue(reason);
        }}
      />

      <Form.Item name="serveScore" className="!mb-3">
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-700">发球到位程度</span>
          <InputNumber
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

      <Form.Item name="notes" label="备注" className="!mb-3">
        <Input.TextArea
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
