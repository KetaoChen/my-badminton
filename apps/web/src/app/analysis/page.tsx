import Link from "next/link";

import { getAnalysisFilters } from "@/lib/analysis";

export default async function AnalysisPage() {
  const { opponents, tournaments } = await getAnalysisFilters();

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
              按正式赛 / 对手筛选，查看汇总表现。
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
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                筛选
              </p>
              <h2 className="text-lg font-semibold text-slate-900">
                按正式赛 / 对手过滤
              </h2>
            </div>
          </div>
          <form className="grid gap-4 sm:grid-cols-3">
            <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
              <input
                type="checkbox"
                name="tournamentOnly"
                className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500"
              />
              仅正式赛
            </label>
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium text-slate-700">
                对手
              </label>
              <select
                name="opponentId"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-inner focus:border-slate-400 focus:outline-none"
                defaultValue=""
              >
                <option value="">全部对手</option>
                {opponents.map((opponent) => (
                  <option key={opponent.id} value={opponent.id}>
                    {opponent.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2 sm:col-span-3">
              <label className="text-sm font-medium text-slate-700">
                赛事（正式赛）
              </label>
              <select
                name="tournamentId"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-inner focus:border-slate-400 focus:outline-none"
                defaultValue=""
              >
                <option value="">全部赛事</option>
                {tournaments.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </form>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">
            分析数据接口占位。可按筛选条件返回胜率、场次、回合数、得失分原因分布等。
          </p>
        </section>
      </main>
    </div>
  );
}

