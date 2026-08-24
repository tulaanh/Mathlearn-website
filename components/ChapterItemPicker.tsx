"use client";

import { useEffect, useState } from "react";

interface DocumentItem {
  id: string;
  title: string;
  documentType: string;
  grade: string;
}

interface QuizItem {
  id: string;
  title: string;
  grade: string;
}

interface ChapterItemPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (item: { itemType: "document" | "quiz"; documentId?: string; quizId?: string; title: string; grade?: string }) => void;
  existingDocumentIds: string[];
  existingQuizIds: string[];
  documents: DocumentItem[];
  quizzes: QuizItem[];
}

export default function ChapterItemPicker({
  open,
  onClose,
  onSelect,
  existingDocumentIds,
  existingQuizIds,
  documents,
  quizzes,
}: ChapterItemPickerProps) {
  const [activeTab, setActiveTab] = useState<"document" | "quiz">("document");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (open) {
      setSearchQuery("");
      setActiveTab("document");
    }
  }, [open]);

  if (!open) return null;

  // Lọc tài liệu chưa được thêm
  const availableDocuments = documents
    .filter((doc) => !existingDocumentIds.includes(doc.id))
    .filter((doc) => doc.title.toLowerCase().includes(searchQuery.toLowerCase()));

  // Lọc bài kiểm tra chưa được thêm
  const availableQuizzes = quizzes
    .filter((quiz) => !existingQuizIds.includes(quiz.id))
    .filter((quiz) => quiz.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={onClose} />

      {/* Modal Content */}
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl transition-colors dark:border-slate-800 dark:bg-[#131b2e]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Thêm nội dung vào chương
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            ✕
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Tìm kiếm theo tiêu đề..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200/80 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-hidden transition-colors focus:border-indigo-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:border-indigo-500 dark:focus:bg-slate-900"
          />
        </div>

        {/* Tab Buttons */}
        <div className="mb-4 flex border-b border-slate-100 dark:border-slate-800">
          <button
            onClick={() => {
              setActiveTab("document");
              setSearchQuery("");
            }}
            className={`flex-1 pb-3 text-sm font-bold transition-colors ${
              activeTab === "document"
                ? "border-b-2 border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                : "text-slate-400 dark:text-slate-500"
            }`}
          >
            📄 Tài liệu ({availableDocuments.length})
          </button>
          <button
            onClick={() => {
              setActiveTab("quiz");
              setSearchQuery("");
            }}
            className={`flex-1 pb-3 text-sm font-bold transition-colors ${
              activeTab === "quiz"
                ? "border-b-2 border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                : "text-slate-400 dark:text-slate-500"
            }`}
          >
            ✓ Bài kiểm tra ({availableQuizzes.length})
          </button>
        </div>

        {/* Available Items List */}
        <div className="max-h-[300px] overflow-y-auto pr-1 space-y-2">
          {activeTab === "document" ? (
            availableDocuments.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-500">
                Không có tài liệu nào khả dụng.
              </p>
            ) : (
              availableDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-900/40"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                      {doc.title}
                    </p>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {doc.grade}
                      </span>
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300">
                        {doc.documentType === "test" ? "Bài kiểm tra" : "Lý thuyết"}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      onSelect({
                        itemType: "document",
                        documentId: doc.id,
                        title: doc.title,
                        grade: doc.grade,
                      })
                    }
                    className="shrink-0 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-indigo-700"
                  >
                    + Thêm
                  </button>
                </div>
              ))
            )
          ) : availableQuizzes.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">
              Không có bài kiểm tra nào khả dụng.
            </p>
          ) : (
            availableQuizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-900/40"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                    {quiz.title}
                  </p>
                  <div className="mt-1">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {quiz.grade}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() =>
                    onSelect({
                      itemType: "quiz",
                      quizId: quiz.id,
                      title: quiz.title,
                      grade: quiz.grade,
                    })
                  }
                  className="shrink-0 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-indigo-700"
                >
                  + Thêm
                </button>
              </div>
            ))
          )}
        </div>

        {/* Close Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
