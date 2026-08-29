"use client";

import { useState } from "react";
import { topics } from "@/data/topics";
import type { BankQuestion, ExamMatrix, QuestionDifficulty } from "@/lib/question-bank-types";
import { DIFFICULTY_META } from "@/lib/question-bank-types";

type Props = {
  grade: string;
  selected: BankQuestion[];
  topicIds: string[];
  matrix: ExamMatrix;
  onTopicChange: (topicIds: string[]) => void;
  onMatrixChange: (matrix: ExamMatrix) => void;
  onChange: (questions: BankQuestion[]) => void;
};

const difficultyOrder: QuestionDifficulty[] = ["nhan_biet", "thong_hieu", "van_dung", "van_dung_cao"];

export default function EventQuestionSelector({ grade, selected, topicIds, matrix, onTopicChange, onMatrixChange, onChange }: Props) {
  const [available, setAvailable] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function setCount(difficulty: QuestionDifficulty, value: string) {
    const count = Number(value);
    onMatrixChange({ ...matrix, [difficulty]: Number.isInteger(count) && count > 0 ? Math.min(count, 100) : 0 });
  }

  async function generate() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/question-bank/sinh-de", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ grade, topicIds, matrix }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Không thể chọn câu hỏi từ ngân hàng.");
      onChange(data.picked ?? []);
      setAvailable(data.available ?? {});
      if (!data.picked?.length) throw new Error("Không tìm thấy câu hỏi phù hợp với chủ đề và ma trận độ khó đã chọn.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể chọn câu hỏi từ ngân hàng.");
    } finally {
      setLoading(false);
    }
  }

  const requested = difficultyOrder.reduce((sum, difficulty) => sum + matrix[difficulty], 0);

  function toggleTopic(topicId: string) {
    onTopicChange(topicIds.includes(topicId) ? topicIds.filter((id) => id !== topicId) : [...topicIds, topicId]);
  }

  function selectAllTopics() {
    onTopicChange(topics.map((topic) => topic.id));
  }

  function clearTopics() {
    onTopicChange([]);
  }

  return (
    <div className="mt-4 space-y-4">
      <div>
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Chủ đề câu hỏi *</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Chọn một hoặc nhiều chủ đề. Câu hỏi thuộc ít nhất một chủ đề đã chọn sẽ được sử dụng.</p>
          </div>
          <div className="flex shrink-0 gap-2">
            <button type="button" onClick={selectAllTopics} className="rounded-lg px-2.5 py-1.5 text-xs font-bold text-violet-600 hover:bg-violet-50 dark:text-violet-400 dark:hover:bg-violet-950/40">Chọn tất cả</button>
            <button type="button" onClick={clearTopics} disabled={!topicIds.length} className="rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-slate-400 dark:hover:bg-slate-800">Bỏ chọn</button>
          </div>
        </div>
        <div id="event-topic" className="mt-3 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3" role="group" aria-label="Chọn chủ đề câu hỏi">
          {topics.map((topic) => {
            const checked = topicIds.includes(topic.id);
            return <button key={topic.id} type="button" aria-pressed={checked} onClick={() => toggleTopic(topic.id)} className={`group relative rounded-2xl border p-4 text-left transition-all ${checked ? "border-violet-500 bg-violet-50 shadow-sm shadow-violet-100 dark:border-violet-400 dark:bg-violet-950/30 dark:shadow-none" : "border-slate-200/80 bg-white hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-950/40 dark:hover:border-violet-700"}`}>
              <span className={`absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full border text-xs font-black transition-colors ${checked ? "border-violet-600 bg-violet-600 text-white dark:border-violet-400 dark:bg-violet-400 dark:text-violet-950" : "border-slate-300 text-transparent dark:border-slate-700"}`} aria-hidden="true">✓</span>
              <span className={`mb-2 inline-flex h-8 w-8 items-center justify-center rounded-xl text-sm ${checked ? "bg-violet-600 text-white dark:bg-violet-400 dark:text-violet-950" : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"}`} aria-hidden="true">⌁</span>
              <span className={`block pr-6 text-sm font-bold ${checked ? "text-violet-800 dark:text-violet-200" : "text-slate-800 dark:text-slate-200"}`}>{topic.name}</span>
              <span className="mt-1 block line-clamp-2 text-xs leading-5 text-slate-500 dark:text-slate-400">{topic.description}</span>
            </button>;
          })}
        </div>
        <div className={`mt-3 flex items-center gap-2 rounded-xl px-3 py-2 text-xs ${topicIds.length ? "bg-violet-50 text-violet-700 dark:bg-violet-950/30 dark:text-violet-300" : "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300"}`}>
          <span aria-hidden="true">{topicIds.length ? "✓" : "!"}</span>
          <span>{topicIds.length ? `Đã chọn ${topicIds.length}/${topics.length} chủ đề.` : "Chưa chọn chủ đề. Hãy chọn ít nhất một chủ đề để sinh câu hỏi."}</span>
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">Số câu theo mức độ</p>
        <div className="grid gap-3 sm:grid-cols-4">
          {DIFFICULTY_META.map((meta) => (
            <label key={meta.id}>
              <span className={`mb-1.5 inline-block rounded-md px-2 py-0.5 text-xs font-bold ${meta.badgeClass}`}>{meta.label}</span>
              <input
                type="number"
                min="0"
                max="100"
                value={matrix[meta.id] || ""}
                onChange={(event) => setCount(meta.id, event.target.value)}
                className="w-full rounded-xl border border-slate-200/80 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-violet-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
              {available[meta.id] !== undefined && <span className="mt-1 block text-[11px] text-slate-500">Có {available[meta.id]} câu phù hợp</span>}
            </label>
          ))}
        </div>
      </div>

      <button type="button" onClick={() => void generate()} disabled={loading || requested === 0 || !topicIds.length} className="rounded-xl border border-indigo-200 px-4 py-2.5 text-xs font-bold text-indigo-600 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-indigo-900/60 dark:text-indigo-400">
        {loading ? "Đang chọn câu hỏi…" : selected.length ? "↻ Chọn lại câu hỏi từ ngân hàng" : "🎲 Chọn câu hỏi từ ngân hàng"}
      </button>
      <p className="text-xs text-slate-500 dark:text-slate-400">Đã chọn {selected.length}/{requested} câu. Hệ thống chọn ngẫu nhiên theo chủ đề và từng mức độ, sau đó lưu bản chụp cùng sự kiện.</p>
      {error && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-600 dark:bg-rose-950/30 dark:text-rose-300">{error}</p>}
      {!!selected.length && <div className="max-h-80 space-y-2 overflow-y-auto rounded-xl bg-slate-50 p-3 dark:bg-slate-950/60">
        {selected.map((question, index) => {
          const meta = DIFFICULTY_META.find((item) => item.id === question.difficulty);
          return <div key={question.id} className="rounded-lg border border-slate-200 bg-white p-3 text-sm dark:border-slate-800 dark:bg-[#131b2e]"><span className={`mr-2 rounded px-1.5 py-0.5 text-[10px] font-bold ${meta?.badgeClass ?? ""}`}>{meta?.short ?? question.difficulty}</span><span className="font-semibold text-slate-500">Câu {index + 1}:</span> <span className="text-slate-700 dark:text-slate-200">{question.text}</span></div>;
        })}
      </div>}
    </div>
  );
}
