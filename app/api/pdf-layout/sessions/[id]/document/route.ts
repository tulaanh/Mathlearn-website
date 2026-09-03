import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { getSafeSessionId, layoutWorkRoot, requireTeacher } from "@/lib/pdf-layout-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const auth = await requireTeacher();
  if (auth.response) return auth.response;
  const { id: rawId } = await params;
  const id = getSafeSessionId(rawId);
  if (!id) return NextResponse.json({ error: "Session không hợp lệ." }, { status: 400 });
  try {
    const document = await readFile(path.join(layoutWorkRoot, id, "document.json"), "utf8");
    return new NextResponse(document, { headers: { "Content-Type": "application/json; charset=utf-8", "Content-Disposition": "attachment; filename=\"document.json\"", "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Chưa có document.json. Hãy nhận diện từng vùng trước; nếu muốn bàn giao sau phân vùng, hãy tải gói Antigravity." }, { status: 404 });
  }
}
