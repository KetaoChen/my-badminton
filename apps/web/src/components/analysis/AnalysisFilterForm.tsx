"use client";

import { useMemo } from "react";
import { Button, Col, DatePicker, Form, Row, Select, Switch } from "antd";
import dayjs from "dayjs";

import { type Filters, type FilterFormValues, type Option } from "./types";

type Props = {
  filters: Filters;
  opponents: Option[];
  tournaments: Option[];
  onFinish: (values: FilterFormValues) => void;
};

export function AnalysisFilterForm({
  filters,
  opponents,
  tournaments,
  onFinish,
}: Props) {
  const initialValues = useMemo(
    () => ({
      opponentId: filters.opponentId ?? "",
      tournamentId: filters.tournamentId ?? "",
      tournamentOnly: filters.tournamentOnly,
      dateRange:
        filters.startDate && filters.endDate
          ? [dayjs(filters.startDate), dayjs(filters.endDate)]
          : undefined,
    }),
    [filters]
  );

  return (
    <Form layout="vertical" initialValues={initialValues} onFinish={onFinish}>
      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item label="对手" name="opponentId">
            <Select
              allowClear
              placeholder="全部对手"
              options={opponents.map((o) => ({
                value: o.id,
                label: o.name,
              }))}
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item label="赛事（正式赛）" name="tournamentId">
            <Select
              allowClear
              placeholder="全部赛事"
              options={tournaments.map((t) => ({
                value: t.id,
                label: t.name,
              }))}
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item label="日期范围" name="dateRange">
            <DatePicker.RangePicker allowClear className="w-full" />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item label="仅正式赛" name="tournamentOnly" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item>
        <Button type="primary" htmlType="submit" block>
          应用筛选
        </Button>
      </Form.Item>
    </Form>
  );
}

