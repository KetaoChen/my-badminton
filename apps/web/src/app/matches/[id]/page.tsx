import Link from "next/link";

import { createRally, getMatchWithRallies } from "@/lib/actions";
import { summarizeMatch } from "@/lib/stats";

type PageProps = {
  params: Promise<{ id: string }>;
};

function formatDate(value?: string | Date | null) {
  if (!value) return "未设置日期";
  const dateValue = typeof value === "string" ? value : value.toISOString();
  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "medium",
  }).format(new Date(dateValue));
}

export default async function MatchDetailPage({ params }: PageProps) {
  const { id } = await params;
  const data = await getMatchWithRallies(id);

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <div className="mx-auto max-w-4xl px-6 py-12">
          <Link
            href="/"
            className="text-sm font-medium text-slate-700 underline-offset-4 hover:underline"
          >
            返回比赛列表
          </Link>
          <p className="mt-6 text-lg font-semibold text-slate-900">未找到比赛</p>
          <p className="text-sm text-slate-500">请确认链接是否正确。</p>
        </div>
      </div>
    );
  }

  const summary = summarizeMatch(data.rallies);
  const reasons = Object.entries(summary.reasons).sort(
    (a, b) => b[1].wins + b[1].losses - (a[1].wins + a[1].losses),
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Match Detail
            </p>
            <h1 className="text-2xl font-semibold text-slate-900">
              {data.match.title}
            </h1>
            <p className="text-sm text-slate-500">
              {formatDate(data.match.matchDate)} · 对手：{" "}
              {data.match.opponentName || "未填写"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={`/matches/${data.match.id}/export`}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              导出 CSV
            </Link>
            <Link
              href="/"
              className="text-sm font-medium text-slate-700 underline-offset-4 hover:underline"
            >
              返回列表
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-6">
        <section className="grid gap-6 md:grid-cols-[1.1fr_1fr]">
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                总览
              </p>
              <div className="mt-2">
                <p className="text-lg font-semibold text-slate-900">
                  {data.match.title}
                </p>
                {data.match.notes ? (
                  <p className="mt-2 text-sm text-slate-600">{data.match.notes}</p>
                ) : null}
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    总回合
                  </p>
                  <p className="text-2xl font-semibold text-slate-900">
                    {summary.total}
                  </p>
                </div>
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                  <p className="text-xs uppercase tracking-wide text-emerald-700">
                    赢球
                  </p>
                  <p className="text-2xl font-semibold text-emerald-800">
                    {summary.wins}
                  </p>
                </div>
                <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                  <p className="text-xs uppercase tracking-wide text-red-700">
                    输球
                  </p>
                  <p className="text-2xl font-semibold text-red-800">
                    {summary.losses}
                  </p>
                </div>
              </div>
              <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  赢球率
                </p>
                <p className="text-2xl font-semibold text-slate-900">
                  {summary.winRate.toFixed(1)}%
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                得失分原因分布
              </p>
              {reasons.length === 0 ? (
                <p className="mt-2 text-sm text-slate-500">暂无回合记录。</p>
              ) : (
                <div className="mt-3 space-y-3">
                  {reasons.map(([reason, counts]) => (
                    <div
                      key={reason}
                      className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {reason}
                        </p>
                        <p className="text-xs text-slate-500">
                          {counts.wins + counts.losses} 次
                        </p>
                      </div>
                      <div className="flex items-center gap-3 text-sm font-semibold">
                        <span className="rounded bg-emerald-100 px-2 py-1 text-emerald-700">
                          +{counts.wins}
                        </span>
                        <span className="rounded bg-red-100 px-2 py-1 text-red-700">
                          -{counts.losses}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              新增回合
            </p>
            <h2 className="text-lg font-semibold text-slate-900">录入得失分</h2>
            <form action={createRally} className="mt-4 space-y-4">
              <input type="hidden" name="matchId" value={data.match.id} />
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    回合编号
                  </label>
                  <input
                    name="sequence"
                    type="number"
                    min={1}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-inner focus:border-slate-400 focus:outline-none"
                    placeholder="默认自动递增"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    结果 *
                  </label>
                  <select
                    name="result"
                    required
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-inner focus:border-slate-400 focus:outline-none"
                    defaultValue="win"
                  >
                    <option value="win">得分</option>
                    <option value="lose">失分</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  得失分原因
                </label>
                <input
                  name="pointReason"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-inner focus:border-slate-400 focus:outline-none"
                  placeholder="如：主动进攻得分、对手失误、发球得分等"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    起始比分（我 / 对手）
                  </label>
                  <div className="flex gap-2">
                    <input
                      name="startScoreSelf"
                      type="number"
                      min={0}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-inner focus:border-slate-400 focus:outline-none"
                      placeholder="我"
                    />
                    <input
                      name="startScoreOpponent"
                      type="number"
                      min={0}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-inner focus:border-slate-400 focus:outline-none"
                      placeholder="对手"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    结束比分（我 / 对手）
                  </label>
                  <div className="flex gap-2">
                    <input
                      name="endScoreSelf"
                      type="number"
                      min={0}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-inner focus:border-slate-400 focus:outline-none"
                      placeholder="我"
                    />
                    <input
                      name="endScoreOpponent"
                      type="number"
                      min={0}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-inner focus:border-slate-400 focus:outline-none"
                      placeholder="对手"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  回合时长（秒）
                </label>
                <input
                  name="durationSeconds"
                  type="number"
                  min={0}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-inner focus:border-slate-400 focus:outline-none"
                  placeholder="可选"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">备注</label>
                <textarea
                  name="notes"
                  rows={2}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-inner focus:border-slate-400 focus:outline-none"
                  placeholder="如击球模式、弱点、战术等"
                />
              </div>

              <button
                type="submit"
                className="inline-flex w-full items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
              >
                保存回合
              </button>
            </form>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                回合列表
              </p>
              <h2 className="text-lg font-semibold text-slate-900">
                所有回合明细
              </h2>
            </div>
          </div>

          {data.rallies.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">暂无回合记录。</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b bg-slate-50 text-xs uppercase tracking-wide text-slate-600">
                    <th className="px-3 py-2">编号</th>
                    <th className="px-3 py-2">结果</th>
                    <th className="px-3 py-2">得失分原因</th>
                    <th className="px-3 py-2">比分</th>
                    <th className="px-3 py-2">时长(s)</th>
                    <th className="px-3 py-2">备注</th>
                  </tr>
                </thead>
                <tbody>
                  {data.rallies.map((rally) => (
                    <tr
                      key={rally.id}
                      className="border-b last:border-0 hover:bg-slate-50"
                    >
                      <td className="px-3 py-2 font-medium text-slate-900">
                        {rally.sequence ?? "-"}
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                            rally.result === "win"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {rally.result === "win" ? "得分" : "失分"}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-slate-800">
                        {rally.pointReason || "未填写"}
                      </td>
                      <td className="px-3 py-2 text-slate-700">
                        {rally.startScoreSelf != null &&
                        rally.startScoreOpponent != null &&
                        rally.endScoreSelf != null &&
                        rally.endScoreOpponent != null
                          ? `${rally.startScoreSelf}:${rally.startScoreOpponent} → ${rally.endScoreSelf}:${rally.endScoreOpponent}`
                          : "未记录"}
                      </td>
                      <td className="px-3 py-2 text-slate-700">
                        {rally.durationSeconds ?? "-"}
                      </td>
                      <td className="px-3 py-2 text-slate-600">
                        {rally.notes || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

