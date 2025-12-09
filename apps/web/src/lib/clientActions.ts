"use client";

import { message } from "antd";

type RunClientActionOptions = {
  successMessage?: string;
  onErrorMessage?: (msg: string) => void;
};

/**
 * Wrap a client-side async action with toast-based error handling.
 * Returns true on success, false on failure.
 */
export async function runClientAction(
  action: () => Promise<unknown>,
  { successMessage, onErrorMessage }: RunClientActionOptions = {}
): Promise<boolean> {
  try {
    await action();
    if (successMessage) {
      message.success(successMessage);
    }
    return true;
  } catch (e) {
    const msg = e instanceof Error ? e.message : "操作失败，请重试";
    onErrorMessage?.(msg);
    message.error(msg);
    return false;
  }
}
