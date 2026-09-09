"use client";

import { useCallback, useState } from "react";
import type { DocumentFormBlock, DocumentType } from "@/lib/document-types";
import type { EditorPreset } from "@/lib/document-templates";
import type { StagedDocumentData } from "@/lib/staged-document-saver";
import DocumentEditorFields from "./DocumentEditorFields";
import DocumentTemplatePicker from "./DocumentTemplatePicker";
import DocumentJsonTools from "./DocumentJsonTools";
import DocumentPreviewModal from "./DocumentPreviewModal";

function withKey(block: DocumentFormBlock): DocumentFormBlock {
  return { ...block, keyId: block.keyId ?? crypto.randomUUID() };
}

const STANDARD_OPTION_IDS = ["a", "b", "c", "d", "e", "f"];

function normalizeMcqQuestions(
  questions: import("@/lib/document-types").QuizQuestion[],
): import("@/lib/document-types").QuizQuestion[] {
  return questions.map((q) => {
    if (q.type !== "multiple_choice" || !q.options || q.options.length === 0) return q;
    const alreadyStandard = q.options.every((o, i) => o.id === STANDARD_OPTION_IDS[i]);
    if (alreadyStandard) return q;

    const oldCorrectIdx = q.options.findIndex((o) => o.id === q.correctOptionId);
    const newOptions = q.options.map((o, i) => ({
      ...o,
      id: STANDARD_OPTION_IDS[i] ?? o.id,
    }));
    const newCorrectOptionId =
      oldCorrectIdx >= 0 && oldCorrectIdx < newOptions.length
        ? newOptions[oldCorrectIdx].id
        : newOptions[0]?.id ?? "a";
    return { ...q, options: newOptions, correctOptionId: newCorrectOptionId };
  });
}

interface DocumentFullEditorModalProps {
  open: boolean;
  onClose: () => void;
  defaultGrade?: string;
  onSaved: (doc: StagedDocumentData) => void;
}

export default function DocumentFullEditorModal({
  open,
  onClose,
  defaultGrade = "Lớp 8",
  onSaved,
}: DocumentFullEditorModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [grade, setGrade] = useState(defaultGrade);
  const [status, setStatus] = useState<"draft" | "published">("published");
  const [documentType, setDocumentType] = useState<DocumentType>("normal");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [blocks, setBlocks] = useState<DocumentFormBlock[]>([
    withKey({ type: "text", content: "" }),
  ]);
  const [attachedTestIds, setAttachedTestIds] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  const applyPreset = (preset: EditorPreset) => {
    setTitle(preset.title);
    setDescription(preset.description);
    setGrade(preset.grade);
    setStatus(preset.status);
    setDocumentType(preset.documentType ?? "normal");
    setSelectedTopics(preset.selectedTopics);
    setBlocks(
      preset.blocks.length
        ? preset.blocks.map((b) => {
            const keyed = withKey(b);
            if (keyed.type === "quiz") {
              return { ...keyed, questions: normalizeMcqQuestions(keyed.questions) };
            }
            return keyed;
          })
        : [withKey({ type: "text", content: "" })],
    );
  };

  const currentPreset: EditorPreset = {
    title,
    description,
    grade,
    status,
    documentType,
    selectedTopics,
    blocks,
  };

  const toggleTopic = useCallback(
    (id: string) =>
      setSelectedTopics((v) => (v.includes(id) ? v.filter((x) => x !== id) : [...v, id])),
    [],
  );
  const toggleAttachedTest = useCallback(
    (id: string) =>
      setAttachedTestIds((v) => (v.includes(id) ? v.filter((x) => x !== id) : [...v, id])),
    [],
  );
  const updateBlock = useCallback(
    (i: number, v: Partial<DocumentFormBlock>) =>
      setBlocks((a) =>
        a.map((b, n) => (n === i ? ({ ...b, ...v } as DocumentFormBlock) : b)),
      ),
    [],
  );
  const patchBlock = useCallback(
    (i: number, patch: (block: DocumentFormBlock) => DocumentFormBlock) =>
      setBlocks((a) => a.map((b, n) => (n === i ? patch(b) : b))),
    [],
  );
  const addText = useCallback(
    () => setBlocks((a) => [...a, withKey({ type: "text", content: "" })]),
    [],
  );
  const addImage = useCallback(
    () =>
      setBlocks((a) => [
        ...a,
        withKey({ type: "image", file: null, altText: "", caption: "" }),
      ]),
    [],
  );
  const addLesson = useCallback(
    () =>
      setBlocks((a) => [
        ...a,
        withKey({ type: "lesson", title: "", description: "", content: "" }),
      ]),
    [],
  );
  const addQuiz = () =>
    setBlocks((a) => [
      ...a,
      withKey({
        type: "quiz",
        title: "",
        description: "",
        questions: [
          {
            id: "q1",
            text: "",
            type: "multiple_choice",
            options: [
              { id: "a", text: "" },
              { id: "b", text: "" },
              { id: "c", text: "" },
              { id: "d", text: "" },
            ],
            correctOptionId: "a",
            points: 1,
          },
        ],
      }),
    ]);
  const removeBlock = useCallback(
    (i: number) => setBlocks((a) => a.filter((_, n) => n !== i)),
    [],
  );
  const moveBlock = useCallback(
    (i: number, dir: -1 | 1) =>
      setBlocks((a) => {
        const j = i + dir;
        if (j < 0 || j >= a.length) return a;
        const next = [...a];
        [next[i], next[j]] = [next[j], next[i]];
        return next;
      }),
    [],
  );

  if (!open) return null;

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!title.trim()) return setError("Vui lòng nhập tên tài liệu.");
    if (!blocks.length) return setError("Tài liệu cần ít nhất một phần nội dung.");

    if (documentType === "test") {
      const hasValidQuiz = blocks.some(
        (b) =>
          b.type === "quiz" &&
          b.title.trim() &&
          b.questions.some((q) => {
            if (!q.text.trim()) return false;
            const t = q.type || "multiple_choice";
            if (t === "multiple_choice")
              return (q.options ?? []).filter((o) => o.text.trim()).length >= 2;
            if (t === "true_false") return (q.statements ?? []).length > 0;
            return true;
          }),
      );
      if (!hasValidQuiz) {
        return setError(
          "Bài kiểm tra cần ít nhất một khối 🧩 Câu hỏi hợp lệ (có tiêu đề khối, nội dung câu hỏi và đáp án).",
        );
      }
    }

    const newDoc: StagedDocumentData = {
      tempId: `staged-doc-${crypto.randomUUID()}`,
      isNew: true,
      title: title.trim(),
      description: description.trim() || undefined,
      grade,
      documentType,
      status,
      blocks,
    };

    onSaved(newDoc);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={onClose} />
      <div className="relative flex max-h-[92vh] w-full max-w-4xl flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl transition-colors dark:border-slate-800 dark:bg-[#131b2e]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              📝 Soạn thảo tài liệu chi tiết
            </h2>
            <p className="text-xs text-slate-500">
              Tài liệu sẽ được lưu tạm và tự động gắn vào chương.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              className="rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-600 hover:bg-indigo-100 dark:border-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-400"
            >
              👁 Xem trước
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <DocumentTemplatePicker onApply={applyPreset} />
          <DocumentJsonTools preset={currentPreset} onApply={applyPreset} />
          <DocumentEditorFields
            title={title}
            description={description}
            grade={grade}
            status={status}
            documentType={documentType}
            setDocumentType={setDocumentType}
            selectedTopics={selectedTopics}
            blocks={blocks}
            attachedTestIds={attachedTestIds}
            toggleAttachedTest={toggleAttachedTest}
            testOptions={[]}
            targetQuestionId={null}
            setTitle={setTitle}
            setDescription={setDescription}
            setGrade={setGrade}
            setStatus={setStatus}
            toggleTopic={toggleTopic}
            updateBlock={updateBlock}
            patchBlock={patchBlock}
            addText={addText}
            addImage={addImage}
            addLesson={addLesson}
            addQuiz={addQuiz}
            removeBlock={removeBlock}
            moveBlock={moveBlock}
          />

          {error && (
            <p
              role="alert"
              className="rounded-xl bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300"
            >
              {error}
            </p>
          )}
        </div>

        {/* Sticky Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-3.5 dark:border-slate-800 dark:bg-[#0f172a]">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="rounded-xl bg-indigo-600 px-6 py-2 text-sm font-bold text-white shadow-sm hover:bg-indigo-700"
          >
            + Hoàn tất & Gắn vào chương
          </button>
        </div>
      </div>

      <DocumentPreviewModal
        open={showPreview}
        onClose={() => setShowPreview(false)}
        title={title}
        description={description}
        grade={grade}
        status={status}
        selectedTopics={selectedTopics}
        blocks={blocks}
      />
    </div>
  );
}
