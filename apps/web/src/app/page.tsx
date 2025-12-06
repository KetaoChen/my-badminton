import Link from "next/link";

import {
  createMatch,
  getDashboardSummary,
  listMatches,
  listOpponents,
} from "@/lib/actions";

function formatDate(value?: string | Date | null) {
  if (!value) return "未设置日期";
  const dateValue = typeof value === "string" ? value : value.toISOString();
  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "medium",
  }).format(new Date(dateValue));
}

export default async function Home() {
  const [matches, opponents, dashboard] = await Promise.all([
    listMatches(),
    listOpponents(),
    getDashboardSummary(),
  ]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-sm uppercase tracking-wide text-slate-500">
              Badminton Analytics
            </p>
            <h1 className="text-2xl font-semibold text-slate-900">
              比赛与回合记录
            </h1>
            <p className="text-sm text-slate-500">
              手动录入比赛与每回合的得失分，为后续视频/模型分析做基础。
            </p>
          </div>
          <div className="hidden text-sm font-medium text-slate-500 sm:block">
            数据存云端 · 无需登录（后续可加）
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-6">
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              比赛场次
            </p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">
              {dashboard.matchCount}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              回合数
            </p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">
              {dashboard.rallyCount}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              胜率
            </p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">
              {dashboard.winRate.toFixed(1)}%
            </p>
            <p className="text-xs text-slate-500">
              {dashboard.wins} 胜 / {dashboard.losses} 负
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              近五场趋势
            </p>
            <div className="mt-2 space-y-1 text-xs text-slate-700">
              {dashboard.recent.length === 0 ? (
                <p className="text-slate-500">暂无数据</p>
              ) : (
                dashboard.recent.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between"
                  >
                    <span className="truncate">
                      {item.title} ({item.opponentName || "未填写"})
                    </span>
                    <span className="font-semibold">
                      {item.wins}-{item.losses} ({item.winRate.toFixed(0)}%)
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-[1.1fr_1fr]">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  新增比赛
                </p>
                <h2 className="text-lg font-semibold text-slate-900">
                  基础信息
                </h2>
              </div>
            </div>
            <form action={createMatch} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  比赛名称 *
                </label>
                <input
                  name="title"
                  required
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-inner focus:border-slate-400 focus:outline-none"
                  placeholder="例如：周末练习赛 / 俱乐部内部赛"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    日期
                  </label>
                  <input
                    type="date"
                    name="matchDate"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-inner focus:border-slate-400 focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    对手（可选已有或手填）
                  </label>
                  <select
                    name="opponentId"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-inner focus:border-slate-400 focus:outline-none"
                    defaultValue=""
                  >
                    <option value="">选择已有对手</option>
                    {opponents.map((opponent) => (
                      <option key={opponent.id} value={opponent.id}>
                        {opponent.name}
                      </option>
                    ))}
                  </select>
                  <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <input
                      name="opponent"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-inner focus:border-slate-400 focus:outline-none"
                      placeholder="或手动输入对手名称/备注"
                    />
                    <label className="flex items-center gap-2 text-xs text-slate-600">
                      <input
                        type="checkbox"
                        name="trainingOpponent"
                        className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500"
                      />
                      标记为训练对手（出现在下拉列表）
                    </label>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  备注
                </label>
                <textarea
                  name="notes"
                  rows={3}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-inner focus:border-slate-400 focus:outline-none"
                  placeholder="场地、球拍、当天状态等信息"
                />
              </div>
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
              >
                保存比赛
              </button>
            </form>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  历史比赛
                </p>
                <h2 className="text-lg font-semibold text-slate-900">
                  已创建的比赛
                </h2>
              </div>
            </div>

            {matches.length === 0 ? (
              <p className="text-sm text-slate-500">
                还没有数据，先创建一场比赛吧。
              </p>
            ) : (
              <ul className="space-y-3">
                {matches.map((match) => (
                  <li
                    key={match.id}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 transition hover:-translate-y-0.5 hover:shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {match.title}
                        </p>
                        <p className="text-xs text-slate-500">
                          {formatDate(match.matchDate)} · 对手：{" "}
                          {match.opponentName || "未填写"}
                        </p>
                      </div>
                      <Link
                        href={`/matches/${match.id}`}
                        className="text-sm font-medium text-slate-700 underline-offset-4 hover:underline"
                      >
                        查看详情
                      </Link>
                    </div>
                    {match.notes ? (
                      <p className="mt-2 text-sm text-slate-600">
                        {match.notes}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                常见得失分原因
              </p>
              <h2 className="text-lg font-semibold text-slate-900">
                Top 5 原因
              </h2>
            </div>
          </div>
          {dashboard.topReasons.length === 0 ? (
            <p className="text-sm text-slate-500">暂无数据。</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {dashboard.topReasons.map((item) => (
                <div
                  key={item.reason}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
                >
                  <p className="text-sm font-semibold text-slate-900">
                    {item.reason}
                  </p>
                  <p className="text-xs text-slate-600">
                    {item.total} 次 · 胜 {item.wins} / 负 {item.losses}
                  </p>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded bg-slate-200">
                    <div
                      className="h-2 bg-emerald-500"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.max(
                            0,
                            (item.wins / Math.max(1, item.total)) * 100
                          )
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
