import Link from "next/link";

import {
  createRally,
  getMatchWithRallies,
  listOpponents,
  updateMatch,
} from "@/lib/actions";
import { summarizeMatch } from "@/lib/stats";

type PageProps = {
  params: { id: string };
};

function formatInputDate(value?: string | Date | null) {
  if (!value) return "";
  const d = typeof value === "string" ? new Date(value) : value;
  return d.toISOString().slice(0, 10);
}

export default async function MatchDetailPage({ params }: PageProps) {
  const { id } = params;
  const [data, opponents] = await Promise.all([
    getMatchWithRallies(id),
    listOpponents(),
  ]);

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
          <p className="mt-6 text-lg font-semibold text-slate-900">
            未找到比赛
          </p>
          <p className="text-sm text-slate-500">请确认链接是否正确。</p>
        </div>
      </div>
    );
  }

  const summary = summarizeMatch(data.rallies);
  const reasons = Object.entries(summary.reasons).sort(
    (a, b) => b[1].wins + b[1].losses - (a[1].wins + a[1].losses)
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-6 py-5 md:flex-row md:items-end md:justify-between">
          <form
            action={updateMatch.bind(null, data.match.id)}
            className="grid w-full gap-3 md:grid-cols-[1.2fr_1fr_1fr_auto]"
          >
            <div className="flex flex-col">
              <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
                比赛名称
              </label>
              <input
                name="title"
                defaultValue={data.match.title}
                required
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-inner focus:border-slate-400 focus:outline-none"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
                日期
              </label>
              <input
                type="date"
                name="matchDate"
                defaultValue={formatInputDate(data.match.matchDate)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-inner focus:border-slate-400 focus:outline-none"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
                对手
              </label>
              <select
                name="opponentId"
                defaultValue={data.match.opponentId ?? ""}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-inner focus:border-slate-400 focus:outline-none"
              >
                <option value="">选择已有对手</option>
                {opponents.map((opponent) => (
                  <option key={opponent.id} value={opponent.id}>
                    {opponent.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end justify-end gap-2">
              <button
                type="submit"
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
              >
                保存
              </button>
            </div>
            <input
              type="hidden"
              name="opponent"
              defaultValue={data.match.opponent ?? ""}
            />
            <input
              type="hidden"
              name="notes"
              defaultValue={data.match.notes ?? ""}
            />
          </form>
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
                  <p className="mt-2 text-sm text-slate-600">
                    {data.match.notes}
                  </p>
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

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  得失分原因
                </label>
                <select
                  name="pointReason"
                  required
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-inner focus:border-slate-400 focus:outline-none"
                  defaultValue="对手失误"
                >
                  <option value="对手失误">对手失误</option>
                  <option value="我方制胜球">我方制胜球</option>
                  <option value="我方失误">我方失误</option>
                  <option value="对手制胜球">对手制胜球</option>
                  <option value="其他">其他</option>
                </select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    战术执行得分
                  </label>
                  <input
                    name="tacticScore"
                    type="number"
                    min={0}
                    max={10}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-inner focus:border-slate-400 focus:outline-none"
                    placeholder="0-10，可选"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    发球到位得分
                  </label>
                  <input
                    name="serveScore"
                    type="number"
                    min={0}
                    max={10}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-inner focus:border-slate-400 focus:outline-none"
                    placeholder="0-10，可选"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    球到位打分
                  </label>
                  <input
                    name="placementScore"
                    type="number"
                    min={0}
                    max={10}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-inner focus:border-slate-400 focus:outline-none"
                    placeholder="0-10，可选"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    站位/步伐打分
                  </label>
                  <input
                    name="footworkScore"
                    type="number"
                    min={0}
                    max={10}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-inner focus:border-slate-400 focus:outline-none"
                    placeholder="0-10，可选"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  备注
                </label>
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
                    <th className="px-3 py-2">战术得分</th>
                    <th className="px-3 py-2">发球到位</th>
                    <th className="px-3 py-2">球到位</th>
                    <th className="px-3 py-2">站位/步伐</th>
                    <th className="px-3 py-2">比分</th>
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
                      <td className="px-3 py-2 text-slate-800">
                        {rally.tacticScore != null ? rally.tacticScore : "—"}
                      </td>
                      <td className="px-3 py-2 text-slate-800">
                        {rally.serveScore != null ? rally.serveScore : "—"}
                      </td>
                      <td className="px-3 py-2 text-slate-800">
                        {rally.placementScore != null
                          ? rally.placementScore
                          : "—"}
                      </td>
                      <td className="px-3 py-2 text-slate-800">
                        {rally.footworkScore != null
                          ? rally.footworkScore
                          : "—"}
                      </td>
                      <td className="px-3 py-2 text-slate-700">
                        {rally.startScoreSelf != null &&
                        rally.startScoreOpponent != null &&
                        rally.endScoreSelf != null &&
                        rally.endScoreOpponent != null
                          ? `${rally.startScoreSelf}:${rally.startScoreOpponent} → ${rally.endScoreSelf}:${rally.endScoreOpponent}`
                          : "未记录"}
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
