"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { LearningPathData } from "@/lib/path-types";
import ChapterModal, { type StagedChapter } from "./ChapterModal";
import type { ChapterEditorItem } from "./ChapterEditor";
import { saveStagedDocument } from "@/lib/staged-document-saver";

interface PathEditorProps {
  initialData?: LearningPathData;
  availableChapters?: {
    id: string;
    title: string;
    description?: string | null;
    grade: string;
    items?: any[];
  }[];
  documents?: { id: string; title: string; documentType: string; grade: string }[];
  quizzes?: { id: string; title: string; grade: string }[];
}

export default function PathEditor({
  initialData,
  availableChapters = [],
  documents = [],
  quizzes = [],
}: PathEditorProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [grade, setGrade] = useState(initialData?.grade ?? "Lớp 8");
  const [chapters, setChapters] = useState<StagedChapter[]>(() => {
    if (!initialData?.chapters) return [];
    return initialData.chapters.map((ch) => ({
      id: ch.id,
      isNew: false,
      title: ch.title,
      description: ch.description ?? undefined,
      grade: ch.grade,
      items: (ch.items || []).map((it) => ({
        itemType: it.itemType,
        documentId: it.documentId,
        quizId: it.quizId,
        documentType: it.documentType,
        title: it.title ?? "",
        grade: it.grade,
      })),
    }));
  });

  const [removedChapterIds, setRemovedChapterIds] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState<StagedChapter | null>(null);

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // Sắp xếp thứ tự chương trong lộ trình
  const moveChapter = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= chapters.length) return;
    setChapters((prev) => {
      const next = [...prev];
      const temp = next[index];
      next[index] = next[targetIndex];
      next[targetIndex] = temp;
      return next;
    });
  };

  // Gỡ chương khỏi lộ trình (chỉ unlink path_id = null)
  const removeChapter = (index: number) => {
    const ch = chapters[index];
    if (!ch.isNew && ch.id) {
      setRemovedChapterIds((prev) => (prev.includes(ch.id) ? prev : [...prev, ch.id]));
    }
    setChapters((prev) => prev.filter((_, i) => i !== index));
  };

  // Mở modal tạo chương mới
  const handleOpenCreateChapter = () => {
    setEditingChapter(null);
    setModalOpen(true);
  };

  // Mở modal sửa chương
  const handleOpenEditChapter = (ch: StagedChapter) => {
    setEditingChapter(ch);
    setModalOpen(true);
  };

  // Callback khi lưu từ ChapterModal
  const handleSaveChapterFromModal = (savedChapter: StagedChapter) => {
    if (editingChapter) {
      // Sửa chương đã có trong danh sách
      setChapters((prev) =>
        prev.map((c) => (c.id === editingChapter.id ? savedChapter : c)),
      );
    } else {
      // Thêm chương mới vào danh sách
      setChapters((prev) => [...prev, savedChapter]);
      // Nếu chương này trước đó nằm trong danh sách đã gỡ, bỏ nó ra khỏi removedChapterIds
      if (!savedChapter.isNew) {
        setRemovedChapterIds((prev) => prev.filter((id) => id !== savedChapter.id));
      }
    }
    setEditingChapter(null);
  };

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

      let targetPathId = initialData?.id;

      // 1. Lưu hoặc Cập nhật Lộ trình
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
        const { data: newPath, error: insertError } = await supabase
          .from("learning_paths")
          .insert({
            title: title.trim(),
            description: description.trim() || null,
            grade,
            subject: "Toán",
            position: 0,
            created_by: user.id,
          })
          .select("id")
          .single();

        if (insertError || !newPath) throw insertError || new Error("Không thể tạo lộ trình.");
        targetPathId = newPath.id;
      }

      // 2. Xử lý các chương được gán vào lộ trình
      for (let chIndex = 0; chIndex < chapters.length; chIndex++) {
        const chapter = chapters[chIndex];

        // Chuẩn bị danh sách items và lưu các tài liệu tạo mới trước
        const preparedItems: ChapterEditorItem[] = [...(chapter.items || [])];
        for (let itIndex = 0; itIndex < preparedItems.length; itIndex++) {
          const it = preparedItems[itIndex];
          if (it.isNew && it.stagedDoc) {
            const realDocId = await saveStagedDocument(supabase, user.id, it.stagedDoc);
            preparedItems[itIndex] = {
              ...it,
              documentId: realDocId,
              isNew: false,
              stagedDoc: undefined,
            };
          }
        }

        let chapterId = chapter.id;

        if (chapter.isNew) {
          // Tạo chương mới trong DB
          const { data: newCh, error: chInsertError } = await supabase
            .from("chapters")
            .insert({
              title: chapter.title.trim(),
              description: chapter.description?.trim() || null,
              grade: chapter.grade,
              subject: "Toán",
              position: chIndex,
              path_id: targetPathId,
              created_by: user.id,
            })
            .select("id")
            .single();

          if (chInsertError || !newCh) {
            throw chInsertError || new Error(`Không thể lưu chương: ${chapter.title}`);
          }
          chapterId = newCh.id;
        } else {
          // Cập nhật chương có sẵn (gán path_id và vị trí mới)
          const { error: chUpdateError } = await supabase
            .from("chapters")
            .update({
              title: chapter.title.trim(),
              description: chapter.description?.trim() || null,
              grade: chapter.grade,
              position: chIndex,
              path_id: targetPathId,
            })
            .eq("id", chapter.id);

          if (chUpdateError) throw chUpdateError;
        }

        // Cập nhật lại chapter_items cho chương này
        const { error: delItemsErr } = await supabase
          .from("chapter_items")
          .delete()
          .eq("chapter_id", chapterId);
        if (delItemsErr) throw delItemsErr;

        if (preparedItems.length > 0) {
          const insertRows = preparedItems.map((item, itemIdx) => ({
            chapter_id: chapterId,
            item_type: item.itemType,
            document_id: item.itemType === "document" ? item.documentId : null,
            quiz_id: item.itemType === "quiz" ? item.quizId : null,
            position: itemIdx,
          }));

          const { error: insertItemsErr } = await supabase
            .from("chapter_items")
            .insert(insertRows);
          if (insertItemsErr) throw insertItemsErr;
        }
      }

      // 3. Gỡ các chương bị loại khỏi lộ trình (set path_id = null)
      if (removedChapterIds.length > 0) {
        const { error: unbindError } = await supabase
          .from("chapters")
          .update({ path_id: null })
          .in("id", removedChapterIds);

        if (unbindError) console.warn("Lỗi gỡ chương khỏi lộ trình:", unbindError);
      }

      router.push("/quan-ly/lo-trinh");
      router.refresh();
    } catch (err: any) {
      setError(err?.message ?? "Đã xảy ra lỗi khi lưu lộ trình.");
      setSaving(false);
    }
  }

  return (
    <>
      <form onSubmit={submit} className="space-y-6">
      {/* Thông tin lộ trình */}
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

      {/* Danh sách chương trong lộ trình */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs transition-colors dark:border-slate-800/80 dark:bg-[#131b2e]">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold dark:text-white">
              📚 Các chương trong lộ trình ({chapters.length})
            </h2>
            <p className="text-xs text-slate-500">
              Tạo chương mới tại chỗ hoặc chọn các chương đã có để đưa vào lộ trình này.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenCreateChapter}
            className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-indigo-700"
          >
            + Thêm chương vào lộ trình
          </button>
        </div>

        {chapters.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 py-10 text-center dark:border-slate-800">
            <p className="text-sm text-slate-500">
              Chưa có chương nào được gán vào lộ trình này.
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Bấm nút &quot;+ Thêm chương vào lộ trình&quot; phía trên để tạo chương ngay hoặc chọn chương có sẵn.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {chapters.map((ch, index) => (
              <div
                key={ch.id || index}
                className="flex items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 transition-colors hover:border-indigo-200 dark:border-slate-800 dark:bg-slate-900/40"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Số thứ tự */}
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                    {index + 1}
                  </span>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                        {ch.title}
                      </p>
                      {ch.isNew && (
                        <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-bold text-amber-800 dark:bg-amber-950/70 dark:text-amber-300">
                          Chương mới (chờ lưu)
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span className="rounded bg-slate-200/70 px-1.5 py-0.2 text-[10px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {ch.grade}
                      </span>
                      <span>•</span>
                      <span>{ch.items?.length || 0} bài học/kiểm tra</span>
                      {ch.description && (
                        <>
                          <span>•</span>
                          <span className="truncate max-w-[200px] sm:max-w-xs">{ch.description}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sắp xếp, Sửa & Gỡ */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleOpenEditChapter(ch)}
                    className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    title="Chỉnh sửa chương và tài liệu"
                  >
                    ✏️ Sửa
                  </button>
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => moveChapter(index, -1)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 disabled:opacity-30 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
                    title="Di chuyển lên"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    disabled={index === chapters.length - 1}
                    onClick={() => moveChapter(index, 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 disabled:opacity-30 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
                    title="Di chuyển xuống"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => removeChapter(index)}
                    className="rounded-lg border border-red-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 dark:border-red-900/60 dark:bg-slate-900 dark:text-red-400"
                    title="Gỡ khỏi lộ trình"
                  >
                    Gỡ
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
          {saving ? "Đang lưu..." : initialData ? "Lưu thay đổi" : "Tạo lộ trình"}
        </button>
      </div>
    </form>

      <ChapterModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        editChapter={editingChapter}
        onSaveChapter={handleSaveChapterFromModal}
        availableChapters={availableChapters}
        currentChapterIds={chapters.map((c) => c.id)}
        defaultGrade={grade}
        documents={documents}
        quizzes={quizzes}
      />
    </>
  );
}
