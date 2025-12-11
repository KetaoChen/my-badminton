"use client";

import { Card, Typography } from "antd";

import { AbilityLineChart } from "../AbilityLineChart";
import { type AggregatedStats } from "./types";

type Props = {
  series: AggregatedStats["abilityTimeSeries"];
};

export function AbilitySeriesCard({ series }: Props) {
  return (
    <Card title="能力分随时间（最近 12 场）" className="shadow-sm">
      {series.length === 0 ? (
        <Typography.Text type="secondary">暂无数据</Typography.Text>
      ) : (
        <AbilityLineChart data={series} />
      )}
    </Card>
  );
}

