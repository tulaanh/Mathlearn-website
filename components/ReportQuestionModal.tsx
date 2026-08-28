"use client";

import { useEffect, useState } from "react";
import LazyMathText from "./LazyMathText";
import { useProfile } from "./ProfileProvider";
import {
  REPORT_ERROR_TYPES,
  type CreateReportPayload,
  type ReportErrorType,
} from "@/lib/report-types";

type ReportQuestionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  question: {
    id: string;
    text: string;
    type?: string;
  } | null;
  documentInfo?: {
    id?: string;
    title?: string;
  } | null;
};

export default function ReportQuestionModal({
  isOpen,
  onClose,
  question,
  documentInfo,
}: ReportQuestionModalProps) {
  const { profile } = useProfile();
  const [errorType, setErrorType] = useState<ReportErrorType>("giai_sai");
  const [description, setDescription] = useState("");
  const [reporterName, setReporterName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setErrorType("giai_sai");
      setDescription("");
      setReporterName(profile?.display_name || "");
      setErrorMessage("");
      setSuccessMessage(false);
    }
  }, [isOpen, profile]);

  if (!isOpen || !question) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!question) return;

    setSubmitting(true);
    setErrorMessage("");

    try {
      const payload: CreateReportPayload = {
        questionId: question.id,
        questionText: question.text,
        questionType: question.type,
        documentId: documentInfo?.id,
        documentTitle: documentInfo?.title,
        documentUrl: typeof window !== "undefined" ? window.location.pathname : undefined,
        errorType,
        description: description.trim() || undefined,
        reporterName: reporterName.trim() || undefined,
      };

      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gửi báo lỗi thất bại.");
      }

      setSuccessMessage(true);
      setTimeout(() => {
        onClose();
      }, 1800);
    } catch (err: any) {
      setErrorMessage(err.message || "Đã xảy ra lỗi, vui lòng thử lại sau.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !submitting) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-modal-title"
    >
      <div className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl transition-colors dark:border-slate-800 dark:bg-[#131b2e] sm:p-7">
        {/* Nút đóng */}
        <button
          type="button"
          disabled={submitting}
          onClick={onClose}
          className="absolute right-4 top-4 rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          aria-label="Đóng"
        >
          ✕
        </button>

        {/* Tiêu đề */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-xl text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
            🚩
          </div>
          <div>
            <h2 id="report-modal-title" className="text-xl font-bold text-slate-900 dark:text-white">
              Báo lỗi câu hỏi
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Cảm ơn bạn đã đóng góp để chất lượng đề thi và bài giảng hoàn thiện hơn!
            </p>
          </div>
        </div>

        {successMessage ? (
          <div className="my-8 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-6 text-center dark:border-emerald-900/60 dark:bg-emerald-950/40">
            <div className="mx-auto mb-2 text-3xl">🎉</div>
            <p className="text-base font-bold text-emerald-800 dark:text-emerald-300">
              Gửi báo lỗi thành công!
            </p>
            <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-400">
              Đội ngũ giáo viên sẽ kiểm tra và cập nhật lại câu hỏi trong thời gian sớm nhất.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {/* Xem trước câu hỏi */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-[#0d1322]/80">
              <div className="mb-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                Câu hỏi đang báo lỗi:
              </div>
              <div className="line-clamp-3 text-sm text-slate-800 dark:text-slate-200">
                <LazyMathText text={question.text} inline />
              </div>
              {documentInfo?.title && (
                <div className="mt-2 text-[11px] text-slate-400">
                  Thuộc tài liệu: <span className="font-medium text-slate-600 dark:text-slate-300">{documentInfo.title}</span>
                </div>
              )}
            </div>

            {/* Chọn loại lỗi */}
            <div>
              <label className="block mb-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Loại lỗi gặp phải <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {REPORT_ERROR_TYPES.map((type) => {
                  const isSelected = errorType === type.id;
                  return (
                    <label
                      key={type.id}
                      className={`flex cursor-pointer items-start gap-2.5 rounded-xl border p-3 text-left transition-all ${
                        isSelected
                          ? "border-rose-500 bg-rose-50/60 ring-2 ring-rose-500/20 dark:border-rose-500 dark:bg-rose-950/30"
                          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 dark:border-slate-800 dark:hover:border-slate-700 dark:hover:bg-slate-800/50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="errorType"
                        value={type.id}
                        checked={isSelected}
                        onChange={() => setErrorType(type.id)}
                        className="mt-0.5 h-4 w-4 accent-rose-600 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 font-semibold text-xs text-slate-900 dark:text-white">
                          <span>{type.icon}</span>
                          <span>{type.label}</span>
                        </div>
                        <div className="mt-0.5 text-[11px] leading-tight text-slate-500 dark:text-slate-400">
                          {type.description}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Mô tả chi tiết */}
            <div>
              <label htmlFor="report-description" className="block mb-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Mô tả chi tiết lỗi <span className="text-slate-400 font-normal text-[11px]">(khuyến khích)</span>
              </label>
              <textarea
                id="report-description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ví dụ: Ở bước biến đổi thứ 2, đạo hàm của (2x+1)^2 phải là 4(2x+1) chứ không phải 2(2x+1)..."
                className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-rose-500 focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-rose-500"
              />
            </div>

            {/* Tên người báo (nếu chưa đăng nhập) */}
            {!profile && (
              <div>
                <label htmlFor="reporter-name" className="block mb-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Tên của bạn / Lớp <span className="text-slate-400 font-normal text-[11px]">(tùy chọn)</span>
                </label>
                <input
                  id="reporter-name"
                  type="text"
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn A - Lớp 12A1"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-rose-500 focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-rose-500"
                />
              </div>
            )}

            {/* Thông báo lỗi nếu có */}
            {errorMessage && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300">
                ⚠️ {errorMessage}
              </div>
            )}

            {/* Nút hành động */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={submitting}
                onClick={onClose}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-rose-700 disabled:opacity-50 dark:bg-rose-600 dark:hover:bg-rose-500"
              >
                {submitting ? (
                  <>
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Đang gửi...
                  </>
                ) : (
                  <>
                    <span>🚩</span>
                    Gửi báo lỗi
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
