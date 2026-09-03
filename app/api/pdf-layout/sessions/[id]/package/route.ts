import { NextResponse } from "next/server";
import { readdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { createZip, type ZipEntry } from "@/lib/zip";
import { getSafeSessionId, layoutWorkRoot, requireTeacher } from "@/lib/pdf-layout-server";
import { normalizeLayout, type PdfLayout } from "@/lib/pdf-layout-types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Params = { params: Promise<{ id: string }> };

function safePackageName(source: string): string {
  const stem = source.replace(/\.pdf$/i, "").replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/^-+|-+$/g, "") || "pdf";
  return `${stem}-antigravity-regions.zip`;
}

function readJsonBody(value: unknown): { layout?: unknown } {
  return value && typeof value === "object" ? value as { layout?: unknown } : {};
}

export async function POST(request: Request, { params }: Params) {
  const auth = await requireTeacher();
  if (auth.response) return auth.response;
  const { id: rawId } = await params;
  const id = getSafeSessionId(rawId);
  if (!id) return NextResponse.json({ error: "Session không hợp lệ." }, { status: 400 });

  try {
    const body = readJsonBody(await request.json());
    const directory = path.join(layoutWorkRoot, id);
    const layout = normalizeLayout(body.layout ?? JSON.parse(await readFile(path.join(directory, "regions.json"), "utf8"))) as PdfLayout;
    const sourcePath = path.join(directory, "source.pdf");
    const sourceData = await readFile(sourcePath);
    const serializedLayout = JSON.stringify(layout, null, 2);
    const layoutTempPath = path.join(directory, "regions.json.package.tmp");
    await writeFile(layoutTempPath, serializedLayout, "utf8");
    await rename(layoutTempPath, path.join(directory, "regions.json"));
    const layoutData = Buffer.from(serializedLayout, "utf8");
    const cropEntries: ZipEntry[] = [];
    try {
      const cropNames = await readdir(path.join(directory, "crops"));
      for (const cropName of cropNames.sort()) {
        if (!/^[a-zA-Z0-9_-]+\.png$/.test(cropName)) continue;
        try {
          cropEntries.push({ name: `crops/${cropName}`, data: await readFile(path.join(directory, "crops", cropName)) });
        } catch {
          // Bỏ qua crop đang bị xóa hoặc chưa ghi xong; PDF và layout vẫn được đóng gói.
        }
      }
    } catch {
      // Chưa có crop là trạng thái hợp lệ khi chỉ mới phân vùng.
    }

    const pageEntries: ZipEntry[] = [];
    const pageManifest: Array<{ page: number; path: string; width: number; height: number }> = [];
    for (const page of layout.pages) {
      const fileName = `page-${String(page.page).padStart(4, "0")}.png`;
      pageEntries.push({ name: `pages/${fileName}`, data: await readFile(path.join(directory, "pages", fileName)) });
      pageManifest.push({ page: page.page, path: `pages/${fileName}`, width: page.width, height: page.height });
    }

    const manifest = {
      version: 1,
      kind: "antigravity_pdf_regions",
      generatedAt: new Date().toISOString(),
      sourcePdf: "source.pdf",
      regions: "regions.json",
      pages: pageManifest,
      crops: cropEntries.map((entry) => entry.name),
      processing: { segmentation: "done", fullRecognition: "not_run", note: "Các vùng chỉ được phân vùng/chỉnh sửa; chưa OCR toàn bộ." },
    };
    const instructions = `# Antigravity PDF regions package\n\nGói này được tạo sau bước phân vùng PDF.\n\n- source.pdf: PDF gốc.\n- pages/: ảnh từng trang, tọa độ bbox trong regions.json dùng theo ảnh gốc.\n- regions.json: layout và các vùng đã được giáo viên kiểm tra/chỉnh sửa.\n- crops/: crop PNG đã tạo trước đó (nếu có).\n- manifest.json: mô tả gói và danh sách file.\n\nFull recognition/OCR chưa được chạy. Antigravity có thể dùng regions.json để xử lý từng vùng theo kind, role và bbox.\n`;
    const entries: ZipEntry[] = [
      { name: "source.pdf", data: sourceData },
      ...pageEntries,
      { name: "regions.json", data: layoutData },
      { name: "manifest.json", data: Buffer.from(JSON.stringify(manifest, null, 2), "utf8") },
      { name: "README.md", data: Buffer.from(instructions, "utf8") },
      ...cropEntries,
    ];
    const zip = createZip(entries);
    await writeFile(path.join(directory, "antigravity-manifest.json"), JSON.stringify(manifest, null, 2), "utf8");
    return new NextResponse(new Uint8Array(zip), {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${safePackageName(layout.source)}"`,
        "Content-Length": String(zip.length),
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return NextResponse.json({ error: `Không thể đóng gói phiên PDF: ${(error as Error).message}` }, { status: 400 });
  }
}
