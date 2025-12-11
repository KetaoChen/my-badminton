"use client";

import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";
import type { ChartOptions, Plugin } from "chart.js";

import { type Rally } from "./types";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

type Props = {
  rallies: Rally[];
};

export function RallyEventChart({ rallies }: Props) {
  const events = rallies.map((rally, idx) => {
    const seq = rally.sequence ?? idx + 1;
    const reason = (rally.pointReason ?? "").trim();
    const serve =
      rally.serveScore != null && rally.serveScore > 0
        ? rally.serveScore
        : null;
    const myError = rally.result === "lose" && reason === "我方失误";
    const tactic = !!rally.tacticUsed;
    return { seq, serve, myError, tactic };
  });

  const labels = events.map((e) => `#${e.seq}`);
  const serveData = events.map((e) =>
    e.serve == null ? null : Number(e.serve)
  );
  const errorData = events.map((e) => (e.myError ? 2 : null));
  const tacticData = events.map((e) => (e.tactic ? 1 : null));

  const maxServe = Math.max(
    0,
    ...serveData.filter((v): v is number => v != null)
  );
  const baseMax = Math.max(maxServe, 2);
  const suggestedMax = Math.max(5, Math.ceil(baseMax * 1.2));

  const chartData = {
    labels,
    datasets: [
      {
        label: "发球分",
        data: serveData,
        borderColor: "#0ea5e9",
        backgroundColor: "#0ea5e9",
        tension: 0.25,
        pointRadius: 3,
        spanGaps: false,
      },
      {
        label: "我方失误失分",
        data: errorData,
        borderColor: "#ef4444",
        backgroundColor: "#ef4444",
        pointBorderColor: "#ef4444",
        pointBorderWidth: 2,
        pointBackgroundColor: "#fff",
        showLine: false,
        pointRadius: 5,
        pointStyle: "cross",
        borderWidth: 0,
      },
      {
        label: "使用战术",
        data: tacticData,
        borderColor: "#22c55e",
        backgroundColor: "#22c55e",
        pointBorderColor: "#22c55e",
        showLine: false,
        pointRadius: 5,
        pointStyle: "triangle",
        borderWidth: 0,
      },
    ],
  };

  const valueLabelPlugin: Plugin<"line"> = {
    id: "rallyValueLabels",
    afterDatasetsDraw: (chart) => {
      const {
        ctx,
        data: { datasets },
      } = chart;
      ctx.save();
      ctx.fillStyle = "#0f172a";
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.font = "500 10px sans-serif";

      datasets.forEach((dataset, datasetIndex) => {
        const meta = chart.getDatasetMeta(datasetIndex);
        meta.data.forEach((element, index) => {
          const raw = dataset.data[index] as number | null;
          if (raw == null || Number.isNaN(raw)) return;
          const { x, y } = element.getProps(["x", "y"], true);
          const label =
            dataset.label === "发球分"
              ? raw.toFixed(1)
              : dataset.label === "我方失误失分"
              ? "X"
              : "✓";
          ctx.fillText(label, x, y - 6);
        });
      });
      ctx.restore();
    },
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "nearest", intersect: false },
    plugins: {
      legend: {
        display: true,
        position: "bottom",
      },
      tooltip: { enabled: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        suggestedMax,
        grid: { color: "rgba(148,163,184,0.25)" },
        ticks: {
          stepSize: suggestedMax <= 10 ? 2 : Math.ceil(suggestedMax / 5),
        },
      },
      x: {
        grid: { display: false },
        ticks: {
          maxRotation: 0,
          minRotation: 0,
          autoSkip: true,
          maxTicksLimit: 12,
        },
      },
    },
  };

  return (
    <div className="h-[280px]">
      <Line data={chartData} options={options} plugins={[valueLabelPlugin]} />
    </div>
  );
}
