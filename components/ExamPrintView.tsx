"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { QuizQuestion, StudyDocument } from "@/lib/document-types";
import { getDocumentImageUrl } from "@/lib/document-url";
import { resolveQuestionImageSrc, resolveAllExplanationImages } from "@/lib/document-preview";
import MathText from "./MathText";

const OPTION_LETTERS = ["A", "B", "C", "D", "E", "F"];
const DEFAULT_EXAM_CODES = ["101", "102", "103", "104"];

type PrintMode = "student" | "solution" | "answer_key_only";
type HeaderStyle = "simple" | "exam" | "none";
type FontSize = "compact" | "normal" | "large";
type ShortAnswerStyle = "dots" | "box";

interface ExamPrintViewProps {
  document: StudyDocument;
  backUrl?: string;
  initialMode?: PrintMode;
  initialExamCode?: string;
}

/** PRNG giả ngẫu nhiên có hạt giống deterministic theo mã đề */
function seededRandom(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function stringToSeed(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) || 101;
}

function shuffleArray<T>(array: readonly T[], rng: () => number): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Xác định layout lựa chọn (1 dòng 4 cột, 2 dòng 2 cột hoặc 4 dòng 1 cột) dựa trên độ dài */
function getOptionGridClass(options: { text: string }[]) {
  if (!options || options.length === 0) return "space-y-1";
  const hasDisplayMath = options.some((o) => (o.text || "").includes("$$") || (o.text || "").includes("\n"));
  if (hasDisplayMath) return "space-y-1";

  const maxLen = Math.max(...options.map((o) => (o.text || "").length));
  if (maxLen <= 22 && options.length <= 4) {
    return "grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1";
  }
  if (maxLen <= 55 && options.length <= 4) {
    return "grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1";
  }
  return "space-y-1";
}

/** Lấy chữ cái đáp án đúng cho câu trắc nghiệm */
function getCorrectOptionLetter(q: QuizQuestion): string {
  const options = q.options ?? [];
  const idx = options.findIndex((o) => o.id === q.correctOptionId);
  if (idx >= 0) return OPTION_LETTERS[idx] ?? "?";
  return "?";
}

export default function ExamPrintView({
  document,
  backUrl,
  initialMode,
  initialExamCode,
}: ExamPrintViewProps) {
  // Trạng thái cấu hình in
  const [mode, setMode] = useState<PrintMode>(initialMode || "student");
  const [headerStyle, setHeaderStyle] = useState<HeaderStyle>("exam");
  const [showStudentInfo, setShowStudentInfo] = useState(true);
  const [showScoreBox, setShowScoreBox] = useState(true);
  const [showAnswerSheet, setShowAnswerSheet] = useState(false);
  const [showSummaryAnswers, setShowSummaryAnswers] = useState(initialMode === "solution");
  const [isTwoColumns, setIsTwoColumns] = useState(false);
  const [fontSize, setFontSize] = useState<FontSize>("normal");

  // Quản lý mã đề thi & xáo trộn
  const [examCode, setExamCode] = useState(initialExamCode || "101");
  const [shuffleQuestions, setShuffleQuestions] = useState(false);
  const [shuffleOptions, setShuffleOptions] = useState(false);
  const [showMasterKeyTable, setShowMasterKeyTable] = useState(false);

  // Tùy chọn trình bày nâng cao
  const [showPoints, setShowPoints] = useState(false);
  const [essayLines, setEssayLines] = useState<number>(4);
  const [shortAnswerStyle, setShortAnswerStyle] = useState<ShortAnswerStyle>("dots");

  // Tùy chỉnh thông tin đầu trang đề thi (khi dùng kiểu đề thi 2 cột)
  const [schoolName, setSchoolName] = useState("TRƯỜNG THPT: .......................................");
  const [examTitle, setExamTitle] = useState(document.title || "ĐỀ KIỂM TRA ĐỊNH KỲ");
  const [examTime, setExamTime] = useState("90 phút");
  const [examSubject, setExamSubject] = useState("TOÁN HỌC");
  const [examNote, setExamNote] = useState("(Thí sinh không được sử dụng tài liệu)");

  // Danh sách câu hỏi theo mã đề hiện tại (có xáo trộn deterministic nếu bật)
  const allQuestionsWithBlock = useMemo(() => {
    const shouldShuffle = (shuffleQuestions || shuffleOptions) && examCode !== "101_goc";
    const rng = shouldShuffle ? seededRandom(stringToSeed(examCode)) : () => 0.5;

    const list: { question: QuizQuestion; blockTitle?: string; blockIndex: number }[] = [];

    document.blocks.forEach((block, bIdx) => {
      if (block.type === "quiz") {
        let questions = (block.questions || []).filter((q) => q && q.text && q.text.trim());
        if (shuffleQuestions && shouldShuffle) {
          questions = shuffleArray(questions, rng);
        }
        questions.forEach((q) => {
          let options = q.options ?? [];
          if (shuffleOptions && shouldShuffle && (q.type === "multiple_choice" || !q.type) && options.length > 1) {
            options = shuffleArray(options, rng);
          }
          list.push({
            question: { ...q, options },
            blockTitle: block.title,
            blockIndex: bIdx,
          });
        });
      }
    });
    return list;
  }, [document.blocks, examCode, shuffleQuestions, shuffleOptions]);

  // Danh sách ma trận đáp án cho bảng tổng hợp 4 mã đề chính
  const masterKeyMatrix = useMemo(() => {
    if (!showMasterKeyTable) return null;
    const codes = DEFAULT_EXAM_CODES;

    return codes.map((code) => {
      const shouldShuffle = (shuffleQuestions || shuffleOptions) && code !== "101_goc";
      const rng = shouldShuffle ? seededRandom(stringToSeed(code)) : () => 0.5;

      const list: { question: QuizQuestion }[] = [];
      document.blocks.forEach((block) => {
        if (block.type === "quiz") {
          let questions = (block.questions || []).filter((q) => q && q.text && q.text.trim());
          if (shuffleQuestions && shouldShuffle) {
            questions = shuffleArray(questions, rng);
          }
          questions.forEach((q) => {
            let options = q.options ?? [];
            if (shuffleOptions && shouldShuffle && (q.type === "multiple_choice" || !q.type) && options.length > 1) {
              options = shuffleArray(options, rng);
            }
            list.push({ question: { ...q, options } });
          });
        }
      });

      return { code, questions: list };
    });
  }, [showMasterKeyTable, document.blocks, shuffleQuestions, shuffleOptions]);

  const totalQuestions = allQuestionsWithBlock.length;
  const isSolutionMode = mode === "solution";
  const isAnswerKeyOnly = mode === "answer_key_only";

  const resolvedBackUrl = backUrl || `/quiz/${document.id}`;

  const fontSizeClass = {
    compact: "text-xs leading-5",
    normal: "text-sm leading-6",
    large: "text-base leading-7",
  }[fontSize];

  /** Xử lý in và xóa title trang để trình duyệt không in dòng header mặc định (Bản in: ... / Ngày giờ) */
  function handlePrint() {
    const prevTitle = window.document.title;
    try {
      window.document.title = " ";
      window.print();
    } finally {
      window.setTimeout(() => {
        window.document.title = prevTitle;
      }, 800);
    }
  }

  return (
    <div className="mx-auto max-w-4xl print:max-w-none print:p-0">
      {/* ─── THANH CÔNG CỤ ĐIỀU KHIỂN (Ẩn hoàn toàn khi in) ─── */}
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm print:hidden dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
          <div>
            <Link
              href={resolvedBackUrl}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
            >
              ← Quay lại bài kiểm tra
            </Link>
            <h2 className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
              Tùy chọn In & Xuất PDF
            </h2>
          </div>
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700 active:scale-95"
          >
            🖨 In / Lưu PDF ngay
          </button>
        </div>

        {/* Chế độ in */}
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <button
            type="button"
            onClick={() => {
              setMode("student");
              setShowSummaryAnswers(false);
            }}
            className={`rounded-xl border p-3 text-left transition ${
              mode === "student"
                ? "border-indigo-500 bg-indigo-50/70 ring-2 ring-indigo-200 dark:border-indigo-400 dark:bg-indigo-950/40 dark:ring-indigo-900"
                : "border-slate-200 hover:border-slate-300 dark:border-slate-700"
            }`}
          >
            <strong className="block text-sm font-bold text-slate-900 dark:text-white">
              📄 Đề bài học sinh
            </strong>
            <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">
              Ẩn đáp án và giải thích, dùng để in phát đề làm trên giấy
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode("solution");
              setShowSummaryAnswers(true);
            }}
            className={`rounded-xl border p-3 text-left transition ${
              mode === "solution"
                ? "border-emerald-500 bg-emerald-50/70 ring-2 ring-emerald-200 dark:border-emerald-400 dark:bg-emerald-950/40 dark:ring-emerald-900"
                : "border-slate-200 hover:border-slate-300 dark:border-slate-700"
            }`}
          >
            <strong className="block text-sm font-bold text-slate-900 dark:text-white">
              📝 Kèm đáp án & Lời giải
            </strong>
            <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">
              Hiện đáp án đúng, lời giải chi tiết và ảnh minh họa
            </span>
          </button>

          <button
            type="button"
            onClick={() => setMode("answer_key_only")}
            className={`rounded-xl border p-3 text-left transition ${
              mode === "answer_key_only"
                ? "border-amber-500 bg-amber-50/70 ring-2 ring-amber-200 dark:border-amber-400 dark:bg-amber-950/40 dark:ring-amber-900"
                : "border-slate-200 hover:border-slate-300 dark:border-slate-700"
            }`}
          >
            <strong className="block text-sm font-bold text-slate-900 dark:text-white">
              🔑 Chỉ Bảng đáp án
            </strong>
            <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">
              Bảng ma trận đáp án nhanh (rút gọn, tiết kiệm giấy)
            </span>
          </button>
        </div>

        {/* ─── THANH CHỌN MÃ ĐỀ & XÁO TRỘN ĐỀ THI ─── */}
        <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/50 p-3.5 dark:border-indigo-950 dark:bg-indigo-950/20">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                🏷 Mã đề thi:
              </span>
              <div className="flex items-center gap-1.5">
                {DEFAULT_EXAM_CODES.map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setExamCode(code)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                      examCode === code
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    }`}
                  >
                    {code}
                  </button>
                ))}
                <input
                  type="text"
                  value={examCode}
                  onChange={(e) => setExamCode(e.target.value.trim().slice(0, 10))}
                  placeholder="Khác..."
                  title="Nhập mã đề tùy chọn"
                  className="h-7 w-16 rounded-lg border border-slate-300 bg-white px-1.5 text-center text-xs font-bold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <label className="flex cursor-pointer items-center gap-1.5">
                <input
                  type="checkbox"
                  checked={shuffleQuestions}
                  onChange={(e) => setShuffleQuestions(e.target.checked)}
                  className="h-4 w-4 rounded accent-indigo-600"
                />
                Xáo thứ tự câu hỏi
              </label>

              <label className="flex cursor-pointer items-center gap-1.5">
                <input
                  type="checkbox"
                  checked={shuffleOptions}
                  onChange={(e) => setShuffleOptions(e.target.checked)}
                  className="h-4 w-4 rounded accent-indigo-600"
                />
                Xáo đáp án (A, B, C, D)
              </label>

              {isAnswerKeyOnly && (
                <label className="flex cursor-pointer items-center gap-1.5 text-indigo-700 dark:text-indigo-400 font-bold">
                  <input
                    type="checkbox"
                    checked={showMasterKeyTable}
                    onChange={(e) => setShowMasterKeyTable(e.target.checked)}
                    className="h-4 w-4 rounded accent-indigo-600"
                  />
                  Gộp 4 mã đề trên 1 bảng
                </label>
              )}
            </div>
          </div>
        </div>

        {/* Lựa chọn Kiểu Tiêu Đề */}
        <div className="mt-4 border-t border-slate-100 pt-4 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Phần tiêu đề đầu trang:
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setHeaderStyle("none");
                  setShowStudentInfo(false);
                  setShowScoreBox(false);
                }}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  headerStyle === "none"
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                    : "border border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                }`}
              >
                🚫 Bỏ tiêu đề
              </button>

              <button
                type="button"
                onClick={() => setHeaderStyle("simple")}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  headerStyle === "simple"
                    ? "bg-indigo-600 text-white"
                    : "border border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                }`}
              >
                📄 Tiêu đề đơn giản
              </button>

              <button
                type="button"
                onClick={() => {
                  setHeaderStyle("exam");
                  setShowStudentInfo(true);
                  setShowScoreBox(true);
                }}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  headerStyle === "exam"
                    ? "bg-indigo-600 text-white"
                    : "border border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                }`}
              >
                📋 Đề thi chuẩn 2 cột (Trường / Môn / Mã đề)
              </button>
            </div>
          </div>
        </div>

        {/* Các tuỳ chọn bật/tắt */}
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2.5 border-t border-slate-100 pt-4 text-xs font-semibold text-slate-700 dark:border-slate-800 dark:text-slate-200">
          <label className="flex cursor-pointer items-center gap-1.5">
            <input
              type="checkbox"
              checked={showStudentInfo}
              onChange={(e) => setShowStudentInfo(e.target.checked)}
              className="h-4 w-4 rounded accent-indigo-600"
            />
            Khung thông tin thí sinh
          </label>

          <label className="flex cursor-pointer items-center gap-1.5">
            <input
              type="checkbox"
              checked={showScoreBox}
              onChange={(e) => setShowScoreBox(e.target.checked)}
              className="h-4 w-4 rounded accent-indigo-600"
            />
            Khung Điểm & Lời phê
          </label>

          <label className="flex cursor-pointer items-center gap-1.5">
            <input
              type="checkbox"
              checked={showAnswerSheet}
              onChange={(e) => setShowAnswerSheet(e.target.checked)}
              className="h-4 w-4 rounded accent-indigo-600"
            />
            Phiếu trả lời trắc nghiệm
          </label>

          <label className="flex cursor-pointer items-center gap-1.5">
            <input
              type="checkbox"
              checked={showSummaryAnswers}
              onChange={(e) => setShowSummaryAnswers(e.target.checked)}
              className="h-4 w-4 rounded accent-indigo-600"
            />
            Bảng đáp án tổng hợp ở cuối
          </label>

          <label className="flex cursor-pointer items-center gap-1.5">
            <input
              type="checkbox"
              checked={isTwoColumns}
              onChange={(e) => setIsTwoColumns(e.target.checked)}
              className="h-4 w-4 rounded accent-indigo-600"
            />
            Bố cục 2 cột (tiết kiệm giấy)
          </label>

          <label className="flex cursor-pointer items-center gap-1.5">
            <input
              type="checkbox"
              checked={showPoints}
              onChange={(e) => setShowPoints(e.target.checked)}
              className="h-4 w-4 rounded accent-indigo-600"
            />
            Hiện điểm từng câu
          </label>

          <div className="flex items-center gap-1.5">
            <span>Cỡ chữ:</span>
            <select
              value={fontSize}
              onChange={(e) => setFontSize(e.target.value as FontSize)}
              className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-800"
            >
              <option value="compact">Nhỏ gọn (Compact)</option>
              <option value="normal">Chuẩn (Normal)</option>
              <option value="large">Lớn (Large)</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span>Dòng tự luận:</span>
            <select
              value={essayLines}
              onChange={(e) => setEssayLines(Number(e.target.value))}
              className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-800"
            >
              <option value="2">2 dòng</option>
              <option value="4">4 dòng</option>
              <option value="6">6 dòng</option>
              <option value="10">10 dòng</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span>Ô điền số:</span>
            <select
              value={shortAnswerStyle}
              onChange={(e) => setShortAnswerStyle(e.target.value as ShortAnswerStyle)}
              className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-800"
            >
              <option value="dots">Dòng chấm (……)</option>
              <option value="box">Khung hộp [  ]</option>
            </select>
          </div>
        </div>

        {/* Tùy chỉnh thông tin header khi ở chế độ Đề thi 2 cột */}
        {headerStyle === "exam" && (
          <details className="mt-4 border-t border-slate-100 pt-3 text-xs dark:border-slate-800">
            <summary className="cursor-pointer font-bold text-slate-600 hover:text-indigo-600 dark:text-slate-400">
              ⚙️ Chỉnh sửa chi tiết tiêu đề (Tên trường, Môn học, Thời gian...)
            </summary>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="block font-medium text-slate-500">Tên trường / Đơn vị</label>
                <input
                  type="text"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  className="mt-1 h-8 w-full rounded border px-2 text-xs dark:border-slate-700 dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-500">Tiêu đề đề thi</label>
                <input
                  type="text"
                  value={examTitle}
                  onChange={(e) => setExamTitle(e.target.value)}
                  className="mt-1 h-8 w-full rounded border px-2 text-xs dark:border-slate-700 dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-500">Môn thi</label>
                <input
                  type="text"
                  value={examSubject}
                  onChange={(e) => setExamSubject(e.target.value)}
                  className="mt-1 h-8 w-full rounded border px-2 text-xs dark:border-slate-700 dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-500">Thời gian làm bài</label>
                <input
                  type="text"
                  value={examTime}
                  onChange={(e) => setExamTime(e.target.value)}
                  className="mt-1 h-8 w-full rounded border px-2 text-xs dark:border-slate-700 dark:bg-slate-800"
                />
              </div>
              <div className="sm:col-span-2 lg:col-span-4">
                <label className="block font-medium text-slate-500">Ghi chú đề thi</label>
                <input
                  type="text"
                  value={examNote}
                  onChange={(e) => setExamNote(e.target.value)}
                  className="mt-1 h-8 w-full rounded border px-2 text-xs dark:border-slate-700 dark:bg-slate-800"
                />
              </div>
            </div>
          </details>
        )}

        <p className="mt-3 text-[11px] text-slate-400">
          💡 Mẹo in: Khi hộp thoại in mở ra, chọn <strong>Lưu dưới dạng PDF (Save as PDF)</strong>, bật <strong>Đồ họa nền (Background graphics)</strong> và bỏ chọn &quot;Tiêu đề và chân trang&quot; mặc định của trình duyệt để có bản in sạch đẹp nhất.
        </p>
      </div>

      {/* ─── TRANG IN CHUẨN A4 (.print-sheet) ─── */}
      <article className="print-sheet rounded-2xl bg-white p-8 shadow-sm transition-colors print:rounded-none print:p-0 print:shadow-none">
        
        {/* 1. HEADER KIỂU ĐỀ THI 2 CỘT */}
        {headerStyle === "exam" && (
          <header className="border-b-2 border-slate-800 pb-3 text-slate-900">
            <div className="grid grid-cols-2 items-start gap-4">
              {/* Cột trái: Đơn vị & Lớp */}
              <div className="text-center font-bold">
                {schoolName && <p className="text-xs uppercase tracking-wide">{schoolName}</p>}
                <p className="text-sm font-extrabold uppercase">
                  {document.grade ? `KHỐI ${document.grade.replace(/lớp\s*/i, "")}` : "MÔN TOÁN"}
                </p>
                {totalQuestions > 0 && (
                  <p className="mt-1 text-[11px] font-normal italic">
                    (Đề thi gồm có {totalQuestions} câu)
                  </p>
                )}
              </div>

              {/* Cột phải: Kỳ thi & Thời gian & Mã đề */}
              <div className="text-center font-bold">
                <p className="text-sm font-extrabold uppercase tracking-tight text-slate-950">
                  {examTitle}
                </p>
                <p className="text-xs">
                  Môn thi: <span className="uppercase">TOÁN HỌC</span>
                </p>
                {examTime && (
                  <p className="text-[11px] font-normal italic">
                    Thời gian làm bài: {examTime} (không kể thời gian phát đề)
                  </p>
                )}
                {examCode && (
                  <div className="mt-1 inline-block border border-slate-800 px-3 py-0.5 text-xs font-bold">
                    Mã đề thi: {examCode}
                  </div>
                )}
              </div>
            </div>

            {/* KHUNG THÔNG TIN THÍ SINH & KHUNG ĐIỂM */}
            {(showStudentInfo || showScoreBox) && (
              <div className="mt-3 border-t border-dashed border-slate-400 pt-2 text-xs">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  {showStudentInfo && (
                    <div className="flex-1 space-y-1">
                      <p>
                        Họ và tên thí sinh: ...................................................................................
                        Lớp: ................
                      </p>
                      <p>Số báo danh: .................................................................................................................</p>
                    </div>
                  )}

                  {showScoreBox && (
                    <div className="shrink-0 border border-slate-800 text-center">
                      <div className="grid grid-cols-2 border-b border-slate-800 font-bold">
                        <div className="border-r border-slate-800 px-4 py-0.5">ĐIỂM</div>
                        <div className="px-6 py-0.5">LỜI PHÊ CỦA GIÁO VIÊN</div>
                      </div>
                      <div className="grid h-10 grid-cols-2">
                        <div className="border-r border-slate-800" />
                        <div />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </header>
        )}

        {/* 2. HEADER KIỂU ĐƠN GIẢN (CHỈ TÊN TÀI LIỆU CĂN GIỮA) */}
        {headerStyle === "simple" && (
          <header className="border-b border-slate-300 pb-3 text-center text-slate-900">
            <h1 className="text-2xl font-extrabold uppercase tracking-tight">{document.title}</h1>
            <p className="mt-1 text-xs font-medium text-slate-600">
              {[document.grade, ...document.topics.map((t) => t.name)].filter(Boolean).join(" · ")}
              {totalQuestions > 0 && ` · ${totalQuestions} câu hỏi`}
            </p>
            {document.description && <p className="mt-1 text-xs italic text-slate-500">{document.description}</p>}

            {/* Khung thông tin học sinh nếu bật */}
            {showStudentInfo && (
              <div className="mt-3 border-t border-dashed border-slate-300 pt-2 text-left text-xs">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1 space-y-1">
                    <p>Họ và tên: .................................................................................................... Lớp: ................</p>
                  </div>
                  {showScoreBox && (
                    <div className="shrink-0 border border-slate-800 px-4 py-1 text-center font-bold">
                      Điểm: ............
                    </div>
                  )}
                </div>
              </div>
            )}
          </header>
        )}

        {/* 3. NẾU HEADERSTYLE === "NONE" THÌ KHÔNG RENDER GÌ Ở ĐẦU TRANG */}

        {/* PHIẾU TRẢ LỜI TRẮC NGHIỆM (NẾU BẬT) */}
        {showAnswerSheet && totalQuestions > 0 && !isAnswerKeyOnly && (
          <section className="my-4 break-inside-avoid rounded border border-slate-800 p-3 text-xs">
            <h3 className="mb-2 text-center font-bold uppercase tracking-wider">
              PHIẾU TRẢ LỜI TRẮC NGHIỆM
            </h3>
            <div className="grid grid-cols-5 gap-x-3 gap-y-1.5 sm:grid-cols-10">
              {allQuestionsWithBlock.map((_, i) => (
                <div key={i} className="flex items-center justify-between border-b border-dotted border-slate-300 pb-0.5">
                  <span className="font-bold">{i + 1}.</span>
                  <span className="text-[10px] text-slate-500">A B C D</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ─── NỘI DUNG CÂU HỎI ─── */}
        {!isAnswerKeyOnly && (
          <main className={`mt-4 ${fontSizeClass} ${isTwoColumns ? "print-columns-2" : ""}`}>
            {/* Nếu có các khối non-quiz (như bài giảng dẫn nhập, lý thuyết, hình ảnh chung) */}
            {document.blocks
              .filter((b) => b.type !== "quiz")
              .map((block) => {
                if (block.type === "text") {
                  return (
                    <div key={block.id ?? block.position} className="mb-3 break-inside-avoid">
                      <MathText text={block.content} className="text-slate-800" />
                    </div>
                  );
                }
                if (block.type === "lesson") {
                  return (
                    <div key={block.id ?? block.position} className="mb-3 break-inside-avoid border-b border-slate-200 pb-2">
                      <h3 className="font-bold uppercase">{block.title}</h3>
                      <MathText text={block.content} className="text-slate-800" />
                    </div>
                  );
                }
                if (block.type === "image") {
                  return (
                    <figure key={block.id ?? block.position} className="my-3 break-inside-avoid text-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={getDocumentImageUrl(block.storagePath)} alt={block.altText} className="mx-auto max-h-64 object-contain" />
                      {block.caption && <figcaption className="mt-1 text-center text-xs italic">{block.caption}</figcaption>}
                    </figure>
                  );
                }
                return null;
              })}

            {/* Render các câu hỏi */}
            {allQuestionsWithBlock.map(({ question, blockTitle, blockIndex }, index) => {
              const isFirstInBlock =
                index === 0 || allQuestionsWithBlock[index - 1].blockIndex !== blockIndex;
              const qIndex = index + 1;
              const qType = question.type || "multiple_choice";
              const options = question.options ?? [];
              const correctIdx = options.findIndex((o) => o.id === question.correctOptionId);
              const gridClass = getOptionGridClass(options);
              const questionImgSrc = resolveQuestionImageSrc(question);

              return (
                <div key={question.id || index} className="mb-4 break-inside-avoid">
                  {/* Tiêu đề phân phần nếu có */}
                  {isFirstInBlock && blockTitle && (
                    <div className="mb-2 mt-3 border-b border-slate-900 pb-1 font-bold uppercase tracking-tight text-slate-950">
                      {blockTitle}
                    </div>
                  )}

                  {/* Đề bài câu hỏi */}
                  <div className="font-medium leading-relaxed text-slate-950">
                    <span className="font-bold">Câu {qIndex}</span>
                    {showPoints && question.points && (
                      <span className="text-xs font-semibold text-slate-600"> ({question.points} điểm)</span>
                    )}
                    <span className="font-bold">: </span>
                    <MathText text={question.text} className="inline" />
                  </div>

                  {/* Hình ảnh đính kèm câu hỏi (hỗ trợ cả URL ngoài, marker OCR và storagePath) */}
                  {questionImgSrc && (
                    <figure className="my-2 break-inside-avoid text-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={questionImgSrc}
                        alt={question.imageCaption || `Ảnh câu ${qIndex}`}
                        className="mx-auto max-h-56 max-w-full object-contain print:max-h-48"
                      />
                      {question.imageCaption && (
                        <figcaption className="mt-0.5 text-center text-xs italic text-slate-600">
                          {question.imageCaption}
                        </figcaption>
                      )}
                    </figure>
                  )}

                  {/* Dạng 1: Trắc nghiệm 4 phương án lựa chọn */}
                  {qType === "multiple_choice" && options.length > 0 && (
                    <div className={`mt-1 pl-3 ${gridClass}`}>
                      {options.map((opt, i) => {
                        const isCorrect = isSolutionMode && (i === correctIdx || opt.id === question.correctOptionId);
                        const letter = OPTION_LETTERS[i] ?? String.fromCharCode(65 + i);
                        return (
                          <div
                            key={opt.id || i}
                            className={`flex items-start gap-1 ${
                              isCorrect ? "font-bold text-slate-950 underline decoration-slate-900 decoration-2" : ""
                            }`}
                          >
                            <span className="font-bold">{letter}.</span>
                            <MathText text={opt.text} className="inline" />
                            {isCorrect && <span className="ml-1 text-xs font-extrabold text-emerald-700">✓</span>}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Dạng 2: Trắc nghiệm Đúng / Sai */}
                  {qType === "true_false" && (question.statements ?? []).length > 0 && (
                    <div className="mt-1 space-y-1 pl-4">
                      {question.statements!.map((st, sIdx) => {
                        const stLetter = String.fromCharCode(97 + sIdx); // a, b, c, d
                        return (
                          <div key={st.id || sIdx} className="flex items-start justify-between gap-2 leading-relaxed">
                            <div className="flex items-start gap-1.5">
                              <span className="font-bold">{stLetter})</span>
                              <MathText text={st.text} className="inline" />
                            </div>
                            <div className="shrink-0 font-bold">
                              {isSolutionMode ? (
                                <span className={st.correctVal === "true" ? "text-emerald-700 font-extrabold" : "text-rose-700 font-extrabold"}>
                                  [{st.correctVal === "true" ? "Đúng" : "Sai"}]
                                </span>
                              ) : (
                                <span className="text-slate-400 font-normal">[ …… ]</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Dạng 3: Trả lời ngắn */}
                  {qType === "short_answer" && (
                    <div className="mt-1.5 pl-3">
                      {isSolutionMode && question.correctAnswer?.trim() ? (
                        <div className="font-semibold text-slate-900">
                          <span>Đáp án: </span>
                          <span className="font-bold underline decoration-slate-800">
                            <MathText text={question.correctAnswer} className="inline font-bold" />
                          </span>
                        </div>
                      ) : shortAnswerStyle === "box" ? (
                        <div className="flex items-center justify-end gap-2 pr-4 pt-1">
                          <span className="text-xs italic text-slate-500">Kết quả:</span>
                          <div className="h-7 w-28 border border-slate-700" />
                        </div>
                      ) : (
                        <div className="italic text-slate-600">
                          Đáp án: …………………………………………………………………………………………
                        </div>
                      )}
                    </div>
                  )}

                  {/* Dạng 4: Tự luận */}
                  {qType === "essay" && !isSolutionMode && (
                    <div className="my-2 space-y-3 pl-3">
                      {Array.from({ length: essayLines }).map((_, lIdx) => (
                        <div key={lIdx} className="border-b border-dotted border-slate-400" />
                      ))}
                    </div>
                  )}

                  {/* LỜI GIẢI CHI TIẾT KHI BẬT CHẾ ĐỘ GIẢI */}
                  {isSolutionMode && (
                    <ExamExplanationBox question={question} />
                  )}
                </div>
              );
            })}

            {totalQuestions === 0 && (
              <p className="py-8 text-center text-slate-500">Bài kiểm tra chưa có câu hỏi.</p>
            )}
          </main>
        )}

        {/* ─── BẢNG ĐÁP ÁN GỘP 4 MÃ ĐỀ (KHI CHỌN MASTER KEY TABLE) ─── */}
        {showMasterKeyTable && masterKeyMatrix && (
          <section className="mt-6 break-inside-avoid border-t-2 border-slate-900 pt-4 text-xs">
            <h3 className="mb-3 text-center font-bold uppercase tracking-wider text-slate-950">
              BẢNG TỔNG HỢP ĐÁP ÁN CÁC MÃ ĐỀ
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-slate-900 text-center">
                <thead>
                  <tr className="bg-slate-100 font-extrabold">
                    <th className="border border-slate-900 px-3 py-1.5">Câu</th>
                    {masterKeyMatrix.map((item) => (
                      <th key={item.code} className="border border-slate-900 px-3 py-1.5">
                        Mã {item.code}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {masterKeyMatrix[0]?.questions.map((_, qIdx) => (
                    <tr key={qIdx} className={qIdx % 2 === 1 ? "bg-slate-50" : ""}>
                      <td className="border border-slate-900 px-2 py-1 font-bold">{qIdx + 1}</td>
                      {masterKeyMatrix.map((item) => {
                        const q = item.questions[qIdx]?.question;
                        let val = "-";
                        if (q) {
                          if (q.type === "multiple_choice" || !q.type) {
                            val = getCorrectOptionLetter(q);
                          } else if (q.type === "true_false") {
                            val = (q.statements || [])
                              .map((s) => (s.correctVal === "true" ? "Đ" : "S"))
                              .join("");
                          } else if (q.type === "short_answer") {
                            val = q.correctAnswer?.slice(0, 5) || "✓";
                          }
                        }
                        return (
                          <td key={item.code} className="border border-slate-900 px-2 py-1 font-bold text-slate-900">
                            {val}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ─── BẢNG ĐÁP ÁN TỔNG HỢP (MA TRẬN ĐÁP ÁN NHANH) ─── */}
        {(showSummaryAnswers || isAnswerKeyOnly) && !showMasterKeyTable && totalQuestions > 0 && (
          <section className="mt-8 break-inside-avoid border-t-2 border-slate-900 pt-4 text-xs">
            <h3 className="mb-3 text-center font-bold uppercase tracking-wider text-slate-950">
              BẢNG ĐÁP ÁN TỔNG HỢP {examCode ? `- MÃ ĐỀ: ${examCode}` : ""}
            </h3>

            {/* Bảng trắc nghiệm nhiều lựa chọn */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-slate-900 text-center">
                <thead>
                  <tr className="bg-slate-100 font-bold">
                    <th className="border border-slate-900 px-2 py-1">Câu</th>
                    {allQuestionsWithBlock.map((_, i) => (
                      <th key={i} className="border border-slate-900 px-1.5 py-1 text-[11px]">
                        {i + 1}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-slate-900 px-2 py-1 font-bold">Đ/A</td>
                    {allQuestionsWithBlock.map(({ question }, i) => {
                      const qType = question.type || "multiple_choice";
                      let keyText = "-";
                      if (qType === "multiple_choice") {
                        keyText = getCorrectOptionLetter(question);
                      } else if (qType === "true_false") {
                        keyText = (question.statements || [])
                          .map((s) => (s.correctVal === "true" ? "Đ" : "S"))
                          .join("");
                      } else if (qType === "short_answer") {
                        keyText = question.correctAnswer?.slice(0, 4) || "✓";
                      }
                      return (
                        <td key={i} className="border border-slate-900 px-1 py-1 font-bold text-slate-950">
                          {keyText}
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Chi tiết cho câu Đúng/Sai và Trả lời ngắn */}
            {allQuestionsWithBlock.some((item) => item.question.type === "true_false" || item.question.type === "short_answer") && (
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {allQuestionsWithBlock
                  .filter((item) => item.question.type === "true_false")
                  .map(({ question }, i) => (
                    <div key={i} className="rounded border border-slate-300 p-2">
                      <span className="font-bold">Câu {i + 1} (Đ/S): </span>
                      {(question.statements || []).map((s, sIdx) => (
                        <span key={sIdx} className="mr-2">
                          {String.fromCharCode(97 + sIdx)}){" "}
                          <strong>{s.correctVal === "true" ? "Đúng" : "Sai"}</strong>
                        </span>
                      ))}
                    </div>
                  ))}

                {allQuestionsWithBlock
                  .filter((item) => item.question.type === "short_answer")
                  .map(({ question }, i) => (
                    <div key={i} className="rounded border border-slate-300 p-2">
                      <span className="font-bold">Câu {i + 1} (Điền số): </span>
                      <strong>{question.correctAnswer || "Chưa có đáp án"}</strong>
                    </div>
                  ))}
              </div>
            )}
          </section>
        )}

        {/* Chân trang in */}
        <footer className="mt-6 border-t border-slate-200 pt-2 text-center text-[11px] text-slate-400 print:text-slate-600">
          ─── HẾT ─── {examCode && `(Mã đề: ${examCode})`}
        </footer>
      </article>
    </div>
  );
}

/** Khung Lời giải chi tiết hiển thị trong chế độ Solution */
function ExamExplanationBox({ question }: { question: QuizQuestion }) {
  const hasText = Boolean(question.explanation?.trim());
  const images = resolveAllExplanationImages(question);
  if (!hasText && images.length === 0) return null;

  return (
    <div className="mt-2 break-inside-avoid rounded border border-slate-300 bg-slate-50/50 p-2.5 text-xs text-slate-800">
      <div className="font-bold text-slate-900">Lời giải chi tiết:</div>
      {images.length > 0 && (
        <div className={images.length === 1 ? "my-2 space-y-2" : "my-2 grid grid-cols-2 gap-2"}>
          {images.map((img, idx) => (
            <figure key={idx} className="break-inside-avoid text-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.src}
                alt={img.caption || `Ảnh lời giải ${idx + 1}`}
                className="mx-auto max-h-60 object-contain"
              />
              {img.caption && (
                <figcaption className="mt-0.5 text-center text-[10px] italic">{img.caption}</figcaption>
              )}
            </figure>
          ))}
        </div>
      )}
      {hasText && <MathText text={question.explanation!} className="inline leading-relaxed" />}
    </div>
  );
}
