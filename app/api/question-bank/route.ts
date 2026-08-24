import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/supabase/server";
import { getBankQuestions } from "@/lib/question-bank";

/** GET /api/question-bank — danh sách câu hỏi ngân hàng (chỉ giáo viên). */
export async function GET(request: Request) {
  const { user, profile } = await getCurrentUser();
  if (!user || profile?.role !== "teacher") {
    return NextResponse.json({ error: "Chỉ giáo viên mới được xem ngân hàng câu hỏi." }, { status: 403 });
  }
  const url = new URL(request.url);
  const limitParam = Number(url.searchParams.get("limit") ?? "0");
  const { items: questions } = await getBankQuestions(
    {
      search: url.searchParams.get("q") ?? undefined,
      grade: url.searchParams.get("grade") ?? undefined,
      topicId: url.searchParams.get("topic") ?? undefined,
      difficulty: (url.searchParams.get("difficulty") ?? "") as never,
      type: (url.searchParams.get("type") ?? "") as never,
    },
    1,
    Number.isInteger(limitParam) && limitParam > 0 ? limitParam : 200,
  );
  return NextResponse.json({ questions });
}
