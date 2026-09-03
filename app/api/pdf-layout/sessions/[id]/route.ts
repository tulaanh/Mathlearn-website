import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { layoutWorkRoot, getSafeSessionId, requireTeacher } from "@/lib/pdf-layout-server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Params = { params: Promise<{ id: string }> };
export async function GET(_request: Request, { params }: Params) {
  const auth = await requireTeacher(); if (auth.response) return auth.response;
  const { id: rawId } = await params; const id = getSafeSessionId(rawId);
  if (!id) return NextResponse.json({ error: "Session không hợp lệ." }, { status: 400 });
  try { const directory = path.join(layoutWorkRoot, id); const status = JSON.parse(await readFile(path.join(directory, "status.json"), "utf8")); let regions;
    if (status.status === "done" || status.status === "review") { try { regions = JSON.parse(await readFile(path.join(directory, "regions.json"), "utf8")); } catch { /* worker đang ghi */ } }
    return NextResponse.json({ ...status, ...(regions ? { regions } : {}) }, { headers: { "Cache-Control": "no-store" } });
  } catch { return NextResponse.json({ error: "Không tìm thấy phiên xử lý." }, { status: 404 }); }
}
