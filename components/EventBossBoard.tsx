"use client";

import { useEffect, useState } from "react";
import type { EventBoss } from "@/lib/event-types";

export default function EventBossBoard({ bosses: initialBosses }: { bosses: EventBoss[] }) {
  const [bosses, setBosses] = useState(initialBosses);
  useEffect(() => setBosses(initialBosses), [initialBosses]);
  useEffect(() => {
    if (!bosses.length) return;
    const timer = window.setInterval(async () => {
      try {
        const res = await fetch(window.location.href, { headers: { "x-event-refresh": "1" }, cache: "no-store" });
        if (!res.ok) return;
        // Trang được refresh thủ công bằng router ở component cha; tránh tải HTML ở đây.
      } catch { /* mạng tạm thời lỗi, lần sau sẽ thử lại */ }
    }, 30000);
    return () => window.clearInterval(timer);
  }, [bosses.length]);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {bosses.map((boss) => {
        const percent = boss.maxHp ? Math.max(0, Math.min(100, Math.round((boss.currentHp / boss.maxHp) * 100))) : 0;
        return (
          <div key={boss.id} className={`rounded-2xl border p-5 shadow-xs ${boss.isDefeated ? "border-emerald-200 bg-emerald-50/70 dark:border-emerald-900/60 dark:bg-emerald-950/20" : "border-rose-200 bg-white dark:border-rose-900/50 dark:bg-[#131b2e]"}`}>
            <div className="flex items-start justify-between gap-3">
              <div><p className="text-4xl">{boss.emoji}</p><h3 className="mt-2 text-lg font-extrabold text-slate-900 dark:text-white">{boss.name}</h3></div>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">{boss.isDefeated ? "Đã hạ gục" : `${boss.currentHp.toLocaleString("vi-VN")} HP`}</span>
            </div>
            {boss.description && <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{boss.description}</p>}
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800"><div className={`h-full rounded-full transition-all ${boss.isDefeated ? "bg-emerald-500" : "bg-rose-500"}`} style={{ width: `${percent}%` }} /></div>
            <p className="mt-1 text-right text-xs font-semibold text-slate-500 dark:text-slate-400">{percent}% máu còn lại</p>
          </div>
        );
      })}
    </div>
  );
}
