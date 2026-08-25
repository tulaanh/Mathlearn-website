"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { DocumentBlock, DocumentFormBlock, DocumentType, StudyDocument } from "@/lib/document-types";
import type { EditorPreset } from "@/lib/document-templates";
import DocumentEditorFields from "./DocumentEditorFields";
import DocumentTemplatePicker from "./DocumentTemplatePicker";
import DocumentJsonTools from "./DocumentJsonTools";
import DocumentPreviewModal from "./DocumentPreviewModal";

/** Gán định danh ổn định cho khối để thu gọn/sắp xếp không bị lệch khi danh sách thay đổi */
function withKey(block: DocumentFormBlock): DocumentFormBlock {
  return { ...block, keyId: block.keyId ?? crypto.randomUUID() };
}

const STANDARD_OPTION_IDS = ["a", "b", "c", "d", "e", "f"];

/** Chuẩn hóa option ID của câu trắc nghiệm: chuyển UUID → "a","b","c","d"
 *  để nhất quán với QuizEditor và các component khác. */
function normalizeMcqQuestions(questions: import("@/lib/document-types").QuizQuestion[]): import("@/lib/document-types").QuizQuestion[] {
  return questions.map((q) => {
    if (q.type !== "multiple_choice" || !q.options || q.options.length === 0) return q;

    // Nếu options đã dùng ID chuẩn thì bỏ qua
    const alreadyStandard = q.options.every((o, i) => o.id === STANDARD_OPTION_IDS[i]);
    if (alreadyStandard) return q;

    // Tìm vị trí đáp án đúng trước khi đổi ID
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

/** Chuyển blocks đã lưu trong DB về dạng form để sửa */
function toFormBlocks(blocks: DocumentBlock[]): DocumentFormBlock[] {
  return blocks.map((b) => {
    if (b.type === "text") return withKey({ type: "text", content: b.content });
    if (b.type === "image") return withKey({ type: "image", file: null, altText: b.altText, caption: b.caption ?? "", storagePath: b.storagePath });
    if (b.type === "lesson") return withKey({ type: "lesson", title: b.title, description: b.description ?? "", content: b.content });
    return withKey({ type: "quiz", title: b.title, description: b.description ?? "", questions: normalizeMcqQuestions(b.questions) });
  });
}

export type TestOption = { id: string; title: string; grade: string };

export default function DocumentEditor({ initialData, testOptions = [] }: { initialData?: StudyDocument; testOptions?: TestOption[] }) {
  const router = useRouter();
  const [title, setTitle] = useState(initialData?.title ?? ""); 
  const [description, setDescription] = useState(initialData?.description ?? ""); 
  const [grade, setGrade] = useState(initialData?.grade ?? "Lớp 8"); 
  const [status, setStatus] = useState<"draft" | "published">(initialData?.status ?? "draft");
  const [documentType, setDocumentType] = useState<DocumentType>(initialData?.documentType ?? "normal");
  const [selectedTopics, setSelectedTopics] = useState<string[]>(() => initialData?.topics.map((t) => t.id) ?? []); 
  const [blocks, setBlocks] = useState<DocumentFormBlock[]>(() =>
    initialData ? toFormBlocks(initialData.blocks) : [withKey({ type: "text", content: "" })],
  );
  const [attachedTestIds, setAttachedTestIds] = useState<string[]>(initialData?.attachedTestIds ?? []);
  const [error, setError] = useState(""); 
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Nạp dữ liệu từ mẫu có sẵn hoặc mã JSON (thay thế toàn bộ nội dung đang soạn)
  const applyPreset = (preset: EditorPreset) => {
    setTitle(preset.title);
    setDescription(preset.description);
    setGrade(preset.grade);
    setStatus(preset.status);
    setDocumentType(preset.documentType ?? "normal");
    setSelectedTopics(preset.selectedTopics);
    setBlocks(preset.blocks.length ? preset.blocks.map((b) => {
      const keyed = withKey(b);
      if (keyed.type === "quiz") return { ...keyed, questions: normalizeMcqQuestions(keyed.questions) };
      return keyed;
    }) : [withKey({ type: "text", content: "" })]);
  };

  const currentPreset: EditorPreset = { title, description, grade, status, documentType, selectedTopics, blocks };

  
  // Các callback giữ identity ổn định qua các lượt render để các block editor memo hóa không phải re-render
  const toggleTopic = useCallback((id: string) => setSelectedTopics(v => v.includes(id) ? v.filter(x => x !== id) : [...v, id]), []);
  const toggleAttachedTest = useCallback((id: string) => setAttachedTestIds(v => v.includes(id) ? v.filter(x => x !== id) : [...v, id]), []);
  const updateBlock = useCallback((i: number, v: Partial<DocumentFormBlock>) => setBlocks(a => a.map((b, n) => n === i ? { ...b, ...v } as DocumentFormBlock : b)), []);
  const patchBlock = useCallback((i: number, patch: (block: DocumentFormBlock) => DocumentFormBlock) => setBlocks(a => a.map((b, n) => n === i ? patch(b) : b)), []);
  const addText = useCallback(() => setBlocks(a => [...a, withKey({ type: "text", content: "" })]), []);
  const addImage = useCallback(() => setBlocks(a => [...a, withKey({ type: "image", file: null, altText: "", caption: "" })]), []);
  const addLesson = useCallback(() => setBlocks(a => [...a, withKey({ type: "lesson", title: "", description: "", content: "" })]), []);
  const addQuiz = () => setBlocks(a => [...a, withKey({
    type: "quiz",
    title: "",
    description: "",
    questions: [{
      id: "q1",
      text: "",
      type: "multiple_choice",
      options: [
        { id: "a", text: "" },
        { id: "b", text: "" },
        { id: "c", text: "" },
        { id: "d", text: "" }
      ],
      correctOptionId: "a",
       points: 1
    }]
  })]);
  const removeBlock = useCallback((i: number) => setBlocks(a => a.filter((_, n) => n !== i)), []);
  // Đổi thứ tự khối lên/xuống (dùng bởi các nút ↑ ↓ trong trình soạn thảo)
  const moveBlock = useCallback((i: number, dir: -1 | 1) => setBlocks(a => {
    const j = i + dir;
    if (j < 0 || j >= a.length) return a;
    const next = [...a];
    [next[i], next[j]] = [next[j], next[i]];
    return next;
  }), []);

  async function submit(e: FormEvent) {
    e.preventDefault(); setError("");
    if (!title.trim()) return setError("Vui lòng nhập tên tài liệu.");
    if (!blocks.length) return setError("Tài liệu cần ít nhất một phần nội dung.");
    // Bài kiểm tra phải có ít nhất một khối câu hỏi hợp lệ để hệ thống chấm điểm
    if (documentType === "test") {
      const hasValidQuiz = blocks.some((b) =>
        b.type === "quiz" &&
        b.title.trim() &&
        b.questions.some((q) => {
          if (!q.text.trim()) return false;
          const t = q.type || "multiple_choice";
          if (t === "multiple_choice") return (q.options ?? []).filter((o) => o.text.trim()).length >= 2;
          if (t === "true_false") return (q.statements ?? []).length > 0;
          return true;
        }),
      );
      if (!hasValidQuiz) return setError("Bài kiểm tra cần ít nhất một khối 🧩 Câu hỏi hợp lệ (có tiêu đề khối, nội dung câu hỏi và đáp án).");
    }
    // Khối ảnh hợp lệ khi: đã chọn file mới (đúng loại, ≤ 5MB) HOẶC tái dùng ảnh đã có trên Storage
    for (const [i, b] of blocks.entries()) {
      if (b.type !== "image" || b.storagePath) continue;
      if (!b.file || !["image/jpeg", "image/png", "image/webp"].includes(b.file.type) || b.file.size > 5 * 1024 * 1024) {
        const tenAnh = b.sourceName ? ` ("${b.sourceName}"` : "";
        return setError(
          `Ảnh ở phần ${i + 1}${tenAnh ? tenAnh + ")" : ""} chưa có file hợp lệ.` +
            (b.sourceName
              ? ` Ảnh này được tham chiếu trong file LaTeX nhưng chưa được chọn kèm khi tải lên — hãy bấm "Chọn file" ở khối ảnh đó và chọn ${b.sourceName} từ thư mục chứa file .tex, hoặc xóa khối ảnh này đi.`
              : " Ảnh phải là JPG, PNG hoặc WebP và không quá 5 MB."),
        );
      }
    }
    const supabase = createClient(); if (!supabase) return setError("Website chưa được cấu hình Supabase."); setSaving(true);
    try {
    const { data: { user } } = await supabase.auth.getUser(); if (!user) { setError("Phiên đăng nhập đã hết. Hãy đăng nhập lại."); setSaving(false); return; }
    // Bài kiểm tra đính kèm chỉ áp dụng cho tài liệu học tập
    let targetDocId = initialData?.id;
    if (initialData) {
      const { error: updateError } = await supabase.from("documents").update({
        title: title.trim(), description: description.trim() || null, grade, document_type: documentType, status,
      }).eq("id", initialData.id);
      if (updateError) { setError(updateError.message); setSaving(false); return; }
    } else {
      const { data: doc, error: docError } = await supabase.from("documents").insert({ title: title.trim(), description: description.trim() || null, subject: "Toán", grade, document_type: documentType, status, created_by: user.id }).select("id").single();
      if (docError || !doc) { setError(docError?.message ?? "Không thể tạo tài liệu."); setSaving(false); return; }
      targetDocId = doc.id;
    }
    if (initialData) {
      // Chế độ sửa: thay toàn bộ khối nội dung và chủ đề
      const { error: delBlocksError } = await supabase.from("document_blocks").delete().eq("document_id", targetDocId);
      if (delBlocksError) { setError(`Không thể cập nhật nội dung: ${delBlocksError.message}`); setSaving(false); return; }
      const { error: delTopicsError } = await supabase.from("document_topics").delete().eq("document_id", targetDocId);
      if (delTopicsError) { setError(`Không thể cập nhật chủ đề: ${delTopicsError.message}`); setSaving(false); return; }
    }
    // Đồng bộ bài kiểm tra đính kèm: xóa hết rồi chèn lại theo thứ tự đã chọn
    const document_id = targetDocId!;
    const { error: delAttachedError } = await supabase.from("document_attached_tests").delete().eq("document_id", document_id);
    if (delAttachedError) { setError(`Không thể cập nhật bài kiểm tra đính kèm: ${delAttachedError.message}`); setSaving(false); return; }
    const attachedTestIdsValue = documentType === "normal" ? attachedTestIds : [];
    if (attachedTestIdsValue.length) {
      const attachResult = await supabase.from("document_attached_tests").insert(
        attachedTestIdsValue.map((test_id, i) => ({ document_id, test_id, position: i })),
      );
      if (attachResult.error) { setError(`Không thể lưu bài kiểm tra đính kèm: ${attachResult.error.message}`); setSaving(false); return; }
    }
    const rows: Record<string, unknown>[] = [];
    for (const [i, b] of blocks.entries()) {
      if (b.type === "text") {
        if (b.content.trim()) rows.push({ document_id, block_type: "text", content: b.content, position: i });
        continue;
      }
      if (b.type === "image") {
        // Ảnh tái dùng từ Storage (ví dụ nhập JSON có storagePath): không tải lên lại
        if (!b.file && b.storagePath) {
          rows.push({ document_id, block_type: "image", storage_path: b.storagePath, alt_text: b.altText.trim() || "Hình ảnh tài liệu Toán", caption: b.caption.trim() || null, position: i });
          continue;
        }
        const file = b.file!;
        const path = `${user.id}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
        const upload = await supabase.storage.from("document-images").upload(path, file, { contentType: file.type });
        if (upload.error) { setError(`Không thể tải ảnh lên: ${upload.error.message}`); setSaving(false); return; }
        rows.push({ document_id, block_type: "image", storage_path: path, alt_text: b.altText.trim() || "Hình ảnh tài liệu Toán", caption: b.caption.trim() || null, position: i });
        continue;
      }
      if (b.type === "lesson") {
        if (b.title.trim() && b.content.trim()) {
          rows.push({
            document_id,
            block_type: "lesson",
            title: b.title.trim(),
            description: b.description?.trim() || null,
            content: b.content.trim(),
            position: i
          });
        }
        continue;
      }
      if (b.type === "quiz") {
        // Tải ảnh của từng câu hỏi lên Storage nếu có
        for (const q of b.questions) {
          if (q.imageFile) {
            const file = q.imageFile;
            const path = `${user.id}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
            const upload = await supabase.storage.from("document-images").upload(path, file, { contentType: file.type });
            if (upload.error) {
              setError(`Không thể tải ảnh câu hỏi lên: ${upload.error.message}`);
              setSaving(false);
              return;
            }
            q.imageStoragePath = path;
            delete q.imageFile;
          }
          if (q.explanationImageFile) {
            const file = q.explanationImageFile;
            const path = `${user.id}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
            const upload = await supabase.storage.from("document-images").upload(path, file, { contentType: file.type });
            if (upload.error) {
              setError(`Không thể tải ảnh lời giải lên: ${upload.error.message}`);
              setSaving(false);
              return;
            }
            q.explanationImageStoragePath = path;
            delete q.explanationImageFile;
          }
          if (q.explanationImages && q.explanationImages.length > 0) {
            for (const item of q.explanationImages) {
              if (item.file) {
                const file = item.file;
                const path = `${user.id}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
                const upload = await supabase.storage.from("document-images").upload(path, file, { contentType: file.type });
                if (upload.error) {
                  setError(`Không thể tải ảnh lời giải lên: ${upload.error.message}`);
                  setSaving(false);
                  return;
                }
                item.storagePath = path;
                delete item.file;
              }
            }
          }
        }

        // Làm sạch dữ liệu trước khi lưu theo từng loại câu hỏi
        const cleanedQuestions = b.questions
          .filter((q) => q.text.trim())
          .map((q) => {
            const qType = q.type || "multiple_choice";
            const imageFields = {
              ...(q.imageStoragePath ? { imageStoragePath: q.imageStoragePath } : {}),
              ...(q.imageCaption?.trim() ? { imageCaption: q.imageCaption.trim() } : {}),
              ...(q.imageUrl ? { imageUrl: q.imageUrl } : {}),
              ...(q.explanationImageStoragePath ? { explanationImageStoragePath: q.explanationImageStoragePath } : {}),
              ...(q.explanationImageCaption?.trim() ? { explanationImageCaption: q.explanationImageCaption.trim() } : {}),
              ...(q.explanationImageUrl ? { explanationImageUrl: q.explanationImageUrl } : {}),
              ...(q.explanationImages && q.explanationImages.length > 0
                ? {
                    explanationImages: q.explanationImages.map((img) => ({
                      ...(img.storagePath ? { storagePath: img.storagePath } : {}),
                      ...(img.caption?.trim() ? { caption: img.caption.trim() } : {}),
                      ...(img.url ? { url: img.url } : {}),
                    })),
                  }
                : {}),
            };

            if (qType === "multiple_choice") {
              const options = (q.options || []).filter((o) => o.text.trim());
              return {
                id: q.id,
                type: qType,
                text: q.text.trim(),
                options,
                correctOptionId: options.some((o) => o.id === q.correctOptionId) ? q.correctOptionId : options[0]?.id ?? "a",
                points: q.points ?? 1,
                ...(q.explanation?.trim() ? { explanation: q.explanation.trim() } : {}),
                ...imageFields,
              };
            }
            if (qType === "true_false") {
              const source = q.statements ?? q.options ?? [];
              const statements = source
                .map((s, idx) => ({
                  id: s.id || `s-${idx + 1}`,
                  text: s.text.trim(),
                  correctVal: s.correctVal === "false" ? ("false" as const) : ("true" as const),
                }))
                .filter((s) => s.text);
              return {
                id: q.id,
                type: qType,
                text: q.text.trim(),
                statements,
                points: q.points ?? 1,
                ...(q.trueFalsePoints ? { trueFalsePoints: q.trueFalsePoints } : {}),
                ...(q.explanation?.trim() ? { explanation: q.explanation.trim() } : {}),
                ...imageFields,
              };
            }
            if (qType === "short_answer") {
              return {
                id: q.id,
                type: qType,
                text: q.text.trim(),
                correctAnswer: (q.correctAnswer || "").trim(),
                points: q.points ?? 1,
                ...(q.explanation?.trim() ? { explanation: q.explanation.trim() } : {}),
                ...imageFields,
              };
            }
            // essay
            return {
              id: q.id,
              type: qType,
              text: q.text.trim(),
              ...(q.explanation?.trim() ? { explanation: q.explanation.trim() } : {}),
              ...imageFields,
            };
          })
          .filter((q) => {
            if (q.type === "multiple_choice") {
              return (q.options || []).length >= 2;
            }
            if (q.type === "true_false") {
              return (q.statements || []).length > 0;
            }
            return true;
          });

        if (b.title.trim() && cleanedQuestions.length > 0) {
          rows.push({
            document_id,
            block_type: "quiz",
            title: b.title.trim(),
            description: b.description?.trim() || null,
            content: JSON.stringify(cleanedQuestions),
            position: i
          });
        }
        continue;
      }
    }
    if (rows.length === 0) { setError("Tài liệu chưa có khối nội dung hợp lệ nào để lưu."); setSaving(false); return; }
    const blockResult = await supabase.from("document_blocks").insert(rows); if (blockResult.error) { setError(`Không thể lưu nội dung: ${blockResult.error.message}`); setSaving(false); return; }
    if (selectedTopics.length) { const topicResult = await supabase.from("document_topics").insert(selectedTopics.map(topic_id => ({ document_id, topic_id }))); if (topicResult.error) { setError(`Không thể lưu chủ đề: ${topicResult.error.message}`); setSaving(false); return; } }
    router.push("/quan-ly/tai-lieu"); router.refresh();
    } catch (err) {
      // Bất kỳ lỗi ngoại lệ nào (mạng, Supabase SDK...) cũng phải hiện rõ thay vì treo nút "Đang lưu..."
      console.error("Lỗi khi lưu tài liệu:", err);
      setError(`Đã xảy ra lỗi khi lưu tài liệu: ${(err as Error).message}. Nội dung đang soạn vẫn còn trên trang — hãy thử bấm lưu lại.`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-6">
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
        testOptions={testOptions}
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
      
      {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">{error}</p>}
      
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={() => setShowPreview(true)} className="rounded-xl border border-indigo-300 bg-white px-5 py-3 text-sm font-bold text-indigo-600 hover:bg-indigo-50 dark:border-indigo-800 dark:bg-slate-900 dark:text-indigo-300 dark:hover:bg-indigo-950/40">
          👁 Xem trước
        </button>
        <button disabled={saving} className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white disabled:opacity-60">
          {saving ? "Đang lưu..." : initialData ? "Lưu thay đổi" : status === "published" ? "Đăng tài liệu" : "Lưu bản nháp"}
        </button>
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
    </form>
  );
}
