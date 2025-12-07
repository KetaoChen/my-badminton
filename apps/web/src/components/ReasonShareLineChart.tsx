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
  Legend,
);

export function ReasonShareLineChart({ series }: { series: Series[] }) {
  if (series.length === 0) return null;
  const labels = series[0].points.map((p) => p.label).reverse();

  const datasets = series.map((s) => ({
    label: s.label,
    data: [...s.points].reverse().map((p) => p.value * 100),
    borderColor: s.color,
    backgroundColor: s.color,
    tension: 0.25,
    pointRadius: 3,
    fill: false,
  }));

  const data = { labels, datasets };

  const options = {
    responsive: true,
    interaction: { mode: "index" as const, intersect: false },
    plugins: {
      legend: {
        display: true,
        position: "bottom" as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        suggestedMax: 100,
        ticks: { stepSize: 10 },
      },
    },
  };

  return <Line data={data} options={options} />;
}

