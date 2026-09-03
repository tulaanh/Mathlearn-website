import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { layoutWorkRoot, getSafeSessionId, requireTeacher } from "@/lib/pdf-layout-server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Params = { params: Promise<{ id: string; page: string }> };
export async function GET(_request: Request, { params }: Params) {
  const auth = await requireTeacher(); if (auth.response) return auth.response;
  const { id: rawId, page: rawPage } = await params; const id = getSafeSessionId(rawId); const page = Number.parseInt(rawPage, 10);
  if (!id || !Number.isInteger(page) || page < 1 || page > 9999) return NextResponse.json({ error: "Tham số không hợp lệ." }, { status: 400 });
  try { const image = await readFile(path.join(layoutWorkRoot, id, "pages", `page-${String(page).padStart(4, "0")}.png`)); return new NextResponse(new Uint8Array(image), { headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=3600" } }); }
  catch { return NextResponse.json({ error: "Không tìm thấy ảnh trang." }, { status: 404 }); }
}
