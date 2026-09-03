"use client";

import { useState, useRef, ChangeEvent, DragEvent } from "react";
import type { EditorPreset } from "@/lib/document-templates";
import { parseDocumentJson, serializeDocumentJson, SAMPLE_DOCUMENT_JSON } from "@/lib/document-json";
import { parseLatexToPreset, SAMPLE_DOCUMENT_LATEX } from "@/lib/latex-parser";
import { isAcceptedImageFile, matchImagesToPreset } from "@/lib/tex-image-match";
import { JSON_FORMAT_HINT, LATEX_SYNTAX_HINT, TOPIC_IDS_HINT } from "@/lib/document-template-hints";

type Props = {
  /** Trạng thái hiện tại của trình soạn thảo (để xuất JSON). */
  preset: EditorPreset;
  /** Nạp dữ liệu mới vào trình soạn thảo (từ LaTeX / JSON hợp lệ). */
  onApply: (preset: EditorPreset) => void;
};

type InputMode = "auto" | "latex" | "json";
type GuideTab = "latex" | "json";

/** Trạng thái nhập .tex còn ảnh chưa ghép được — chờ người dùng chọn thêm ảnh. */
type TexImportState = {
  sourceTitle: string;
  preset: EditorPreset;
  matched: number;
  total: number;
  missing: string[];
};

/** Nhập/xuất tài liệu hỗ trợ cả định dạng LaTeX (.tex) và JSON (.json). */
export default function DocumentJsonTools({ preset, onApply }: Props) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<InputMode>("auto");
  const [inputCode, setInputCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [texImport, setTexImport] = useState<TexImportState | null>(null);
  const [guideTab, setGuideTab] = useState<GuideTab>("latex");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const readFileAsText = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => resolve(String(event.target?.result ?? ""));
      reader.onerror = () => reject(new Error("Không thể đọc file từ máy tính."));
      reader.readAsText(file, "UTF-8");
    });

  const applyTexPreset = (sourceTitle: string, p: EditorPreset, matched: number, total: number) => {
    if (
      !window.confirm(
        `Đã phân tích xong nội dung LaTeX "${p.title || sourceTitle}". Nạp dữ liệu này sẽ THAY THẾ toàn bộ nội dung đang soạn. Tiếp tục?`,
      )
    ) {
      return;
    }
    onApply(p);
    const imageNote = total > 0 ? `, kèm ${matched}/${total} ảnh` : "";
    setSuccess(`Đã nạp tài liệu "${p.title}" thành công! (${p.blocks.length} khối nội dung${imageNote})`);
    setTexImport(null);
  };

  const processTexFile = async (file: File, imageFiles: File[]) => {
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      const content = await readFileAsText(file);
      setInputCode(content);
      const result = parseLatexToPreset(content);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      const report = matchImagesToPreset(result.data, imageFiles);
      if (report.missing.length === 0) {
        applyTexPreset(file.name, result.data, report.matched, report.total);
      } else {
        // Còn ảnh chưa ghép được: giữ lại preset, cho người dùng chọn thêm ảnh hoặc bấm nạp ngay
        setTexImport({ sourceTitle: file.name, preset: result.data, ...report });
      }
    } catch (e) {
      setError(`Không thể đọc file LaTeX: ${(e as Error).message}`);
    } finally {
      setBusy(false);
    }
  };

  const processJsonFile = async (file: File) => {
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      const content = await readFileAsText(file);
      setInputCode(content);
      const parsed = await parseDocumentJson(content);
      if (!parsed.ok) {
        setError(`File JSON không hợp lệ: ${parsed.error}`);
        return;
      }
      if (
        window.confirm(
          `Đã đọc file JSON "${parsed.data.title}". Nạp dữ liệu này sẽ THAY THẾ toàn bộ nội dung đang soạn. Tiếp tục?`,
        )
      ) {
        onApply(parsed.data);
        setSuccess(`Đã nạp file "${file.name}" ("${parsed.data.title}") thành công với ${parsed.data.blocks.length} khối nội dung.`);
      } else {
        const kbSize = (file.size / 1024).toFixed(1);
        setSuccess(`Đã nạp mã file "${file.name}" (${kbSize} KB) vào ô bên dưới. Bấm "Nạp vào trình soạn thảo" khi bạn sẵn sàng.`);
      }
    } catch (e) {
      setError(`Không thể xử lý file JSON: ${(e as Error).message}`);
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
      await processJsonFile(jsonFiles[0]);
      return;
    }
    setError("Vui lòng chọn file .tex (kèm các file ảnh nếu có) hoặc file .json.");
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

  /** Nhận diện định dạng của đoạn mã khi ở chế độ Auto */
  const detectFormat = (code: string): "latex" | "json" => {
    const trimmed = code.trim();
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      return "json";
    }
    if (
      trimmed.startsWith("\\") ||
      trimmed.includes("\\documentclass") ||
      trimmed.includes("\\doctitle") ||
      trimmed.includes("\\begin{") ||
      trimmed.includes("\\section")
    ) {
      return "latex";
    }
    // Nếu có chứa nhiều dấu ngoặc nhọn { } kiểu JSON:
    if (trimmed.includes('"version"') || trimmed.includes('"title"') || trimmed.includes('"blocks"')) {
      return "json";
    }
    return "latex";
  };

  /** Xử lý nạp mã nguồn từ ô textarea */
  async function importCode() {
    setError("");
    setSuccess("");
    const trimmed = inputCode.trim();
    if (!trimmed) {
      setError("Hãy dán mã LaTeX/JSON hoặc tải file từ máy tính lên trước khi nạp.");
      return;
    }

    setBusy(true);
    try {
      const selectedFormat = mode === "auto" ? detectFormat(trimmed) : mode;

      if (selectedFormat === "latex") {
        const result = parseLatexToPreset(trimmed);
        if (!result.ok) {
          setError(result.error);
          return;
        }
        const report = matchImagesToPreset(result.data, []);
        if (report.missing.length === 0) {
          applyTexPreset("Mã LaTeX", result.data, report.matched, report.total);
        } else {
          setTexImport({ sourceTitle: "Mã LaTeX trực tiếp", preset: result.data, ...report });
        }
      } else {
        const result = await parseDocumentJson(trimmed);
        if (!result.ok) {
          setError(`Mã JSON không đúng cấu trúc: ${result.error}`);
          return;
        }
        if (!window.confirm(`Nạp tài liệu "${result.data.title}" sẽ THAY THẾ toàn bộ nội dung đang soạn. Tiếp tục?`)) {
          return;
        }
        onApply(result.data);
        setSuccess(`Đã nạp thành công "${result.data.title}" với ${result.data.blocks.length} khối nội dung từ JSON.`);
      }
    } catch (err) {
      setError(`Lỗi khi xử lý dữ liệu: ${(err as Error).message}`);
    } finally {
      setBusy(false);
    }
  }

  async function exportJson() {
    setError("");
    setSuccess("");
    setBusy(true);
    try {
      const json = await serializeDocumentJson(preset);
      setInputCode(json);
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
      setSuccess("Đã xuất tài liệu ra file JSON và tải về máy — nội dung cũng được hiển thị trong ô bên dưới.");
    } catch (e) {
      setError(`Không thể xuất JSON: ${(e as Error).message}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-2xl border border-indigo-200 bg-white p-5 shadow-sm transition-all dark:border-slate-700 dark:bg-slate-900 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white sm:text-lg">
              📄 Nhập / Xuất tài liệu (LaTeX & JSON)
            </h2>
            <span className="rounded-md bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
              .tex & .json
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Tải file <code className="font-semibold text-indigo-600 dark:text-indigo-400">.tex</code> / <code className="font-semibold text-indigo-600 dark:text-indigo-400">.json</code> từ máy tính hoặc dán trực tiếp mã LaTeX / JSON để tạo nhanh nội dung tài liệu.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="rounded-lg border border-slate-300 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          {open ? "▲ Thu gọn công cụ" : "▼ Mở công cụ nhập / xuất"}
        </button>
      </div>

      {open && (
        <div className="mt-5 space-y-4">
          {/* Khu vực Kéo thả & Chọn file */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
              isDragging
                ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 ring-2 ring-indigo-400/50"
                : "border-slate-300 hover:border-indigo-400 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800/60"
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
            <div className="flex flex-col items-center justify-center space-y-2 text-slate-600 dark:text-slate-300">
              <div className="rounded-full bg-indigo-100 p-3 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <p className="font-semibold text-slate-900 dark:text-white">
                Kéo thả file <span className="text-indigo-600 dark:text-indigo-400 font-bold">.tex</span> hoặc <span className="text-indigo-600 dark:text-indigo-400 font-bold">.json</span> (kèm các file ảnh) vào đây
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                hoặc click để chọn file từ máy tính — có thể chọn nhiều file cùng lúc (file .tex + các file ảnh)
              </p>
              <div className="mt-1 flex flex-wrap justify-center gap-1.5 text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-lg px-3 py-1 font-medium">
                💡 Mẹo: Khi dùng file LaTeX có ảnh, hãy chọn cùng lúc file .tex và các file ảnh (.png, .jpg) cùng thư mục để hệ thống tự động ghép ảnh.
              </div>
            </div>
          </div>

          {/* Bảng ghép ảnh LaTeX còn thiếu */}
          {texImport && (
            <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm dark:border-amber-800 dark:bg-amber-950/40">
              <p className="font-bold text-amber-900 dark:text-amber-200">
                Tài liệu LaTeX "{texImport.sourceTitle}" tham chiếu {texImport.total} ảnh — đã ghép được {texImport.matched}.
              </p>
              {texImport.missing.length > 0 && (
                <>
                  <p className="mt-2 text-amber-800 dark:text-amber-300 font-medium">
                    Chưa tìm thấy các ảnh sau trong lượt tải:
                  </p>
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
                  className="rounded-lg border border-amber-400 bg-white px-3.5 py-1.5 text-xs font-bold text-amber-800 hover:bg-amber-100 dark:border-amber-700 dark:bg-slate-900 dark:text-amber-300 dark:hover:bg-amber-900/40"
                >
                  📂 Chọn thêm ảnh từ máy
                </button>
                <button
                  type="button"
                  onClick={() =>
                    applyTexPreset(texImport.sourceTitle, texImport.preset, texImport.matched, texImport.total)
                  }
                  className="rounded-lg bg-amber-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-amber-700"
                >
                  ✅ Nạp ngay vào trình soạn thảo
                </button>
                <button
                  type="button"
                  onClick={() => setTexImport(null)}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300"
                >
                  Đóng
                </button>
              </div>
              <p className="mt-2 text-xs text-amber-700 dark:text-amber-400">
                Lưu ý: Ảnh chưa ghép sẽ giữ chỗ trống trong trình soạn thảo, bạn có thể bấm "Chọn file" để đính sau bất kỳ lúc nào trước khi lưu.
              </p>
            </div>
          )}

          {/* Khu vực Dán mã trực tiếp */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <span>Chế độ nhận diện mã:</span>
                <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 dark:border-slate-700 dark:bg-slate-800">
                  <button
                    type="button"
                    onClick={() => setMode("auto")}
                    className={`rounded-md px-2.5 py-1 text-xs font-bold transition-colors ${
                      mode === "auto"
                        ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-700 dark:text-white"
                        : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                    }`}
                  >
                    ✨ Tự động
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("latex")}
                    className={`rounded-md px-2.5 py-1 text-xs font-bold transition-colors ${
                      mode === "latex"
                        ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-700 dark:text-white"
                        : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                    }`}
                  >
                    📄 LaTeX (.tex)
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("json")}
                    className={`rounded-md px-2.5 py-1 text-xs font-bold transition-colors ${
                      mode === "json"
                        ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-700 dark:text-white"
                        : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                    }`}
                  >
                    📋 JSON (.json)
                  </button>
                </div>
              </div>
              {inputCode.trim() && (
                <button
                  type="button"
                  onClick={() => {
                    setInputCode("");
                    setError("");
                    setSuccess("");
                  }}
                  className="text-xs text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 font-medium"
                >
                  Xóa ô nhập
                </button>
              )}
            </div>

            <textarea
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              rows={7}
              spellCheck={false}
              placeholder={
                mode === "latex"
                  ? "Dán mã LaTeX tại đây (ví dụ: \\doctitle{Tên bài}, \\begin{lesson}..., \\begin{quiz}...)..."
                  : mode === "json"
                  ? 'Dán mã JSON tại đây (ví dụ: { "title": "Tên tài liệu", "blocks": [...] })...'
                  : "Hoặc dán trực tiếp mã LaTeX (\\doctitle, \\begin{lesson}...) hoặc mã JSON ({ ... }) tại đây..."
              }
              className="w-full rounded-xl border border-slate-300 bg-slate-50 p-3.5 font-mono text-xs leading-5 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:focus:bg-slate-900"
            />
          </div>

          {/* Các nút hành động */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={importCode}
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60"
            >
              <span>⚡</span>
              {busy ? "Đang phân tích..." : "Nạp vào trình soạn thảo"}
            </button>

            <button
              type="button"
              disabled={busy}
              onClick={() => {
                setInputCode(SAMPLE_DOCUMENT_LATEX);
                setMode("latex");
                setError("");
                setSuccess('Đã chèn mẫu LaTeX — hãy bấm "Nạp vào trình soạn thảo" để trải nghiệm.');
              }}
              className="rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:border-indigo-400 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-indigo-500"
            >
              📄 Chèn mẫu LaTeX
            </button>

            <button
              type="button"
              disabled={busy}
              onClick={() => {
                setInputCode(SAMPLE_DOCUMENT_JSON);
                setMode("json");
                setError("");
                setSuccess('Đã chèn mẫu JSON — hãy bấm "Nạp vào trình soạn thảo" để thử.');
              }}
              className="rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:border-indigo-400 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-indigo-500"
            >
              📋 Chèn mẫu JSON
            </button>

            <button
              type="button"
              disabled={busy}
              onClick={() => fileInputRef.current?.click()}
              className="rounded-xl border border-indigo-300 bg-indigo-50/70 px-3.5 py-2.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300 dark:hover:bg-indigo-900/50"
            >
              📂 Chọn file từ máy
            </button>

            <button
              type="button"
              disabled={busy}
              onClick={exportJson}
              className="rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 disabled:opacity-60 ml-auto"
            >
              ⬇ Xuất file JSON
            </button>
          </div>

          {/* Thông báo lỗi và thành công */}
          {error && (
            <pre
              role="alert"
              className="whitespace-pre-wrap rounded-xl border border-red-200 bg-red-50 p-4 font-sans text-xs sm:text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300"
            >
              {error}
            </pre>
          )}
          {success && (
            <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs sm:text-sm text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300 font-medium">
              {success}
            </p>
          )}

          {/* Hướng dẫn chi tiết & Cú pháp mẫu */}
          <details className="rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-400">
            <summary className="cursor-pointer font-bold text-slate-800 dark:text-slate-200 hover:text-indigo-600">
              📖 Hướng dẫn chi tiết cú pháp LaTeX & JSON
            </summary>

            <div className="mt-3 space-y-3">
              {/* Tab hướng dẫn */}
              <div className="flex border-b border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setGuideTab("latex")}
                  className={`px-3 py-1.5 text-xs font-bold border-b-2 transition-colors ${
                    guideTab === "latex"
                      ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                      : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400"
                  }`}
                >
                  Cú pháp LaTeX (.tex)
                </button>
                <button
                  type="button"
                  onClick={() => setGuideTab("json")}
                  className={`px-3 py-1.5 text-xs font-bold border-b-2 transition-colors ${
                    guideTab === "json"
                      ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                      : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400"
                  }`}
                >
                  Cấu trúc JSON (.json)
                </button>
              </div>

              {guideTab === "latex" ? (
                <div className="space-y-2">
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    File mẫu LaTeX hoàn chỉnh nằm tại:{" "}
                    <code className="rounded bg-slate-200 px-1.5 py-0.5 font-mono text-indigo-700 dark:bg-slate-800 dark:text-indigo-300">
                      templates/mau-tai-lieu.tex
                    </code>
                  </p>
                  <pre className="max-h-60 overflow-auto whitespace-pre rounded-lg bg-slate-900 p-3 font-mono text-[11px] leading-4 text-emerald-400 dark:bg-black">
                    {LATEX_SYNTAX_HINT}
                  </pre>
                  <ul className="list-disc pl-5 space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
                    <li>
                      <strong>Công thức Toán:</strong> Dùng <code>$công_thức$</code> cho công thức inline và <code>$$công_thức$$</code> cho khối công thức riêng.
                    </li>
                    <li>
                      <strong>Hình ảnh:</strong> Lệnh <code>\image{"{tỉ_lệ}{chú_thích}{tên_file.png}"}</code>. Khi tải lên, hãy chọn cùng lúc file .tex và các file ảnh.
                    </li>
                    <li>
                      <strong>Các dạng câu hỏi:</strong> Hỗ trợ Trắc nghiệm 4 đáp án (<code>mcq</code>), Đúng/Sai (<code>truefalse</code>), Trả lời ngắn (<code>shortanswer</code>), và Tự luận (<code>essay</code>).
                    </li>
                  </ul>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    File mẫu JSON hoàn chỉnh nằm tại:{" "}
                    <code className="rounded bg-slate-200 px-1.5 py-0.5 font-mono text-indigo-700 dark:bg-slate-800 dark:text-indigo-300">
                      templates/mau-tai-lieu.json
                    </code>
                  </p>
                  <pre className="max-h-60 overflow-auto whitespace-pre rounded-lg bg-slate-900 p-3 font-mono text-[11px] leading-4 text-sky-300 dark:bg-black">
                    {JSON_FORMAT_HINT}
                  </pre>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">{TOPIC_IDS_HINT}</p>
                </div>
              )}
            </div>
          </details>
        </div>
      )}
    </section>
  );
}
