"use client";

import { X } from "lucide-react";

export function Modal({
  open,
  onClose,
  title,
  children
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="rounded-md p-1 hover:bg-slate-100" aria-label="Close modal">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-3 text-sm text-slate-700">{children}</div>
      </div>
    </div>
  );
}
