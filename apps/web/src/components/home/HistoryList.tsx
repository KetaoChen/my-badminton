"use client";

import Link from "next/link";
import { Card, Tag, Typography } from "antd";

import { type Match } from "./types";

type Props = {
  matches: Match[];
};

function backgroundForMatch(match: Match) {
  const wins = match.wins ?? 0;
  const losses = match.losses ?? 0;
  if (wins > losses) return "#ecfdf3"; // win
  if (wins < losses) return "#fff1f2"; // lose
  return "#f8fafc"; // draw
}

export function HistoryList({ matches }: Props) {
  if (matches.length === 0) {
    return (
      <Typography.Text type="secondary">
        还没有数据，先创建一场比赛吧。
      </Typography.Text>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {matches.map((match) => {
        const backgroundColor = backgroundForMatch(match);
        return (
          <Card
            key={match.id}
            size="small"
            className="border-slate-200"
            title={
              <Typography.Text strong>
                {[match.tournamentName, match.title, match.opponentName]
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
                {match.wins ?? 0} - {match.losses ?? 0}
              </Typography.Text>
              <Tag
                color={
                  (match.wins ?? 0) > (match.losses ?? 0)
                    ? "green"
                    : (match.wins ?? 0) < (match.losses ?? 0)
                      ? "red"
                      : "default"
                }
              >
                {(match.wins ?? 0) > (match.losses ?? 0)
                  ? "胜"
                  : (match.wins ?? 0) < (match.losses ?? 0)
                    ? "负"
                    : "平"}
              </Tag>
            </div>
            {match.notes ? (
              <Typography.Paragraph className="!mt-2 !mb-0" type="secondary">
                {match.notes}
              </Typography.Paragraph>
            ) : null}
          </Card>
        );
      })}
    </div>
  );
}

function formatDate(value?: string | Date | null) {
  if (!value) return "未设置日期";
  const dateValue = typeof value === "string" ? value : value?.toISOString();
  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "medium",
  }).format(new Date(dateValue ?? ""));
}

