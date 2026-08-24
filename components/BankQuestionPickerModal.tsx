"use client";

import { useEffect, useState } from "react";
import type { QuizQuestion } from "@/lib/document-types";
import { DIFFICULTY_META, QUESTION_TYPE_LABELS } from "@/lib/question-bank-types";
import type { Topic } from "@/lib/types";
import MathText from "./MathText";

type BankPick = {
  id: string;
  text: string;
  type?: QuestionType2;
  difficulty: string;
  grade: string;
  points?: number;
  topicIds: string[];
};

type QuestionType2 = "multiple_choice" | "true_false" | "short_answer" | "essay";

type Props = {
  open: boolean;
  onClose: () => void;
  /** Nhận danh sách câu hỏi đã chọn (đã ở định dạng câu hỏi tài liệu). */
  onInsert: (questions: QuizQuestion[]) => void;
  topics: Topic[];
};

/** Modal chọn câu hỏi từ ngân hàng để chèn vào khối quiz của tài liệu. */
export default function BankQuestionPickerModal({ open, onClose, onInsert, topics }: Props) {
  const [questions, setQuestions] = useState<BankPick[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!open) return;
    setSelectedIds(new Set());
    setError("");
    setLoading(true);
    fetch("/api/question-bank?limit=200")
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Không thể tải ngân hàng câu hỏi.");
        setQuestions(data.questions ?? []);
      })
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }, [open]);

  if (!open) return null;

  const filtered = questions.filter((q) => !search.trim() || q.text.toLowerCase().includes(search.trim().toLowerCase()));

  async function insertSelected() {
    if (!selectedIds.size) return;
    // Lấy nội dung đầy đủ (đáp án) của các câu đã chọn từ API chi tiết từng câu
    setError("");
    try {
      const pickedQuestions: QuizQuestion[] = [];
      for (const id of selectedIds) {
        const res = await fetch(`/api/question-bank/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Không thể tải câu hỏi.");
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { difficulty, grade, topicIds, createdAt, updatedAt, imageFile, ...question } = data;
        pickedQuestions.push(question as QuizQuestion);
      }
      onInsert(pickedQuestions);
      onClose();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="flex max-h-[85vh] w-full max-w-3xl flex-col rounded-2xl bg-white shadow-xl dark:bg-slate-900" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-700">
          <h2 className="font-bold dark:text-white">📚 Chèn câu hỏi từ ngân hàng</h2>
          <button onClick={onClose} className="rounded-lg px-2 py-1 text-sm font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">✕</button>
        </div>

        <div className="border-b border-slate-200 p-4 dark:border-slate-700">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="🔍 Tìm trong ngân hàng..." className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Đang hiển thị {filtered.length}/{questions.length} câu · đã chọn {selectedIds.size}
          </p>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {loading && <p className="text-sm text-slate-500">Đang tải ngân hàng câu hỏi...</p>}
          {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">{error}</p>}
          {!loading && !filtered.length && <p className="text-sm text-slate-500">Ngân hàng chưa có câu hỏi hoặc không khớp tìm kiếm.</p>}
          {filtered.map((q) => {
            const meta = DIFFICULTY_META.find((d) => d.id === q.difficulty);
            const selected = selectedIds.has(q.id);
            return (
              <label key={q.id} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 ${selected ? "border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/30" : "border-slate-200 dark:border-slate-700"}`}>
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() => setSelectedIds((current) => {
                    const next = new Set(current);
                    if (next.has(q.id)) next.delete(q.id);
                    else next.add(q.id);
                    return next;
                  })}
                  className="mt-1 h-4 w-4 shrink-0"
                />
                <span className="min-w-0 flex-1">
                  <span className="mb-1 flex flex-wrap items-center gap-2">
                    {meta && <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${meta.badgeClass}`}>{meta.short}</span>}
                    <span className="text-xs text-slate-400">{QUESTION_TYPE_LABELS[q.type ?? "multiple_choice"]} · {q.grade}</span>
                    {q.topicIds.map((tid) => {
                      const t = topics.find((x) => x.id === tid);
                      return t ? <span key={tid} className="text-xs text-violet-600 dark:text-violet-300">{t.name}</span> : null;
                    })}
                  </span>
                  <MathText text={q.text} className="block text-sm leading-6 text-slate-800 dark:text-slate-100" />
                </span>
              </label>
            );
          })}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-200 p-4 dark:border-slate-700">
          <button onClick={onClose} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold text-slate-600 dark:border-slate-700 dark:text-slate-300">Hủy</button>
          <button disabled={!selectedIds.size} onClick={insertSelected} className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-60">
            ⬇ Chèn {selectedIds.size || ""} câu hỏi
          </button>
        </div>
      </div>
    </div>
  );
}
