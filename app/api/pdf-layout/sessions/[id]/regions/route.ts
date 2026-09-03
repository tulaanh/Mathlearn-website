import { NextResponse } from "next/server";
import { readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { layoutWorkRoot, getSafeSessionId, requireTeacher } from "@/lib/pdf-layout-server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Params = { params: Promise<{ id: string }> };
export async function GET(_request: Request, { params }: Params) {
  const auth = await requireTeacher(); if (auth.response) return auth.response;
  const { id: rawId } = await params; const id = getSafeSessionId(rawId);
  if (!id) return NextResponse.json({ error: "Session không hợp lệ." }, { status: 400 });
  try { return NextResponse.json(JSON.parse(await readFile(path.join(layoutWorkRoot, id, "regions.json"), "utf8")), { headers: { "Cache-Control": "no-store" } }); }
  catch { return NextResponse.json({ error: "Chưa có dữ liệu vùng." }, { status: 404 }); }
}
export async function PATCH(request: Request, { params }: Params) {
  const auth = await requireTeacher(); if (auth.response) return auth.response;
  const { id: rawId } = await params; const id = getSafeSessionId(rawId);
  if (!id) return NextResponse.json({ error: "Session không hợp lệ." }, { status: 400 });
  let payload: unknown; try { payload = await request.json(); } catch { return NextResponse.json({ error: "JSON không hợp lệ." }, { status: 400 }); }
  if (!payload || typeof payload !== "object" || !Array.isArray((payload as { pages?: unknown }).pages)) return NextResponse.json({ error: "Dữ liệu phải có mảng pages." }, { status: 400 });
  const serialized = JSON.stringify(payload, null, 2); if (serialized.length > 20 * 1024 * 1024) return NextResponse.json({ error: "Dữ liệu vùng vượt quá 20 MB." }, { status: 400 });
  const directory = path.join(layoutWorkRoot, id);
  try { const temp = path.join(directory, "regions.json.tmp"); await writeFile(temp, serialized, "utf8"); await rename(temp, path.join(directory, "regions.json")); return NextResponse.json({ ok: true, savedAt: new Date().toISOString() }); }
  catch { return NextResponse.json({ error: "Không thể lưu regions.json." }, { status: 500 }); }
}
