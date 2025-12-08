import Link from "next/link";

import {
  getMatchWithRallies,
  listOpponents,
  listTournaments,
} from "@/lib/actions";
import { MatchDetailContent } from "@/components/MatchDetailContent";
import { summarizeMatch } from "@/lib/stats";

type PageProps = {
  params: Promise<{ id: string }>;
};

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

  return (
    <MatchDetailContent
      match={data.match}
      opponents={opponents}
      tournaments={tournaments}
      rallies={data.rallies}
      summary={{
        total: summary.total,
        wins: summary.wins,
        losses: summary.losses,
        winRate: summary.winRate,
      }}
      winReasons={winReasons}
      loseReasons={loseReasons}
    />
  );
}
