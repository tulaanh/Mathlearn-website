"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { ChapterData } from "@/lib/chapter-types";
import ChapterManageCard from "./ChapterManageCard";

export default function ChapterManageList({ initialChapters }: { initialChapters: ChapterData[] }) {
  const router = useRouter();
  const [chapters, setChapters] = useState(initialChapters);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Bạn có chắc muốn xóa chương này? Hành động không thể hoàn tác.")) return;
    setDeleting(id);
    const supabase = createClient();
    if (!supabase) return;
    const { error } = await supabase.from("chapters").delete().eq("id", id);
    if (error) {
      alert("Không thể xóa: " + error.message);
      setDeleting(null);
      return;
    }
    setChapters((prev) => prev.filter((c) => c.id !== id));
    setDeleting(null);
    router.refresh();
  }

  if (chapters.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-700">
        <div className="mx-auto mb-4 text-5xl">📚</div>
        <p className="text-sm text-slate-500 dark:text-slate-400">Chưa có chương nào.</p>
        <Link href="/quan-ly/chuong/them" className="mt-4 inline-block font-semibold text-indigo-600 dark:text-indigo-400">
          Tạo chương đầu tiên →
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {chapters.map((chapter) => (
        <ChapterManageCard
          key={chapter.id}
          chapter={chapter}
          onDelete={handleDelete}
          isDeleting={deleting === chapter.id}
        />
      ))}
    </div>
  );
}
