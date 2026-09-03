"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { BankQuestion, QuestionDifficulty } from "@/lib/question-bank-types";
import { DIFFICULTY_META, QUESTION_TYPE_LABELS } from "@/lib/question-bank-types";
import type { Topic } from "@/lib/types";
import MathText from "./MathText";

type Props = { grades: string[]; topics: Topic[] };

type MatrixState = Record<QuestionDifficulty, number>;

/** Sinh đề ngẫu nhiên theo ma trận số câu mỗi mức độ khó. */
export default function ExamMatrixGenerator({ grades, topics }: Props) {
  const router = useRouter();
  const [matrix, setMatrix] = useState<MatrixState>({ nhan_biet: 4, thong_hieu: 3, van_dung: 2, van_dung_cao: 1 });
  const [grade, setGrade] = useState("");
  const [topic, setTopic] = useState("");
  const [type, setType] = useState("");
  const [title, setTitle] = useState("Đề kiểm tra sinh từ ngân hàng câu hỏi");
  const [picked, setPicked] = useState<BankQuestion[]>([]);
  const [available, setAvailable] = useState<Record<string, number> | null>(null);
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const totalWanted = DIFFICULTY_META.reduce((sum, d) => sum + matrix[d.id], 0);
  const totalPicked = picked.length;

  const patchMatrix = (id: QuestionDifficulty, value: number) =>
    setMatrix((m) => ({ ...m, [id]: Math.max(0, Math.min(100, value)) }));

  async function generate() {
    setError("");
    setBusy(true);
    setPicked([]);
    try {
      const res = await fetch("/api/question-bank/sinh-de", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matrix, grade, topic, type }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Không thể sinh đề.");
      setPicked(data.picked ?? []);
      setAvailable(data.available ?? {});
      if (!data.picked?.length) setError("Không có câu hỏi nào khớp ma trận và bộ lọc. Hãy thêm câu hỏi vào ngân hàng hoặc nới lỏng bộ lọc.");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  /** Lưu đề đã sinh thành tài liệu kiểm tra nháp (giống luồng ghép đề thủ công). */
  async function saveAsTest(andPrint = false) {
    if (!picked.length) return;
    setSaving(true);
    setError("");
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      if (!supabase) throw new Error("Website chưa được cấu hình Supabase.");
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Phiên đăng nhập đã hết. Hãy đăng nhập lại.");

      const cleaned = picked.map((q) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { difficulty, grade: qGrade, topicIds, createdAt, updatedAt, imageFile, ...rest } = q;
        return rest;
      });

      const gradeCounts = new Map<string, number>();
      for (const q of picked) gradeCounts.set(q.grade, (gradeCounts.get(q.grade) ?? 0) + 1);
      const mainGrade = [...gradeCounts.entries()].sort((a, b) => b[1] - a[1])[0][0];

      const { data: doc, error: docError } = await supabase
        .from("documents")
        .insert({
          title: title.trim() || "Đề kiểm tra",
          description: `Sinh tự động theo ma trận: ${DIFFICULTY_META.map((d) => `${matrix[d.id]} ${d.short}`).filter((s) => !s.startsWith("0")).join(", ")}`,
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
      const topicLinks = [...new Set(picked.flatMap((q) => q.topicIds))].filter((id) => validTopicIds.has(id));
      if (topicLinks.length) {
        await supabase.from("document_topics").insert(topicLinks.map((topicId) => ({ document_id: doc.id, topic_id: topicId })));
      }

      if (andPrint) {
        router.push(`/quiz/${doc.id}/in`);
      } else {
        router.push(`/quan-ly/tai-lieu/${doc.id}/sua`);
      }
    } catch (err) {
      setError((err as Error).message);
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Ma trận + bộ lọc */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h2 className="mb-4 font-bold dark:text-white">Ma trận đề</h2>
        <div className="grid gap-3 sm:grid-cols-4">
          {DIFFICULTY_META.map((meta) => (
            <label key={meta.id} className={`rounded-xl border p-3 ${meta.badgeClass}`}>
              <span className="block text-xs font-bold uppercase">{meta.label}</span>
              <input
                type="number"
                min={0}
                max={100}
                value={matrix[meta.id]}
                onChange={(e) => patchMatrix(meta.id, Number(e.target.value))}
                className="mt-2 h-11 w-full rounded-lg border border-current/30 bg-white px-3 text-lg font-bold text-slate-900"
              />
            </label>
          ))}
        </div>
        <p className="mt-2 text-xs font-semibold text-slate-500 dark:text-slate-400">Tổng: {totalWanted} câu</p>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <select value={grade} onChange={(e) => setGrade(e.target.value)} className="h-10 rounded-lg border border-slate-300 px-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white">
            <option value="">Mọi khối lớp</option>
            {grades.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
          <select value={topic} onChange={(e) => setTopic(e.target.value)} className="h-10 rounded-lg border border-slate-300 px-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white">
            <option value="">Mọi chủ đề</option>
            {topics.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <select value={type} onChange={(e) => setType(e.target.value)} className="h-10 rounded-lg border border-slate-300 px-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white">
            <option value="">Mọi loại câu hỏi</option>
            {Object.entries(QUESTION_TYPE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button disabled={busy || totalWanted === 0} onClick={generate} className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-60">
            {busy ? "Đang sinh..." : "🎲 Sinh đề ngẫu nhiên"}
          </button>
          {available && (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Khả dụng: {DIFFICULTY_META.map((d) => `${d.short}: ${available[d.id] ?? 0}`).join(" · ")}
            </p>
          )}
        </div>

        {available && totalWanted > 0 && DIFFICULTY_META.some((d) => (available[d.id] ?? 0) < matrix[d.id]) && (
          <p className="mt-2 rounded-lg bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
            ⚠ Ngân hàng không đủ câu cho một số mức độ — hệ thống sẽ lấy tối đa số câu hiện có.
          </p>
        )}
      </div>

      {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">{error}</p>}

      {/* Kết quả sinh */}
      {totalPicked > 0 && (
        <div className="rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm dark:border-emerald-900 dark:bg-slate-900">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-bold dark:text-white">Đề đã sinh — {totalPicked}/{totalWanted} câu</h2>
            <div className="flex flex-wrap gap-2">
              <button disabled={busy || saving} onClick={generate} className="rounded-lg border border-indigo-300 px-4 py-2 text-xs font-bold text-indigo-600 disabled:opacity-60 dark:border-indigo-800 dark:text-indigo-300">🔄 Chọn lại câu khác</button>
              <button disabled={busy || saving} onClick={() => saveAsTest(true)} className="rounded-lg border border-purple-300 bg-purple-50 px-4 py-2 text-xs font-bold text-purple-700 hover:bg-purple-100 disabled:opacity-60 dark:border-purple-800 dark:bg-purple-950/40 dark:text-purple-300">
                {saving ? "Đang lưu..." : "🖨 Lưu & Xuất PDF"}
              </button>
              <button disabled={busy || saving} onClick={() => saveAsTest(false)} className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-60">
                {saving ? "Đang lưu..." : "💾 Lưu bài kiểm tra (nháp)"}
              </button>
            </div>
          </div>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Tên bài kiểm tra"
            className="mb-4 h-11 w-full rounded-lg border border-slate-300 px-3 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />
          <ol className="space-y-3">
            {picked.map((q, i) => {
              const meta = DIFFICULTY_META.find((d) => d.id === q.difficulty)!;
              return (
                <li key={q.id} className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-slate-500">Câu {i + 1}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${meta.badgeClass}`}>{meta.short}</span>
                    <span className="text-xs text-slate-400">{QUESTION_TYPE_LABELS[q.type || "multiple_choice"]} · {q.grade}</span>
                  </div>
                  <MathText text={q.text} className="text-sm leading-6 text-slate-800 dark:text-slate-100" />
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </div>
  );
}
