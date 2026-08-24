"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { LearningPathData } from "@/lib/path-types";

interface PathEditorProps {
  initialData?: LearningPathData;
}

export default function PathEditor({ initialData }: PathEditorProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [grade, setGrade] = useState(initialData?.grade ?? "Lớp 8");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      return setError("Vui lòng nhập tên lộ trình.");
    }

    const supabase = createClient();
    if (!supabase) {
      return setError("Website chưa được cấu hình Supabase.");
    }

    setSaving(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        setSaving(false);
        return;
      }

      if (initialData) {
        const { error: updateError } = await supabase
          .from("learning_paths")
          .update({
            title: title.trim(),
            description: description.trim() || null,
            grade,
          })
          .eq("id", initialData.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase.from("learning_paths").insert({
          title: title.trim(),
          description: description.trim() || null,
          grade,
          subject: "Toán",
          position: 0,
          created_by: user.id,
        });

        if (insertError) throw insertError;
      }

      router.push("/quan-ly/lo-trinh");
      router.refresh();
    } catch (err: any) {
      setError(err?.message ?? "Đã xảy ra lỗi khi lưu lộ trình.");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs transition-colors dark:border-slate-800/80 dark:bg-[#131b2e]">
        <h2 className="mb-4 text-lg font-bold dark:text-white">Thông tin lộ trình</h2>
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Tên lộ trình *
            </label>
            <input
              type="text"
              maxLength={200}
              placeholder="Ví dụ: Lộ trình Toán lớp 8 học kỳ 1..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-slate-200/80 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-hidden transition-colors focus:border-indigo-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:border-indigo-500 dark:focus:bg-slate-900"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Mô tả lộ trình
            </label>
            <textarea
              rows={3}
              placeholder="Nhập mô tả về lộ trình học này..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-slate-200/80 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-hidden transition-colors focus:border-indigo-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:border-indigo-500 dark:focus:bg-slate-900"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Khối lớp
            </label>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="w-full rounded-xl border border-slate-200/80 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-hidden transition-colors focus:border-indigo-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:border-indigo-500 dark:focus:bg-slate-900"
            >
              {["Lớp 6", "Lớp 7", "Lớp 8", "Lớp 9", "Lớp 10", "Lớp 11", "Lớp 12"].map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error && (
        <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          Hủy
        </button>
        <button
          disabled={saving}
          className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 disabled:opacity-60 dark:shadow-none"
        >
          {saving ? "Đang lưu..." : initialData ? "Lưu thay đổi" : "Tạo lộ trình"}
        </button>
      </div>
    </form>
  );
}
