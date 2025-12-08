"use client";

import Link from "next/link";
import { Button, Card, Checkbox, Input, Tag, Typography } from "antd";
import { createMatch } from "@/lib/actions";
import { AppHeader } from "./AppHeader";

type Match = {
  id: string;
  title: string;
  matchDate: string | null;
  opponentName: string | null;
  wins: number | null;
  losses: number | null;
  notes: string | null;
  tournamentName: string | null;
};

type Option = {
  id: string;
  name: string;
};

function formatDate(value?: string | Date | null) {
  if (!value) return "未设置日期";
  const dateValue = typeof value === "string" ? value : value?.toISOString();
  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "medium",
  }).format(new Date(dateValue ?? ""));
}

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
            <form action={createMatch} className="flex flex-col gap-5">
              <div className="space-y-3">
                <Typography.Text strong>比赛名称 *</Typography.Text>
                <Input
                  name="title"
                  required
                  placeholder="例如：周末练习赛 / 俱乐部内部赛"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
                <div className="space-y-3">
                  <Typography.Text strong>日期</Typography.Text>
                  <Input type="date" name="matchDate" />
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <Typography.Text strong>对手（可选已有或手填）</Typography.Text>
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
                <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <Input
                    name="opponent"
                    placeholder="或手动输入对手名称/备注"
                  />
                  <Checkbox name="trainingOpponent">标记为训练对手</Checkbox>
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <Typography.Text strong>
                  赛事名称（填或选则视为正式赛）
                </Typography.Text>
                <div className="flex flex-col gap-3">
                  <select
                    name="tournamentId"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-inner focus:border-slate-400 focus:outline-none"
                    defaultValue=""
                  >
                    <option value="">选择已有赛事</option>
                    {tournaments.map((tournament) => (
                      <option key={tournament.id} value={tournament.id}>
                        {tournament.name}
                      </option>
                    ))}
                  </select>
                  <Input
                    name="tournamentName"
                    placeholder="如：俱乐部公开赛、联赛等"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <Typography.Text strong>备注</Typography.Text>
                <Input.TextArea
                  name="notes"
                  rows={3}
                  placeholder="场地、球拍、当天状态等信息"
                />
              </div>
              <Button type="primary" htmlType="submit" block>
                保存比赛
              </Button>
            </form>
          </Card>

          <Card
            title="历史比赛"
            className="shadow-sm"
            styles={{
              body: { padding: 20 },
              header: { paddingInline: 20, paddingBlock: 14 },
            }}
          >
            {matches.length === 0 ? (
              <Typography.Text type="secondary">
                还没有数据，先创建一场比赛吧。
              </Typography.Text>
            ) : (
              <div className="flex flex-col gap-4">
                {matches.map((match) => {
                  const wins = match.wins ?? 0;
                  const losses = match.losses ?? 0;
                  const backgroundColor =
                    wins > losses
                      ? "#ecfdf3" // emerald-50
                      : wins < losses
                      ? "#fff1f2" // rose-50
                      : "#f8fafc"; // slate-50

                  return (
                    // 用背景色区分胜负：赢=绿，输=红，平=灰
                    <Card
                      key={match.id}
                      size="small"
                      className="border-slate-200"
                      title={
                        <Typography.Text strong>
                          {[
                            match.tournamentName,
                            match.title,
                            match.opponentName,
                          ]
                            .filter(Boolean)
                            .join(" · ") || match.title}
                        </Typography.Text>
                      }
                      extra={
                        <Link href={`/matches/${match.id}`} className="text-sm">
                          查看详情
                        </Link>
                      }
                      styles={{
                        body: { padding: 14, backgroundColor },
                        header: { backgroundColor },
                      }}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <Typography.Text type="secondary">
                          {formatDate(match.matchDate)} · 得分情况：
                          {wins} - {losses}
                        </Typography.Text>
                        <Tag
                          color={
                            wins > losses
                              ? "green"
                              : wins < losses
                              ? "red"
                              : "default"
                          }
                        >
                          {wins > losses ? "胜" : wins < losses ? "负" : "平"}
                        </Tag>
                      </div>
                      {match.notes ? (
                        <Typography.Paragraph
                          className="!mt-2 !mb-0"
                          type="secondary"
                        >
                          {match.notes}
                        </Typography.Paragraph>
                      ) : null}
                    </Card>
                  );
                })}
              </div>
            )}
          </Card>
        </section>
      </main>
    </div>
  );
}
