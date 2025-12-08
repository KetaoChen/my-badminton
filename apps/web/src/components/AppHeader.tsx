"use client";

import Link from "next/link";
import { Layout, Menu, Space, Typography, theme, Button } from "antd";
import { signOut } from "next-auth/react";
import { ReactNode } from "react";

type AppHeaderProps = {
  activeKey?: "home" | "analysis";
  title?: string;
  description?: string;
  extra?: ReactNode;
};

const navItems = [
  { key: "home", label: <Link href="/">首页</Link> },
  { key: "analysis", label: <Link href="/analysis">比赛分析</Link> },
];

export function AppHeader({
  activeKey,
  title,
  description,
  extra,
}: AppHeaderProps) {
  const { token } = theme.useToken();

  return (
    <Layout.Header
      style={{
        background: token.colorBgContainer,
        borderBottom: `1px solid ${token.colorBorderSecondary}`,
        paddingInline: 0,
        paddingTop: 4,
        paddingBottom: 12,
        height: "100%",
      }}
    >
      <div className="mx-auto max-w-5xl w-full px-4 sm:px-6 flex flex-col gap-2">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <Space size={12} wrap>
            <Typography.Title level={4} className="!mb-0">
              Badminton Analytics
            </Typography.Title>
            <Menu
              mode="horizontal"
              selectedKeys={activeKey ? [activeKey] : []}
              items={navItems}
              style={{ borderBottom: "none", minWidth: 220 }}
            />
          </Space>
          <Space wrap>
            {extra}
            <Button onClick={() => signOut({ callbackUrl: "/login" })}>
              登出
            </Button>
          </Space>
        </div>
        {(title || description) && (
          <div className="flex flex-col gap-1">
            {title ? (
              <Typography.Title level={3} className="!mb-0">
                {title}
              </Typography.Title>
            ) : null}
            {description ? (
              <Typography.Text type="secondary">{description}</Typography.Text>
            ) : null}
          </div>
        )}
      </div>
    </Layout.Header>
  );
}
