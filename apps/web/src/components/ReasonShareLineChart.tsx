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
  type ChartOptions,
  type TooltipItem,
} from "chart.js";
import { Line } from "react-chartjs-2";

type Series = {
  label: string;
  points: { label: string; value: number }[];
  color: string;
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

function shortenLabel(label: string) {
  const parts = label.split("·").map((p) => p.trim());
  if (parts.length >= 1 && parts[0]) return parts[0];
  return label;
}

export function ReasonShareLineChart({ series }: { series: Series[] }) {
  if (series.length === 0) return null;
  const originalLabels = series[0].points.map((p) => p.label);
  const labels = originalLabels.map(shortenLabel);

  const datasets = series.map((s) => ({
    label: s.label,
    data: s.points.map((p) => p.value * 100),
    borderColor: s.color,
    backgroundColor: s.color,
    tension: 0.3,
    pointRadius: 2,
    pointHoverRadius: 4,
    fill: false,
  }));

  const data = { labels, datasets };

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index" as const, intersect: false },
    plugins: {
      legend: {
        display: true,
        position: "bottom" as const,
        labels: {
          boxWidth: 12,
          usePointStyle: true,
        },
      },
      tooltip: {
        callbacks: {
          title: (items) =>
            items.length ? originalLabels[items[0].dataIndex] : "",
          label: (ctx: TooltipItem<"line">) => {
            const v = ctx.parsed.y as number;
            return `${ctx.dataset.label}: ${v.toFixed(1)}%`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        suggestedMax: 100,
        ticks: {
          stepSize: 10,
          callback: (value) => `${value}%`,
        },
        grid: { color: "rgba(148,163,184,0.25)" },
      },
      x: {
        grid: { display: false },
        ticks: {
          maxRotation: 0,
          minRotation: 0,
          autoSkip: true,
          maxTicksLimit: 6,
        },
      },
    },
  };

  return (
    <div className="h-[320px]">
      <Line data={data} options={options} />
    </div>
  );
}
