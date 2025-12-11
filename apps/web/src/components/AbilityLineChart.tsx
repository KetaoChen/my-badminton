"use client";

import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";
import type { ChartOptions, TooltipItem } from "chart.js";

type SeriesPoint = {
  matchDate: string | null;
  title: string;
  opponentName: string;
  serve: number | null;
  tactic: number;
  error: number;
};

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export function AbilityLineChart({ data }: { data: SeriesPoint[] }) {
  const labelsFull = data.map((d) => `${d.matchDate ?? "无日期"} · ${d.title}`);

  const labels = labelsFull.map((label) => {
    const [datePart] = label.split("·").map((s) => s.trim());
    return datePart || label;
  });

  const toDs = (key: keyof SeriesPoint, color: string, label: string) => ({
    label,
    data: data.map((d) => (d[key] == null ? null : Number(d[key]))) as Array<
      number | null
    >,
    borderColor: color,
    backgroundColor: color,
    tension: 0.25,
    pointRadius: 3,
    fill: false,
  });

  const chartData = {
    labels,
    datasets: [
      toDs("serve", "#0ea5e9", "发球"),
      toDs("tactic", "#22c55e", "战术使用"),
      toDs("error", "#ef4444", "失误"),
    ],
  };

  const allValues = chartData.datasets
    .flatMap((ds) => ds.data)
    .filter((v): v is number => typeof v === "number" && !Number.isNaN(v));
  const maxVal = allValues.length ? Math.max(...allValues) : 0;
  const suggestedMax = Math.max(5, Math.ceil(maxVal * 1.2));
  const stepSize = suggestedMax <= 10 ? 2 : Math.ceil(suggestedMax / 5);

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index" as const, intersect: false },
    plugins: {
      legend: {
        display: true,
        position: "bottom" as const,
      },
      tooltip: {
        callbacks: {
          title: (items) =>
            items.length ? labelsFull[items[0].dataIndex] : "",
          label: (ctx: TooltipItem<"line">) => {
            const v = ctx.parsed.y as number | null;
            if (v == null || Number.isNaN(v)) return undefined;
            return `${ctx.dataset.label}: ${v.toFixed(1)}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        suggestedMax,
        ticks: { stepSize },
        grid: { color: "rgba(148,163,184,0.25)" },
      },
      x: {
        grid: { display: false },
        ticks: {
          maxRotation: 0,
          minRotation: 0,
          autoSkip: true,
          maxTicksLimit: 8,
        },
      },
    },
  };

  return (
    <div className="h-[320px]">
      <Line data={chartData} options={options} />
    </div>
  );
}
