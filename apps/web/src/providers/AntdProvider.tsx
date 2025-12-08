"use client";

import { App, ConfigProvider, theme } from "antd";
import zhCN from "antd/locale/zh_CN";
import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export function AntdProvider({ children }: Props) {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: "#1e293b",
          borderRadius: 10,
          fontFamily:
            '"Inter", "Segoe UI", system-ui, -apple-system, "Helvetica Neue", sans-serif',
        },
        algorithm: theme.defaultAlgorithm,
        components: {
          Button: {
            controlHeight: 36,
            borderRadius: 8,
          },
          Input: {
            controlHeight: 38,
            borderRadius: 8,
          },
          Select: {
            borderRadius: 8,
          },
          Card: {
            borderRadiusLG: 12,
          },
          Modal: {
            borderRadiusLG: 12,
          },
        },
      }}
    >
      <App>{children}</App>
    </ConfigProvider>
  );
}

