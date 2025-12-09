"use client";

import { useEffect, useMemo, useState } from "react";
import { Radio, Segmented, Space } from "antd";

type Props = {
  defaultResult?: "win" | "lose";
  defaultReason?: string | null;
  resultName?: string;
  reasonName?: string;
  onChange?: (value: { result: "win" | "lose"; reason: string }) => void;
};

const winReasons = [
  "对手失误",
  "拉吊",
  "突击",
  "杀球",
  "网前",
  "防反",
  "假动作",
  "其他",
] as const;
const loseReasons = [
  "我方失误",
  "球不到位",
  "步伐不到位",
  "对手制胜球",
  "其他",
] as const;

export function ResultReasonFields({
  defaultResult = "win",
  defaultReason,
  resultName = "result",
  reasonName = "pointReason",
  onChange,
}: Props) {
  const [result, setResult] = useState<"win" | "lose">(defaultResult);
  const [reason, setReason] = useState<string>(() => {
    const available = defaultResult === "win" ? winReasons : loseReasons;
    if (defaultReason && available.includes(defaultReason as never)) {
      return defaultReason;
    }
    return available[0];
  });

  const reasons = useMemo(
    () => (result === "win" ? winReasons : loseReasons),
    [result]
  );
  const safeReason = useMemo(() => {
    if (reasons.includes(reason as never)) return reason;
    if (defaultReason && reasons.includes(defaultReason as never)) {
      return defaultReason;
    }
    return reasons[0];
  }, [reason, defaultReason, reasons]);

  useEffect(() => {
    if (!onChange) return;
    onChange({ result, reason: safeReason });
  }, [result, safeReason, onChange]);

  return (
    <Space orientation="vertical" size={8} className="w-full">
      <Segmented
        value={result}
        onChange={(value) => {
          const nextResult = value as "win" | "lose";
          setResult(nextResult);
          const nextReasons = nextResult === "win" ? winReasons : loseReasons;
          setReason((prev) =>
            nextReasons.includes(prev as never) ? prev : nextReasons[0]
          );
        }}
        options={[
          { label: "得分", value: "win" },
          { label: "失分", value: "lose" },
        ]}
        size="large"
        block
      />
      <input type="hidden" name={resultName} value={result} />

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-slate-700">
          {result === "win" ? "得分原因" : "失分原因"}
        </span>
        <Radio.Group
          onChange={(e) => setReason(e.target.value)}
          value={safeReason}
          className="w-full"
        >
          <div className="grid grid-cols-2 gap-x-6 gap-y-2">
            {reasons.map((r) => (
              <Radio key={r} value={r}>
                {r}
              </Radio>
            ))}
          </div>
        </Radio.Group>
        <input type="hidden" name={reasonName} value={safeReason} />
      </div>
    </Space>
  );
}
