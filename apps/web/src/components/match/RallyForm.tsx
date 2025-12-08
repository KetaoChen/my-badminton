"use client";

import { Button, Checkbox, Col, Form, Input, InputNumber, Row } from "antd";

import { createRally } from "@/lib/actions";
import { ResultReasonFields } from "../ResultReasonFields";

type Props = {
  matchId: string;
  defaultReason?: string;
};

export function RallyForm({ matchId, defaultReason = "对手失误" }: Props) {
  return (
    <Form
      layout="vertical"
      component="form"
      action={createRally}
      size="middle"
      className="space-y-2"
    >
      <input type="hidden" name="matchId" value={matchId} />

      <ResultReasonFields
        key={`create-${matchId}`}
        defaultResult="win"
        defaultReason={defaultReason}
      />

      <Form.Item name="excludeFromScore" valuePropName="checked" className="!mb-3">
        <Checkbox name="excludeFromScore">不计入比分</Checkbox>
      </Form.Item>

      <Row gutter={12}>
        <Col span={12}>
          <Form.Item name="tacticUsed" valuePropName="checked" className="!mb-3">
            <Checkbox name="tacticUsed">使用战术</Checkbox>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="发球到位得分" className="!mb-3">
            <InputNumber
              name="serveScore"
              min={0}
              max={10}
              className="w-full"
              placeholder="0-10"
              controls={false}
            />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item label="备注" className="!mb-3">
        <Input.TextArea
          name="notes"
          rows={3}
          placeholder="如击球模式、弱点、战术等"
        />
      </Form.Item>

      <Form.Item className="!mb-0">
        <Button type="primary" htmlType="submit" block style={{ paddingInline: 16 }}>
          保存回合
        </Button>
      </Form.Item>
    </Form>
  );
}

