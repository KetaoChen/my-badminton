"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alert, Button, Card, Form, Input } from "antd";

export default function RegisterPage() {
  return <RegisterForm />;
}

function RegisterForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onFinish = async (values: { username: string; password: string }) => {
    setError(null);
    setLoading(true);
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data?.error || "注册失败，请重试");
      return;
    }

    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <Card title="注册" className="w-full max-w-md shadow-sm">
        <Form
          layout="vertical"
          onFinish={onFinish}
          disabled={loading}
          className="space-y-2"
        >
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: "请输入用户名" }]}
          >
            <Input placeholder="输入用户名" />
          </Form.Item>
          <Form.Item
            name="password"
            label="密码"
            rules={[{ required: true, message: "请输入密码" }]}
          >
            <Input.Password placeholder="输入密码" />
          </Form.Item>
          {error ? <Alert type="error" message={error} /> : null}
          <div className="flex gap-2">
            <Button onClick={() => router.push("/login")} block>
              返回登录
            </Button>
            <Button type="primary" htmlType="submit" block loading={loading}>
              注册
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}
