"use client";

import { useEffect, useState } from "react";
import type { ChapterEditorItem } from "./ChapterEditor";
import ChapterItemPicker from "./ChapterItemPicker";
import DocumentQuickCreateModal from "./DocumentQuickCreateModal";
import DocumentFullEditorModal from "./DocumentFullEditorModal";
import type { StagedDocumentData } from "@/lib/staged-document-saver";

export interface StagedChapter {
  id: string;
  isNew?: boolean;
  title: string;
  description?: string;
  grade: string;
  items: ChapterEditorItem[];
}

interface ChapterModalProps {
  open: boolean;
  onClose: () => void;
  editChapter?: StagedChapter | null;
  onSaveChapter: (chapter: StagedChapter) => void;
  availableChapters: {
    id: string;
    title: string;
    description?: string | null;
    grade: string;
    items?: any[];
  }[];
  currentChapterIds: string[];
  defaultGrade?: string;
  documents: { id: string; title: string; documentType: string; grade: string }[];
  quizzes: { id: string; title: string; grade: string }[];
}

export default function ChapterModal({
  open,
  onClose,
  editChapter,
  onSaveChapter,
  availableChapters,
  currentChapterIds,
  defaultGrade = "Lớp 8",
  documents,
  quizzes,
}: ChapterModalProps) {
  const [tab, setTab] = useState<"create" | "existing">("create");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [grade, setGrade] = useState(defaultGrade);
  const [items, setItems] = useState<ChapterEditorItem[]>([]);
  const [searchExisting, setSearchExisting] = useState("");
  const [error, setError] = useState("");

  const [pickerOpen, setPickerOpen] = useState(false);
  const [quickDocOpen, setQuickDocOpen] = useState(false);
  const [fullDocOpen, setFullDocOpen] = useState(false);

  useEffect(() => {
    if (open) {
      setError("");
      setSearchExisting("");
      if (editChapter) {
        setTab("create"); // In edit mode, show the form
        setTitle(editChapter.title);
        setDescription(editChapter.description ?? "");
        setGrade(editChapter.grade);
        setItems(editChapter.items ?? []);
      } else {
        setTab("create");
        setTitle("");
        setDescription("");
        setGrade(defaultGrade);
        setItems([]);
      }
    }
  }, [open, editChapter, defaultGrade]);

  if (!open) return null;

  const existingDocumentIds = items
    .filter((i) => i.itemType === "document" && i.documentId && !i.isNew)
    .map((i) => i.documentId!);
  const existingQuizIds = items
    .filter((i) => i.itemType === "quiz" && i.quizId)
    .map((i) => i.quizId!);

  const addContent = (item: ChapterEditorItem) => {
    setItems((prev) => [...prev, item]);
    setPickerOpen(false);
  };

  const addStagedDoc = (stagedDoc: StagedDocumentData) => {
    setItems((prev) => [
      ...prev,
      {
        itemType: "document",
        documentId: stagedDoc.tempId,
        documentType: stagedDoc.documentType,
        title: stagedDoc.title,
        grade: stagedDoc.grade,
        isNew: true,
        stagedDoc,
      },
    ]);
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

  // Chọn 1 chương có sẵn từ hệ thống
  const handleSelectExisting = (ch: (typeof availableChapters)[0]) => {
    const mappedItems: ChapterEditorItem[] = (ch.items || []).map((it: any) => ({
      itemType: it.itemType ?? it.item_type,
      documentId: it.documentId ?? it.document_id,
      quizId: it.quizId ?? it.quiz_id,
      documentType: it.documentType ?? (it.documents?.document_type === "test" ? "test" : "normal"),
      title: it.title ?? it.documents?.title ?? "Nội dung",
      grade: it.grade ?? it.documents?.grade,
    }));

    onSaveChapter({
      id: ch.id,
      isNew: false,
      title: ch.title,
      description: ch.description ?? undefined,
      grade: ch.grade,
      items: mappedItems,
    });
    onClose();
  };

  // Lưu chương mới hoặc cập nhật chương đang sửa
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      return setError("Vui lòng nhập tên chương.");
    }

    const chapterToSave: StagedChapter = {
      id: editChapter ? editChapter.id : `staged-ch-${crypto.randomUUID()}`,
      isNew: editChapter ? editChapter.isNew : true,
      title: title.trim(),
      description: description.trim() || undefined,
      grade,
      items,
    };

    onSaveChapter(chapterToSave);
    onClose();
  };

  const filteredAvailable = availableChapters
    .filter((c) => !currentChapterIds.includes(c.id))
    .filter(
      (c) =>
        c.title.toLowerCase().includes(searchExisting.toLowerCase()) ||
        c.grade.toLowerCase().includes(searchExisting.toLowerCase()),
    );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={onClose} />
      <div className="relative flex max-h-[92vh] w-full max-w-3xl flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl transition-colors dark:border-slate-800 dark:bg-[#131b2e]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              {editChapter ? "✏️ Chỉnh sửa chương" : "📚 Thêm chương vào lộ trình"}
            </h2>
            <p className="text-xs text-slate-500">
              {editChapter
                ? "Cập nhật tiêu đề và danh sách bài học/kiểm tra trong chương."
                : "Tạo chương mới tại chỗ hoặc chọn từ các chương đã có."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            ✕
          </button>
        </div>

        {/* Tab switch (chỉ hiện khi tạo mới, không hiện khi đang sửa 1 chương cụ thể) */}
        {!editChapter && (
          <div className="flex border-b border-slate-200 px-6 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/30">
            <button
              type="button"
              onClick={() => setTab("create")}
              className={`py-3 px-4 text-sm font-bold border-b-2 transition-colors ${
                tab === "create"
                  ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                  : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400"
              }`}
            >
              ✨ Tạo chương mới tại chỗ
            </button>
            <button
              type="button"
              onClick={() => setTab("existing")}
              className={`py-3 px-4 text-sm font-bold border-b-2 transition-colors ${
                tab === "existing"
                  ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                  : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400"
              }`}
            >
              📂 Chọn chương có sẵn ({filteredAvailable.length})
            </button>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {tab === "existing" && !editChapter ? (
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Tìm kiếm chương theo tên hoặc lớp..."
                value={searchExisting}
                onChange={(e) => setSearchExisting(e.target.value)}
                className="w-full rounded-xl border border-slate-200/80 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-hidden transition-colors focus:border-indigo-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />

              {filteredAvailable.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 py-12 text-center text-sm text-slate-500 dark:border-slate-800">
                  Không tìm thấy chương nào khả dụng chưa được gán vào lộ trình này.
                </div>
              ) : (
                <div className="max-h-[380px] overflow-y-auto space-y-2 pr-1">
                  {filteredAvailable.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-slate-200/70 bg-white p-4 shadow-xs transition-colors hover:border-indigo-300 dark:border-slate-800 dark:bg-slate-900/40"
                    >
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-slate-900 dark:text-white truncate">
                          {c.title}
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="rounded bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                            {c.grade}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {c.items?.length || 0} bài học/kiểm tra
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSelectExisting(c)}
                        className="shrink-0 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-indigo-700"
                      >
                        + Chọn chương này
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Form Tạo mới hoặc Sửa chương */
            <div className="space-y-5">
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Tên chương *
                  </label>
                  <input
                    type="text"
                    maxLength={200}
                    placeholder="VD: Chương 1: Đa thức nhiều biến..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-xl border border-slate-200/80 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-hidden transition-colors focus:border-indigo-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Mô tả chương
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Tóm tắt nội dung trọng tâm của chương này..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded-xl border border-slate-200/80 bg-slate-50 px-4 py-2 text-sm text-slate-900 outline-hidden transition-colors focus:border-indigo-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Khối lớp
                  </label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full rounded-xl border border-slate-200/80 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-hidden transition-colors focus:border-indigo-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  >
                    {["Lớp 6", "Lớp 7", "Lớp 8", "Lớp 9", "Lớp 10", "Lớp 11", "Lớp 12"].map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Phần quản lý tài liệu trong chương */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      📖 Tài liệu trong chương ({items.length})
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Thêm bài học hoặc bài kiểm tra trực tiếp cho chương này.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setPickerOpen(true)}
                      className="rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-600 hover:bg-indigo-100 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-400"
                    >
                      🔍 Có sẵn
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickDocOpen(true)}
                      className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 hover:bg-emerald-100 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-400"
                    >
                      ⚡ Tạo nhanh
                    </button>
                    <button
                      type="button"
                      onClick={() => setFullDocOpen(true)}
                      className="rounded-lg border border-violet-200 bg-violet-50 px-2.5 py-1 text-xs font-bold text-violet-700 hover:bg-violet-100 dark:border-violet-900/60 dark:bg-violet-950/40 dark:text-violet-400"
                    >
                      📝 Soạn LaTeX
                    </button>
                  </div>
                </div>

                {items.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-500 dark:border-slate-800">
                    Chương này chưa có tài liệu nào. Bạn có thể thêm ngay bây giờ hoặc bổ sung sau.
                  </div>
                ) : (
                  <div className="max-h-[220px] overflow-y-auto space-y-1.5 pr-1">
                    {items.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between gap-2 rounded-lg border border-slate-100 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-900/40"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            {index + 1}
                          </span>
                          <span className="text-sm">
                            {item.itemType === "document" && item.documentType !== "test"
                              ? "📄"
                              : "✓"}
                          </span>
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                            {item.title}
                          </span>
                          {item.isNew && (
                            <span className="shrink-0 rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-800 dark:bg-amber-950/80 dark:text-amber-300">
                              Mới tạo
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => moveBlock(index, -1)}
                            className="flex h-6 w-6 items-center justify-center rounded border border-slate-200 text-xs text-slate-500 hover:bg-slate-100 disabled:opacity-30 dark:border-slate-800"
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            disabled={index === items.length - 1}
                            onClick={() => moveBlock(index, 1)}
                            className="flex h-6 w-6 items-center justify-center rounded border border-slate-200 text-xs text-slate-500 hover:bg-slate-100 disabled:opacity-30 dark:border-slate-800"
                          >
                            ↓
                          </button>
                          <button
                            type="button"
                            onClick={() => removeBlock(index)}
                            className="flex h-6 w-6 items-center justify-center rounded border border-red-200 text-xs text-red-600 hover:bg-red-50 dark:border-red-900/60"
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
                <p className="rounded-lg bg-red-50 p-2.5 text-xs text-red-600 dark:bg-red-950/40 dark:text-red-300">
                  {error}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer (khi ở form tạo/sửa) */}
        {(tab === "create" || editChapter) && (
          <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-3.5 dark:border-slate-800 dark:bg-[#0f172a]">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSaveForm}
              className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700"
            >
              {editChapter ? "Cập nhật chương" : "+ Thêm chương vào lộ trình"}
            </button>
          </div>
        )}
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

      <DocumentQuickCreateModal
        open={quickDocOpen}
        onClose={() => setQuickDocOpen(false)}
        defaultGrade={grade}
        onCreated={addStagedDoc}
      />

      <DocumentFullEditorModal
        open={fullDocOpen}
        onClose={() => setFullDocOpen(false)}
        defaultGrade={grade}
        onSaved={addStagedDoc}
      />
    </div>
  );
}
