"use client";

import { Modal as AntdModal } from "antd";
import { ReactNode } from "react";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
}: ModalProps) {
  return (
    <AntdModal
      open={open}
      onCancel={onClose}
      title={title ?? "弹窗"}
      footer={footer ?? null}
      centered
      width={720}
      styles={{
        body: { maxHeight: "70vh", overflowY: "auto" },
      }}
    >
      {children}
    </AntdModal>
  );
}

