"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { QuestionType } from "@/lib/document-types";
import type { BankQuestion, QuestionDifficulty } from "@/lib/question-bank-types";
import { DIFFICULTY_META, bankQuestionToPayload } from "@/lib/question-bank-types";
import { topics } from "@/data/topics";
import { resolveQuestionImageSrc, resolveExplanationImageSrc } from "@/lib/document-preview";

const GRADE_OPTIONS = ["Lớp 6", "Lớp 7", "Lớp 8", "Lớp 9"];
const OPTION_IDS = ["a", "b", "c", "d"];
const makeId = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 10)}`;

function emptyQuestion(): BankQuestion {
  return {
    id: "",
    text: "",
    type: "multiple_choice",
    difficulty: "nhan_biet",
    grade: "Lớp 8",
    topicIds: [],
    points: 1,
    options: OPTION_IDS.map((id) => ({ id, text: "" })),
    correctOptionId: "a",
  };
}

type Props = { initial?: BankQuestion };

/** Form thêm/sửa một câu hỏi trong ngân hàng (chỉ giáo viên). */
export default function BankQuestionForm({ initial }: Props) {
  const router = useRouter();
  const [q, setQ] = useState<BankQuestion>(() => initial ?? emptyQuestion());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const qType = q.type || "multiple_choice";
  const statements = q.statements ?? [];

  const patch = (fn: (draft: BankQuestion) => void) =>
    setQ((current) => {
      const draft = { ...current, options: current.options?.map((o) => ({ ...o })), statements: current.statements?.map((s) => ({ ...s })) };
      fn(draft);
      return draft;
    });

  const changeType = (type: QuestionType) =>
    patch((d) => {
      d.type = type;
      if (type === "multiple_choice" && !d.options?.length) {
        d.options = OPTION_IDS.map((id) => ({ id, text: "" }));
        d.correctOptionId = "a";
      }
      if (type === "true_false" && !d.statements?.length) {
        d.statements = [{ id: makeId("s"), text: "", correctVal: "true" }];
      }
      if (type === "short_answer" && d.correctAnswer === undefined) d.correctAnswer = "";
    });

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!q.text.trim()) return setError("Vui lòng nhập nội dung câu hỏi.");
    if (!q.grade.trim()) return setError("Vui lòng chọn khối lớp.");
    if (qType === "multiple_choice") {
      const filled = (q.options ?? []).filter((o) => o.text.trim());
      if (filled.length < 2) return setError("Câu trắc nghiệm cần ít nhất 2 đáp án không rỗng.");
    }
    if (qType === "true_false" && !(q.statements ?? []).some((s) => s.text.trim())) {
      return setError("Câu Đúng/Sai cần ít nhất một mệnh đề không rỗng.");
    }

    setSaving(true);
    try {
      const supabase = createClient();
      if (!supabase) throw new Error("Website chưa được cấu hình Supabase.");
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Phiên đăng nhập đã hết. Hãy đăng nhập lại.");

      // Tải ảnh minh họa lên Storage nếu có file mới
      let payload = bankQuestionToPayload(q);
      if (q.imageFile) {
        const file = q.imageFile;
        const path = `${user.id}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
        const upload = await supabase.storage.from("document-images").upload(path, file, { contentType: file.type });
        if (upload.error) throw new Error(`Không thể tải ảnh đề bài lên: ${upload.error.message}`);
        payload = {
          ...payload,
          content: { ...payload.content, imageStoragePath: path, imageCaption: q.imageCaption },
        };
      }
      if (q.explanationImageFile) {
        const file = q.explanationImageFile;
        const path = `${user.id}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
        const upload = await supabase.storage.from("document-images").upload(path, file, { contentType: file.type });
        if (upload.error) throw new Error(`Không thể tải ảnh lời giải lên: ${upload.error.message}`);
        payload = {
          ...payload,
          content: { ...payload.content, explanationImageStoragePath: path, explanationImageCaption: q.explanationImageCaption },
        };
      }
      if (Array.isArray(q.explanationImages) && q.explanationImages.length > 0) {
        const updatedExpImages: Array<{ storagePath?: string; caption?: string; url?: string }> = [];
        for (const item of q.explanationImages) {
          if (item.file) {
            const file = item.file;
            const path = `${user.id}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
            const upload = await supabase.storage.from("document-images").upload(path, file, { contentType: file.type });
            if (upload.error) throw new Error(`Không thể tải ảnh lời giải lên: ${upload.error.message}`);
            updatedExpImages.push({
              ...(path ? { storagePath: path } : {}),
              ...(item.caption?.trim() ? { caption: item.caption.trim() } : {}),
              ...(item.url ? { url: item.url } : {}),
            });
          } else {
            updatedExpImages.push({
              ...(item.storagePath ? { storagePath: item.storagePath } : {}),
              ...(item.caption?.trim() ? { caption: item.caption.trim() } : {}),
              ...(item.url ? { url: item.url } : {}),
            });
          }
        }
        payload = {
          ...payload,
          content: { ...payload.content, explanationImages: updatedExpImages },
        };
      }

      let questionId = initial?.id;
      if (initial) {
        const { error: updateError } = await supabase.from("question_bank").update(payload).eq("id", initial.id);
        if (updateError) throw new Error(updateError.message);
        const { error: delError } = await supabase.from("question_bank_topics").delete().eq("question_id", initial.id);
        if (delError) throw new Error(delError.message);
      } else {
        const { data: row, error: insertError } = await supabase
          .from("question_bank")
          .insert({ ...payload, created_by: user.id })
          .select("id")
          .single();
        if (insertError || !row) throw new Error(insertError?.message ?? "Không thể lưu câu hỏi.");
        questionId = row.id;
      }
      if (q.topicIds.length && questionId) {
        const { error: topicError } = await supabase
          .from("question_bank_topics")
          .insert(q.topicIds.map((topicId) => ({ question_id: questionId, topic_id: topicId })));
        if (topicError) throw new Error(topicError.message);
      }
      router.push("/quan-ly/ngan-hang-cau-hoi");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
      setSaving(false);
    }
  }

  const imgSrc = resolveQuestionImageSrc(q);

  return (
    <form onSubmit={submit} className="space-y-5">
      {/* Mức độ khó */}
      <div>
        <label className="mb-2 block text-sm font-bold dark:text-white">Mức độ khó *</label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {DIFFICULTY_META.map((meta) => (
            <button
              key={meta.id}
              type="button"
              onClick={() => patch((d) => { d.difficulty = meta.id as QuestionDifficulty; })}
              className={`rounded-xl border px-3 py-3 text-sm font-bold transition-colors ${
                q.difficulty === meta.id
                  ? meta.badgeClass + " border-current"
                  : "border-slate-200 bg-white text-slate-600 hover:border-indigo-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
              }`}
            >
              {meta.label}
            </button>
          ))}
        </div>
      </div>

      {/* Khối lớp + loại câu hỏi */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-bold dark:text-white">Khối lớp</label>
          <select value={GRADE_OPTIONS.includes(q.grade) ? q.grade : "other"} onChange={(e) => patch((d) => { d.grade = e.target.value === "other" ? "" : e.target.value; })} className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white">
            {GRADE_OPTIONS.map((g) => <option key={g} value={g}>{g}</option>)}
            <option value="other">{q.grade && !GRADE_OPTIONS.includes(q.grade) ? q.grade : "— Khác —"}</option>
          </select>
          {!GRADE_OPTIONS.includes(q.grade) && (
            <input placeholder="Nhập khối lớp khác" value={q.grade} onChange={(e) => patch((d) => { d.grade = e.target.value; })} className="mt-2 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
          )}
        </div>
        <div>
          <label className="mb-2 block text-sm font-bold dark:text-white">Loại câu hỏi</label>
          <select value={qType} onChange={(e) => changeType(e.target.value as QuestionType)} className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white">
            <option value="multiple_choice">Trắc nghiệm</option>
            <option value="true_false">Đúng / Sai</option>
            <option value="short_answer">Trả lời ngắn</option>
            <option value="essay">Tự luận</option>
          </select>
        </div>
      </div>

      {/* Nội dung câu hỏi */}
      <div>
        <label className="mb-2 block text-sm font-bold dark:text-white">Nội dung câu hỏi * (hỗ trợ $LaTeX$)</label>
        <textarea rows={3} value={q.text} onChange={(e) => patch((d) => { d.text = e.target.value; })} className="w-full rounded-lg border border-slate-300 p-3 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
      </div>

      {/* Trắc nghiệm */}
      {qType === "multiple_choice" && (
        <div className="space-y-2">
          <p className="text-sm font-bold dark:text-white">Các đáp án — bấm chữ cái để chọn đáp án đúng</p>
          {(q.options ?? []).map((option) => {
            const correct = q.correctOptionId === option.id;
            return (
              <div key={option.id} className="flex items-center gap-2">
                <button type="button" onClick={() => patch((d) => { d.correctOptionId = option.id; })} className={`rounded-md px-2 py-1.5 text-xs font-bold ${correct ? "bg-green-600 text-white" : "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300"}`}>{correct ? "✓ Đúng" : option.id.toUpperCase()}</button>
                <input placeholder={`Đáp án ${option.id.toUpperCase()}`} value={option.text} onChange={(e) => patch((d) => { const found = (d.options ?? []).find((o) => o.id === option.id); if (found) found.text = e.target.value; })} className="h-10 min-w-0 flex-1 rounded-lg border border-slate-300 px-3 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
              </div>
            );
          })}
        </div>
      )}

      {/* Đúng/Sai */}
      {qType === "true_false" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold dark:text-white">Các mệnh đề</p>
            <button type="button" onClick={() => patch((d) => { d.statements = [...(d.statements ?? []), { id: makeId("s"), text: "", correctVal: "true" }]; })} className="rounded-lg border border-green-300 px-3 py-1.5 text-xs font-bold text-green-700 dark:border-green-800 dark:text-green-300">+ Thêm mệnh đề</button>
          </div>
          {statements.map((statement, si) => (
            <div key={statement.id} className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/60">
              <div className="flex items-center gap-2">
                <span className="rounded bg-slate-200 px-2 py-0.5 text-xs font-bold dark:bg-slate-700">{si + 1}</span>
                <input placeholder={`Mệnh đề ${si + 1}`} value={statement.text} onChange={(e) => patch((d) => { (d.statements ?? [])[si].text = e.target.value; })} className="h-9 min-w-0 flex-1 rounded-md border border-slate-300 px-2 text-sm dark:border-slate-600 dark:bg-slate-950 dark:text-white" />
                <button type="button" disabled={statements.length <= 1} onClick={() => patch((d) => { (d.statements ?? []).splice(si, 1); })} className="rounded border border-red-200 px-2 py-1 text-xs text-red-600 disabled:opacity-40">Xóa</button>
              </div>
              <div className="flex gap-2 pl-8">
                {(["true", "false"] as const).map((value) => (
                  <button key={value} type="button" onClick={() => patch((d) => { (d.statements ?? [])[si].correctVal = value; })} className={`rounded-md border px-3 py-1 text-xs font-semibold ${statement.correctVal === value ? (value === "true" ? "border-green-600 bg-green-600 text-white" : "border-red-600 bg-red-600 text-white") : "border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"}`}>
                    {value === "true" ? "Đúng" : "Sai"}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Trả lời ngắn */}
      {qType === "short_answer" && (
        <div>
          <label className="mb-2 block text-sm font-bold dark:text-white">Đáp án đúng</label>
          <input value={q.correctAnswer ?? ""} onChange={(e) => patch((d) => { d.correctAnswer = e.target.value; })} className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
        </div>
      )}

      {qType === "essay" && (
        <div className="rounded-lg border border-indigo-100 bg-indigo-50/30 p-3 text-xs text-indigo-700 dark:border-indigo-950/40 dark:bg-indigo-950/20 dark:text-indigo-300">
          💡 Câu tự luận không được chấm tự động; học sinh đối chiếu với phần giải thích.
        </div>
      )}

      {/* Điểm + giải thích */}
      <div className="grid gap-4 sm:grid-cols-[160px_1fr]">
        {qType !== "essay" && (
          <div>
            <label className="mb-2 block text-sm font-bold dark:text-white">Điểm tối đa</label>
            <input type="number" min="0.01" step="0.01" value={q.points ?? 1} onChange={(e) => patch((d) => { const v = Number(e.target.value); d.points = Number.isFinite(v) && v > 0 ? v : 1; })} className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
          </div>
        )}
        <div>
          <label className="mb-2 block text-sm font-bold dark:text-white">Giải thích / Lời giải (tùy chọn, hỗ trợ $LaTeX$)</label>
          <input value={q.explanation ?? ""} onChange={(e) => patch((d) => { d.explanation = e.target.value; })} className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
        </div>
      </div>

      {/* Ảnh lời giải */}
      <div className="rounded-lg border border-dashed border-blue-200 bg-blue-50/20 p-3 dark:border-blue-900/40 dark:bg-blue-950/10">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-blue-900 dark:text-blue-300">🖼 Ảnh lời giải / sơ đồ giải thích (tùy chọn)</label>
          {(q.explanationImageFile || q.explanationImageStoragePath || q.explanationImageUrl) && (
            <button type="button" onClick={() => patch((d) => { delete d.explanationImageFile; delete d.explanationImageStoragePath; delete d.explanationImageUrl; d.explanationImageCaption = undefined; })} className="text-xs font-bold text-red-600 hover:underline">Xóa ảnh lời giải</button>
          )}
        </div>
        {resolveExplanationImageSrc(q) ? (
          <div className="mt-2 space-y-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={resolveExplanationImageSrc(q)!} alt="Ảnh lời giải" className="max-h-48 rounded-lg object-contain" />
            <input placeholder="Chú thích ảnh lời giải" value={q.explanationImageCaption ?? ""} onChange={(e) => patch((d) => { d.explanationImageCaption = e.target.value; })} className="h-8 w-full rounded-md border border-slate-300 px-2 text-xs dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
          </div>
        ) : (
          <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => { const file = e.target.files?.[0]; if (file) patch((d) => { d.explanationImageFile = file; if (!d.explanationImageCaption) d.explanationImageCaption = "Hình ảnh lời giải"; }); }} className="mt-2 block w-full text-xs text-slate-500 file:mr-2 file:rounded-md file:border-0 file:bg-blue-50 file:px-2.5 file:py-1 file:text-xs file:font-semibold file:text-blue-700 dark:file:bg-blue-950 dark:file:text-blue-300" />
        )}
      </div>

      {/* Chủ đề */}
      <div>
        <label className="mb-2 block text-sm font-bold dark:text-white">Chủ đề Toán (có thể chọn nhiều)</label>
        <div className="flex flex-wrap gap-2">
          {topics.map((topic) => {
            const active = q.topicIds.includes(topic.id);
            return (
              <button key={topic.id} type="button" onClick={() => patch((d) => { d.topicIds = active ? d.topicIds.filter((id) => id !== topic.id) : [...d.topicIds, topic.id]; })} className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${active ? "border-indigo-500 bg-indigo-600 text-white" : "border-slate-300 text-slate-600 hover:border-indigo-400 dark:border-slate-700 dark:text-slate-300"}`}>
                {topic.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Ảnh đề bài */}
      <div className="rounded-lg border border-dashed border-slate-300 p-3 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold dark:text-slate-300">🖼 Ảnh đề bài (tùy chọn)</label>
          {(q.imageFile || q.imageStoragePath || q.imageUrl) && (
            <button type="button" onClick={() => patch((d) => { delete d.imageFile; delete d.imageStoragePath; delete d.imageUrl; d.imageCaption = undefined; })} className="text-xs font-bold text-red-600 hover:underline">Xóa ảnh</button>
          )}
        </div>
        {imgSrc ? (
          <div className="mt-2 space-y-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imgSrc} alt="Ảnh đề bài" className="max-h-48 rounded-lg object-contain" />
            <input placeholder="Chú thích ảnh" value={q.imageCaption ?? ""} onChange={(e) => patch((d) => { d.imageCaption = e.target.value; })} className="h-8 w-full rounded-md border border-slate-300 px-2 text-xs dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
          </div>
        ) : (
          <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => { const file = e.target.files?.[0]; if (file) patch((d) => { d.imageFile = file; if (!d.imageCaption) d.imageCaption = "Hình ảnh câu hỏi"; }); }} className="mt-2 block w-full text-xs text-slate-500 file:mr-2 file:rounded-md file:border-0 file:bg-indigo-50 file:px-2.5 file:py-1 file:text-xs file:font-semibold file:text-indigo-700 dark:file:bg-indigo-950 dark:file:text-indigo-300" />
        )}
      </div>

      {error && <pre role="alert" className="whitespace-pre-wrap rounded-xl bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">{error}</pre>}

      <div className="flex gap-3">
        <button type="submit" disabled={saving} className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-60">
          {saving ? "Đang lưu..." : initial ? "💾 Cập nhật câu hỏi" : "💾 Lưu vào ngân hàng"}
        </button>
        <button type="button" onClick={() => router.push("/quan-ly/ngan-hang-cau-hoi")} className="rounded-xl border border-slate-300 px-6 py-3 text-sm font-bold text-slate-600 dark:border-slate-700 dark:text-slate-300">Hủy</button>
      </div>
    </form>
  );
}
