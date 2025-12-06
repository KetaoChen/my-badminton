import Link from "next/link";

import { createMatch, listMatches } from "@/lib/actions";

function formatDate(value?: string | Date | null) {
  if (!value) return "未设置日期";
  const dateValue = typeof value === "string" ? value : value.toISOString();
  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "medium",
  }).format(new Date(dateValue));
}

export default async function Home() {
  const matches = await listMatches();

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
                    对手
                  </label>
                  <input
                    name="opponent"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-inner focus:border-slate-400 focus:outline-none"
                    placeholder="对手姓名或备注"
                  />
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
                          {match.opponent || "未填写"}
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
                      <p className="mt-2 text-sm text-slate-600">{match.notes}</p>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
