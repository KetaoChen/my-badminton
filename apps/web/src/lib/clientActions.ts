"use client";

import { App, message } from "antd";
import type { MessageInstance } from "antd/es/message/interface";
import { useCallback } from "react";

type RunClientActionOptions = {
  successMessage?: string;
  onErrorMessage?: (msg: string) => void;
  messageApi?: MessageInstance;
};

type RunClientActionInput = Omit<RunClientActionOptions, "messageApi">;

/**
 * Wrap a client-side async action with toast-based error handling.
 * Returns true on success, false on failure.
 */
export async function runClientAction(
  action: () => Promise<unknown>,
  { successMessage, onErrorMessage, messageApi }: RunClientActionOptions = {}
): Promise<boolean> {
  const api = messageApi ?? message;
  try {
    await action();
    if (successMessage) {
      api.success(successMessage);
    }
    return true;
  } catch (e) {
    const msg = e instanceof Error ? e.message : "操作失败，请重试";
    onErrorMessage?.(msg);
    api.error(msg);
    return false;
  }
}

/**
 * Hook wrapper to auto-wire messageApi from Antd App context.
 */
export function useRunClientAction() {
  const { message: msgApi } = App.useApp();
  return useCallback(
    (action: () => Promise<unknown>, options?: RunClientActionInput) =>
      runClientAction(action, { ...options, messageApi: msgApi }),
    [msgApi]
  );
}

export type UseRunClientActionReturn = ReturnType<typeof useRunClientAction>;
