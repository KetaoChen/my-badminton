"use client";

import { Card, Typography } from "antd";

import { ReasonShareLineChart } from "../ReasonShareLineChart";
import { type Analysis } from "./types";

type Props = {
  title: string;
  series: Analysis["winReasonSeries"] | Analysis["loseReasonSeries"];
};

export function ReasonSeriesCard({ title, series }: Props) {
  return (
    <Card title={title} className="shadow-sm">
      {series.length === 0 ? (
        <Typography.Text type="secondary">暂无数据</Typography.Text>
      ) : (
        <ReasonShareLineChart series={series} />
      )}
    </Card>
  );
}

