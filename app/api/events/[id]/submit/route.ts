import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/supabase/server";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/** POST /api/events/:id/submit — server-side chấm bài và gây sát thương. */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  // Rate limiting: 10 req/min (critical endpoint)
  const ip = getClientIp(request);
  const { success } = rateLimit(ip, { interval: 60_000, limit: 10 });
  if (!success) {
    return NextResponse.json(
      { error: "Quá nhiều yêu cầu. Vui lòng thử lại sau." },
      { status: 429, headers: { "Retry-After": "60" } },
    );
  }

  const { user, supabase } = await getCurrentUser();
  if (!user || !supabase) {
    return NextResponse.json({ error: "Cần đăng nhập để nộp bài." }, { status: 401 });
  }
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) {
    return NextResponse.json({ error: "Mã lượt làm bài không hợp lệ." }, { status: 400 });
  }
  const answers: Record<string, string> = {};
  try {
    const body = await request.json();
    if (body.answers && typeof body.answers === "object" && !Array.isArray(body.answers)) {
      Object.entries(body.answers)
        .filter(([key, value]) => key.length <= 200 && typeof value === "string" && value.length <= 1000)
        .slice(0, 500)
        .forEach(([key, value]) => { answers[key] = value as string; });
    }
  } catch { /* bỏ qua JSON rỗng/trống */ }
  const { data, error } = await supabase.rpc("submit_event_attempt", {
    p_attempt_id: id,
    p_answers: answers,
  });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json(data);
}
