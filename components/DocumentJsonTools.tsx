"use client";

import { useState, useRef, ChangeEvent, DragEvent } from "react";
import type { EditorPreset } from "@/lib/document-templates";
import { parseDocumentJson, serializeDocumentJson, SAMPLE_DOCUMENT_JSON } from "@/lib/document-json";
import { isAcceptedImageFile, matchImagesToPreset } from "@/lib/tex-image-match";

type Props = {
  /** Trạng thái hiện tại của trình soạn thảo (để xuất JSON). */
  preset: EditorPreset;
  /** Nạp dữ liệu mới vào trình soạn thảo (từ JSON hợp lệ). */
  onApply: (preset: EditorPreset) => void;
};

/** Trạng thái nhập .tex còn ảnh chưa ghép được — chờ người dùng chọn thêm ảnh. */
type TexImportState = {
  fileName: string;
  preset: EditorPreset;
  matched: number;
  total: number;
  missing: string[];
};

const FORMAT_HINT = `{
  "version": 1,
  "title": "Tên tài liệu (tối đa 200 ký tự)",
  "description": "Mô tả (tuỳ chọn)",
  "grade": "Lớp 8",
  "status": "draft",
  "documentType": "normal",
  "topicIds": ["phuong-trinh"],
  "blocks": [
    { "type": "text", "content": "Văn bản, hỗ trợ $LaTeX$" },
    { "type": "image", "altText": "Mô tả ảnh", "caption": "Chú thích",
      "dataUrl": "data:image/png;base64,..." },
    { "type": "lesson", "title": "Tiêu đề", "description": "Mô tả",
      "content": "Nội dung bài giảng" },
    { "type": "quiz", "title": "Tiêu đề", "questions": [
      { "type": "multiple_choice", "text": "Câu hỏi", "options": ["A", "B", "C", "D"], "correctIndex": 0, "points": 1 },
      { "type": "true_false", "text": "Đề bài chung", "statements": [
        { "text": "Mệnh đề 1", "correct": true }, { "text": "Mệnh đề 2", "correct": false },
        { "text": "Mệnh đề 3", "correct": true }, { "text": "Mệnh đề 4", "correct": false }
      ], "points": 1, "trueFalsePoints": [0, 0.1, 0.25, 0.5, 1], "explanation": "Giải thích" }
    ] }
  ]
}`;

const TOPIC_IDS_HINT =
  "topicIds hợp lệ: hang-dang-thuc, phan-tich-da-thuc, phan-thuc-dai-so, phuong-trinh, tam-giac-vuong.";

/** Công cụ nhập/xuất mã JSON cho trình soạn thảo tài liệu. */
export default function DocumentJsonTools({ preset, onApply }: Props) {
  const [open, setOpen] = useState(false);
  const [jsonText, setJsonText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [texImport, setTexImport] = useState<TexImportState | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const readFileAsText = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => resolve(String(event.target?.result ?? ""));
      reader.onerror = () => reject(new Error("Không thể đọc file từ máy tính."));
      reader.readAsText(file, "UTF-8");
    });

  const applyTexPreset = (fileName: string, preset: EditorPreset, matched: number, total: number) => {
    if (!window.confirm("Đã phân tích xong file LaTeX. Nạp dữ liệu này sẽ THAY THẾ toàn bộ nội dung đang soạn. Tiếp tục?")) return;
    onApply(preset);
    const imageNote = total > 0 ? `, kèm ${matched}/${total} ảnh` : "";
    setSuccess(`Đã nạp file LaTeX "${fileName}" thành công! (${preset.blocks.length} khối nội dung${imageNote})`);
    setTexImport(null);
  };

  const processTexFile = async (file: File, imageFiles: File[]) => {
    setBusy(true);
    try {
      const content = await readFileAsText(file);
      const { parseLatexToPreset } = await import("@/lib/latex-parser");
      const result = parseLatexToPreset(content);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      const report = matchImagesToPreset(result.data, imageFiles);
      if (report.missing.length === 0) {
        applyTexPreset(file.name, result.data, report.matched, report.total);
      } else {
        // Còn ảnh chưa ghép được: giữ lại preset, cho người dùng chọn thêm ảnh trước khi nạp
        setTexImport({ fileName: file.name, preset: result.data, ...report });
      }
    } catch (e) {
      setError(`Không thể đọc file LaTeX: ${(e as Error).message}`);
    } finally {
      setBusy(false);
    }
  };

  const processFiles = async (fileList: File[]) => {
    setError("");
    setSuccess("");

    const texFiles = fileList.filter((f) => f.name.toLowerCase().endsWith(".tex") || f.type === "application/x-tex");
    const imageFiles = fileList.filter(isAcceptedImageFile);
    const jsonFiles = fileList.filter((f) => f.name.toLowerCase().endsWith(".json") || f.type === "application/json");

    if (texFiles.length > 1) {
      setError("Chỉ chọn một file .tex duy nhất trong mỗi lần tải lên.");
      return;
    }
    if (texFiles.length === 1) {
      await processTexFile(texFiles[0], imageFiles);
      return;
    }
    if (jsonFiles.length > 0) {
      try {
        const content = await readFileAsText(jsonFiles[0]);
        setJsonText(content);
        const kbSize = (jsonFiles[0].size / 1024).toFixed(1);
        setSuccess(`Đã đọc file "${jsonFiles[0].name}" (${kbSize} KB). Bấm "Nạp vào trình soạn thảo" bên dưới để áp dụng.`);
      } catch (e) {
        setError((e as Error).message);
      }
      return;
    }
    setError("Vui lòng chọn file .json hoặc .tex (kèm các file ảnh nếu có).");
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) processFiles([...files]);
    e.target.value = "";
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) processFiles([...files]);
  };

  const handleAddImages = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !texImport) return;
    const report = matchImagesToPreset(texImport.preset, [...files]);
    setTexImport({ ...texImport, ...report });
    e.target.value = "";
  };

  async function importJson() {
    setError("");
    setSuccess("");
    if (!jsonText.trim()) {
      setError("Hãy dán mã JSON hoặc tải file JSON từ máy tính lên trước khi nạp.");
      return;
    }
    setBusy(true);
    const result = await parseDocumentJson(jsonText);
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    if (!window.confirm("Nạp dữ liệu sẽ THAY THẾ toàn bộ nội dung đang soạn. Tiếp tục?")) return;
    onApply(result.data);
    setSuccess(`Đã nạp "${result.data.title}" với ${result.data.blocks.length} khối nội dung.`);
  }

  async function exportJson() {
    setError("");
    setSuccess("");
    setBusy(true);
    try {
      const json = await serializeDocumentJson(preset);
      setJsonText(json);
      const blob = new Blob([json], { type: "application/json;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = window.document.createElement("a");
      const slug =
        preset.title
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "") || "tai-lieu";
      link.href = url;
      link.download = `${slug}.json`;
      window.document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setSuccess("Đã xuất JSON và tải file về máy — nội dung cũng được điền vào ô bên trên.");
    } catch (e) {
      setError(`Không thể xuất JSON: ${(e as Error).message}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-bold dark:text-white">{"{ }"} Tạo từ mã / file JSON</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Tải file JSON từ máy tính lên hoặc dán mã JSON chuẩn để nạp tài liệu, hoặc xuất tài liệu ra file JSON.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-600 dark:border-slate-700 dark:text-slate-300"
        >
          {open ? "▲ Thu gọn" : "▼ Mở công cụ JSON"}
        </button>
      </div>

      {open && (
        <div className="mt-4 space-y-3">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`mt-4 border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragging ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30" : "border-slate-300 hover:border-indigo-400 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
            }`}
          >
            <input
              type="file"
              multiple
              accept=".json,.tex,image/jpeg,image/png,image/webp"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            <div className="flex flex-col items-center justify-center space-y-2 text-slate-600 dark:text-slate-400">
              <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="font-medium">Kéo thả file .json hoặc .tex (kèm các file ảnh) vào đây</p>
              <p className="text-sm">hoặc click để chọn file từ máy tính — chọn được nhiều file cùng lúc</p>
              <p className="text-xs text-amber-600 mt-2 font-medium">Mẹo: chọn file .tex cùng các file ảnh trong cùng thư mục để ảnh được tự động đính kèm.</p>
            </div>
          </div>

          {texImport && (
            <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm dark:border-amber-800 dark:bg-amber-950/40">
              <p className="font-bold text-amber-800 dark:text-amber-300">
                File LaTeX "{texImport.fileName}" tham chiếu {texImport.total} ảnh — đã ghép được {texImport.matched}.
              </p>
              {texImport.missing.length > 0 && (
                <>
                  <p className="mt-2 text-amber-700 dark:text-amber-400">Chưa tìm thấy các ảnh sau (thường nằm cùng thư mục với file .tex):</p>
                  <ul className="mt-1 list-disc space-y-0.5 pl-5 font-mono text-xs text-amber-800 dark:text-amber-300">
                    {texImport.missing.map((name) => (
                      <li key={name}>{name}</li>
                    ))}
                  </ul>
                </>
              )}
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                ref={imageInputRef}
                onChange={handleAddImages}
              />
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className="rounded-lg border border-amber-400 bg-white px-4 py-2 text-xs font-bold text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:bg-slate-900 dark:text-amber-300 dark:hover:bg-amber-900/40"
                >
                  📂 Chọn thêm ảnh
                </button>
                <button
                  type="button"
                  onClick={() => applyTexPreset(texImport.fileName, texImport.preset, texImport.matched, texImport.total)}
                  className="rounded-lg bg-amber-600 px-4 py-2 text-xs font-bold text-white hover:bg-amber-700"
                >
                  ✅ Nạp vào trình soạn thảo
                </button>
                <button
                  type="button"
                  onClick={() => setTexImport(null)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-bold text-slate-600 dark:border-slate-700 dark:text-slate-300"
                >
                  Hủy
                </button>
              </div>
              <p className="mt-2 text-xs text-amber-700 dark:text-amber-400">
                Ảnh chưa ghép sẽ giữ chỗ trống — bạn có thể đính sau ngay trong trình soạn thảo trước khi lưu.
              </p>
            </div>
          )}

          <textarea
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              rows={6}
              spellCheck={false}
              placeholder={'Hoặc dán mã JSON tại đây...'}
              className="w-full rounded-lg border border-slate-300 bg-slate-50 p-3 font-mono text-xs leading-5 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
          />

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => fileInputRef.current?.click()}
              className="rounded-lg border border-indigo-500 bg-indigo-50 px-4 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-100 dark:border-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 dark:hover:bg-indigo-900/50"
            >
              📂 Tải file (.json / .tex + ảnh) từ máy
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={importJson}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {busy ? "Đang xử lý..." : "Nạp vào trình soạn thảo"}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={exportJson}
              className="rounded-lg border border-indigo-300 px-4 py-2 text-xs font-bold text-indigo-600 dark:border-indigo-800 dark:text-indigo-400 disabled:opacity-60"
            >
              ⬇ Xuất JSON hiện tại
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                setJsonText(SAMPLE_DOCUMENT_JSON);
                setError("");
                setSuccess('Đã chèn ví dụ mẫu — bấm "Nạp vào trình soạn thảo" để thử.');
              }}
              className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-bold text-slate-600 dark:border-slate-700 dark:text-slate-300"
            >
              Chèn ví dụ mẫu
            </button>
          </div>
          {error && (
            <pre role="alert" className="whitespace-pre-wrap rounded-xl bg-red-50 p-4 font-sans text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
              {error}
            </pre>
          )}
          {success && (
            <p className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">{success}</p>
          )}
          <details className="rounded-lg border border-slate-200 p-3 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
            <summary className="cursor-pointer font-semibold">Cấu trúc mã JSON & Hướng dẫn tải file</summary>
            <pre className="mt-2 overflow-x-auto whitespace-pre font-mono leading-5">{FORMAT_HINT}</pre>
            <p className="mt-2">{TOPIC_IDS_HINT}</p>
            <p className="mt-1">
              Bạn có thể kéo thả file <code>.json</code> trực tiếp vào ô văn bản trên hoặc bấm <strong>"📂 Tải file JSON từ máy"</strong>.
            </p>
            <p className="mt-1">
              File mẫu đầy đủ nằm trong repo:{" "}
              <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">templates/mau-tai-lieu.json</code> — bạn có thể tải về,
              sửa nội dung rồi nạp vào website.
            </p>
            <p className="mt-1">
              Khối <code>image</code> chấp nhận <code>dataUrl</code> (base64 JPEG/PNG/WebP ≤ 5 MB) hoặc{" "}
              <code>storagePath</code> đã có trên Storage; nếu bỏ trống sẽ tạo chỗ trống để đính ảnh sau. Khi xuất, ảnh
              vừa chọn chỉ được nhúng base64 nếu ≤ 512 KB.
            </p>
          </details>
        </div>
      )}
    </section>
  );
}
