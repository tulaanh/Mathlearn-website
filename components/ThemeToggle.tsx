"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "theme";

export default function ThemeToggle() {
  // null = chưa mount (tránh lệch hydration giữa server và client)
  const [isDark, setIsDark] = useState<boolean | null>(null);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem(STORAGE_KEY, next ? "dark" : "light");
    } catch {
      // bỏ qua nếu trình duyệt chặn localStorage
    }
  }

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? "Chuyển sang chế độ sáng" : "Chuyển sang chế độ tối"}
      title={isDark ? "Chế độ sáng" : "Chế độ tối"}
      className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-lg transition-colors hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-slate-700"
    >
      {/* Icon trung tâm trước khi biết trạng thái để tránh nhảy chữ */}
      {isDark === null ? "🌓" : isDark ? "☀️" : "🌙"}
    </button>
  );
}
