import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { getSafeSessionId, layoutWorkRoot, requireTeacher } from "@/lib/pdf-layout-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Params = { params: Promise<{ id: string; file: string }> };

export async function GET(_request: Request, { params }: Params) {
  const auth = await requireTeacher();
  if (auth.response) return auth.response;
  const { id: rawId, file: rawFile } = await params;
  const id = getSafeSessionId(rawId);
  const file = path.basename(rawFile);
  if (!id || !file || file !== rawFile || !/^[a-zA-Z0-9_-]+\.png$/.test(file)) {
    return NextResponse.json({ error: "Tham số không hợp lệ." }, { status: 400 });
  }
  try {
    const image = await readFile(path.join(layoutWorkRoot, id, "crops", file));
    return new NextResponse(new Uint8Array(image), { headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=3600" } });
  } catch {
    return NextResponse.json({ error: "Không tìm thấy crop." }, { status: 404 });
  }
}
