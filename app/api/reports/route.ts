import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/supabase/server";
import { createQuestionReport, getQuestionReports, getReportStats } from "@/lib/reports";
import type { CreateReportPayload, ReportErrorType, ReportStatus } from "@/lib/report-types";

/**
 * POST /api/reports — Gửi báo lỗi câu hỏi (mọi người dùng hoặc khách).
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { questionId, questionText, errorType } = body;

    if (!questionId || !questionText || !errorType) {
      return NextResponse.json(
        { error: "Thiếu thông tin bắt buộc (ID câu hỏi, nội dung, hoặc loại lỗi)." },
        { status: 400 },
      );
    }

    const validErrorTypes: ReportErrorType[] = [
      "giai_sai",
      "de_sai",
      "thieu_de",
      "de_mo",
      "khac",
    ];

    if (!validErrorTypes.includes(errorType)) {
      return NextResponse.json(
        { error: "Loại lỗi không hợp lệ." },
        { status: 400 },
      );
    }

    const payload: CreateReportPayload = {
      questionId: String(body.questionId),
      questionText: String(body.questionText),
      questionType: body.questionType,
      documentId: body.documentId,
      documentTitle: body.documentTitle,
      documentUrl: body.documentUrl,
      errorType,
      description: body.description,
      reporterName: body.reporterName,
    };

    const result = await createQuestionReport(payload);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Không thể gửi báo lỗi lúc này." },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, id: result.id }, { status: 201 });
  } catch (err: any) {
    console.error("API POST /api/reports error:", err);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi khi xử lý yêu cầu." },
      { status: 500 },
    );
  }
}

/**
 * GET /api/reports — Lấy danh sách báo lỗi (chỉ giáo viên).
 */
export async function GET(request: Request) {
  const { user, profile } = await getCurrentUser();
  if (!user || profile?.role !== "teacher") {
    return NextResponse.json(
      { error: "Chỉ giáo viên mới có quyền xem danh sách báo lỗi." },
      { status: 403 },
    );
  }

  const url = new URL(request.url);
  const status = (url.searchParams.get("status") ?? "all") as ReportStatus | "all";
  const errorType = (url.searchParams.get("errorType") ?? "all") as ReportErrorType | "all";
  const search = url.searchParams.get("q") ?? undefined;
  const page = Math.max(1, Number(url.searchParams.get("page") ?? "1") || 1);

  const [paged, stats] = await Promise.all([
    getQuestionReports({ status, errorType, search }, page),
    getReportStats(),
  ]);

  return NextResponse.json({
    items: paged.items,
    total: paged.total,
    stats,
  });
}
