import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/** GET /api/events/:id/leaderboard — bảng xếp hạng theo metric của event. */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, supabase } = await getCurrentUser();
  if (!user || !supabase) return NextResponse.json({ error: "Cần đăng nhập." }, { status: 401 });
  const { id } = await params;
  let { data, error } = await supabase.rpc("event_score_leaderboard", { p_event_id: id, p_limit: 20 });
  if (error) {
    const legacy = await supabase.rpc("event_leaderboard", { p_event_id: id, p_limit: 20 });
    data = (legacy.data ?? []).map((row: any) => ({ ...row, total_score: row.total_damage, metric: "damage" }));
    error = legacy.error;
  }
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ leaderboard: data ?? [] });
}
