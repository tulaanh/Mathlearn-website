import type { QuestionType } from "@/lib/document-types";

/** Các phân loại lỗi câu hỏi/đề thi */
export type ReportErrorType =
  | "giai_sai"
  | "de_sai"
  | "thieu_de"
  | "de_mo"
  | "khac";

/** Trạng thái xử lý của báo cáo */
export type ReportStatus = "pending" | "resolved" | "rejected";

export type ReportErrorTypeMeta = {
  id: ReportErrorType;
  label: string;
  short: string;
  icon: string;
  description: string;
  badgeClass: string;
};

export const REPORT_ERROR_TYPES: ReportErrorTypeMeta[] = [
  {
    id: "giai_sai",
    label: "Lời giải sai",
    short: "Giải sai",
    icon: "✖",
    description: "Sai phương pháp, sai công thức, tính toán nhầm hoặc kết luận giải thích không khớp",
    badgeClass: "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800",
  },
  {
    id: "de_sai",
    label: "Đề bài sai",
    short: "Đề sai",
    icon: "⚠️",
    description: "Đề bài mâu thuẫn, số liệu vô lý, hoặc tất cả các đáp án đều sai",
    badgeClass: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800",
  },
  {
    id: "thieu_de",
    label: "Thiếu đề / dữ kiện",
    short: "Thiếu đề",
    icon: "📄",
    description: "Thiếu hình vẽ minh họa, thiếu giả thiết bài toán, hoặc bị mất ký tự KaTeX",
    badgeClass: "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950/50 dark:text-orange-300 dark:border-orange-800",
  },
  {
    id: "de_mo",
    label: "Đề mở / chưa chặt chẽ",
    short: "Đề mở",
    icon: "🔄",
    description: "Đề bài hiểu theo nhiều nghĩa, thiếu điều kiện biến số, câu chữ mập mờ",
    badgeClass: "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800",
  },
  {
    id: "khac",
    label: "Lỗi khác / Góp ý",
    short: "Khác",
    icon: "💬",
    description: "Lỗi chính tả, lỗi hiển thị giao diện hoặc góp ý bổ sung khác",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
  },
];

export const REPORT_STATUS_META: Record<
  ReportStatus,
  { label: string; badgeClass: string; icon: string }
> = {
  pending: {
    label: "Chờ xử lý",
    badgeClass: "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-700",
    icon: "⏳",
  },
  resolved: {
    label: "Đã khắc phục",
    badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700",
    icon: "✓",
  },
  rejected: {
    label: "Bỏ qua",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
    icon: "✕",
  },
};

export function getErrorTypeMeta(type: string): ReportErrorTypeMeta {
  return (
    REPORT_ERROR_TYPES.find((t) => t.id === type) ?? {
      id: "khac",
      label: "Lỗi khác",
      short: "Khác",
      icon: "💬",
      description: "",
      badgeClass: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
    }
  );
}

export type QuestionReport = {
  id: string;
  questionId: string;
  questionText: string;
  questionType?: QuestionType | string;
  documentId?: string | null;
  documentTitle?: string | null;
  documentUrl?: string | null;
  errorType: ReportErrorType;
  description?: string | null;
  status: ReportStatus;
  resolutionNote?: string | null;
  reporterId?: string | null;
  reporterName?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateReportPayload = {
  questionId: string;
  questionText: string;
  questionType?: string;
  documentId?: string;
  documentTitle?: string;
  documentUrl?: string;
  errorType: ReportErrorType;
  description?: string;
  reporterName?: string;
};

export type ReportFilterParams = {
  status?: ReportStatus | "all";
  errorType?: ReportErrorType | "all";
  search?: string;
};
