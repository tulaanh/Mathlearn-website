import { NextResponse } from "next/server";
import os from "node:os";
import path from "node:path";
import { getCurrentUser } from "@/lib/supabase/server";

export const layoutWorkRoot = path.join(os.tmpdir(), "mathlearn-pdf-layout");
export function getSafeSessionId(value: string) { return /^[a-f0-9-]{20,64}$/i.test(value) ? value : null; }
export async function requireTeacher() {
  const { user, profile } = await getCurrentUser();
  if (!user) return { response: NextResponse.json({ error: "Cần đăng nhập." }, { status: 401 }) };
  if (profile?.role !== "teacher") return { response: NextResponse.json({ error: "Chỉ giáo viên mới được dùng công cụ này." }, { status: 403 }) };
  return { user };
}
