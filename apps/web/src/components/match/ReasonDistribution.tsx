"use client";

import { Card, Col, Flex, Row, Space, Tag, Typography } from "antd";

import { type ReasonCount } from "./types";

type Props = {
  winReasons: [string, ReasonCount][];
  loseReasons: [string, ReasonCount][];
};

export function ReasonDistribution({ winReasons, loseReasons }: Props) {
  return (
    <Card title="得失分原因分布" className="shadow-sm">
      <Row gutter={12}>
        <Col span={12}>
          <Typography.Text type="success" className="text-xs uppercase">
            得分原因
          </Typography.Text>
          <Space direction="vertical" className="mt-2 w-full">
            {winReasons.length === 0 ? (
              <Typography.Text type="secondary">暂无得分记录。</Typography.Text>
            ) : (
              winReasons.map(([reason, counts]) => (
                <Card
                  key={reason}
                  size="small"
                  className="bg-emerald-50 border-emerald-100"
                >
                  <Flex align="center" justify="space-between">
                    <Typography.Text strong>{reason}</Typography.Text>
                    <Tag color="green">+{counts.wins}</Tag>
                  </Flex>
                </Card>
              ))
            )}
          </Space>
        </Col>
        <Col span={12}>
          <Typography.Text type="danger" className="text-xs uppercase">
            失分原因
          </Typography.Text>
          <Space direction="vertical" className="mt-2 w-full">
            {loseReasons.length === 0 ? (
              <Typography.Text type="secondary">暂无失分记录。</Typography.Text>
            ) : (
              loseReasons.map(([reason, counts]) => (
                <Card
                  key={reason}
                  size="small"
                  className="bg-rose-50 border-rose-100"
                >
                  <Flex align="center" justify="space-between">
                    <Typography.Text strong>{reason}</Typography.Text>
                    <Tag color="red">-{counts.losses}</Tag>
                  </Flex>
                </Card>
              ))
            )}
          </Space>
        </Col>
      </Row>
    </Card>
  );
}

