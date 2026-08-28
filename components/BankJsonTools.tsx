"use client";

import { useRef, useState, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { parseBankJson } from "@/lib/question-bank-json";
import { topics } from "@/data/topics";

const FORMAT_HINT = `{
  "version": 1,
  "kind": "question_bank",
  "questions": [
    {
      "text": "Nội dung câu hỏi (hỗ trợ $LaTeX$)",
      "type": "multiple_choice",
      "difficulty": "nhan_biet",
      "grade": "Lớp 8",
      "topicIds": ["ham-so-va-do-thi"],
      "options": ["A", "B", "C", "D"],
      "correctIndex": 0,
      "points": 1,
      "explanation": "Giải thích (tùy chọn)"
    },
    {
      "text": "Câu đúng/sai",
      "type": "true_false",
      "difficulty": "thong_hieu",
      "statements": [{ "text": "Mệnh đề 1", "correct": true }]
    }
  ]
}

difficulty: nhan_biet | thong_hieu | van_dung | van_dung_cao
type: multiple_choice | true_false | short_answer | essay
topicIds hợp lệ: ${topics.map((topic) => topic.id).join(", ")}.`;

/** Nhập nhiều câu hỏi vào ngân hàng từ file/dán JSON. */
export default function BankJsonTools() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [jsonText, setJsonText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function importJson() {
    setError("");
    setResult("");
    if (!jsonText.trim()) {
      setError("Hãy dán mã JSON hoặc chọn file trước khi nhập.");
      return;
    }
    setBusy(true);
    try {
      const parsed = parseBankJson(jsonText);
      if (!parsed.ok) throw new Error(parsed.error);
      if (!parsed.questions.length) {
        throw new Error(`Không có câu hỏi hợp lệ nào.\n${parsed.errors.join("\n")}`);
      }

      const supabase = createClient();
      if (!supabase) throw new Error("Website chưa được cấu hình Supabase.");
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Phiên đăng nhập đã hết. Hãy đăng nhập lại.");

      const rows = parsed.questions.map((q) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, text, type, difficulty, grade, topicIds, imageFile, createdAt, updatedAt, ...content } = q;
        return {
          text,
          type: type || "multiple_choice",
          difficulty,
          grade,
          content,
          created_by: user.id,
          __topicIds: topicIds ?? [],
        };
      });

      let imported = 0;
      const topicRows: { question_id: string; topic_id: string }[] = [];
      for (const row of rows) {
        const { __topicIds, ...payload } = row;
        const { data, error: insertError } = await supabase
          .from("question_bank")
          .insert(payload)
          .select("id")
          .single();
        if (insertError) throw new Error(insertError.message);
        imported += 1;
        for (const topicId of __topicIds) topicRows.push({ question_id: data.id, topic_id: topicId });
      }
      if (topicRows.length) {
        const validTopics = new Set(topics.map((topic) => topic.id));
        await supabase.from("question_bank_topics").insert(topicRows.filter((r) => validTopics.has(r.topic_id)));
      }

      setResult(
        `Đã nhập ${imported} câu hỏi.` +
          (parsed.skipped ? ` Bỏ qua ${parsed.skipped} câu lỗi:\n${parsed.errors.join("\n")}` : ""),
      );
      setJsonText("");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === "string") {
        setJsonText(content);
        setResult(`Đã đọc file "${file.name}". Bấm "Nhập vào ngân hàng" để áp dụng.`);
      }
    };
    reader.onerror = () => setError("Không thể đọc file từ máy tính.");
    reader.readAsText(file, "UTF-8");
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-bold dark:text-white">{"{ }"} Nhập câu hỏi từ JSON</h2>
        <button type="button" onClick={() => setOpen((v) => !v)} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-600 dark:border-slate-700 dark:text-slate-300">
          {open ? "▲ Thu gọn" : "▼ Mở công cụ"}
        </button>
      </div>
      {open && (
        <div className="mt-4 space-y-3">
          <input ref={fileInputRef} type="file" accept=".json,application/json,text/plain" onChange={handleFile} className="hidden" />
          <textarea value={jsonText} onChange={(e) => setJsonText(e.target.value)} rows={6} spellCheck={false} placeholder="Dán mã JSON ngân hàng câu hỏi tại đây..." className="w-full rounded-lg border border-slate-300 bg-slate-50 p-3 font-mono text-xs leading-5 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200" />
          <div className="flex flex-wrap gap-2">
            <button type="button" disabled={busy} onClick={() => fileInputRef.current?.click()} className="rounded-lg border border-indigo-300 px-4 py-2 text-xs font-bold text-indigo-600 dark:border-indigo-800 dark:text-indigo-300">📂 Chọn file .json</button>
            <button type="button" disabled={busy} onClick={importJson} className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 disabled:opacity-60">{busy ? "Đang xử lý..." : "⬆ Nhập vào ngân hàng"}</button>
          </div>
          {error && <pre role="alert" className="whitespace-pre-wrap rounded-xl bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">{error}</pre>}
          {result && <p className="whitespace-pre-wrap rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">{result}</p>}
          <details className="rounded-lg border border-slate-200 p-3 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
            <summary className="cursor-pointer font-semibold">Cấu trúc mã JSON</summary>
            <pre className="mt-2 overflow-x-auto whitespace-pre font-mono leading-5">{FORMAT_HINT}</pre>
          </details>
        </div>
      )}
    </section>
  );
}
