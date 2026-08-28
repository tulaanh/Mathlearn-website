import { createServerSupabaseClient, createPublicSupabaseClient, getCurrentUser } from "@/lib/supabase/server";
import type {
  CreateReportPayload,
  QuestionReport,
  ReportErrorType,
  ReportFilterParams,
  ReportStatus,
} from "@/lib/report-types";

export const REPORT_PAGE_SIZE = 15;

export type PagedReports = {
  items: QuestionReport[];
  total: number;
};

export type ReportStats = {
  total: number;
  pending: number;
  resolved: number;
  rejected: number;
};

function mapRowToReport(row: any): QuestionReport {
  return {
    id: row.id,
    questionId: row.question_id,
    questionText: row.question_text,
    questionType: row.question_type,
    documentId: row.document_id,
    documentTitle: row.document_title,
    documentUrl: row.document_url,
    errorType: row.error_type as ReportErrorType,
    description: row.description,
    status: row.status as ReportStatus,
    resolutionNote: row.resolution_note,
    reporterId: row.reporter_id,
    reporterName: row.reporter_name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Lấy danh sách báo lỗi có phân trang, lọc theo trạng thái, loại lỗi và từ khóa (dành cho giáo viên). */
export async function getQuestionReports(
  filters: ReportFilterParams = {},
  page = 1,
  pageSize = REPORT_PAGE_SIZE,
): Promise<PagedReports> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return { items: [], total: 0 };

  let query = supabase
    .from("question_reports")
    .select("*", { count: "exact" });

  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  if (filters.errorType && filters.errorType !== "all") {
    query = query.eq("error_type", filters.errorType);
  }

  if (filters.search && filters.search.trim()) {
    const q = filters.search.trim();
    query = query.or(
      `question_text.ilike.%${q}%,description.ilike.%${q}%,document_title.ilike.%${q}%,reporter_name.ilike.%${q}%`,
    );
  }

  query = query.order("created_at", { ascending: false });

  const from = (Math.max(1, page) - 1) * pageSize;
  const to = from + pageSize - 1;
  const { data, error, count } = await query.range(from, to);

  if (error) {
    console.error("Error fetching question reports:", error);
    return { items: [], total: 0 };
  }

  return {
    items: (data ?? []).map(mapRowToReport),
    total: count ?? 0,
  };
}

/** Lấy thống kê số lượng báo lỗi theo trạng thái. */
export async function getReportStats(): Promise<ReportStats> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return { total: 0, pending: 0, resolved: 0, rejected: 0 };

  const { data, error } = await supabase
    .from("question_reports")
    .select("status");

  if (error || !data) {
    return { total: 0, pending: 0, resolved: 0, rejected: 0 };
  }

  const stats: ReportStats = {
    total: data.length,
    pending: 0,
    resolved: 0,
    rejected: 0,
  };

  for (const item of data) {
    if (item.status === "pending") stats.pending++;
    else if (item.status === "resolved") stats.resolved++;
    else if (item.status === "rejected") stats.rejected++;
  }

  return stats;
}

/** Tạo báo lỗi mới (dành cho người học / khách). */
export async function createQuestionReport(
  payload: CreateReportPayload,
): Promise<{ success: boolean; error?: string; id?: string }> {
  // Có thể dùng server client (kèm auth cookie nếu có) hoặc public client
  const supabase = (await createServerSupabaseClient()) ?? createPublicSupabaseClient();
  if (!supabase) return { success: false, error: "Cơ sở dữ liệu chưa được cấu hình." };

  const { user, profile } = await getCurrentUser().catch(() => ({ user: null, profile: null }));

  const reporterId = user?.id ?? null;
  const reporterName = payload.reporterName?.trim() || profile?.display_name || (user ? "Học sinh" : "Khách ẩn danh");

  const row = {
    question_id: payload.questionId,
    question_text: payload.questionText.slice(0, 5000),
    question_type: payload.questionType || "multiple_choice",
    document_id: payload.documentId || null,
    document_title: payload.documentTitle?.slice(0, 200) || null,
    document_url: payload.documentUrl?.slice(0, 500) || null,
    error_type: payload.errorType,
    description: payload.description?.trim() || null,
    status: "pending",
    reporter_id: reporterId,
    reporter_name: reporterName,
  };

  const { data, error } = await supabase
    .from("question_reports")
    .insert(row)
    .select("id")
    .single();

  if (error) {
    console.error("Error creating question report:", error);
    return { success: false, error: error.message };
  }

  return { success: true, id: data?.id };
}

/** Cập nhật trạng thái và ghi chú xử lý báo lỗi (chỉ giáo viên). */
export async function updateQuestionReport(
  id: string,
  update: { status?: ReportStatus; resolutionNote?: string | null },
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return { success: false, error: "Cơ sở dữ liệu chưa được cấu hình." };

  const updateData: Record<string, any> = {};
  if (update.status) updateData.status = update.status;
  if (update.resolutionNote !== undefined) updateData.resolution_note = update.resolutionNote;

  const { error } = await supabase
    .from("question_reports")
    .update(updateData)
    .eq("id", id);

  if (error) {
    console.error("Error updating question report:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/** Xóa báo lỗi (chỉ giáo viên). */
export async function deleteQuestionReport(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return { success: false, error: "Cơ sở dữ liệu chưa được cấu hình." };

  const { error } = await supabase
    .from("question_reports")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting question report:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}
