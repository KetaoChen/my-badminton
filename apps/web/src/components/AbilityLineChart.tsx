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

type SeriesPoint = {
  matchDate: string | null;
  title: string;
  opponentName: string;
  serve: number;
  placement: number;
  footwork: number;
  tactic: number;
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

export function AbilityLineChart({ data }: { data: SeriesPoint[] }) {
  const labels = data
    .map((d) => {
      if (d.matchDate) return String(d.matchDate);
      return d.title;
    })
    .reverse(); // show oldest to newest left->right

  const toDs = (key: keyof SeriesPoint, color: string, label: string) => ({
    label,
    data: [...data].reverse().map((d) => Number(d[key] || 0)),
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
      toDs("placement", "#22c55e", "球到位"),
      toDs("footwork", "#f59e0b", "站位&步伐"),
      toDs("tactic", "#6366f1", "战术"),
    ],
  };

  const options = {
    responsive: true,
    interaction: { mode: "index" as const, intersect: false },
    plugins: {
      legend: {
        display: true,
        position: "bottom" as const,
      },
      tooltip: {},
    },
    scales: {
      y: {
        beginAtZero: true,
        suggestedMax: 10,
        ticks: { stepSize: 2 },
      },
    },
  };

  return <Line data={chartData} options={options} />;
}

