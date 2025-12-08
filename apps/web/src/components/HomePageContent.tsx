"use client";

import { Card } from "antd";
import { AppHeader } from "./AppHeader";
import { HistoryList } from "./home/HistoryList";
import { MatchCreateForm } from "./home/MatchCreateForm";
import { type Match, type Option } from "./home/types";

type Props = {
  matches: Match[];
  opponents: Option[];
  tournaments: Option[];
};

export function HomePageContent({ matches, opponents, tournaments }: Props) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <AppHeader
        activeKey="home"
        title="比赛与回合记录"
        description="手动录入比赛与每回合的得失分，为后续视频/模型分析做基础。"
      />

      <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6">
        <section className="grid gap-8 md:grid-cols-[1.1fr_1fr]">
          <Card
            title="新增比赛"
            className="shadow-sm"
            styles={{
              body: { padding: 20 },
              header: { paddingInline: 20, paddingBlock: 14 },
            }}
          >
            <MatchCreateForm opponents={opponents} tournaments={tournaments} />
          </Card>

          <Card
            title="历史比赛"
            className="shadow-sm"
            styles={{
              body: { padding: 20 },
              header: { paddingInline: 20, paddingBlock: 14 },
            }}
          >
            <HistoryList matches={matches} />
          </Card>
        </section>
      </main>
    </div>
  );
}
