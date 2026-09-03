import { NextResponse } from "next/server";
import { spawn } from "node:child_process";
import { createWriteStream } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { layoutWorkRoot, requireTeacher } from "@/lib/pdf-layout-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const workRoot = layoutWorkRoot;
const projectRoot = process.cwd();
const scriptPath = path.join(projectRoot, "scripts", "pdf_layout_prepare.py");
const modelPath = path.join(projectRoot, ".agents", "skills", "new-convert-bank", "models", "doclayout_yolo_docstructbench_imgsz1024.pt");


export async function POST(request: Request) {
  const auth = await requireTeacher();
  if (auth.response) return auth.response;
  const formData = await request.formData();
  const uploaded = formData.get("file");
  if (!(uploaded instanceof File)) return NextResponse.json({ error: "Vui lÃ²ng chá»n má»™t file PDF." }, { status: 400 });
  if (!uploaded.name.toLowerCase().endsWith(".pdf") && uploaded.type !== "application/pdf") return NextResponse.json({ error: "Chá»‰ há»— trá»£ file PDF." }, { status: 400 });
  if (uploaded.size === 0 || uploaded.size > 150 * 1024 * 1024) return NextResponse.json({ error: "PDF pháº£i cÃ³ dung lÆ°á»£ng tá»« 1 byte Ä‘áº¿n 150 MB." }, { status: 400 });

  const sessionId = randomUUID();
  const sessionDir = path.join(workRoot, sessionId);
  await mkdir(sessionDir, { recursive: true });
  await writeFile(path.join(sessionDir, "source.pdf"), Buffer.from(await uploaded.arrayBuffer()));
  await writeFile(path.join(sessionDir, "status.json"), JSON.stringify({ status: "queued", stage: "queued", progress: 0, source: uploaded.name }, null, 2), "utf8");
  const args = [scriptPath, path.join(sessionDir, "source.pdf"), sessionDir, "--dpi", "120"];
  if (modelPath) args.push("--model", modelPath);
  const child = spawn(process.env.PYTHON_BIN || "python", args, { cwd: projectRoot, windowsHide: true, stdio: ["ignore", "pipe", "pipe"] });
  const logStream = createWriteStream(path.join(sessionDir, "worker.log"), { flags: "a" });
  child.stdout?.pipe(logStream, { end: false });
  child.stderr?.pipe(logStream, { end: false });
  child.on("close", () => logStream.end());
  child.on("error", async (error) => {
    await writeFile(path.join(sessionDir, "status.json"), JSON.stringify({ status: "error", stage: "failed", progress: 0, error: `KhÃ´ng cháº¡y Ä‘Æ°á»£c Python: ${error.message}` }, null, 2), "utf8").catch(() => undefined);
  });
  child.unref();
  return NextResponse.json({ sessionId, source: uploaded.name }, { status: 202 });
}

