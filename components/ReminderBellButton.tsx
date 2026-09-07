"use client";

import { useEffect, useRef, useState } from "react";
import { isReminderEnabled, setReminderEnabled } from "@/lib/study-reminder";

/** Nút chuông trên header: bật/tắt tính năng nhắc nhở học tập mỗi 30 phút. */
export default function ReminderBellButton() {
  const [open, setOpen] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Đọc cài đặt đã lưu (chỉ phía client để tránh lệch hydration)
  useEffect(() => {
    setEnabled(isReminderEnabled());
  }, []);

  // Đóng popover khi click ra ngoài hoặc nhấn Escape
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const handleToggle = () => {
    const next = !enabled;
    setEnabled(next);
    setReminderEnabled(next);
  };

  return (
    <div ref={containerRef} className="relative hidden sm:block">
      <button
        type="button"
        aria-label="Cài đặt nhắc nhở học tập"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="relative text-2xl text-slate-600 transition hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400"
      >
        ♧
        {enabled && (
          <span className="absolute -right-1 -top-0.5 h-2 w-2 rounded-full bg-indigo-500" aria-hidden />
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-full z-40 mt-3 w-72 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-900/10 dark:border-slate-700 dark:bg-[#131b2e] dark:shadow-black/40">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              Nhắc nhở học tập
            </p>
            <button
              type="button"
              role="switch"
              aria-checked={enabled}
              aria-label="Bật/tắt nhắc nhở"
              onClick={handleToggle}
              className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition ${
                enabled ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-600"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition ${
                  enabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            Nhắc bạn mỗi 30 phút khi đang học trên web. Nếu đang làm bài kiểm
            tra, lời nhắc sẽ được hoãn đến sau khi nộp bài.
          </p>
        </div>
      )}
    </div>
  );
}
