"use client";

import { useEffect, useState } from "react";
import type { EventLeaderboardRow } from "@/lib/event-types";
import { EVENT_TYPE_META } from "@/lib/event-types";

export default function EventLeaderboard({ eventId, initialRows, eventType = "boss_battle" }: { eventId: string; initialRows: EventLeaderboardRow[]; eventType?: keyof typeof EVENT_TYPE_META }) {
  const [rows, setRows] = useState(initialRows);
  const [loading, setLoading] = useState(false);
  useEffect(() => setRows(initialRows), [initialRows]);
  async function refresh() {
    setLoading(true);
    try {
      const res = await fetch(`/api/events/${eventId}/leaderboard`, { cache: "no-store" });
      const data = await res.json();
      if (res.ok) setRows((data.leaderboard ?? []).map((row: any) => ({ userId: row.user_id, userName: row.user_name, totalDamage: Number(row.total_score ?? row.total_damage ?? 0), totalScore: Number(row.total_score ?? row.total_damage ?? 0), metric: row.metric ?? "damage", attempts: Number(row.attempts) })));
    } finally { setLoading(false); }
  }
  const meta = EVENT_TYPE_META[eventType];
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800/80 dark:bg-[#131b2e]">
      <div className="mb-4 flex items-center justify-between gap-3"><div><h2 className="text-lg font-extrabold text-slate-900 dark:text-white">🏆 Bảng xếp hạng</h2><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Tổng {meta.scoreLabel} của người tham gia</p></div><button type="button" onClick={refresh} disabled={loading} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">{loading ? "Đang tải…" : "↻ Làm mới"}</button></div>
      {!rows.length ? <p className="py-5 text-center text-sm text-slate-500 dark:text-slate-400">Chưa có điểm đóng góp nào.</p> : <div className="space-y-2">{rows.map((row, index) => <div key={row.userId} className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5 dark:bg-slate-900/60"><span className="w-7 text-center text-sm font-extrabold">{index < 3 ? ["🥇", "🥈", "🥉"][index] : index + 1}</span><span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-800 dark:text-slate-200">{row.userName}</span><span className="text-sm font-extrabold text-orange-600 dark:text-orange-400">{meta.icon} {row.totalScore.toLocaleString("vi-VN")}</span><span className="hidden text-xs text-slate-400 sm:inline">{row.attempts} lượt</span></div>)}</div>}
    </section>
  );
}
