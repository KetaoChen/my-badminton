"use client";

import { Card, Space, Typography } from "antd";

import { ReasonBar } from "./ReasonBar";
import { ReasonShare } from "./types"; // we need type, add to types

type Props = {
  title: string;
  reasons: ReasonShare[];
  color?: "green" | "red";
};

export function ReasonShareCard({ title, reasons, color = "green" }: Props) {
  return (
    <Card title={title} className="shadow-sm">
      {reasons.length === 0 ? (
        <Typography.Text type="secondary">暂无数据</Typography.Text>
      ) : (
        <Space direction="vertical" className="w-full">
          {reasons.map((r) => (
            <ReasonBar
              key={r.reason}
              label={r.reason}
              value={r.avgShare * 100}
              color={color}
            />
          ))}
        </Space>
      )}
    </Card>
  );
}

