"use client";

import { useRef, useState, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { parseBankJson } from "@/lib/question-bank-json";
import { normalizeImageName, isAcceptedImageFile } from "@/lib/tex-image-match";
import { topics } from "@/data/topics";
import { QUESTION_TYPE_LABELS, getDifficultyMeta } from "@/lib/question-bank-types";
import LazyMathText from "./LazyMathText";
import type { BankQuestion } from "@/lib/question-bank-types";

type ImportPreview = {
  questions: BankQuestion[];
  skipped: number;
  errors: string[];
};

type PreviewAnswer = {
  label: string;
  value?: string;
};

function getPreviewAnswer(question: BankQuestion): PreviewAnswer {
  const type = question.type || "multiple_choice";
  if (type === "multiple_choice") {
    const correct = question.options?.find((option) => option.id === question.correctOptionId);
    return correct ? { label: "Đáp án", value: correct.text } : { label: "Chưa có đáp án đúng" };
  }
  if (type === "true_false") {
    return {
      label: "Đáp án",
      value: (question.statements ?? [])
        .map((statement, index) => `${index + 1}. ${statement.correctVal === "true" ? "Đúng" : "Sai"}`)
        .join(" · "),
    };
  }
  if (type === "short_answer") {
    return { label: "Đáp án", value: question.correctAnswer || "Chưa có đáp án" };
  }
  return { label: "Dạng tự luận" };
}

const FORMAT_HINT = `{
  "version": 1,
  "kind": "question_bank",
  "questions": [
    {
      "text": "Nội dung câu hỏi (hỗ trợ $LaTeX$)",
      "type": "multiple_choice",
      "difficulty": "nhan_biet",
      "grade": "Lớp 12",
      "topicIds": ["ham-so-va-do-thi"],
      "imageFileName": "lt_1.png",
      "options": ["A", "B", "C", "D"],
      "correctIndex": 0,
      "points": 1,
      "explanation": "Giải thích (tùy chọn)",
      "explanationImageFileName": "lt_2.png"
    }
  ]
}

difficulty: nhan_biet | thong_hieu | van_dung | van_dung_cao
type: multiple_choice | true_false | short_answer | essay
imageFileName / explanationImageFileName: Tên file ảnh tương ứng cần tải lên cùng JSON.`;

/** Nhập nhiều câu hỏi vào ngân hàng từ file/dán JSON kèm tệp hình ảnh. */
export default function BankJsonTools() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [jsonText, setJsonText] = useState("");
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState("");
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  function handleImageSelection(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).filter(isAcceptedImageFile);
    e.target.value = "";
    if (files.length > 0) {
      setSelectedImages((prev) => {
        const map = new Map(prev.map((f) => [f.name, f]));
        files.forEach((f) => map.set(f.name, f));
        return Array.from(map.values());
      });
      setPreview(null);
      setResult(`Đã chọn thêm ${files.length} file ảnh. Hãy xem lại preview trước khi nhập.`);
    }
  }

  function previewJson() {
    setError("");
    setResult("");
    setPreview(null);
    if (!jsonText.trim()) {
      setError("Hãy dán mã JSON hoặc chọn file trước khi xem preview.");
      return;
    }

    const parsed = parseBankJson(jsonText);
    if (!parsed.ok) {
      setError(parsed.error);
      return;
    }
    if (!parsed.questions.length) {
      setError(`Không có câu hỏi hợp lệ nào.\n${parsed.errors.join("\n")}`);
      return;
    }

    setPreview({ questions: parsed.questions, skipped: parsed.skipped, errors: parsed.errors });
    setResult(`Đã phân tích ${parsed.questions.length} câu hỏi. Kiểm tra preview rồi xác nhận để nhập.`);
  }

  async function importJson() {
    setError("");
    setResult("");
    if (!preview?.questions.length) {
      setError("Hãy xem preview và xác nhận dữ liệu trước khi nhập.");
      return;
    }
    setBusy(true);
    try {
      const parsed = preview;
      const supabase = createClient();
      if (!supabase) throw new Error("Website chưa được cấu hình Supabase.");
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Phiên đăng nhập đã hết. Hãy đăng nhập lại.");

      // Xây dựng bản đồ file ảnh theo tên chuẩn hoá
      const fileMap = new Map<string, File>();
      for (const file of selectedImages) {
        fileMap.set(normalizeImageName(file.name), file);
      }

      const uploadCache = new Map<string, string>();
      async function uploadFileIfNeeded(file: File): Promise<string> {
        const cacheKey = file.name + "_" + file.size;
        if (uploadCache.has(cacheKey)) return uploadCache.get(cacheKey)!;
        const path = `${user?.id || "anon"}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
        const res = await supabase!.storage.from("document-images").upload(path, file, { contentType: file.type });
        if (res.error) throw new Error(`Lỗi tải ảnh "${file.name}": ${res.error.message}`);
        uploadCache.set(cacheKey, path);
        return path;
      }

      let uploadedImagesCount = 0;

      const rows = [];
      for (const q of parsed.questions) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, text, type, difficulty, grade, topicIds, imageFile, explanationImageFile, createdAt, updatedAt, ...content } = q;

        let imgStorage = content.imageStoragePath;
        if (!imgStorage && q.imageSourceName) {
          const match = fileMap.get(normalizeImageName(q.imageSourceName));
          if (match) {
            imgStorage = await uploadFileIfNeeded(match);
            uploadedImagesCount++;
          }
        }

        let expStorage = content.explanationImageStoragePath;
        if (!expStorage && q.explanationImageSourceName) {
          const match = fileMap.get(normalizeImageName(q.explanationImageSourceName));
          if (match) {
            expStorage = await uploadFileIfNeeded(match);
            uploadedImagesCount++;
          }
        }

        let updatedExpImages = content.explanationImages;
        if (Array.isArray(content.explanationImages) && content.explanationImages.length > 0) {
          const processedList = [];
          for (const item of content.explanationImages) {
            let itemPath = item.storagePath;
            if (!itemPath && item.sourceName) {
              const match = fileMap.get(normalizeImageName(item.sourceName));
              if (match) {
                itemPath = await uploadFileIfNeeded(match);
                uploadedImagesCount++;
              }
            }
            processedList.push({
              ...(itemPath ? { storagePath: itemPath } : {}),
              ...(item.caption?.trim() ? { caption: item.caption.trim() } : {}),
              ...(item.url ? { url: item.url } : {}),
            });
          }
          updatedExpImages = processedList.filter((it) => it.storagePath || it.url);
        }

        const finalContent = {
          ...content,
          ...(imgStorage ? { imageStoragePath: imgStorage } : {}),
          ...(expStorage ? { explanationImageStoragePath: expStorage } : {}),
          ...(updatedExpImages && updatedExpImages.length > 0 ? { explanationImages: updatedExpImages } : {}),
        };

        delete (finalContent as Record<string, unknown>).imageSourceName;
        delete (finalContent as Record<string, unknown>).explanationImageSourceName;

        rows.push({
          text,
          type: type || "multiple_choice",
          difficulty,
          grade,
          content: finalContent,
          created_by: user.id,
          __topicIds: topicIds ?? [],
        });
      }

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
        `✅ Đã nhập thành công ${imported} câu hỏi vào ngân hàng (${uploadedImagesCount} ảnh đã được tải lên).` +
          (parsed.skipped ? `\n⚠️ Bỏ qua ${parsed.skipped} câu lỗi:\n${parsed.errors.join("\n")}` : ""),
      );
      setJsonText("");
      setSelectedImages([]);
      setPreview(null);
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
        setPreview(null);
        setResult(`Đã đọc file "${file.name}". Bấm "Xem preview" để kiểm tra trước khi nhập.`);
      }
    };
    reader.onerror = () => setError("Không thể đọc file từ máy tính.");
    reader.readAsText(file, "UTF-8");
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-bold dark:text-white">{"{ }"} Nhập câu hỏi từ JSON & Ảnh</h2>
        <button type="button" onClick={() => setOpen((v) => !v)} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-600 dark:border-slate-700 dark:text-slate-300">
          {open ? "▲ Thu gọn" : "▼ Mở công cụ"}
        </button>
      </div>
      {open && (
        <div className="mt-4 space-y-3">
          <input ref={fileInputRef} type="file" accept=".json,application/json,text/plain" onChange={handleFile} className="hidden" />
          <input ref={imageInputRef} type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={handleImageSelection} className="hidden" />

          <textarea
            value={jsonText}
            onChange={(e) => {
              setJsonText(e.target.value);
              setPreview(null);
              setError("");
              setResult("");
            }}
            rows={6}
            spellCheck={false}
            placeholder="Dán mã JSON ngân hàng câu hỏi tại đây..."
            className="w-full rounded-lg border border-slate-300 bg-slate-50 p-3 font-mono text-xs leading-5 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
          />

          {selectedImages.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 rounded-xl bg-slate-50 p-3 text-xs dark:bg-slate-800">
              <span className="font-semibold text-slate-700 dark:text-slate-200">🖼 {selectedImages.length} ảnh đã chọn:</span>
              <div className="flex max-h-20 flex-wrap gap-1 overflow-y-auto">
                {selectedImages.map((img) => (
                  <span key={img.name} className="rounded bg-indigo-100 px-2 py-0.5 text-[11px] font-medium text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                    {img.name}
                  </span>
                ))}
              </div>
              <button type="button" onClick={() => { setSelectedImages([]); setPreview(null); }} className="ml-auto text-xs text-rose-600 hover:underline">Xóa danh sách ảnh</button>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <button type="button" disabled={busy} onClick={() => fileInputRef.current?.click()} className="rounded-lg border border-indigo-300 px-4 py-2 text-xs font-bold text-indigo-600 dark:border-indigo-800 dark:text-indigo-300">📂 1. Chọn file .json</button>
            <button type="button" disabled={busy} onClick={() => imageInputRef.current?.click()} className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">🖼 2. Chọn kèm ảnh (nếu có)</button>
            <button type="button" disabled={busy} onClick={previewJson} className="rounded-lg border border-indigo-300 px-4 py-2 text-xs font-bold text-indigo-600 hover:bg-indigo-50 disabled:opacity-60 dark:border-indigo-800 dark:text-indigo-300 dark:hover:bg-indigo-950/40">🔍 3. Xem preview</button>
            <button type="button" disabled={busy || !preview} onClick={importJson} className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 disabled:opacity-60">{busy ? "Đang tải ảnh & nhập..." : preview ? `✅ 4. Xác nhận nhập ${preview.questions.length} câu` : "✅ 4. Xác nhận nhập"}</button>
          </div>

          {preview && (
            <div className="space-y-3 rounded-2xl border border-indigo-200 bg-indigo-50/60 p-4 dark:border-indigo-900 dark:bg-indigo-950/30">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="font-bold text-indigo-900 dark:text-indigo-100">Preview dữ liệu nhập</h3>
                  <p className="mt-1 text-xs text-indigo-700 dark:text-indigo-300">
                    {preview.questions.length} câu hợp lệ{preview.skipped ? ` · ${preview.skipped} câu sẽ bị bỏ qua` : ""}. Chưa có dữ liệu nào được ghi vào ngân hàng.
                  </p>
                </div>
                <button type="button" disabled={busy} onClick={() => setPreview(null)} className="rounded-lg border border-indigo-300 px-3 py-1.5 text-xs font-bold text-indigo-700 dark:border-indigo-800 dark:text-indigo-300">Đóng preview</button>
              </div>

              <div className="max-h-[32rem] space-y-3 overflow-y-auto pr-1">
                {preview.questions.map((question, index) => {
                  const type = question.type || "multiple_choice";
                  const difficulty = getDifficultyMeta(question.difficulty);
                  return (
                    <article key={`${index}-${question.text}`} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
                      <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
                        <span className="font-bold text-slate-500 dark:text-slate-400">Câu {index + 1}</span>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">{QUESTION_TYPE_LABELS[type]}</span>
                        <span className={`rounded-full px-2 py-0.5 font-bold ${difficulty.badgeClass}`}>{difficulty.label}</span>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">{question.grade}</span>
                        {question.imageSourceName && <span className="text-slate-400">🖼 {question.imageSourceName}</span>}
                      </div>
                      <LazyMathText text={question.text} className="text-sm leading-6 text-slate-800 dark:text-slate-100" />
                      {type === "multiple_choice" && (
                        <div className="mt-2 grid gap-1 text-xs text-slate-600 sm:grid-cols-2 dark:text-slate-300">
                          {(question.options ?? []).map((option) => (
                            <div key={option.id} className={option.id === question.correctOptionId ? "font-bold text-emerald-600 dark:text-emerald-400" : ""}>
                              <span>{option.id.toUpperCase()}. </span>
                              <LazyMathText inline text={option.text} />
                              {option.id === question.correctOptionId ? " ✓" : ""}
                            </div>
                          ))}
                        </div>
                      )}
                      {type === "true_false" && (
                        <div className="mt-2 space-y-1 text-xs text-slate-600 dark:text-slate-300">
                          {(question.statements ?? []).map((statement, statementIndex) => (
                            <div key={statement.id}>
                              <span>{statementIndex + 1}. </span>
                              <LazyMathText inline text={statement.text} />
                              <span> — </span>
                              <strong>{statement.correctVal === "true" ? "Đúng" : "Sai"}</strong>
                            </div>
                          ))}
                        </div>
                      )}
                      {(() => {
                        const answer = getPreviewAnswer(question);
                        return (
                          <p className="mt-2 flex flex-wrap items-baseline gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                            <span>{answer.label}{answer.value ? ":" : ""}</span>
                            {answer.value && <LazyMathText inline text={answer.value} />}
                          </p>
                        );
                      })()}
                      {question.explanation && (
                        <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          <span>Giải thích: </span>
                          <LazyMathText text={question.explanation} className="inline-block align-top" />
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>

              {preview.errors.length > 0 && (
                <div className="rounded-xl bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
                  <p className="font-bold">Các câu sẽ bị bỏ qua:</p>
                  <ul className="mt-1 list-inside list-disc space-y-1">{preview.errors.map((item) => <li key={item}>{item}</li>)}</ul>
                </div>
              )}
            </div>
          )}

          {error && <pre role="alert" className="whitespace-pre-wrap rounded-xl bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">{error}</pre>}
          {result && <p className="whitespace-pre-wrap rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">{result}</p>}

          <details className="rounded-lg border border-slate-200 p-3 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
            <summary className="cursor-pointer font-semibold">Cấu trúc mã JSON hỗ trợ ảnh</summary>
            <pre className="mt-2 overflow-x-auto whitespace-pre font-mono leading-5">{FORMAT_HINT}</pre>
          </details>
        </div>
      )}
    </section>
  );
}
