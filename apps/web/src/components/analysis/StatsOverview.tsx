"use client";

import { Card, Col, Row, Statistic } from "antd";

import { type AggregatedStats } from "./types";

type Props = {
  stats: AggregatedStats;
};

export function StatsOverview({ stats }: Props) {
  return (
    <Card className="shadow-sm">
      <Row gutter={[12, 12]} justify="start">
        <Col flex="1 0 20%" style={{ minWidth: 140 }}>
          <Statistic title="总比赛" value={stats.matchCount} />
        </Col>
        <Col flex="1 0 20%" style={{ minWidth: 140 }}>
          <Statistic
            title="胜率(按场)"
            value={Number(stats.winRate.toFixed(1))}
            suffix="%"
          />
        </Col>
        <Col flex="1 0 20%" style={{ minWidth: 140 }}>
          <Statistic
            title="发球质量"
            value={Number((stats.abilities.serve ?? 0).toFixed(1))}
          />
        </Col>
        <Col flex="1 0 20%" style={{ minWidth: 140 }}>
          <Statistic
            title="战术 / 场"
            value={Number((stats.abilities.tactic ?? 0).toFixed(1))}
          />
        </Col>
        <Col flex="1 0 20%" style={{ minWidth: 140 }}>
          <Statistic
            title="失误 / 场"
            value={Number((stats.abilities.error ?? 0).toFixed(1))}
          />
        </Col>
      </Row>
    </Card>
  );
}
