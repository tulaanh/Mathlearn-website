import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/supabase/server";
import { deleteQuestionReport, updateQuestionReport } from "@/lib/reports";
import type { ReportStatus } from "@/lib/report-types";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

type RouteProps = {
  params: Promise<{ id: string }>;
};

/**
 * PATCH /api/reports/[id] — Cập nhật trạng thái / ghi chú của báo lỗi (chỉ giáo viên).
 */
export async function PATCH(request: Request, { params }: RouteProps) {
  // Rate limiting: 30 req/min cho write
  const ip = getClientIp(request);
  const { success } = rateLimit(ip, { interval: 60_000, limit: 30 });
  if (!success) {
    return NextResponse.json(
      { error: "Quá nhiều yêu cầu. Vui lòng thử lại sau." },
      { status: 429, headers: { "Retry-After": "60" } },
    );
  }

  const { user, profile } = await getCurrentUser();
  if (!user || profile?.role !== "teacher") {
    return NextResponse.json(
      { error: "Chỉ giáo viên mới có quyền cập nhật báo lỗi." },
      { status: 403 },
    );
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "ID báo lỗi không hợp lệ." }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { status, resolutionNote } = body;

    const validStatuses: ReportStatus[] = ["pending", "resolved", "rejected"];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ error: "Trạng thái không hợp lệ." }, { status: 400 });
    }

    const result = await updateQuestionReport(id, {
      status,
      resolutionNote,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error || "Cập nhật thất bại." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("API PATCH /api/reports/[id] error:", err);
    return NextResponse.json({ error: "Lỗi hệ thống khi cập nhật báo lỗi." }, { status: 500 });
  }
}

/**
 * DELETE /api/reports/[id] — Xóa báo lỗi (chỉ giáo viên).
 */
export async function DELETE(_request: Request, { params }: RouteProps) {
  // Rate limiting: 30 req/min cho write
  const ip = getClientIp(_request);
  const { success } = rateLimit(ip, { interval: 60_000, limit: 30 });
  if (!success) {
    return NextResponse.json(
      { error: "Quá nhiều yêu cầu. Vui lòng thử lại sau." },
      { status: 429, headers: { "Retry-After": "60" } },
    );
  }

  const { user, profile } = await getCurrentUser();
  if (!user || profile?.role !== "teacher") {
    return NextResponse.json(
      { error: "Chỉ giáo viên mới có quyền xóa báo lỗi." },
      { status: 403 },
    );
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "ID báo lỗi không hợp lệ." }, { status: 400 });
  }

  try {
    const result = await deleteQuestionReport(id);
    if (!result.success) {
      return NextResponse.json({ error: result.error || "Xóa thất bại." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("API DELETE /api/reports/[id] error:", err);
    return NextResponse.json({ error: "Lỗi hệ thống khi xóa báo lỗi." }, { status: 500 });
  }
}
