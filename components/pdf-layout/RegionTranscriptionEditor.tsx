"use client";

import { normalizeRegionTranscription, type Region } from "@/lib/pdf-layout-types";

type Props = {
  region: Region | null;
  change: (patch: Partial<Region>) => void;
  retype: () => void;
  busy: boolean;
};

export default function RegionTranscriptionEditor({ region, change, retype, busy }: Props) {
  if (!region || region.kind === "ignore") return null;
  if (region.kind === "image" || region.kind === "table") return <div className="rounded-2xl border border-emerald-200 bg-white p-4 dark:border-emerald-900 dark:bg-[#131b2e]">
    <h3 className="mb-2 text-sm font-extrabold dark:text-white">Ảnh / đồ thị / bảng</h3>
    <p className="mb-3 text-xs leading-5 text-slate-500">Giữ nguyên vùng này dưới dạng PNG crop, không ép nhận diện thành văn bản.</p>
    <button type="button" onClick={retype} disabled={busy} className="w-full rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-50">
      {busy ? "Đang crop..." : "Crop vùng này"}
    </button>
  </div>;
  const transcription = region.transcription;
  const update = (key: "rawText" | "content", value: string) => {
    const current = transcription ?? {
      status: "review" as const,
      rawText: "",
      content: "",
      contentType: region.kind === "formula" ? "latex" as const : "text" as const,
      confidence: 0,
      needsReview: true,
      warnings: [],
    };
    change({ transcription: normalizeRegionTranscription({ ...current, [key]: value, status: "review", needsReview: true }, region.kind) });
  };
  return <div className="rounded-2xl border border-violet-200 bg-white p-4 dark:border-violet-900 dark:bg-[#131b2e]">
    <div className="mb-3 flex items-center justify-between gap-2">
      <h3 className="text-sm font-extrabold dark:text-white">Vision Retype</h3>
      <span className="text-[11px] font-semibold text-slate-500">{transcription?.status ?? "pending"}</span>
    </div>
    <button type="button" onClick={retype} disabled={busy} className="mb-3 w-full rounded-lg bg-violet-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-50">
      {busy ? "Đang nhận diện..." : "Nhận diện vùng này"}
    </button>
    <label className="mb-3 block text-xs font-semibold text-slate-500">Raw output
      <textarea value={transcription?.rawText ?? ""} onChange={(event) => update("rawText", event.target.value)} rows={4} className="mt-1 w-full rounded border border-slate-300 bg-transparent p-2 text-xs dark:border-slate-700 dark:text-white" />
    </label>
    <label className="mb-3 block text-xs font-semibold text-slate-500">Nội dung chuẩn hóa
      <textarea value={transcription?.content ?? ""} onChange={(event) => update("content", event.target.value)} rows={6} className="mt-1 w-full rounded border border-slate-300 bg-transparent p-2 text-xs dark:border-slate-700 dark:text-white" />
    </label>
    {transcription && <div className="rounded-lg bg-slate-50 p-3 text-xs dark:bg-slate-900">
      <p>Confidence: <b>{Math.round(transcription.confidence * 100)}%</b>{transcription.needsReview ? " · cần review" : ""}</p>
      {transcription.validation && <p className="mt-1 text-slate-500">$ {transcription.validation.dollarsBalanced ? "✓" : "✗"} · ngoặc {transcription.validation.bracesBalanced ? "✓" : "✗"} · KaTeX {transcription.validation.katexCompatible ? "✓" : "✗"}</p>}
      {transcription.warnings.length > 0 && <ul className="mt-2 list-disc pl-4 text-amber-700">{transcription.warnings.map((warning, index) => <li key={`${warning}-${index}`}>{warning}</li>)}</ul>}
    </div>}
    <p className="mt-3 text-[11px] leading-5 text-slate-500">Agent chỉ chép nội dung nhìn thấy. Kiểm tra lại công thức trước khi đưa vào question bank.</p>
  </div>;
}
