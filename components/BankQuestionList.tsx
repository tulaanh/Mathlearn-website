"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { BankQuestion } from "@/lib/question-bank-types";
import { DIFFICULTY_META, QUESTION_TYPE_LABELS, getDifficultyMeta } from "@/lib/question-bank-types";
import type { Topic } from "@/lib/types";
import { serializeBankJson } from "@/lib/question-bank-json";
import LazyMathText from "./LazyMathText";

type Props = {
  questions: BankQuestion[];
  grades: string[];
  topics: Topic[];
};

const TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "Mọi loại" },
  { value: "multiple_choice", label: "Trắc nghiệm" },
  { value: "true_false", label: "Đúng / Sai" },
  { value: "short_answer", label: "Trả lời ngắn" },
  { value: "essay", label: "Tự luận" },
];

/** Loại bỏ các trường riêng của ngân hàng trước khi đưa vào khối quiz của tài liệu (giữ id làm định danh câu hỏi). */
function toDocumentQuestion(q: BankQuestion) {
  const {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    difficulty, grade, topicIds, createdAt, updatedAt, imageFile,
    ...rest
  } = q;
  return rest;
}

export default function BankQuestionList({ questions, grades, topics }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const currentSearch = searchParams.get("q") ?? "";
  const currentGrade = searchParams.get("grade") ?? "";
  const currentTopic = searchParams.get("topic") ?? "";
  const currentDifficulty = searchParams.get("difficulty") ?? "";
  const currentType = searchParams.get("type") ?? "";

  const setFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page"); // đổi bộ lọc thì quay về trang 1
    const qs = params.toString();
    startTransition(() => {
      router.push(qs ? `/quan-ly/ngan-hang-cau-hoi?${qs}` : "/quan-ly/ngan-hang-cau-hoi");
    });
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const visibleQuestions = useMemo(
    () => questions.filter((q) => !hiddenIds.has(q.id)),
    [questions, hiddenIds],
  );

  const selectedQuestions = useMemo(
    () => visibleQuestions.filter((q) => selectedIds.has(q.id)),
    [visibleQuestions, selectedIds],
  );

  async function removeQuestion(id: string) {
    if (!window.confirm("Xóa câu hỏi này khỏi ngân hàng?")) return;
    setBusy(true);
    setError("");
    try {
      const supabase = createClient();
      if (!supabase) throw new Error("Website chưa được cấu hình Supabase.");
      const { error: deleteError } = await supabase.from("question_bank").delete().eq("id", id);
      if (deleteError) throw new Error(deleteError.message);
      setHiddenIds((current) => new Set(current).add(id));
      setSelectedIds((current) => {
        const next = new Set(current);
        next.delete(id);
        return next;
      });
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  /** Xóa hàng loạt các câu hỏi đang được chọn khỏi ngân hàng. */
  async function removeSelectedQuestions() {
    if (!selectedQuestions.length) return;
    const count = selectedQuestions.length;
    if (!window.confirm(`Bạn có chắc muốn xóa ${count} câu hỏi đã chọn không? Hành động này không thể hoàn tác.`)) return;

    setBusy(true);
    setError("");
    setMessage("");
    try {
      const supabase = createClient();
      if (!supabase) throw new Error("Website chưa được cấu hình Supabase.");
      const { error: deleteError } = await supabase
        .from("question_bank")
        .delete()
        .in("id", selectedQuestions.map((question) => question.id));
      if (deleteError) throw new Error(deleteError.message);

      const deletedIds = new Set(selectedQuestions.map((question) => question.id));
      setHiddenIds((current) => new Set([...current, ...deletedIds]));
      setSelectedIds((current) => {
        const next = new Set(current);
        deletedIds.forEach((id) => next.delete(id));
        return next;
      });
      setMessage(`Đã xóa ${count} câu hỏi khỏi ngân hàng.`);
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  /** Ghép đề thủ công: tạo tài liệu kiểm tra nháp từ các câu đã chọn. */
  async function createTestFromSelected() {
    if (!selectedQuestions.length) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const supabase = createClient();
      if (!supabase) throw new Error("Website chưa được cấu hình Supabase.");
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Phiên đăng nhập đã hết. Hãy đăng nhập lại.");

      const cleaned = selectedQuestions.map(toDocumentQuestion);
      const gradeCounts = new Map<string, number>();
      for (const q of selectedQuestions) gradeCounts.set(q.grade, (gradeCounts.get(q.grade) ?? 0) + 1);
      const mainGrade = [...gradeCounts.entries()].sort((a, b) => b[1] - a[1])[0][0];

      const { data: doc, error: docError } = await supabase
        .from("documents")
        .insert({
          title: `Đề từ ngân hàng (${cleaned.length} câu)`,
          description: null,
          subject: "Toán",
          grade: mainGrade,
          document_type: "test",
          status: "draft",
          created_by: user.id,
        })
        .select("id")
        .single();
      if (docError || !doc) throw new Error(docError?.message ?? "Không thể tạo bài kiểm tra.");

      const { error: blockError } = await supabase.from("document_blocks").insert({
        document_id: doc.id,
        block_type: "quiz",
        title: "Phần câu hỏi",
        content: JSON.stringify(cleaned),
        position: 0,
      });
      if (blockError) throw new Error(blockError.message);

      const validTopicIds = new Set(topics.map((t) => t.id));
      const topicLinks = [
        ...new Set(selectedQuestions.flatMap((q) => q.topicIds)),
      ].filter((id) => validTopicIds.has(id));
      if (topicLinks.length) {
        await supabase.from("document_topics").insert(topicLinks.map((topicId) => ({ document_id: doc.id, topic_id: topicId })));
      }

      router.push(`/quan-ly/tai-lieu/${doc.id}/sua`);
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  function exportSelected() {
    if (!selectedQuestions.length && !visibleQuestions.length) return;
    const data = selectedQuestions.length ? selectedQuestions : visibleQuestions;
    const json = serializeBankJson(data);
    const blob = new Blob([json], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement("a");
    link.href = url;
    link.download = "ngan-hang-cau-hoi.json";
    window.document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setMessage(`Đã xuất ${data.length} câu hỏi ra file JSON.`);
  }

  return (
    <div className={`relative space-y-5 transition-opacity ${isPending ? "opacity-60" : ""}`} aria-busy={isPending}>
      {isPending && (
        <div className="sticky top-20 z-20 mx-auto w-fit rounded-full bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-lg">
          Đang cập nhật bộ lọc…
        </div>
      )}
      {/* Bộ lọc */}
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const value = (new FormData(e.currentTarget).get("q") as string) ?? "";
            setFilter("q", value.trim());
          }}
          className="flex min-w-[220px] flex-1 gap-2"
        >
          <input name="q" defaultValue={currentSearch} placeholder="🔍 Tìm theo nội dung câu hỏi..." className="h-10 min-w-0 flex-1 rounded-lg border border-slate-300 px-3 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
          <button type="submit" className="h-10 rounded-lg bg-indigo-600 px-4 text-xs font-bold text-white hover:bg-indigo-700">Tìm</button>
        </form>
        <select value={currentGrade} onChange={(e) => setFilter("grade", e.target.value)} className="h-10 rounded-lg border border-slate-300 px-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white">
          <option value="">Mọi khối lớp</option>
          {grades.map((g) => <option key={g} value={g}>{g}</option>)}
        </select>
        <select value={currentTopic} onChange={(e) => setFilter("topic", e.target.value)} className="h-10 rounded-lg border border-slate-300 px-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white">
          <option value="">Mọi chủ đề</option>
          {topics.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <select value={currentDifficulty} onChange={(e) => setFilter("difficulty", e.target.value)} className="h-10 rounded-lg border border-slate-300 px-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white">
          <option value="">Mọi mức độ</option>
          {DIFFICULTY_META.map((d) => <option key={d.id} value={d.id}>{d.label}</option>)}
        </select>
        <select value={currentType} onChange={(e) => setFilter("type", e.target.value)} className="h-10 rounded-lg border border-slate-300 px-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white">
          {TYPE_OPTIONS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>

      {/* Thanh hành động khi có lựa chọn */}
      {(selectedIds.size > 0 || visibleQuestions.length > 0) && (
        <div className="sticky top-2 z-10 flex flex-wrap items-center gap-3 rounded-2xl border border-indigo-200 bg-indigo-50/95 p-3 shadow-sm backdrop-blur dark:border-indigo-900 dark:bg-indigo-950/80">
          <label className="flex items-center gap-2 text-xs font-bold text-indigo-800 dark:text-indigo-200">
            <input
              type="checkbox"
              checked={visibleQuestions.length > 0 && visibleQuestions.every((q) => selectedIds.has(q.id))}
              onChange={(e) => setSelectedIds(e.target.checked ? new Set(visibleQuestions.map((q) => q.id)) : new Set())}
              className="h-4 w-4"
            />
            Chọn tất cả ({visibleQuestions.length})
          </label>
          {selectedIds.size > 0 && (
            <>
              <button disabled={busy} onClick={createTestFromSelected} className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 disabled:opacity-60">
                📝 Tạo đề từ {selectedQuestions.length} câu đã chọn
              </button>
              <button disabled={busy} onClick={removeSelectedQuestions} className="rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-60">
                🗑 Xóa {selectedQuestions.length} câu đã chọn
              </button>
              <button disabled={busy} onClick={() => setSelectedIds(new Set())} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-600 dark:border-slate-600 dark:text-slate-300">Bỏ chọn</button>
            </>
          )}
          <button disabled={busy} onClick={exportSelected} className="ml-auto rounded-lg border border-indigo-300 px-3 py-2 text-xs font-bold text-indigo-600 dark:border-indigo-800 dark:text-indigo-300">
            ⬇ Xuất JSON {selectedQuestions.length > 0 ? `(${selectedQuestions.length} câu)` : `(mọi kết quả lọc)`}
          </button>
        </div>
      )}

      {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">{error}</p>}
      {message && <p className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">{message}</p>}

      {/* Danh sách câu hỏi */}
      {visibleQuestions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-700">
          <p className="text-sm text-slate-500">Không có câu hỏi nào khớp bộ lọc.</p>
          <Link href="/quan-ly/ngan-hang-cau-hoi/them" className="mt-4 inline-block font-semibold text-indigo-600">Thêm câu hỏi đầu tiên →</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {visibleQuestions.map((q, index) => {
            const meta = getDifficultyMeta(q.difficulty);
            const qType = q.type || "multiple_choice";
            const selected = selectedIds.has(q.id);
            return (
              <div key={q.id} className={`rounded-2xl border bg-white p-4 shadow-sm transition-colors dark:bg-slate-900 ${selected ? "border-indigo-500 ring-2 ring-indigo-200 dark:ring-indigo-900" : "border-slate-200 dark:border-slate-700"}`}>
                <div className="flex items-start gap-3">
                  <input type="checkbox" checked={selected} onChange={() => toggleSelect(q.id)} className="mt-1 h-4 w-4 shrink-0" aria-label={`Chọn câu ${index + 1}`} />
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${meta.badgeClass}`}>{meta.label}</span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">{QUESTION_TYPE_LABELS[qType]}</span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">{q.grade}</span>
                      {q.topicIds.map((topicId) => {
                        const topic = topics.find((t) => t.id === topicId);
                        return topic ? (
                          <Link key={topicId} href={`/quan-ly/ngan-hang-cau-hoi?topic=${topicId}`} className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-semibold text-violet-700 hover:bg-violet-200 dark:bg-violet-950/50 dark:text-violet-300">{topic.name}</Link>
                        ) : null;
                      })}
                      {qType !== "essay" && <span className="text-xs text-slate-400">{q.points ?? 1} điểm</span>}
                    </div>
                    <LazyMathText text={q.text} className="text-sm leading-6 text-slate-800 dark:text-slate-100" />
                    {q.imageStoragePath && <p className="mt-1 text-xs text-slate-400">🖼 Có ảnh minh họa</p>}
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Link href={`/quan-ly/ngan-hang-cau-hoi/${q.id}/sua`} className="rounded-lg border border-emerald-300 px-3 py-1.5 text-xs font-bold text-emerald-600 dark:border-emerald-800 dark:text-emerald-300">✏️ Sửa</Link>
                      <button disabled={busy} onClick={() => removeQuestion(q.id)} className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-bold text-red-600 disabled:opacity-50 dark:border-red-900">Xóa</button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
