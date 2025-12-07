"use client";

import { useMemo, useState } from "react";

type Props = {
  defaultResult?: "win" | "lose";
  defaultReason?: string | null;
  resultName?: string;
  reasonName?: string;
};

const winReasons = ["对手失误", "我方制胜球", "其他"] as const;
const loseReasons = ["我方失误", "对手制胜球", "其他"] as const;

export function ResultReasonFields({
  defaultResult = "win",
  defaultReason,
  resultName = "result",
  reasonName = "pointReason",
}: Props) {
  const reasonsFor = (res: "win" | "lose") =>
    res === "win" ? winReasons : loseReasons;

  const [result, setResult] = useState<"win" | "lose">(defaultResult);
  const [reason, setReason] = useState<string>(() => {
    const available = reasonsFor(defaultResult);
    if (defaultReason && available.includes(defaultReason as never)) {
      return defaultReason;
    }
    return available[0];
  });

  const reasons = useMemo(() => reasonsFor(result), [result]);

  return (
    <div className="space-y-2">
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">结果 *</label>
        <select
          name={resultName}
          value={result}
          onChange={(e) => {
            const nextResult = e.target.value as "win" | "lose";
            setResult(nextResult);
            const nextReasons = reasonsFor(nextResult);
            setReason((prev) =>
              nextReasons.includes(prev as never) ? prev : nextReasons[0]
            );
          }}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-inner focus:border-slate-400 focus:outline-none"
          required
        >
          <option value="win">得分</option>
          <option value="lose">失分</option>
        </select>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">
          {result === "win" ? "得分原因" : "失分原因"}
        </label>
        <select
          name={reasonName}
          value={reason}
          onChange={(e) => {
            const next = e.target.value;
            const allowed = reasonsFor(result);
            setReason(allowed.includes(next as never) ? next : allowed[0]);
          }}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-inner focus:border-slate-400 focus:outline-none"
          required
        >
          {reasons.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

