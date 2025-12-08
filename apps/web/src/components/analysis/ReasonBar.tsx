"use client";

import { Progress } from "antd";

type Props = {
  label: string;
  value: number;
  color?: "green" | "red";
};

export function ReasonBar({ label, value, color = "green" }: Props) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-xs text-slate-600">
        <span className="truncate">{label}</span>
        <span className="font-medium text-slate-800">{value.toFixed(1)}%</span>
      </div>
      <Progress
        percent={Number(value.toFixed(1))}
        showInfo={false}
        strokeColor={color === "green" ? "#22c55e" : "#f87171"}
      />
    </div>
  );
}

