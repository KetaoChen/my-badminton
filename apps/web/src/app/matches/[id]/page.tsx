import Link from "next/link";

import {
  createRally,
  getMatchWithRallies,
  listOpponents,
  listTournaments,
  updateMatch,
} from "@/lib/actions";
import { MatchEditModal } from "@/components/MatchEditModal";
import { ResultReasonFields } from "@/components/ResultReasonFields";
import { RallyEditModal } from "@/components/RallyEditModal";
import { summarizeMatch } from "@/lib/stats";

type PageProps = {
  params: Promise<{ id: string }>;
};

function formatInputDate(value?: string | Date | null) {
  if (!value) return "";
  const d = typeof value === "string" ? new Date(value) : value;
  return d.toISOString().slice(0, 10);
}

export default async function MatchDetailPage({ params }: PageProps) {
  const { id } = await params;
  const [data, opponents, tournaments] = await Promise.all([
    getMatchWithRallies(id),
    listOpponents(),
    listTournaments(),
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
  const winReasons = reasons
    .filter(([, counts]) => counts.wins > 0)
    .sort((a, b) => b[1].wins - a[1].wins);
  const loseReasons = reasons
    .filter(([, counts]) => counts.losses > 0)
    .sort((a, b) => b[1].losses - a[1].losses);

  const displayTitle = [
    data.match.tournamentName,
    data.match.title,
    data.match.opponentName ?? undefined,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-6 py-5 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              比赛名称
            </p>
            <p className="text-lg font-semibold text-slate-900">
              {displayTitle || data.match.title}
            </p>
            <p className="text-sm text-slate-600">
              日期：{formatInputDate(data.match.matchDate) || "未填写"} · 对手：
              {data.match.opponentName || "未填写"} · 赛事：
              {data.match.tournamentName || "未填写"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <MatchEditModal
              match={data.match}
              opponents={opponents}
              tournaments={tournaments}
              action={updateMatch.bind(null, data.match.id)}
            />
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
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                      得分原因
                    </p>
                    {winReasons.length === 0 ? (
                      <p className="text-xs text-slate-500">暂无得分记录。</p>
                    ) : (
                      winReasons.map(([reason, counts]) => (
                        <div
                          key={reason}
                          className="flex items-center justify-between rounded-lg border border-slate-200 bg-emerald-50 px-3 py-2"
                        >
                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              {reason}
                            </p>
                            <p className="text-xs text-slate-500">
                              {counts.wins} 次
                            </p>
                          </div>
                          <span className="rounded bg-emerald-200 px-2 py-1 text-xs font-semibold text-emerald-800">
                            +{counts.wins}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-rose-700">
                      失分原因
                    </p>
                    {loseReasons.length === 0 ? (
                      <p className="text-xs text-slate-500">暂无失分记录。</p>
                    ) : (
                      loseReasons.map(([reason, counts]) => (
                        <div
                          key={reason}
                          className="flex items-center justify-between rounded-lg border border-slate-200 bg-rose-50 px-3 py-2"
                        >
                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              {reason}
                            </p>
                            <p className="text-xs text-slate-500">
                              {counts.losses} 次
                            </p>
                          </div>
                          <span className="rounded bg-rose-200 px-2 py-1 text-xs font-semibold text-rose-800">
                            -{counts.losses}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
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
              <ResultReasonFields
                defaultResult="win"
                defaultReason="对手失误"
              />

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
                    <th className="px-3 py-2 text-right">操作</th>
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
                      <td className="px-3 py-2 text-right align-top">
                        <RallyEditModal
                          rally={{
                            id: rally.id,
                            matchId: data.match.id,
                            result: rally.result,
                            pointReason: rally.pointReason,
                            tacticScore: rally.tacticScore,
                            serveScore: rally.serveScore,
                            placementScore: rally.placementScore,
                            footworkScore: rally.footworkScore,
                            notes: rally.notes,
                          }}
                        />
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
