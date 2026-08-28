"use client";
import { memo, useCallback, useState } from "react";
import type { DocumentFormBlock } from "@/lib/document-types";
import { trueFalsePointTable } from "@/lib/exam-scoring";
import { resolveQuestionImageSrc, resolveExplanationImageSrc, getLocalImageUrl } from "@/lib/document-preview";
import { getDocumentImageUrl } from "@/lib/document-url";
import { topics } from "@/data/topics";
import BankQuestionPickerModal from "./BankQuestionPickerModal";

type QuizBlock = Extract<DocumentFormBlock, { type: "quiz" }>;
type QuizQuestion = QuizBlock["questions"][number];
type Props = {
  blockIndex: number;
  block: QuizBlock;
  targetQuestionId?: string | null;
  updateBlock: (index: number, value: Partial<DocumentFormBlock>) => void;
  patchBlock: (index: number, patch: (block: DocumentFormBlock) => DocumentFormBlock) => void;
};

const optionIds = ["a", "b", "c", "d"];
const makeId = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
const cloneQuestion = (q: QuizQuestion): QuizQuestion => ({ ...q, options: q.options?.map((o) => ({ ...o })), statements: q.statements?.map((s) => ({ ...s })), trueFalsePoints: q.trueFalsePoints?.map((point) => point) });

function makeQuestion(type: QuizQuestion["type"] = "multiple_choice"): QuizQuestion {
  if (type === "true_false") return { id: makeId("q"), text: "", type, points: 1, statements: [{ id: makeId("s"), text: "", correctVal: "true" }] };
  if (type === "short_answer") return { id: makeId("q"), text: "", type, points: 1, correctAnswer: "" };
  if (type === "essay") return { id: makeId("q"), text: "", type };
  return { id: makeId("q"), text: "", type: "multiple_choice", points: 1, options: optionIds.map((id) => ({ id, text: "" })), correctOptionId: "a" };
}

const getStatements = (q: QuizQuestion) => q.statements ?? (q.options ?? []).map((o) => ({ id: o.id, text: o.text, correctVal: o.correctVal === "false" ? "false" as const : "true" as const }));

const QuizEditor = memo(function QuizEditor({ blockIndex, block, targetQuestionId, updateBlock, patchBlock }: Props) {
  const questions = block.questions ?? [];
  const [pickerOpen, setPickerOpen] = useState(false);

  // Sửa có mục tiêu: chỉ clone câu hỏi đang được sửa, các câu khác giữ nguyên identity
  // để QuestionEditor memo hóa không phải re-render trên từng phím gõ.
  const updateQuestion = useCallback((index: number, fn: (question: QuizQuestion) => void) => {
    patchBlock(blockIndex, (b) => {
      if (b.type !== "quiz") return b;
      const prev = b.questions ?? [];
      const draft = cloneQuestion(prev[index] ?? makeQuestion());
      fn(draft);
      return { ...b, questions: prev.map((q, i) => (i === index ? draft : q)) };
    });
  }, [blockIndex, patchBlock]);

  const removeQuestion = useCallback((index: number) => {
    patchBlock(blockIndex, (b) => (b.type !== "quiz" ? b : { ...b, questions: (b.questions ?? []).filter((_, i) => i !== index) }));
  }, [blockIndex, patchBlock]);

  const addQuestion = useCallback(() => {
    patchBlock(blockIndex, (b) => (b.type !== "quiz" ? b : { ...b, questions: [...(b.questions ?? []), makeQuestion()] }));
  }, [blockIndex, patchBlock]);

  const changeType = useCallback((index: number, type: NonNullable<QuizQuestion["type"]>) => {
    patchBlock(blockIndex, (b) => {
      if (b.type !== "quiz") return b;
      const old = (b.questions ?? [])[index] ?? makeQuestion();
      const replacement = makeQuestion(type);
      replacement.id = old.id;
      replacement.text = old.text;
      replacement.explanation = old.explanation;
      replacement.points = old.points ?? 1;
      replacement.trueFalsePoints = old.trueFalsePoints;
      replacement.imageFile = old.imageFile;
      replacement.imageStoragePath = old.imageStoragePath;
      replacement.imageUrl = old.imageUrl;
      replacement.imageCaption = old.imageCaption;
      replacement.explanationImageFile = old.explanationImageFile;
      replacement.explanationImageStoragePath = old.explanationImageStoragePath;
      replacement.explanationImageUrl = old.explanationImageUrl;
      replacement.explanationImageCaption = old.explanationImageCaption;
      replacement.explanationImages = old.explanationImages;
      return { ...b, questions: (b.questions ?? []).map((q, i) => (i === index ? replacement : q)) };
    });
  }, [blockIndex, patchBlock]);

  const insertFromBank = useCallback((picked: QuizQuestion[]) => {
    patchBlock(blockIndex, (b) => (b.type !== "quiz" ? b : { ...b, questions: [...(b.questions ?? []), ...picked] }));
  }, [blockIndex, patchBlock]);

  return (
    <div className="space-y-4">
      <input placeholder="Tiêu đề phần câu hỏi" value={block.title} onChange={(e) => updateBlock(blockIndex, { title: e.target.value })} className="h-11 w-full rounded-lg border border-slate-300 px-3 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
      <input placeholder="Mô tả ngắn (tùy chọn)" value={block.description ?? ""} onChange={(e) => updateBlock(blockIndex, { description: e.target.value })} className="h-10 w-full rounded-lg border border-slate-300 px-3 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
      <div className="rounded-lg border border-purple-100 bg-purple-50/50 p-3 text-sm text-purple-800 dark:border-purple-950 dark:bg-purple-950/20 dark:text-purple-200">Dạng <strong>Đúng / Sai</strong> gồm một đề bài chung và nhiều mệnh đề. Học sinh sẽ trả lời từng mệnh đề.</div>
      {questions.map((q, qi) => (
        <QuestionEditor
          key={q.id}
          question={q}
          qi={qi}
          isTarget={Boolean(targetQuestionId && (targetQuestionId === q.id || targetQuestionId === String(qi + 1)))}
          updateQuestion={updateQuestion}
          removeQuestion={removeQuestion}
          changeType={changeType}
        />
      ))}
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={addQuestion} className="rounded-lg border border-indigo-300 px-3 py-2 text-xs font-bold text-indigo-600 dark:border-indigo-800 dark:text-indigo-300">+ Thêm câu hỏi</button>
        <button type="button" onClick={() => setPickerOpen(true)} className="rounded-lg border border-violet-300 px-3 py-2 text-xs font-bold text-violet-600 dark:border-violet-800 dark:text-violet-300">📚 Chèn từ ngân hàng câu hỏi</button>
      </div>
      <BankQuestionPickerModal open={pickerOpen} onClose={() => setPickerOpen(false)} onInsert={insertFromBank} topics={topics} />
    </div>
  );
});

/** Trình sửa một câu hỏi: memo theo identity câu hỏi để gõ câu này không re-render câu khác. */
const QuestionEditor = memo(function QuestionEditor({
  question: q,
  qi,
  isTarget,
  updateQuestion,
  removeQuestion,
  changeType,
}: {
  question: QuizQuestion;
  qi: number;
  isTarget?: boolean;
  updateQuestion: (index: number, fn: (question: QuizQuestion) => void) => void;
  removeQuestion: (index: number) => void;
  changeType: (index: number, type: NonNullable<QuizQuestion["type"]>) => void;
}) {
  const qType = q.type ?? "multiple_choice";
  const statements = getStatements(q);
  const pointTable = trueFalsePointTable(q);

  return (
    <div
      id={`cau-${q.id}`}
      className={`space-y-3 rounded-xl p-4 transition-all scroll-mt-28 ${
        isTarget
          ? "border-2 border-rose-500 bg-rose-50/80 ring-4 ring-rose-500/25 dark:border-rose-500 dark:bg-rose-950/40 dark:ring-rose-500/30"
          : "bg-slate-50 dark:bg-slate-800/60"
      }`}
    >
      {isTarget && (
        <div className="flex items-center gap-2 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs animate-pulse">
          <span>🚩</span>
          <span>Câu hỏi cần sửa theo phản hồi báo lỗi từ học sinh</span>
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2 dark:border-slate-700">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Câu hỏi số {qi + 1}</p>
        <div className="flex items-center gap-2">
          <select value={qType} onChange={(e) => changeType(qi, e.target.value as NonNullable<QuizQuestion["type"]>)} className="h-8 rounded-lg border border-slate-300 bg-white px-2 text-xs dark:border-slate-700 dark:bg-slate-950 dark:text-white"><option value="multiple_choice">Trắc nghiệm</option><option value="true_false">Đúng / Sai</option><option value="short_answer">Trả lời ngắn</option><option value="essay">Tự luận</option></select>
          <button type="button" onClick={() => removeQuestion(qi)} className="rounded-lg border border-red-200 px-2 py-1 text-xs font-bold text-red-600 dark:border-red-900">Xóa câu</button>
        </div>
        {qType !== "essay" && <div className="space-y-3 rounded-lg border border-amber-200 bg-amber-50/60 p-3 dark:border-amber-900/60 dark:bg-amber-950/20"><label className="flex items-center gap-2 text-xs font-bold text-amber-900 dark:text-amber-200">Điểm tối đa của câu<input type="number" min="0.01" step="0.01" value={q.points ?? 1} onChange={(e) => updateQuestion(qi, (current) => { const value = Number(e.target.value); current.points = Number.isFinite(value) && value > 0 ? value : 1; })} className="h-8 w-24 rounded-md border border-amber-300 bg-white px-2 text-sm font-normal text-slate-900 dark:border-amber-800 dark:bg-slate-950 dark:text-white" /></label>{qType === "true_false" && <div><p className="mb-2 text-xs font-bold text-amber-900 dark:text-amber-200">Điểm theo số ý Đúng</p><div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{pointTable.map((point, correct) => <label key={correct} className="text-xs text-slate-700 dark:text-slate-300">Đúng {correct} ý<input type="number" min="0" step="0.01" value={point} disabled={correct === statements.length} onChange={(e) => updateQuestion(qi, (current) => { const table = trueFalsePointTable(current); const value = Number(e.target.value); table[correct] = Number.isFinite(value) && value >= 0 ? value : 0; current.trueFalsePoints = table; })} className="mt-1 h-8 w-full rounded-md border border-amber-300 bg-white px-2 text-sm disabled:cursor-not-allowed disabled:bg-slate-100 dark:border-amber-800 dark:bg-slate-950 dark:text-white dark:disabled:bg-slate-800" /></label>)}</div><p className="mt-2 text-[11px] text-amber-800 dark:text-amber-300">Với 4 mệnh đề mặc định: 0; 0,1; 0,25; 0,5; 1,0 điểm.</p></div>}</div>}

      </div>
      <textarea placeholder={qType === "true_false" ? "Nhập đề bài chung (có thể dùng $LaTeX$)" : "Nội dung câu hỏi (có thể dùng $LaTeX$)"} value={q.text} onChange={(e) => updateQuestion(qi, (current) => { current.text = e.target.value; })} rows={2} className="w-full rounded-lg border border-slate-300 p-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white" />

      {/* Ảnh đính kèm cho câu hỏi */}
      <div className="rounded-lg border border-dashed border-slate-300 bg-white p-3 dark:border-slate-700 dark:bg-slate-900/50">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            🖼 Ảnh minh họa cho câu hỏi (tùy chọn)
          </label>
          {(q.imageFile || q.imageStoragePath || q.imageUrl) && (
            <button
              type="button"
              onClick={() => updateQuestion(qi, (curr) => {
                delete curr.imageFile;
                delete curr.imageStoragePath;
                delete curr.imageUrl;
                delete curr.imageCaption;
              })}
              className="text-xs font-bold text-red-600 hover:underline"
            >
              Xóa ảnh
            </button>
          )}
        </div>

        {(() => {
          const imgSrc = resolveQuestionImageSrc(q);
          if (imgSrc) {
            return (
              <div className="mt-2 space-y-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imgSrc} alt="Preview" loading="lazy" decoding="async" className="max-h-48 rounded-lg object-contain" />
                <input
                  placeholder="Chú thích ảnh (Ví dụ: Hình 1: Đồ thị hàm số)"
                  value={q.imageCaption ?? ""}
                  onChange={(e) => updateQuestion(qi, (curr) => { curr.imageCaption = e.target.value; })}
                  className="h-8 w-full rounded-md border border-slate-300 px-2 text-xs dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>
            );
          }
          return (
            <div className="mt-2">
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    updateQuestion(qi, (curr) => {
                      curr.imageFile = file;
                      if (!curr.imageCaption) curr.imageCaption = "Hình ảnh câu hỏi";
                    });
                  }
                }}
                className="block w-full text-xs text-slate-500 file:mr-2 file:rounded-md file:border-0 file:bg-indigo-50 file:px-2.5 file:py-1 file:text-xs file:font-semibold file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-950 dark:file:text-indigo-300"
              />
              {q.imageCaption && (
                <p className="mt-1 text-[11px] text-slate-400">
                  Chú thích: {q.imageCaption} (Hãy chọn file ảnh từ máy tính để tải lên)
                </p>
              )}
            </div>
          );
        })()}
      </div>

      {qType === "multiple_choice" && <div className="space-y-2">
        {optionIds.map((slot) => { const option = q.options?.find((o) => o.id === slot) ?? { id: slot, text: "" }; const correct = q.correctOptionId === slot; return <div key={slot} className="flex items-center gap-2"><button type="button" onClick={() => updateQuestion(qi, (current) => { current.correctOptionId = slot; })} className={`rounded-md px-2 py-1 text-xs font-bold ${correct ? "bg-green-600 text-white" : "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300"}`}>{correct ? "✓ Đúng" : slot.toUpperCase()}</button><input placeholder={`Đáp án ${slot.toUpperCase()}`} value={option.text} onChange={(e) => updateQuestion(qi, (current) => { const options = current.options ?? []; const found = options.find((o) => o.id === slot); if (found) found.text = e.target.value; else options.push({ id: slot, text: e.target.value }); current.options = options; })} className="h-9 min-w-0 flex-1 rounded-md border border-slate-300 px-2 text-sm dark:border-slate-600 dark:bg-slate-950 dark:text-white" /></div>; })}
      </div>}

      {qType === "true_false" && <div className="space-y-3">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Các mệnh đề</p>
        {statements.map((statement, si) => <div key={statement.id} className="space-y-2 rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900/40">
          <div className="flex items-center gap-2"><span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-bold dark:bg-slate-800">{si + 1}</span><input placeholder={`Nhập mệnh đề ${si + 1}`} value={statement.text} onChange={(e) => updateQuestion(qi, (current) => { const list = current.statements ?? statements.map((s) => ({ ...s })); list[si].text = e.target.value; current.statements = list; delete current.options; })} className="h-9 min-w-0 flex-1 rounded-md border border-slate-300 px-2 text-sm dark:border-slate-600 dark:bg-slate-950 dark:text-white" /><button type="button" disabled={statements.length <= 1} onClick={() => updateQuestion(qi, (current) => { const list = current.statements ?? statements.map((s) => ({ ...s })); list.splice(si, 1); current.statements = list; delete current.options; })} className="rounded border border-red-200 px-2 py-1 text-xs text-red-600 disabled:opacity-40">Xóa</button></div>
          <div className="flex gap-2 pl-8">{(["true", "false"] as const).map((value) => <button key={value} type="button" onClick={() => updateQuestion(qi, (current) => { const list = current.statements ?? statements.map((s) => ({ ...s })); list[si].correctVal = value; current.statements = list; delete current.options; })} className={`rounded-md border px-3 py-1 text-xs font-semibold ${statement.correctVal === value ? value === "true" ? "border-green-600 bg-green-600 text-white" : "border-red-600 bg-red-600 text-white" : "border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"}`}>{value === "true" ? "Đúng" : "Sai"}</button>)}</div>
        </div>)}
        <button type="button" onClick={() => updateQuestion(qi, (current) => { const list = current.statements ?? statements.map((s) => ({ ...s })); list.push({ id: makeId("s"), text: "", correctVal: "true" }); current.statements = list; delete current.options; })} className="rounded-lg border border-green-300 px-3 py-2 text-xs font-bold text-green-700 dark:border-green-800 dark:text-green-300">+ Thêm mệnh đề</button>
      </div>}

      {qType === "short_answer" && <input placeholder="Đáp án đúng" value={q.correctAnswer ?? ""} onChange={(e) => updateQuestion(qi, (current) => { current.correctAnswer = e.target.value; })} className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white" />}
      {qType === "essay" && <div className="rounded-lg border border-indigo-100 bg-indigo-50/30 p-3 text-xs text-indigo-700 dark:border-indigo-950/40 dark:bg-indigo-950/20 dark:text-indigo-300">💡 Học sinh sẽ đối chiếu bài làm với phần giải thích/hướng dẫn giải.</div>}
      <div className="space-y-2">
        <textarea placeholder="Giải thích / Hướng dẫn giải (tùy chọn, hỗ trợ $LaTeX$)" value={q.explanation ?? ""} onChange={(e) => updateQuestion(qi, (current) => { current.explanation = e.target.value; })} rows={2} className="w-full rounded-lg border border-slate-300 p-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white" />

        {/* Ảnh lời giải / giải thích */}
        <div className="rounded-lg border border-dashed border-blue-200 bg-blue-50/20 p-3 dark:border-blue-900/40 dark:bg-blue-950/10">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="text-xs font-semibold text-blue-900 dark:text-blue-300">
              🖼 Ảnh lời giải / sơ đồ giải thích (tùy chọn)
            </label>
            {(q.explanationImageFile || q.explanationImageStoragePath || q.explanationImageUrl || (q.explanationImages && q.explanationImages.length > 0)) && (
              <button
                type="button"
                onClick={() => updateQuestion(qi, (curr) => {
                  delete curr.explanationImageFile;
                  delete curr.explanationImageStoragePath;
                  delete curr.explanationImageUrl;
                  delete curr.explanationImageCaption;
                  delete curr.explanationImages;
                })}
                className="text-xs font-bold text-red-600 hover:underline"
              >
                Xóa tất cả ảnh lời giải
              </button>
            )}
          </div>

          {(() => {
            const hasArray = Array.isArray(q.explanationImages) && q.explanationImages.length > 0;
            if (hasArray) {
              return (
                <div className="mt-2 space-y-3">
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {q.explanationImages!.map((img, imgIdx) => {
                      let src = img.url;
                      if (img.file) src = getLocalImageUrl(img.file);
                      else if (img.storagePath) src = getDocumentImageUrl(img.storagePath) || undefined;
                      return (
                        <div key={imgIdx} className="relative rounded-lg border border-blue-200 bg-white p-2 dark:border-blue-900 dark:bg-slate-900">
                          {src && (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img src={src} alt="Preview" loading="lazy" decoding="async" className="max-h-36 w-full rounded object-contain" />
                          )}
                          <input
                            placeholder="Chú thích ảnh..."
                            value={img.caption ?? ""}
                            onChange={(e) => updateQuestion(qi, (curr) => {
                              if (curr.explanationImages && curr.explanationImages[imgIdx]) {
                                curr.explanationImages[imgIdx].caption = e.target.value;
                              }
                            })}
                            className="mt-1.5 h-7 w-full rounded border border-slate-200 px-2 text-[11px] dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                          />
                          <button
                            type="button"
                            onClick={() => updateQuestion(qi, (curr) => {
                              if (curr.explanationImages) {
                                curr.explanationImages.splice(imgIdx, 1);
                              }
                            })}
                            className="mt-1 text-[11px] font-semibold text-red-600 hover:underline"
                          >
                            ✕ Xóa ảnh {imgIdx + 1}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  <div>
                    <label className="inline-flex cursor-pointer items-center rounded-md border border-blue-300 bg-white px-2.5 py-1 text-xs font-semibold text-blue-700 shadow-xs hover:bg-blue-50 dark:border-blue-800 dark:bg-slate-900 dark:text-blue-300">
                      + Thêm ảnh lời giải
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="sr-only"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            updateQuestion(qi, (curr) => {
                              if (!curr.explanationImages) curr.explanationImages = [];
                              curr.explanationImages.push({ file, caption: `Hình ảnh lời giải ${curr.explanationImages.length + 1}` });
                            });
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
              );
            }

            const expImgSrc = resolveExplanationImageSrc(q);
            if (expImgSrc) {
              return (
                <div className="mt-2 space-y-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={expImgSrc} alt="Preview lời giải" loading="lazy" decoding="async" className="max-h-48 rounded-lg object-contain" />
                  <input
                    placeholder="Chú thích ảnh lời giải (tùy chọn)"
                    value={q.explanationImageCaption ?? ""}
                    onChange={(e) => updateQuestion(qi, (curr) => { curr.explanationImageCaption = e.target.value; })}
                    className="h-8 w-full rounded-md border border-slate-300 px-2 text-xs dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                  <div>
                    <label className="inline-flex cursor-pointer items-center rounded-md border border-blue-300 bg-white px-2.5 py-1 text-xs font-semibold text-blue-700 shadow-xs hover:bg-blue-50 dark:border-blue-800 dark:bg-slate-900 dark:text-blue-300">
                      + Thêm ảnh lời giải khác
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="sr-only"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            updateQuestion(qi, (curr) => {
                              curr.explanationImages = [
                                {
                                  file: curr.explanationImageFile,
                                  storagePath: curr.explanationImageStoragePath,
                                  url: curr.explanationImageUrl,
                                  caption: curr.explanationImageCaption,
                                },
                                { file, caption: "Hình ảnh lời giải 2" },
                              ];
                              delete curr.explanationImageFile;
                              delete curr.explanationImageStoragePath;
                              delete curr.explanationImageUrl;
                              delete curr.explanationImageCaption;
                            });
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
              );
            }
            return (
              <div className="mt-2">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      updateQuestion(qi, (curr) => {
                        curr.explanationImageFile = file;
                        if (!curr.explanationImageCaption) curr.explanationImageCaption = "Hình ảnh lời giải";
                      });
                    }
                  }}
                  className="block w-full text-xs text-slate-500 file:mr-2 file:rounded-md file:border-0 file:bg-blue-50 file:px-2.5 file:py-1 file:text-xs file:font-semibold file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-950 dark:file:text-blue-300"
                />
                {q.explanationImageCaption && (
                  <p className="mt-1 text-[11px] text-slate-400">
                    Chú thích: {q.explanationImageCaption} (Hãy chọn file ảnh từ máy tính để tải lên)
                  </p>
                )}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
});

export default QuizEditor;
