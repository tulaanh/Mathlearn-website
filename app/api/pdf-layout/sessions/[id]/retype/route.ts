import { NextResponse } from "next/server";
import { spawn } from "node:child_process";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { getSafeSessionId, layoutWorkRoot, requireTeacher } from "@/lib/pdf-layout-server";
import { normalizeLayout, normalizeRegionTranscription, type PdfLayout, type Region, type RegionAsset, type RetypedDocument } from "@/lib/pdf-layout-types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Params = { params: Promise<{ id: string }> };
type RequestBody = { regionId?: unknown };
type WorkerResult = { regionId: string; page?: number; transcription?: Parameters<typeof normalizeRegionTranscription>[0]; asset?: RegionAsset | null; error?: string };
const workerPath = path.join(process.cwd(), "scripts", "antigravity_retype.py");
const MAX_REGIONS = 1000;

function getTargets(layout: PdfLayout, body: RequestBody): Array<{ page: number; region: Region }> {
  const id = typeof body.regionId === "string" ? body.regionId : null;
  if (!id) throw new Error('Cần truyền "regionId".');
  const targets: Array<{ page: number; region: Region }> = [];
  for (const page of layout.pages) for (const region of page.regions) {
    if (!region.enabled || region.kind === "ignore") continue;
    if (id ? region.id === id : true) targets.push({ page: page.page, region });
  }
  if (id && !targets.length) throw new Error("Không tìm thấy vùng đang bật.");
  if (targets.length > MAX_REGIONS) throw new Error(`Mỗi lần chỉ xử lý tối đa ${MAX_REGIONS} vùng.`);
  return targets;
}

function runWorker(input: object): Promise<{ ok: boolean; results: WorkerResult[]; error?: string }> {
  return new Promise((resolve, reject) => {
    const child = spawn(process.env.PYTHON_BIN || "python", ["-u", workerPath], {
      cwd: process.cwd(), windowsHide: true, stdio: ["pipe", "pipe", "pipe"],
    });
    let stdout = ""; let stderr = ""; let finished = false;
    const timeout = setTimeout(() => { child.kill(); reject(new Error("Worker nhận diện quá thời gian cho phép.")); }, 10 * 60 * 1000);
    child.stdout.setEncoding("utf8"); child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk: string) => { stdout += chunk; });
    child.stderr.on("data", (chunk: string) => { stderr += chunk; });
    child.on("error", (error) => { clearTimeout(timeout); if (!finished) { finished = true; reject(new Error(`Không chạy được Python: ${error.message}`)); } });
    child.on("close", (code) => {
      clearTimeout(timeout); if (finished) return; finished = true;
      try {
        const result = JSON.parse(stdout.trim()) as { ok?: boolean; results?: WorkerResult[]; error?: string };
        resolve({ ok: result.ok === true && code === 0, results: Array.isArray(result.results) ? result.results : [], error: result.error || (code ? stderr.trim() : undefined) });
      } catch { reject(new Error(`Worker không trả về JSON hợp lệ${stderr ? `: ${stderr.trim()}` : "."}`)); }
    });
    child.stdin.end(JSON.stringify(input));
  });
}

export async function POST(request: Request, { params }: Params) {
  const auth = await requireTeacher(); if (auth.response) return auth.response;
  const { id: rawId } = await params; const id = getSafeSessionId(rawId);
  if (!id) return NextResponse.json({ error: "Session không hợp lệ." }, { status: 400 });
  let body: RequestBody;
  try { body = await request.json() as RequestBody; } catch { return NextResponse.json({ error: "JSON không hợp lệ." }, { status: 400 }); }
  const directory = path.join(layoutWorkRoot, id);
  try {
    const layout = normalizeLayout(JSON.parse(await readFile(path.join(directory, "regions.json"), "utf8")));
    const targets = getTargets(layout, body);
    await writeFile(path.join(directory, "status.json"), JSON.stringify({ status: "processing", stage: "retyping", progress: 0, pages: layout.pages.length, processed: 0 }, null, 2), "utf8");
    const items = targets.map(({ page: pageNumber, region }) => {
      const page = layout.pages.find((candidate) => candidate.page === pageNumber);
      if (!page) throw new Error(`Không tìm thấy trang ${pageNumber}.`);
      return { regionId: region.id, page: pageNumber, kind: region.kind, role: region.role, bbox: region.bbox, pagePath: path.join(directory, "pages", `page-${String(pageNumber).padStart(4, "0")}.png`), cropPath: path.join(directory, "crops", `${region.id.replace(/[^a-zA-Z0-9_-]/g, "_")}.png`) };
    });
    const worker = await runWorker({ items });
    if (!worker.ok && !worker.results.length) throw new Error(worker.error || "Worker nhận diện thất bại.");
    const resultById = new Map(worker.results.map((result) => [result.regionId, result]));
    let processed = 0; let failed = 0; let needsReview = 0;
    const assets: RegionAsset[] = [];
    for (const page of layout.pages) for (const region of page.regions) {
      const result = resultById.get(region.id);
      if (!result) {
        if (region.asset) assets.push({ ...region.asset, page: page.page, bbox: region.bbox });
        continue;
      }
      if (result.asset) {
        region.asset = { ...result.asset, page: page.page, bbox: region.bbox };
        assets.push(region.asset);
      }
      if (result.transcription) {
        region.transcription = normalizeRegionTranscription({ ...result.transcription, processedAt: new Date().toISOString() }, region.kind);
        if (region.transcription.status === "error") failed += 1; else processed += 1;
        if (region.transcription.needsReview) needsReview += 1;
      } else if (!result.asset) {
        failed += 1;
        region.transcription = normalizeRegionTranscription({ status: "error", error: result.error || "Worker không có kết quả", warnings: [result.error || "Worker không có kết quả"] }, region.kind);
        needsReview += 1;
      } else {
        processed += 1;
      }
    }
    const uniqueAssets = [...new Map(assets.map((asset) => [asset.fileName, asset])).values()];
    const blocks = layout.pages.flatMap((page) => [...page.regions]
      .filter((region) => region.enabled && region.kind !== "ignore")
      .sort((a, b) => a.order - b.order)
      .map((region) => ({
        regionId: region.id, page: page.page, order: region.order, kind: region.kind,
        role: region.role, bbox: region.bbox,
        ...(region.transcription?.content ? { content: region.transcription.content, rawText: region.transcription.rawText } : {}),
        ...(region.asset ? { assetFileName: region.asset.fileName } : {}),
      })));
    const retypedDocument: RetypedDocument = {
      version: 1, kind: "retyped_document", source: layout.source,
      createdAt: new Date().toISOString(), blocks, assets: uniqueAssets,
    };
    await mkdir(path.join(directory, "assets"), { recursive: true });
    await writeFile(path.join(directory, "assets", "manifest.json"), JSON.stringify({ version: 1, kind: "pdf_assets", source: layout.source, assets: uniqueAssets }, null, 2), "utf8");
    await writeFile(path.join(directory, "document.json"), JSON.stringify(retypedDocument, null, 2), "utf8");
    const temp = path.join(directory, "regions.json.tmp");
    await writeFile(temp, JSON.stringify(layout, null, 2), "utf8"); await rename(temp, path.join(directory, "regions.json"));
    await writeFile(path.join(directory, "status.json"), JSON.stringify({ status: failed ? "review" : "done", stage: failed ? "review" : "ready", progress: 100, pages: layout.pages.length, processed, failed, needsReview, assets: uniqueAssets.length, documentReady: true }, null, 2), "utf8");
    return NextResponse.json({ ok: failed === 0, processed, failed, needsReview, assets: uniqueAssets.length, document: retypedDocument, results: worker.results }, { status: failed ? 207 : 200 });
  } catch (error) { await writeFile(path.join(directory, "status.json"), JSON.stringify({ status: "error", stage: "retyping_failed", progress: 0, error: (error as Error).message }, null, 2), "utf8").catch(() => undefined); return NextResponse.json({ error: (error as Error).message }, { status: 400 }); }
}
