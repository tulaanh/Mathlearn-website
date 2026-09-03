import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/supabase/server";
import { getBankQuestions } from "@/lib/question-bank";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

/** GET /api/question-bank — danh sách câu hỏi ngân hàng. */
export async function GET(request: Request) {
  // Rate limiting: 100 req/min cho read
  const ip = getClientIp(request);
  const { success } = rateLimit(ip, { interval: 60_000, limit: 100 });
  if (!success) {
    return NextResponse.json(
      { error: "Quá nhiều yêu cầu. Vui lòng thử lại sau." },
      { status: 429, headers: { "Retry-After": "60" } },
    );
  }

  const { user } = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Cần đăng nhập để xem ngân hàng câu hỏi." }, { status: 401 });
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
