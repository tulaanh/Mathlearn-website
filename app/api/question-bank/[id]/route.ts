import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/supabase/server";
import { getBankQuestionById } from "@/lib/question-bank";

/** GET /api/question-bank/[id] — nội dung đầy đủ một câu hỏi (chỉ giáo viên). */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, profile } = await getCurrentUser();
  if (!user || profile?.role !== "teacher") {
    return NextResponse.json({ error: "Không có quyền truy cập." }, { status: 403 });
  }
  const { id } = await params;
  const question = await getBankQuestionById(id);
  if (!question) {
    return NextResponse.json({ error: "Không tìm thấy câu hỏi." }, { status: 404 });
  }
  return NextResponse.json(question);
}
