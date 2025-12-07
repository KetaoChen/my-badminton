"use client";

import { ReactNode, useEffect, useRef } from "react";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  maxWidthClass?: string;
};

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  maxWidthClass = "max-w-xl",
}: ModalProps) {
  const backdropRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === backdropRef.current) onClose();
      }}
    >
      <div
        className={`w-full ${maxWidthClass} overflow-hidden rounded-xl bg-white shadow-2xl`}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="text-sm font-semibold text-slate-900">
            {title ?? "弹窗"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-slate-500 hover:text-slate-700"
          >
            关闭
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-4 py-4">{children}</div>
        {footer ? <div className="border-t px-4 py-3">{footer}</div> : null}
      </div>
    </div>
  );
}

