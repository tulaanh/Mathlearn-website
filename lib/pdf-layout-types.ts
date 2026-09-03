export type RegionKind = "text" | "formula" | "image" | "table" | "ignore";
export type RegionRole = "unassigned" | "question" | "solution" | "header" | "footer";
export type TranscriptionStatus = "pending" | "processing" | "done" | "review" | "error";
export type TranscriptionContentType = "text" | "latex" | "mixed" | "none";

export type RegionValidation = {
  dollarsBalanced: boolean;
  bracesBalanced: boolean;
  katexCompatible: boolean;
};

export type RegionTranscription = {
  status: TranscriptionStatus;
  rawText: string;
  content: string;
  contentType: TranscriptionContentType;
  confidence: number;
  needsReview: boolean;
  warnings: string[];
  validation?: RegionValidation;
  processedAt?: string;
  error?: string;
};

export type Region = {
  id: string;
  kind: RegionKind;
  role: RegionRole;
  bbox: [number, number, number, number];
  order: number;
  enabled: boolean;
  confidence?: number;
  source?: string;
  groupId?: string;
  groupRole?: "stem" | "option" | "statement" | "answer" | "explanation" | "image";
  optionKey?: "A" | "B" | "C" | "D" | "E" | "F";
  transcription?: RegionTranscription;
  asset?: RegionAsset;
};

export type RegionAsset = {
  fileName: string;
  kind: "image" | "table";
  mimeType: "image/png";
  page: number;
  bbox: [number, number, number, number];
  width?: number;
  height?: number;
};

export type RetypedDocument = {
  version: 1;
  kind: "retyped_document";
  source: string;
  createdAt: string;
  blocks: Array<{
    regionId: string;
    page: number;
    order: number;
    kind: RegionKind;
    role: RegionRole;
    bbox: [number, number, number, number];
    content?: string;
    rawText?: string;
    assetFileName?: string;
  }>;
  assets: RegionAsset[];
};

export type Page = {
  page: number;
  file: string;
  width: number;
  height: number;
  regions: Region[];
};

export type PdfLayout = {
  version: number;
  kind: string;
  source: string;
  createdAt?: string;
  pages: Page[];
};

export type RetypeResponse = {
  ok: boolean;
  processed: number;
  failed: number;
  needsReview: number;
  results: Array<{ page: number; regionId: string; transcription?: RegionTranscription; asset?: RegionAsset; error?: string }>;
};

const ALLOWED_KINDS = new Set<RegionKind>(["text", "formula", "image", "table", "ignore"]);
const ALLOWED_ROLES = new Set<RegionRole>(["unassigned", "question", "solution", "header", "footer"]);

export function isRetypeKind(kind: RegionKind): boolean {
  return kind === "text" || kind === "formula";
}

export function countUnescapedDollars(value: string): number {
  let count = 0;
  let slashCount = 0;
  for (const char of value) {
    if (char === "\\") slashCount += 1;
    else {
      if (char === "$" && slashCount % 2 === 0) count += 1;
      slashCount = 0;
    }
  }
  return count;
}

export function hasBalancedBraces(value: string): boolean {
  let depth = 0;
  let escaped = false;
  for (const char of value) {
    if (escaped) { escaped = false; continue; }
    if (char === "\\") { escaped = true; continue; }
    if (char === "{") depth += 1;
    if (char === "}") { depth -= 1; if (depth < 0) return false; }
  }
  return depth === 0;
}

export function validateTranscription(content: string): RegionValidation {
  return {
    dollarsBalanced: countUnescapedDollars(content) % 2 === 0,
    bracesBalanced: hasBalancedBraces(content),
    katexCompatible: !content.includes("\\(") && !content.includes("\\[") &&
      !/\\(?:vspace|par|textbf|textit|begin\{(?:itemize|enumerate|tabular|center)\})/.test(content),
  };
}

export function normalizeRegionTranscription(input: Partial<RegionTranscription>, kind: RegionKind): RegionTranscription {
  const content = typeof input.content === "string" ? input.content.normalize("NFC").trim() : "";
  const rawText = typeof input.rawText === "string" ? input.rawText.normalize("NFC").trim() : content;
  const validation = validateTranscription(content);
  const warnings = Array.isArray(input.warnings) ? input.warnings.filter((x): x is string => typeof x === "string") : [];
  if (!validation.dollarsBalanced) warnings.push("Công thức chưa cân bằng dấu $.");
  if (!validation.bracesBalanced) warnings.push("Công thức chưa cân bằng dấu ngoặc nhọn {}.");
  if (!validation.katexCompatible) warnings.push("Nội dung có lệnh/kiểu LaTeX không tương thích với quy tắc KaTeX.");
  const confidence = typeof input.confidence === "number" && Number.isFinite(input.confidence)
    ? Math.max(0, Math.min(1, input.confidence)) : 0;
  const needsReview = input.needsReview === true || warnings.length > 0 || confidence < 0.8;
  return {
    status: input.status ?? (needsReview ? "review" : "done"),
    rawText, content,
    contentType: input.contentType ?? (kind === "formula" ? "latex" : "text"),
    confidence, needsReview, warnings: [...new Set(warnings)], validation,
    ...(input.processedAt ? { processedAt: input.processedAt } : {}),
    ...(input.error ? { error: input.error } : {}),
  };
}


export function normalizeLayout(value: unknown): PdfLayout {
  if (!value || typeof value !== "object") throw new Error("Layout không hợp lệ.");
  const root = value as Record<string, unknown>;
  if (!Array.isArray(root.pages)) throw new Error('Layout phải có mảng "pages".');
  const pages = root.pages.map((rawPage, pageIndex) => {
    if (!rawPage || typeof rawPage !== "object") throw new Error(`Trang #${pageIndex + 1} không hợp lệ.`);
    const p = rawPage as Record<string, unknown>;
    const page = Number(p.page), width = Number(p.width), height = Number(p.height);
    if (!Number.isInteger(page) || page < 1 || !Number.isFinite(width) || !Number.isFinite(height)) throw new Error(`Trang #${pageIndex + 1} thiếu kích thước hợp lệ.`);
    if (!Array.isArray(p.regions)) throw new Error(`Trang ${page} thiếu mảng regions.`);
    const regions = p.regions.map((rawRegion, regionIndex) => {
      if (!rawRegion || typeof rawRegion !== "object") throw new Error(`Vùng #${regionIndex + 1} ở trang ${page} không hợp lệ.`);
      const r = rawRegion as Record<string, unknown>;
      const bbox = Array.isArray(r.bbox) && r.bbox.length === 4 ? r.bbox.map(Number) : [];
      if (bbox.length !== 4 || bbox.some((n) => !Number.isFinite(n))) throw new Error(`bbox vùng ${String(r.id ?? regionIndex + 1)} không hợp lệ.`);
      const [x1, y1, x2, y2] = bbox;
      if (x1 < 0 || y1 < 0 || x2 <= x1 || y2 <= y1 || x2 > width || y2 > height) throw new Error(`bbox vùng ${String(r.id ?? regionIndex + 1)} vượt khỏi trang.`);
      return {
        ...r,
        id: typeof r.id === "string" && r.id ? r.id : `p${page}-r${regionIndex + 1}`,
        kind: ALLOWED_KINDS.has(r.kind as RegionKind) ? r.kind as RegionKind : "text",
        role: ALLOWED_ROLES.has(r.role as RegionRole) ? r.role as RegionRole : "unassigned",
        bbox: [x1, y1, x2, y2] as [number, number, number, number],
        order: Number.isInteger(r.order) ? Number(r.order) : regionIndex + 1,
        enabled: r.enabled !== false,
      } as Region;
    });
    return { ...p, page, width, height, regions } as Page;
  });
  return {
    ...root,
    version: Number.isInteger(root.version) ? Number(root.version) : 1,
    kind: typeof root.kind === "string" ? root.kind : "pdf_layout_regions",
    source: typeof root.source === "string" ? root.source : "document.pdf",
    pages,
  } as PdfLayout;
}
