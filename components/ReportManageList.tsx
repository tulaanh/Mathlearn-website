"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import LazyMathText from "./LazyMathText";
import Pagination from "./Pagination";
import {
  REPORT_ERROR_TYPES,
  REPORT_STATUS_META,
  getErrorTypeMeta,
  type QuestionReport,
  type ReportErrorType,
  type ReportStatus,
} from "@/lib/report-types";
import type { ReportStats } from "@/lib/reports";

type ReportManageListProps = {
  reports: QuestionReport[];
  total: number;
  stats: ReportStats;
  currentStatus?: string;
  currentErrorType?: string;
  currentSearch?: string;
  currentPage: number;
};

export default function ReportManageList({
  reports: initialReports,
  total,
  stats,
  currentStatus = "all",
  currentErrorType = "all",
  currentSearch = "",
  currentPage,
}: ReportManageListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [reports, setReports] = useState(initialReports);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [activeNoteModalReport, setActiveNoteModalReport] = useState<QuestionReport | null>(null);
  const [resolutionNoteText, setResolutionNoteText] = useState("");
  const [submittingNote, setSubmittingNote] = useState(false);
  const [searchInputValue, setSearchInputValue] = useState(currentSearch);

  function updateQuery(params: Record<string, string | null>) {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    for (const [k, v] of Object.entries(params)) {
      if (v === null || v === "" || v === "all") {
        current.delete(k);
      } else {
        current.set(k, v);
      }
    }
    // Khi đổi bộ lọc thì reset về trang 1
    if (!("page" in params)) {
      current.delete("page");
    }
    router.push(`/quan-ly/bao-loi?${current.toString()}`);
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateQuery({ q: searchInputValue.trim() || null });
  }

  async function handleStatusChange(reportId: string, newStatus: ReportStatus, note?: string) {
    setUpdatingId(reportId);
    try {
      const res = await fetch(`/api/reports/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, resolutionNote: note }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Không thể cập nhật trạng thái.");
      }

      setReports((prev) =>
        prev.map((r) =>
          r.id === reportId
            ? { ...r, status: newStatus, resolutionNote: note !== undefined ? note : r.resolutionNote }
            : r,
        ),
      );
      router.refresh();
    } catch (err: any) {
      alert(`Lỗi: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleDelete(reportId: string) {
    if (!confirm("Bạn có chắc chắn muốn xóa báo lỗi này không?")) return;

    setUpdatingId(reportId);
    try {
      const res = await fetch(`/api/reports/${reportId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Không thể xóa báo lỗi.");
      }

      setReports((prev) => prev.filter((r) => r.id !== reportId));
      router.refresh();
    } catch (err: any) {
      alert(`Lỗi: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleSaveNoteModal(e: React.FormEvent) {
    e.preventDefault();
    if (!activeNoteModalReport) return;

    setSubmittingNote(true);
    try {
      await handleStatusChange(
        activeNoteModalReport.id,
        activeNoteModalReport.status === "pending" ? "resolved" : activeNoteModalReport.status,
        resolutionNoteText.trim(),
      );
      setActiveNoteModalReport(null);
    } finally {
      setSubmittingNote(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* 1. Thẻ thống kê */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <button
          type="button"
          onClick={() => updateQuery({ status: "all" })}
          className={`rounded-2xl border p-4 text-left transition-all ${
            currentStatus === "all"
              ? "border-indigo-500 bg-indigo-50/60 ring-2 ring-indigo-500/20 dark:border-indigo-500 dark:bg-indigo-950/30"
              : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-[#131b2e]"
          }`}
        >
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Tổng báo lỗi</div>
          <div className="mt-1 text-2xl font-black text-slate-900 dark:text-white">{stats.total}</div>
        </button>

        <button
          type="button"
          onClick={() => updateQuery({ status: "pending" })}
          className={`rounded-2xl border p-4 text-left transition-all ${
            currentStatus === "pending"
              ? "border-amber-500 bg-amber-50/60 ring-2 ring-amber-500/20 dark:border-amber-500 dark:bg-amber-950/30"
              : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-[#131b2e]"
          }`}
        >
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400">
            <span>⏳</span> Chờ xử lý
          </div>
          <div className="mt-1 text-2xl font-black text-amber-600 dark:text-amber-400">{stats.pending}</div>
        </button>

        <button
          type="button"
          onClick={() => updateQuery({ status: "resolved" })}
          className={`rounded-2xl border p-4 text-left transition-all ${
            currentStatus === "resolved"
              ? "border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20 dark:border-emerald-500 dark:bg-emerald-950/30"
              : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-[#131b2e]"
          }`}
        >
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            <span>✓</span> Đã khắc phục
          </div>
          <div className="mt-1 text-2xl font-black text-emerald-600 dark:text-emerald-400">{stats.resolved}</div>
        </button>

        <button
          type="button"
          onClick={() => updateQuery({ status: "rejected" })}
          className={`rounded-2xl border p-4 text-left transition-all ${
            currentStatus === "rejected"
              ? "border-slate-500 bg-slate-50/60 ring-2 ring-slate-500/20 dark:border-slate-500 dark:bg-slate-800/30"
              : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-[#131b2e]"
          }`}
        >
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>✕</span> Bỏ qua
          </div>
          <div className="mt-1 text-2xl font-black text-slate-600 dark:text-slate-300">{stats.rejected}</div>
        </button>
      </div>

      {/* 2. Thanh lọc và tìm kiếm */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 transition-colors dark:border-slate-800/80 dark:bg-[#131b2e] md:flex-row md:items-center md:justify-between">
        {/* Tìm kiếm */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <input
            type="text"
            placeholder="Tìm theo nội dung câu hỏi, mô tả lỗi, tên tài liệu..."
            value={searchInputValue}
            onChange={(e) => setSearchInputValue(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-2.5 pl-9 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-900/60 dark:text-white dark:focus:border-indigo-400"
          />
          <span className="absolute left-3 top-2.5 text-slate-400">🔍</span>
          {searchInputValue && (
            <button
              type="button"
              onClick={() => {
                setSearchInputValue("");
                updateQuery({ q: null });
              }}
              className="absolute right-3 top-2.5 text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              ✕
            </button>
          )}
        </form>

        {/* Lọc theo Loại lỗi */}
        <div className="flex items-center gap-2">
          <label htmlFor="filter-error-type" className="text-xs font-bold text-slate-500 shrink-0 dark:text-slate-400">
            Loại lỗi:
          </label>
          <select
            id="filter-error-type"
            value={currentErrorType}
            onChange={(e) => updateQuery({ errorType: e.target.value })}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <option value="all">Tất cả loại lỗi</option>
            {REPORT_ERROR_TYPES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.icon} {t.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 3. Danh sách báo lỗi */}
      {reports.length === 0 ? (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-12 text-center dark:border-slate-800/80 dark:bg-[#131b2e]">
          <div className="mx-auto mb-3 text-4xl">🎉</div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">Không có báo lỗi nào</h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {currentStatus !== "all" || currentErrorType !== "all" || currentSearch
              ? "Không tìm thấy báo lỗi phù hợp với bộ lọc hiện tại."
              : "Hiện tại không có phản hồi báo lỗi câu hỏi nào từ người học."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => {
            const errorMeta = getErrorTypeMeta(report.errorType);
            const statusMeta = REPORT_STATUS_META[report.status] ?? REPORT_STATUS_META.pending;
            const isBusy = updatingId === report.id;

            return (
              <div
                key={report.id}
                className={`rounded-2xl border bg-white p-5 shadow-xs transition-all dark:bg-[#131b2e] ${
                  report.status === "pending"
                    ? "border-amber-200/90 dark:border-amber-900/50"
                    : report.status === "resolved"
                      ? "border-emerald-200/70 dark:border-emerald-900/40"
                      : "border-slate-200/80 dark:border-slate-800/80"
                }`}
              >
                {/* Header card: Loại lỗi + Trạng thái + Ngày gửi */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 dark:border-slate-800/70">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-bold ${errorMeta.badgeClass}`}
                    >
                      <span>{errorMeta.icon}</span>
                      <span>{errorMeta.label}</span>
                    </span>

                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusMeta.badgeClass}`}
                    >
                      <span>{statusMeta.icon}</span>
                      <span>{statusMeta.label}</span>
                    </span>
                  </div>

                  <div className="text-xs text-slate-400">
                    Gửi bởi: <span className="font-semibold text-slate-600 dark:text-slate-300">{report.reporterName || "Ẩn danh"}</span>
                    {" • "}
                    <span>{new Date(report.createdAt).toLocaleString("vi-VN")}</span>
                  </div>
                </div>

                {/* Nội dung câu hỏi */}
                <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3.5 dark:border-slate-800/70 dark:bg-[#0d1322]/80">
                  <div className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Nội dung câu hỏi:
                  </div>
                  <div className="text-sm font-medium text-slate-900 dark:text-white">
                    <LazyMathText text={report.questionText} />
                  </div>
                </div>

                {/* Mô tả lỗi của học sinh */}
                {report.description && (
                  <div className="mt-3 rounded-xl border border-rose-100 bg-rose-50/40 p-3 text-xs text-rose-900 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-200">
                    <span className="font-bold">Mô tả của người học: </span>
                    <span className="italic">{report.description}</span>
                  </div>
                )}

                {/* Ghi chú xử lý của giáo viên */}
                {report.resolutionNote && (
                  <div className="mt-3 rounded-xl border border-emerald-100 bg-emerald-50/50 p-3 text-xs text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-200">
                    <span className="font-bold">Ghi chú khắc phục: </span>
                    <span>{report.resolutionNote}</span>
                  </div>
                )}

                {/* Footer: Liên kết tài liệu + Nút thao tác */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    {report.documentTitle && (
                      <span className="font-medium text-slate-500 dark:text-slate-400">
                        Tài liệu: <strong className="text-slate-800 dark:text-slate-200">{report.documentTitle}</strong>
                      </span>
                    )}
                    {report.documentId && (
                      <div className="flex items-center gap-1.5">
                        <Link
                          href={`/tai-lieu/${report.documentId}${report.questionId ? `#cau-${encodeURIComponent(report.questionId)}` : ""}`}
                          target="_blank"
                          className="rounded-lg border border-slate-200 px-2 py-1 text-slate-600 hover:border-indigo-400 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-300 dark:hover:text-indigo-400"
                        >
                          👁 Xem câu hỏi ↗
                        </Link>
                        <Link
                          href={`/quan-ly/tai-lieu/${report.documentId}/sua${report.questionId ? `?questionId=${encodeURIComponent(report.questionId)}#cau-${encodeURIComponent(report.questionId)}` : ""}`}
                          target="_blank"
                          className="rounded-lg border border-indigo-200 bg-indigo-50/50 px-2 py-1 font-semibold text-indigo-700 hover:bg-indigo-100 dark:border-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-300"
                        >
                          ✎ Sửa câu hỏi này ↗
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Nút hành động trạng thái */}
                  <div className="flex flex-wrap items-center gap-2">
                    {report.status !== "resolved" && (
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleStatusChange(report.id, "resolved")}
                        className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 disabled:opacity-50 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                      >
                        ✓ Đã sửa
                      </button>
                    )}

                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => {
                        setActiveNoteModalReport(report);
                        setResolutionNoteText(report.resolutionNote || "");
                      }}
                      className="rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                      💬 Ghi chú
                    </button>

                    {report.status !== "rejected" && (
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleStatusChange(report.id, "rejected")}
                        className="rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
                      >
                        Bỏ qua
                      </button>
                    )}

                    {report.status !== "pending" && (
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleStatusChange(report.id, "pending")}
                        className="rounded-xl border border-amber-300 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-950/40"
                      >
                        Mở lại
                      </button>
                    )}

                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => handleDelete(report.id)}
                      className="rounded-xl p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
                      title="Xóa báo lỗi này"
                    >
                      🗑
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Phân trang */}
      <Pagination
        basePath="/quan-ly/bao-loi"
        params={{
          status: currentStatus !== "all" ? currentStatus : undefined,
          errorType: currentErrorType !== "all" ? currentErrorType : undefined,
          q: currentSearch || undefined,
        }}
        page={currentPage}
        total={total}
        pageSize={15}
      />

      {/* Modal chỉnh sửa ghi chú khắc phục */}
      {activeNoteModalReport && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget && !submittingNote) setActiveNoteModalReport(null);
          }}
        >
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl transition-colors dark:border-slate-800 dark:bg-[#131b2e]">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Ghi chú xử lý báo lỗi
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Nhập thông tin hoặc giải thích cách bạn đã xử lý câu hỏi này để lưu lại lịch sử.
            </p>

            <form onSubmit={handleSaveNoteModal} className="mt-4 space-y-4">
              <textarea
                rows={4}
                value={resolutionNoteText}
                onChange={(e) => setResolutionNoteText(e.target.value)}
                placeholder="Ví dụ: Đã sửa đáp án câu D thành 2x + 1 và cập nhật lại hình vẽ minh họa..."
                className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  disabled={submittingNote}
                  onClick={() => setActiveNoteModalReport(null)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  disabled={submittingNote}
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500"
                >
                  {submittingNote ? "Đang lưu..." : "Lưu & Đánh dấu đã sửa"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
