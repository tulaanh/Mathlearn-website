import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/supabase/server";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/** POST /api/events/:id/start — bắt đầu/tiếp tục một lượt làm hoạt động. */
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  // Rate limiting: 10 req/min (critical endpoint)
  const ip = getClientIp(_request);
  const { success } = rateLimit(ip, { interval: 60_000, limit: 10 });
  if (!success) {
    return NextResponse.json(
      { error: "Quá nhiều yêu cầu. Vui lòng thử lại sau." },
      { status: 429, headers: { "Retry-After": "60" } },
    );
  }

  const { user, supabase } = await getCurrentUser();
  if (!user || !supabase) {
    return NextResponse.json({ error: "Cần đăng nhập để tham gia sự kiện." }, { status: 401 });
  }
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) {
    return NextResponse.json({ error: "Mã hoạt động không hợp lệ." }, { status: 400 });
  }
  const { data, error } = await supabase.rpc("start_event_attempt", { p_activity_id: id });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json(data);
}
