"use client";

import { useState } from "react";
import type { StagedDocumentData } from "@/lib/staged-document-saver";
import type { DocumentType } from "@/lib/document-types";
import MathText from "@/components/MathText";

interface QuickQuestion {
  id: string;
  text: string;
  options: { id: string; text: string }[];
  correctOptionId: string;
}

interface DocumentQuickCreateModalProps {
  open: boolean;
  onClose: () => void;
  defaultGrade?: string;
  onCreated: (doc: StagedDocumentData) => void;
}

function parsePastedQuestions(rawText: string): QuickQuestion[] {
  const lines = rawText
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const questions: QuickQuestion[] = [];
  let currentQ: QuickQuestion | null = null;

  for (const line of lines) {
    const qMatch = line.match(/^(?:Câu\s*\d+[\s.:]|Bài\s*\d+[\s.:]|\d+[\s.:])\s*(.*)/i);
    if (qMatch) {
      if (currentQ && currentQ.text && currentQ.options.length >= 2) {
        questions.push(currentQ);
      }
      currentQ = {
        id: `q-${questions.length + 1}`,
        text: qMatch[1] || line,
        options: [],
        correctOptionId: "a",
      };
      continue;
    }

    const optMatch = line.match(/^(\*?)([A-Fa-f])[\s.:)]\s*(.*)/);
    if (optMatch && currentQ) {
      const isCorrect = optMatch[1] === "*";
      const optLetter = optMatch[2].toLowerCase();
      const optText = optMatch[3] || "";
      currentQ.options.push({ id: optLetter, text: optText });
      if (isCorrect) {
        currentQ.correctOptionId = optLetter;
      }
      continue;
    }

    const ansMatch = line.match(/^(?:Đáp án|ĐA|Key)[\s.:]*([A-Fa-f])/i);
    if (ansMatch && currentQ) {
      currentQ.correctOptionId = ansMatch[1].toLowerCase();
      continue;
    }

    if (currentQ && currentQ.options.length === 0) {
      currentQ.text += "\n" + line;
    }
  }

  if (currentQ && currentQ.text && currentQ.options.length >= 2) {
    questions.push(currentQ);
  }

  return questions;
}

export default function DocumentQuickCreateModal({
  open,
  onClose,
  defaultGrade = "Lớp 8",
  onCreated,
}: DocumentQuickCreateModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [grade, setGrade] = useState(defaultGrade);
  const [documentType, setDocumentType] = useState<DocumentType>("normal");

  // Nội dung lý thuyết
  const [textContent, setTextContent] = useState("");
  const [previewTheory, setPreviewTheory] = useState(false);

  // Nội dung trắc nghiệm
  const [quizMode, setQuizMode] = useState<"form" | "paste">("form");
  const [pasteRaw, setPasteRaw] = useState("");
  const [questions, setQuestions] = useState<QuickQuestion[]>([
    {
      id: "q1",
      text: "",
      options: [
        { id: "a", text: "" },
        { id: "b", text: "" },
        { id: "c", text: "" },
        { id: "d", text: "" },
      ],
      correctOptionId: "a",
    },
  ]);

  const [error, setError] = useState("");

  if (!open) return null;

  const handleAddQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        id: `q-${prev.length + 1}`,
        text: "",
        options: [
          { id: "a", text: "" },
          { id: "b", text: "" },
          { id: "c", text: "" },
          { id: "d", text: "" },
        ],
        correctOptionId: "a",
      },
    ]);
  };

  const handleRemoveQuestion = (idx: number) => {
    if (questions.length <= 1) return;
    setQuestions((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleQuestionTextChange = (idx: number, text: string) => {
    setQuestions((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], text };
      return next;
    });
  };

  const handleOptionTextChange = (qIdx: number, optId: string, text: string) => {
    setQuestions((prev) => {
      const next = [...prev];
      const q = next[qIdx];
      const newOptions = q.options.map((o) => (o.id === optId ? { ...o, text } : o));
      next[qIdx] = { ...q, options: newOptions };
      return next;
    });
  };

  const handleCorrectOptionChange = (qIdx: number, correctOptionId: string) => {
    setQuestions((prev) => {
      const next = [...prev];
      next[qIdx] = { ...next[qIdx], correctOptionId };
      return next;
    });
  };

  const handleParsePaste = () => {
    if (!pasteRaw.trim()) return;
    const parsed = parsePastedQuestions(pasteRaw);
    if (parsed.length === 0) {
      setError(
        "Không nhận diện được câu hỏi nào từ nội dung dán. Đảm bảo mỗi câu bắt đầu bằng 'Câu 1:', 'Câu 2:' và các phương án 'A.', 'B.', 'C.', 'D.' (dấu * ở đáp án đúng).",
      );
      return;
    }
    setError("");
    setQuestions(parsed);
    setQuizMode("form");
  };

  function handleSubmit() {
    setError("");

    if (!title.trim()) {
      return setError("Vui lòng nhập tên tài liệu.");
    }

    const tempId = `staged-doc-${crypto.randomUUID()}`;

    if (documentType === "normal") {
      const content =
        textContent.trim() || `# ${title.trim()}\n\n*Nội dung tài liệu đang được cập nhật.*`;
      const newDoc: StagedDocumentData = {
        tempId,
        isNew: true,
        title: title.trim(),
        description: description.trim() || undefined,
        grade,
        documentType: "normal",
        status: "published",
        blocks: [
          {
            keyId: crypto.randomUUID(),
            type: "text",
            content,
          },
        ],
      };
      onCreated(newDoc);
      resetAndClose();
    } else {
      // Validate bài kiểm tra
      const validQuestions = questions.filter(
        (q) => q.text.trim() && q.options.filter((o) => o.text.trim()).length >= 2,
      );

      if (validQuestions.length === 0) {
        return setError(
          "Vui lòng nhập ít nhất một câu hỏi hợp lệ (có nội dung câu hỏi và tối thiểu 2 phương án đáp án).",
        );
      }

      const formattedQuestions = validQuestions.map((q, idx) => ({
        id: `q${idx + 1}`,
        type: "multiple_choice" as const,
        text: q.text.trim(),
        options: q.options
          .filter((o) => o.text.trim())
          .map((o) => ({ id: o.id, text: o.text.trim() })),
        correctOptionId: q.correctOptionId,
        points: 1,
      }));

      const newDoc: StagedDocumentData = {
        tempId,
        isNew: true,
        title: title.trim(),
        description: description.trim() || undefined,
        grade,
        documentType: "test",
        status: "published",
        blocks: [
          {
            keyId: crypto.randomUUID(),
            type: "quiz",
            title: "Phần câu hỏi trắc nghiệm",
            description: "",
            questions: formattedQuestions,
          },
        ],
      };
      onCreated(newDoc);
      resetAndClose();
    }
  }

  function resetAndClose() {
    setTitle("");
    setDescription("");
    setTextContent("");
    setPasteRaw("");
    setQuestions([
      {
        id: "q1",
        text: "",
        options: [
          { id: "a", text: "" },
          { id: "b", text: "" },
          { id: "c", text: "" },
          { id: "d", text: "" },
        ],
        correctOptionId: "a",
      },
    ]);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={onClose} />
      <div className="relative flex max-h-[92vh] w-full max-w-2xl flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl transition-colors dark:border-slate-800 dark:bg-[#131b2e]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              ⚡ Tạo nhanh tài liệu &amp; Soạn nội dung
            </h2>
            <p className="text-xs text-slate-500">
              Nhập tiêu đề và soạn trực tiếp lý thuyết hoặc trắc nghiệm để gắn ngay vào chương.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Tên tài liệu *
            </label>
            <input
              type="text"
              autoFocus
              maxLength={200}
              placeholder="VD: Bài 1: Đơn thức và đa thức..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-slate-200/80 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-hidden transition-colors focus:border-indigo-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Loại tài liệu
              </label>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value as DocumentType)}
                className="w-full rounded-xl border border-slate-200/80 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-hidden transition-colors focus:border-indigo-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              >
                <option value="normal">📄 Lý thuyết / Bài học</option>
                <option value="test">✓ Bài kiểm tra trắc nghiệm</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Khối lớp
              </label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full rounded-xl border border-slate-200/80 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-hidden transition-colors focus:border-indigo-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              >
                {["Lớp 6", "Lớp 7", "Lớp 8", "Lớp 9", "Lớp 10", "Lớp 11", "Lớp 12"].map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Mô tả ngắn (tùy chọn)
            </label>
            <input
              type="text"
              placeholder="Tóm tắt ngắn gọn nội dung bài học..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-slate-200/80 bg-slate-50 px-3.5 py-2 text-sm text-slate-900 outline-hidden transition-colors focus:border-indigo-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            />
          </div>

          {/* ===================== PHẦN SOẠN NỘI DUNG ===================== */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            {documentType === "normal" ? (
              /* Soạn Lý thuyết */
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    ✍️ Nội dung bài học (Markdown &amp; LaTeX KaTeX $...$)
                  </label>
                  <button
                    type="button"
                    onClick={() => setPreviewTheory(!previewTheory)}
                    className="text-xs font-bold text-indigo-600 hover:underline dark:text-indigo-400"
                  >
                    {previewTheory ? "✏️ Chỉnh sửa" : "👁 Xem trước công thức"}
                  </button>
                </div>

                {previewTheory ? (
                  <div className="min-h-[160px] max-h-[260px] overflow-y-auto rounded-xl border border-indigo-100 bg-indigo-50/30 p-4 text-sm dark:border-slate-800 dark:bg-slate-900/40">
                    {textContent.trim() ? (
                      <MathText text={textContent} />
                    ) : (
                      <span className="italic text-slate-400">Chưa có nội dung để xem trước.</span>
                    )}
                  </div>
                ) : (
                  <textarea
                    rows={7}
                    placeholder={`Nhập lý thuyết, định lý hoặc dán nội dung vào đây...\nVí dụ:\nĐịnh lý Pythagoras: Trong tam giác vuông, ta có $a^2 + b^2 = c^2$.\nCông thức nghiệm: $x = \\frac{-b \\pm \\sqrt{\\Delta}}{2a}$`}
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    className="w-full font-mono rounded-xl border border-slate-200/80 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-hidden transition-colors focus:border-indigo-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                )}
                <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
                  <span>Mẹo công thức:</span>
                  <button
                    type="button"
                    onClick={() => setTextContent((prev) => prev + " $x^2$ ")}
                    className="rounded bg-slate-100 px-1.5 py-0.5 hover:bg-slate-200 dark:bg-slate-800"
                  >
                    $x^2$
                  </button>
                  <button
                    type="button"
                    onClick={() => setTextContent((prev) => prev + " $\\frac{a}{b}$ ")}
                    className="rounded bg-slate-100 px-1.5 py-0.5 hover:bg-slate-200 dark:bg-slate-800"
                  >
                    $\frac&#123;a&#125;&#123;b&#125;$
                  </button>
                  <button
                    type="button"
                    onClick={() => setTextContent((prev) => prev + " $\\sqrt{x}$ ")}
                    className="rounded bg-slate-100 px-1.5 py-0.5 hover:bg-slate-200 dark:bg-slate-800"
                  >
                    $\sqrt&#123;x&#125;$
                  </button>
                  <button
                    type="button"
                    onClick={() => setTextContent((prev) => prev + " $\\Delta$ ")}
                    className="rounded bg-slate-100 px-1.5 py-0.5 hover:bg-slate-200 dark:bg-slate-800"
                  >
                    $\Delta$
                  </button>
                </div>
              </div>
            ) : (
              /* Soạn Bài kiểm tra trắc nghiệm */
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    🧩 Danh sách câu hỏi ({questions.length})
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setQuizMode(quizMode === "form" ? "paste" : "form")}
                      className="text-xs font-bold text-indigo-600 hover:underline dark:text-indigo-400"
                    >
                      {quizMode === "form" ? "📋 Dán nhanh đề dạng text" : "✍️ Nhập từng câu"}
                    </button>
                  </div>
                </div>

                {quizMode === "paste" ? (
                  <div className="space-y-2 rounded-xl border border-indigo-100 bg-indigo-50/20 p-3 dark:border-slate-800 dark:bg-slate-900/30">
                    <p className="text-[11px] text-slate-500">
                      Dán đề trắc nghiệm (đặt dấu <strong className="text-emerald-600">*</strong> ở
                      đáp án đúng):
                    </p>
                    <textarea
                      rows={6}
                      placeholder={`Câu 1: Phương trình $2x - 4 = 0$ có nghiệm là:\nA. 1\n*B. 2\nC. 3\nD. 4\n\nCâu 2: Giá trị của $\\sqrt{9}$ là:\n*A. 3\nB. -3\nC. 9\nD. 81`}
                      value={pasteRaw}
                      onChange={(e) => setPasteRaw(e.target.value)}
                      className="w-full font-mono rounded-lg border border-slate-200 bg-white p-2.5 text-xs outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    />
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={handleParsePaste}
                        className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-700"
                      >
                        ⚡ Phân tích &amp; Nạp câu hỏi
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {questions.map((q, qIdx) => (
                      <div
                        key={q.id}
                        className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3.5 transition-colors dark:border-slate-800 dark:bg-slate-900/30"
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                            Câu {qIdx + 1}
                          </span>
                          {questions.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveQuestion(qIdx)}
                              className="text-xs text-red-500 hover:text-red-700"
                            >
                              ✕ Xóa câu
                            </button>
                          )}
                        </div>

                        <input
                          type="text"
                          placeholder={`Nội dung câu hỏi ${qIdx + 1} (hỗ trợ $...$)...`}
                          value={q.text}
                          onChange={(e) => handleQuestionTextChange(qIdx, e.target.value)}
                          className="mb-3 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                        />

                        {/* 4 phương án */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {q.options.map((opt) => (
                            <div
                              key={opt.id}
                              className={`flex items-center gap-2 rounded-lg border p-1.5 transition-colors ${
                                q.correctOptionId === opt.id
                                  ? "border-emerald-500 bg-emerald-50/40 dark:border-emerald-700 dark:bg-emerald-950/30"
                                  : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950"
                              }`}
                            >
                              <input
                                type="radio"
                                name={`correct-${q.id}`}
                                checked={q.correctOptionId === opt.id}
                                onChange={() => handleCorrectOptionChange(qIdx, opt.id)}
                                className="h-4 w-4 cursor-pointer text-emerald-600 focus:ring-emerald-500"
                                title="Tick chọn đây là đáp án đúng"
                              />
                              <span className="text-xs font-bold uppercase text-slate-500">
                                {opt.id}.
                              </span>
                              <input
                                type="text"
                                placeholder={`Đáp án ${opt.id.toUpperCase()}`}
                                value={opt.text}
                                onChange={(e) =>
                                  handleOptionTextChange(qIdx, opt.id, e.target.value)
                                }
                                className="w-full bg-transparent text-xs text-slate-900 outline-hidden dark:text-white"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={handleAddQuestion}
                      className="w-full rounded-xl border border-dashed border-indigo-300 py-2 text-xs font-bold text-indigo-600 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-400 dark:hover:bg-indigo-950/30"
                    >
                      + Thêm câu hỏi trắc nghiệm
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-lg bg-red-50 p-2.5 text-xs text-red-600 dark:bg-red-950/40 dark:text-red-300"
            >
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 border-t border-slate-200 bg-slate-50 px-6 py-3.5 dark:border-slate-800 dark:bg-[#0f172a]">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700"
          >
            + Tạo &amp; Thêm vào chương
          </button>
        </div>
      </div>
    </div>
  );
}
