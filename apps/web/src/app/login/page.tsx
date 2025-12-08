"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button, Card, Form, Input, Alert } from "antd";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onFinish = async (values: { username: string; password: string }) => {
    setError(null);
    setLoading(true);
    const res = await signIn("credentials", {
      redirect: true,
      callbackUrl,
      username: values.username,
      password: values.password,
    });
    if (res?.error) {
      setLoading(false);
      setError("用户名或密码错误");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <Card title="登录" className="w-full max-w-md shadow-sm">
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
          <Button type="primary" htmlType="submit" block loading={loading}>
            登录
          </Button>
        </Form>
      </Card>
    </div>
  );
}
