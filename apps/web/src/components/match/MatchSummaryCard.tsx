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
      {match.notes ? (
        <Typography.Paragraph type="secondary" className="!mb-4">
          {match.notes}
        </Typography.Paragraph>
      ) : null}
      <Row gutter={[12, 12]} justify="start">
        <Col flex="1 0 20%" style={{ minWidth: 140 }}>
          <Statistic title="总回合" value={summary.total} />
        </Col>
        <Col flex="1 0 20%" style={{ minWidth: 140 }}>
          <Statistic title="赢球" value={summary.wins} />
        </Col>
        <Col flex="1 0 20%" style={{ minWidth: 140 }}>
          <Statistic title="输球" value={summary.losses} />
        </Col>
        <Col flex="1 0 20%" style={{ minWidth: 140 }}>
          <Statistic
            title="发球平均分"
            value={
              summary.serveAvg != null
                ? Number(summary.serveAvg.toFixed(1))
                : "—"
            }
          />
        </Col>
        <Col flex="1 0 20%" style={{ minWidth: 140 }}>
          <Statistic title="战术使用次数" value={summary.tacticUsed} />
        </Col>
      </Row>
    </Card>
  );
}

