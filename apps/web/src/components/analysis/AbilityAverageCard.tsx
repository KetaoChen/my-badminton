"use client";

import { Card, Space, Progress } from "antd";

import { type Analysis } from "./types";

type Props = {
  abilities: Analysis["abilities"];
};

export function AbilityAverageCard({ abilities }: Props) {
  return (
    <Card title="能力平均分" className="shadow-sm">
      <Space orientation="vertical" className="w-full">
        <ScoreBar label="发球" value={abilities.serve} />
        <ScoreBar label="战术" value={abilities.tactic} />
      </Space>
    </Card>
  );
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  const clamped = Math.max(0, Math.min(10, value || 0));
  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-xs text-slate-600">
        <span>{label}</span>
        <span className="font-medium text-slate-800">{clamped.toFixed(1)}</span>
      </div>
      <Progress
        percent={Number(((clamped / 10) * 100).toFixed(1))}
        showInfo={false}
        strokeColor="#0ea5e9"
      />
    </div>
  );
}

