"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { ChapterData } from "@/lib/chapter-types";
import ChapterItemPicker from "./ChapterItemPicker";

interface ChapterEditorProps {
  initialData?: ChapterData;
  documents: { id: string; title: string; documentType: string; grade: string }[];
  quizzes: { id: string; title: string; grade: string }[];
  paths?: { id: string; title: string }[];
}

interface ChapterEditorItem {
  itemType: "document" | "quiz";
  documentId?: string;
  quizId?: string;
  title: string;
  grade?: string;
}

export default function ChapterEditor({ initialData, documents, quizzes, paths = [] }: ChapterEditorProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [grade, setGrade] = useState(initialData?.grade ?? "Lớp 8");
  const [pathId, setPathId] = useState(initialData?.pathId ?? "");
  const [items, setItems] = useState<ChapterEditorItem[]>(() => {
    if (!initialData?.items) return [];
    return initialData.items.map((item) => ({
      itemType: item.itemType,
      documentId: item.documentId,
      quizId: item.quizId,
      title: item.title ?? "",
      grade: item.grade,
    }));
  });

  const [pickerOpen, setPickerOpen] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const existingDocumentIds = items.filter((i) => i.itemType === "document").map((i) => i.documentId!);
  const existingQuizIds = items.filter((i) => i.itemType === "quiz").map((i) => i.quizId!);

  const addContent = (item: ChapterEditorItem) => {
    setItems((prev) => [...prev, item]);
    setPickerOpen(false);
  };

  const removeBlock = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const moveBlock = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= items.length) return;
    setItems((prev) => {
      const next = [...prev];
      const temp = next[index];
      next[index] = next[targetIndex];
      next[targetIndex] = temp;
      return next;
    });
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      return setError("Vui lòng nhập tên chương.");
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
        // Edit mode
        const { error: chapterError } = await supabase
          .from("chapters")
          .update({
            title: title.trim(),
            description: description.trim() || null,
            grade,
            path_id: pathId || null,
          })
          .eq("id", initialData.id);

        if (chapterError) throw chapterError;

        // Delete old items
        const { error: deleteError } = await supabase
          .from("chapter_items")
          .delete()
          .eq("chapter_id", initialData.id);

        if (deleteError) throw deleteError;

        // Insert new items
        if (items.length > 0) {
          const insertRows = items.map((item, index) => ({
            chapter_id: initialData.id,
            item_type: item.itemType,
            document_id: item.itemType === "document" ? item.documentId : null,
            quiz_id: item.itemType === "quiz" ? item.quizId : null,
            position: index,
          }));

          const { error: insertError } = await supabase.from("chapter_items").insert(insertRows);
          if (insertError) throw insertError;
        }
      } else {
        // Create mode
        const { data: newChapter, error: chapterError } = await supabase
          .from("chapters")
          .insert({
            title: title.trim(),
            description: description.trim() || null,
            grade,
            subject: "Toán",
            position: 0,
            path_id: pathId || null,
            created_by: user.id,
          })
          .select("id")
          .single();

        if (chapterError || !newChapter) {
          throw chapterError || new Error("Không thể tạo chương mới.");
        }

        // Insert items
        if (items.length > 0) {
          const insertRows = items.map((item, index) => ({
            chapter_id: newChapter.id,
            item_type: item.itemType,
            document_id: item.itemType === "document" ? item.documentId : null,
            quiz_id: item.itemType === "quiz" ? item.quizId : null,
            position: index,
          }));

          const { error: insertError } = await supabase.from("chapter_items").insert(insertRows);
          if (insertError) throw insertError;
        }
      }

      router.push("/quan-ly/chuong");
      router.refresh();
    } catch (err: any) {
      setError(err?.message ?? "Đã xảy ra lỗi khi lưu chương.");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      {/* Thông tin chương */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs transition-colors dark:border-slate-800/80 dark:bg-[#131b2e]">
        <h2 className="mb-4 text-lg font-bold dark:text-white">Thông tin chương học</h2>
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Tên chương *
            </label>
            <input
              type="text"
              maxLength={200}
              placeholder="Nhập tên chương..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-slate-200/80 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-hidden transition-colors focus:border-indigo-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:border-indigo-500 dark:focus:bg-slate-900"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Mô tả chương
            </label>
            <textarea
              rows={3}
              placeholder="Nhập mô tả về chương học này..."
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

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Lộ trình học
            </label>
            <select
              value={pathId}
              onChange={(e) => setPathId(e.target.value)}
              className="w-full rounded-xl border border-slate-200/80 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-hidden transition-colors focus:border-indigo-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:border-indigo-500 dark:focus:bg-slate-900"
            >
              <option value="">— Chưa gán vào lộ trình nào —</option>
              {paths.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Nội dung chương */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs transition-colors dark:border-slate-800/80 dark:bg-[#131b2e]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold dark:text-white">📖 Danh sách nội dung ({items.length})</h2>
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-xs font-bold text-indigo-600 transition-colors hover:bg-indigo-100 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-400 dark:hover:bg-indigo-950/60"
          >
            + Thêm nội dung
          </button>
        </div>

        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 py-10 text-center dark:border-slate-800">
            <p className="text-sm text-slate-500">Chưa có bài học hay bài kiểm tra nào trong chương này.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-4 transition-colors dark:border-slate-800 dark:bg-slate-900/30"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Number tag */}
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {index + 1}
                  </span>

                  {/* Icon type */}
                  <span className="text-lg shrink-0">
                    {item.itemType === "document" ? "📄" : "✓"}
                  </span>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                      {item.title}
                    </p>
                    <div className="mt-0.5 flex items-center gap-1.5">
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                        {item.itemType === "document" ? "Tài liệu" : "Bài kiểm tra"}
                      </span>
                      {item.grade && (
                        <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-[9px] font-semibold text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                          {item.grade}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sắp xếp & Xóa */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => moveBlock(index, -1)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-30 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    disabled={index === items.length - 1}
                    onClick={() => moveBlock(index, 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-30 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => removeBlock(index)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/60 dark:text-red-400 dark:hover:bg-red-950/40"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && (
        <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </p>
      )}

      {/* Hành động */}
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
          {saving ? "Đang lưu..." : initialData ? "Lưu thay đổi" : "Tạo chương"}
        </button>
      </div>

      <ChapterItemPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={addContent}
        existingDocumentIds={existingDocumentIds}
        existingQuizIds={existingQuizIds}
        documents={documents}
        quizzes={quizzes}
      />
    </form>
  );
}
