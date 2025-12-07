import Link from "next/link";

import { AbilityLineChart } from "@/components/AbilityLineChart";
import { ReasonShareLineChart } from "@/components/ReasonShareLineChart";
import { getAnalysis, getAnalysisFilters } from "@/lib/analysis";

type PageProps = {
  searchParams: Promise<{
    tournamentOnly?: string;
    opponentId?: string;
    tournamentId?: string;
    startDate?: string;
    endDate?: string;
  }>;
};

export default async function AnalysisPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const filters = {
    tournamentOnly: params.tournamentOnly === "on",
    opponentId: params.opponentId || undefined,
    tournamentId: params.tournamentId || undefined,
    startDate: params.startDate || undefined,
    endDate: params.endDate || undefined,
  };

  const { opponents, tournaments } = await getAnalysisFilters();
  const analysis = await getAnalysis(filters);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-5 sm:px-6">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Match Analysis
            </p>
            <h1 className="text-2xl font-semibold text-slate-900">比赛分析</h1>
            <p className="text-sm text-slate-500">
              按正式赛 / 对手过滤，默认展示全部比赛。
            </p>
          </div>
          <Link
            href="/"
            className="text-sm font-medium text-slate-700 underline-offset-4 hover:underline"
          >
            返回首页
          </Link>
        </div>
      </header>

      <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6">
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex flex-col gap-1">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              筛选
            </p>
            <h2 className="text-lg font-semibold text-slate-900">
              按正式赛 / 对手 / 时间过滤
            </h2>
          </div>
          <form className="grid gap-4 md:grid-cols-2" method="get">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">对手</label>
              <select
                name="opponentId"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-inner focus:border-slate-400 focus:outline-none"
                defaultValue={filters.opponentId ?? ""}
              >
                <option value="">全部对手</option>
                {opponents.map((opponent) => (
                  <option key={opponent.id} value={opponent.id}>
                    {opponent.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                赛事（正式赛）
              </label>
              <select
                name="tournamentId"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-inner focus:border-slate-400 focus:outline-none"
                defaultValue={filters.tournamentId ?? ""}
              >
                <option value="">全部赛事</option>
                {tournaments.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                起始日期
              </label>
              <input
                type="date"
                name="startDate"
                defaultValue={filters.startDate ?? ""}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-inner focus:border-slate-400 focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                结束日期
              </label>
              <input
                type="date"
                name="endDate"
                defaultValue={filters.endDate ?? ""}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-inner focus:border-slate-400 focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">其他</label>
              <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  name="tournamentOnly"
                  defaultChecked={filters.tournamentOnly}
                  className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500"
                />
                仅正式赛
              </label>
            </div>
            <div className="md:col-span-2">
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
              >
                应用筛选
              </button>
            </div>
          </form>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="总比赛" value={analysis.matchCount} />
            <StatCard
              label="胜率(按场)"
              value={`${analysis.winRate.toFixed(1)}%`}
            />
            <StatCard
              label="场次 胜 / 负"
              value={`${analysis.matchWins} / ${analysis.matchLosses}`}
            />
            <StatCard
              label="回合 胜 / 负"
              value={`${analysis.wins} / ${analysis.losses}`}
            />
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <ChartCard title="得分原因（均值占比）">
            {analysis.winReasonShares.length === 0 ? (
              <EmptyText />
            ) : (
              <div className="space-y-2">
                {analysis.winReasonShares.map((r) => (
                  <div key={r.reason}>
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span className="truncate">{r.reason}</span>
                      <span className="font-medium text-slate-800">
                        {(r.avgShare * 100).toFixed(1)}%
                      </span>
                    </div>
                    <Bar value={r.avgShare * 100} max={100} />
                  </div>
                ))}
              </div>
            )}
          </ChartCard>

          <ChartCard title="失分原因（均值占比）">
            {analysis.loseReasonShares.length === 0 ? (
              <EmptyText />
            ) : (
              <div className="space-y-2">
                {analysis.loseReasonShares.map((r) => (
                  <div key={r.reason}>
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span className="truncate">{r.reason}</span>
                      <span className="font-medium text-slate-800">
                        {(r.avgShare * 100).toFixed(1)}%
                      </span>
                    </div>
                    <Bar value={r.avgShare * 100} max={100} />
                  </div>
                ))}
              </div>
            )}
          </ChartCard>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <ChartCard title="得分原因随时间">
            {analysis.winReasonSeries.length === 0 ? (
              <EmptyText />
            ) : (
              <ReasonShareLineChart series={analysis.winReasonSeries} />
            )}
          </ChartCard>

          <ChartCard title="失分原因随时间">
            {analysis.loseReasonSeries.length === 0 ? (
              <EmptyText />
            ) : (
              <ReasonShareLineChart series={analysis.loseReasonSeries} />
            )}
          </ChartCard>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <ChartCard title="能力平均分">
            <div className="space-y-2 text-sm text-slate-700">
              <LabeledBar label="发球" value={analysis.abilities.serve} />
              <LabeledBar label="球到位" value={analysis.abilities.placement} />
              <LabeledBar
                label="站位&步伐"
                value={analysis.abilities.footwork}
              />
              <LabeledBar label="战术" value={analysis.abilities.tactic} />
            </div>
          </ChartCard>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-3">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              能力分随时间（最近 12 场）
            </p>
          </div>
          {analysis.abilityTimeSeries.length === 0 ? (
            <EmptyText />
          ) : (
            <AbilityLineChart data={analysis.abilityTimeSeries} />
          )}
        </section>
      </main>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-3">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          {title}
        </p>
      </div>
      {children}
    </div>
  );
}

function Bar({ value, max }: { value: number; max: number }) {
  const width = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="mt-1 h-2 w-full overflow-hidden rounded bg-slate-200">
      <div
        className="h-2 bg-emerald-500 transition-all"
        style={{ width: `${width}%` }}
      />
    </div>
  );
}

function LabeledBar({ label, value }: { label: string; value: number }) {
  const clamped = Math.max(0, Math.min(10, value || 0));
  return (
    <div>
      <div className="flex items-center justify-between text-xs text-slate-600">
        <span>{label}</span>
        <span className="font-medium text-slate-800">{clamped.toFixed(1)}</span>
      </div>
      <div className="mt-1 h-2 w-full overflow-hidden rounded bg-slate-200">
        <div
          className="h-2 bg-sky-500 transition-all"
          style={{ width: `${(clamped / 10) * 100}%` }}
        />
      </div>
    </div>
  );
}

function EmptyText() {
  return <p className="text-sm text-slate-500">暂无数据</p>;
}
