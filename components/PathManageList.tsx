"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { LearningPathData } from "@/lib/path-types";

export default function PathManageList({ initialPaths }: { initialPaths: LearningPathData[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function removePath(id: string) {
    if (!confirm("Xóa lộ trình này? Các chương bên trong sẽ không bị xóa nhưng sẽ không còn thuộc lộ trình nào.")) return;
    const supabase = createClient();
    if (!supabase) return setError("Website chưa được cấu hình Supabase.");

    setBusyId(id);
    setError("");
    const { error: deleteError } = await supabase.from("learning_paths").delete().eq("id", id);
    setBusyId(null);
    if (deleteError) return setError(deleteError.message);
    router.refresh();
  }

  if (initialPaths.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-700">
        <p className="text-sm text-slate-500">Chưa có lộ trình học nào.</p>
        <Link href="/quan-ly/lo-trinh/them" className="mt-4 inline-block font-semibold text-indigo-600 hover:underline">
          Tạo lộ trình đầu tiên →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">{error}</p>}
      {initialPaths.map((path) => (
        <div
          key={path.id}
          className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-colors dark:border-slate-800/80 dark:bg-[#131b2e]"
        >
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700 dark:bg-blue-950/70 dark:text-blue-300">
                {path.grade}
              </span>
              <h2 className="truncate text-base font-bold text-slate-900 dark:text-white">🧭 {path.title}</h2>
            </div>
            <p className="mt-1 line-clamp-1 text-sm text-slate-500 dark:text-slate-400">
              {path.description || "Chưa có mô tả."} · 📚 {path.chapters.length} chương
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Link
              href={`/lo-trinh/${path.id}`}
              className="rounded-lg border border-indigo-200 px-3 py-2 text-xs font-bold text-indigo-600 hover:bg-indigo-50 dark:border-indigo-900/60 dark:text-indigo-400 dark:hover:bg-indigo-950/40"
            >
              Xem
            </Link>
            <Link
              href={`/quan-ly/lo-trinh/${path.id}/sua`}
              className="rounded-lg border border-emerald-300 px-3 py-2 text-xs font-bold text-emerald-600 hover:bg-emerald-50 dark:border-emerald-900/60 dark:text-emerald-400 dark:hover:bg-emerald-950/40"
            >
              ✏️ Sửa
            </Link>
            <button
              disabled={busyId === path.id}
              onClick={() => removePath(path.id)}
              className="rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-600 disabled:opacity-50 hover:bg-red-50 dark:border-red-900/60 dark:text-red-400 dark:hover:bg-red-950/40"
            >
              Xóa
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
