"use client";

import { Card, Col, Row, Statistic, Typography } from "antd";

import { type Match, type Summary } from "./types";

type Props = {
  match: Match;
  summary: Summary;
};

export function MatchSummaryCard({ match, summary }: Props) {
  return (
    <Card title="总览" className="shadow-sm">
      <Typography.Title level={4}>{match.title}</Typography.Title>
      {match.notes ? (
        <Typography.Paragraph type="secondary">
          {match.notes}
        </Typography.Paragraph>
      ) : null}
      <Row gutter={12} className="mt-2">
        <Col span={8}>
          <Statistic title="总回合" value={summary.total} />
        </Col>
        <Col span={8}>
          <Statistic title="赢球" value={summary.wins} />
        </Col>
        <Col span={8}>
          <Statistic title="输球" value={summary.losses} />
        </Col>
      </Row>
      <Card size="small" className="mt-3">
        <Statistic title="赢球率" value={`${summary.winRate.toFixed(1)}%`} />
      </Card>
    </Card>
  );
}

