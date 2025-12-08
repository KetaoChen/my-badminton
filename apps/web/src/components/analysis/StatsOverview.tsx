"use client";

import { Card, Col, Row, Statistic } from "antd";

import { type Analysis } from "./types";

type Props = {
  analysis: Analysis;
};

export function StatsOverview({ analysis }: Props) {
  return (
    <Card className="shadow-sm">
      <Row gutter={12}>
        <Col xs={12} md={6}>
          <Statistic title="总比赛" value={analysis.matchCount} />
        </Col>
        <Col xs={12} md={6}>
          <Statistic
            title="胜率(按场)"
            value={Number(analysis.winRate.toFixed(1))}
            suffix="%"
          />
        </Col>
        <Col xs={12} md={6}>
          <Statistic title="场次 胜 / 负" value={`${analysis.matchWins} / ${analysis.matchLosses}`} />
        </Col>
        <Col xs={12} md={6}>
          <Statistic title="回合 胜 / 负" value={`${analysis.wins} / ${analysis.losses}`} />
        </Col>
      </Row>
    </Card>
  );
}

