import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/supabase/server";
import { getBankQuestionById } from "@/lib/question-bank";

/** GET /api/question-bank/[id] — nội dung đầy đủ một câu hỏi. */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user } = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Cần đăng nhập để xem câu hỏi." }, { status: 401 });
  }
  const { id } = await params;
  const question = await getBankQuestionById(id);
  if (!question) {
    return NextResponse.json({ error: "Không tìm thấy câu hỏi." }, { status: 404 });
  }
  return NextResponse.json(question);
}
