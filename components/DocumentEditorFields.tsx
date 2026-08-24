"use client";
import { memo, useCallback, useState } from "react";
import type { DocumentFormBlock, DocumentType } from "@/lib/document-types";
import type { TestOption } from "./DocumentEditor";
import { topics } from "@/data/topics";
import QuizEditor from "./QuizEditor";

const grades = ["Lớp 6", "Lớp 7", "Lớp 8", "Lớp 9", "Lớp 10", "Lớp 11", "Lớp 12"];
type PatchBlock = (i: number, patch: (block: DocumentFormBlock) => DocumentFormBlock) => void;
type Props = {
  title: string;
  description: string;
  grade: string;
  status: "draft" | "published";
  documentType: DocumentType;
  setDocumentType: (v: DocumentType) => void;
  selectedTopics: string[];
  blocks: DocumentFormBlock[];
  attachedTestIds?: string[];
  toggleAttachedTest?: (v: string) => void;
  testOptions?: TestOption[];
  setTitle: (v: string) => void;
  setDescription: (v: string) => void;
  setGrade: (v: string) => void;
  setStatus: (v: "draft" | "published") => void;
  toggleTopic: (v: string) => void;
  updateBlock: (i: number, v: Partial<DocumentFormBlock>) => void;
  patchBlock: PatchBlock;
  addText: () => void;
  addImage: () => void;
  addLesson: () => void;
  addQuiz: () => void;
  moveBlock: (i: number, d: -1 | 1) => void;
  removeBlock: (i: number) => void;
};
const labels = { text: "📄 Văn bản", image: "🖼️ Hình ảnh", lesson: "📗 Bài giảng", quiz: "🧩 Câu hỏi" };

/** Gán định danh ổn định cho khối để thu gọn/sắp xếp không bị lệch khi danh sách thay đổi */
const blockKey = (b: DocumentFormBlock, i: number) => b.keyId ?? `b-${i}`;

const summary = (b: DocumentFormBlock) =>
  b.type === "text" ? b.content.split("\n")[0] || "(Trống)"
  : b.type === "image" ? (b.file?.name || b.storagePath || "Chưa chọn ảnh")
  : b.type === "lesson" ? (b.title || "(Chưa có tiêu đề)")
  : `${b.title || "(Chưa có tiêu đề)"} · ${b.questions.length} câu`;

/** Một khối nội dung: memo để gõ trong khối này không re-render các khối khác. */
const BlockItem = memo(function BlockItem({
  block: b,
  index: i,
  isLast,
  isClosed,
  toggle,
  updateBlock,
  patchBlock,
  moveBlock,
  removeBlock,
}: {
  block: DocumentFormBlock;
  index: number;
  isLast: boolean;
  isClosed: boolean;
  toggle: (k: string) => void;
  updateBlock: (i: number, v: Partial<DocumentFormBlock>) => void;
  patchBlock: PatchBlock;
  moveBlock: (i: number, d: -1 | 1) => void;
  removeBlock: (i: number) => void;
}) {
  const k = blockKey(b, i);
  return (
    <div className="overflow-hidden rounded-xl border dark:border-slate-700">
      <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 dark:bg-slate-800">
        <button type="button" onClick={() => toggle(k)} className="h-7 w-7 rounded border text-xs">{isClosed ? "▶" : "▼"}</button>
        <b className="rounded-full bg-purple-100 px-2 py-1 text-xs text-purple-700">{labels[b.type]}</b>
        {isClosed && <span className="min-w-0 flex-1 truncate text-xs text-slate-500">{summary(b)}</span>}
        {!isClosed && <span className="flex-1" />}
        <button type="button" disabled={!i} onClick={() => moveBlock(i, -1)} className="h-7 w-7 rounded border disabled:opacity-40">↑</button>
        <button type="button" disabled={isLast} onClick={() => moveBlock(i, 1)} className="h-7 w-7 rounded border disabled:opacity-40">↓</button>
        <button type="button" onClick={() => removeBlock(i)} className="h-7 w-7 rounded border text-red-600">✕</button>
      </div>
      {!isClosed && (
        <div className="p-4">
          {b.type === "text" && (
            <textarea value={b.content} onChange={e => updateBlock(i, { content: e.target.value })} rows={6} placeholder="Nhập nội dung văn bản... Hỗ trợ $LaTeX$" className="w-full rounded-lg border p-3 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
          )}
          {b.type === "image" && (
            <div className="space-y-3">
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={e => updateBlock(i, { file: e.target.files?.[0] ?? null })} className="block w-full text-sm dark:text-slate-300" />
              <input placeholder="Mô tả thay thế cho ảnh" value={b.altText} onChange={e => updateBlock(i, { altText: e.target.value })} className="h-10 w-full rounded-lg border px-3 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
              <input placeholder="Chú thích ảnh" value={b.caption} onChange={e => updateBlock(i, { caption: e.target.value })} className="h-10 w-full rounded-lg border px-3 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
            </div>
          )}
          {b.type === "lesson" && (
            <div className="space-y-3">
              <input placeholder="Tiêu đề bài giảng" value={b.title} onChange={e => updateBlock(i, { title: e.target.value })} className="h-11 w-full rounded-lg border px-3 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
              <input placeholder="Mô tả ngắn (tùy chọn)" value={b.description ?? ""} onChange={e => updateBlock(i, { description: e.target.value })} className="h-10 w-full rounded-lg border px-3 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
              <textarea placeholder="Nội dung bài giảng (Markdown + LaTeX)" value={b.content} onChange={e => updateBlock(i, { content: e.target.value })} rows={10} className="w-full rounded-lg border p-3 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
            </div>
          )}
          {b.type === "quiz" && <QuizEditor blockIndex={i} block={b} updateBlock={updateBlock} patchBlock={patchBlock} />}
        </div>
      )}
    </div>
  );
});

export default function DocumentEditorFields(p: Props) {
  const [closed, setClosed] = useState<Set<string>>(new Set());
  const toggle = useCallback((k: string) => setClosed(s => {
    const n = new Set(s);
    if (n.has(k)) n.delete(k);
    else n.add(k);
    return n;
  }), []);

  return <>
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900"><label className="block text-sm font-semibold dark:text-slate-200">{p.documentType === "test" ? "Tên bài kiểm tra" : "Tên tài liệu"}<input required value={p.title} onChange={e => p.setTitle(e.target.value)} className="mt-2 h-11 w-full rounded-xl border px-4 dark:border-slate-700 dark:bg-slate-950 dark:text-white" /></label><label className="mt-4 block text-sm font-semibold dark:text-slate-200">{p.documentType === "test" ? "Mô tả bài kiểm tra" : "Mô tả tài liệu"}<textarea value={p.description} onChange={e => p.setDescription(e.target.value)} rows={3} className="mt-2 w-full rounded-xl border p-3 dark:border-slate-700 dark:bg-slate-950 dark:text-white" /></label><div className="mt-4 grid gap-4 sm:grid-cols-2"><label className="text-sm font-semibold dark:text-slate-200">Khối lớp<select value={p.grade} onChange={e => p.setGrade(e.target.value)} className="mt-2 h-11 w-full rounded-xl border px-3 dark:border-slate-700 dark:bg-slate-950 dark:text-white">{grades.map(g => <option key={g}>{g}</option>)}</select></label><label className="text-sm font-semibold dark:text-slate-200">Trạng thái<select value={p.status} onChange={e => p.setStatus(e.target.value as "draft" | "published")} className="mt-2 h-11 w-full rounded-xl border px-3 dark:border-slate-700 dark:bg-slate-950 dark:text-white"><option value="draft">Lưu nháp</option><option value="published">Đăng công khai</option></select></label></div></section>
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900"><h2 className="font-bold dark:text-white">Loại nội dung</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Chọn cách hiển thị và mục đích sử dụng của nội dung.</p><div className="mt-4 grid gap-3 sm:grid-cols-2"><button type="button" onClick={() => p.setDocumentType("normal")} className={`rounded-xl border p-4 text-left transition ${p.documentType === "normal" ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200 dark:border-indigo-400 dark:bg-indigo-950/40 dark:ring-indigo-900" : "border-slate-200 hover:border-indigo-300 dark:border-slate-700"}`}><strong className="block dark:text-white">📚 Tài liệu học tập</strong><span className="mt-1 block text-xs font-normal text-slate-500 dark:text-slate-400">Nội dung để đọc và học theo chủ đề.</span></button><button type="button" onClick={() => p.setDocumentType("test")} className={`rounded-xl border p-4 text-left transition ${p.documentType === "test" ? "border-purple-500 bg-purple-50 ring-2 ring-purple-200 dark:border-purple-400 dark:bg-purple-950/40 dark:ring-purple-900" : "border-slate-200 hover:border-purple-300 dark:border-slate-700"}`}><strong className="block dark:text-white">📝 Bài kiểm tra</strong><span className="mt-1 block text-xs font-normal text-slate-500 dark:text-slate-400">Bài làm trên trình duyệt, chấm điểm thang 10.</span></button></div></section>
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900"><h2 className="font-bold dark:text-white">Gán chủ đề</h2><div className="mt-4 flex flex-wrap gap-2">{topics.map(t => <button type="button" key={t.id} onClick={() => p.toggleTopic(t.id)} className={`rounded-full px-3 py-2 text-xs font-semibold ${p.selectedTopics.includes(t.id) ? "bg-violet-600 text-white" : "border border-slate-300 dark:border-slate-700 dark:text-slate-300"}`}>{p.selectedTopics.includes(t.id) ? "✓ " : ""}{t.name}</button>)}</div></section>
    {p.documentType === "normal" && (
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900"><h2 className="font-bold dark:text-white">📝 Bài kiểm tra đính kèm (tùy chọn)</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Chọn một hoặc nhiều bài kiểm tra đã xuất bản để hiển thị nút làm bài ngay bên dưới nội dung tài liệu. Có thể bỏ trống nếu tài liệu không cần bài kiểm tra.</p>{(p.testOptions ?? []).length === 0 ? <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Chưa có bài kiểm tra nào đã xuất bản — hãy tạo và đăng bài kiểm tra trước.</p> : <div className="mt-4 flex flex-wrap gap-2">{(p.testOptions ?? []).map((t) => { const selected = (p.attachedTestIds ?? []).includes(t.id); return <button type="button" key={t.id} onClick={() => p.toggleAttachedTest?.(t.id)} className={`rounded-full px-3 py-2 text-xs font-semibold ${selected ? "bg-purple-600 text-white" : "border border-slate-300 text-slate-700 hover:border-purple-300 dark:border-slate-700 dark:text-slate-300"}`}>{selected ? "✓ " : ""}{t.title} ({t.grade})</button>; })}</div>}</section>
    )}
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900"><h2 className="font-bold dark:text-white">{p.documentType === "test" ? "Nội dung bài kiểm tra" : "Nội dung tài liệu"}</h2><p className="mt-1 text-sm text-slate-500">{p.documentType === "test" ? "Thêm khối câu hỏi để học sinh làm bài và nhận điểm thang 10." : "Dạng Đúng / Sai gồm một đề bài và nhiều mệnh đề."}</p><div className="mt-5 space-y-4">{p.blocks.map((b, i) => (
      <BlockItem
        key={blockKey(b, i)}
        block={b}
        index={i}
        isLast={i === p.blocks.length - 1}
        isClosed={closed.has(blockKey(b, i))}
        toggle={toggle}
        updateBlock={p.updateBlock}
        patchBlock={p.patchBlock}
        moveBlock={p.moveBlock}
        removeBlock={p.removeBlock}
      />
    ))}</div><div className="mt-5 flex flex-wrap justify-center gap-2 rounded-xl border border-indigo-200 bg-white/95 p-3 dark:border-indigo-900 dark:bg-slate-900"><button type="button" onClick={p.addText} className="rounded-lg border border-indigo-300 px-3 py-2 text-xs font-bold text-indigo-600">📄 Văn bản</button><button type="button" onClick={p.addImage} className="rounded-lg border border-sky-300 px-3 py-2 text-xs font-bold text-sky-600">🖼️ Hình ảnh</button><button type="button" onClick={p.addLesson} className="rounded-lg border border-green-300 px-3 py-2 text-xs font-bold text-green-600">📗 Bài giảng</button><button type="button" onClick={p.addQuiz} className="rounded-lg border border-purple-300 px-3 py-2 text-xs font-bold text-purple-600">🧩 Câu hỏi</button></div></section>
  </>;
}
