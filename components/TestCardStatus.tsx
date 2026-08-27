"use client";

import { useEffect, useState } from "react";
import { loadExamDraft, loadExamResult } from "@/lib/exam-draft";

export default function TestCardStatus({ documentId }: { documentId: string }) {
  const [status, setStatus] = useState<{
    type: "completed" | "in_progress";
    score?: number;
    percent?: number;
  } | null>(null);

  useEffect(() => {
    // 1. Kiểm tra xem có bài làm dở không
    const draft = loadExamDraft(documentId);
    if (draft && Object.keys(draft.answers).length > 0) {
      setStatus({ type: "in_progress" });
      return;
    }

    // 2. Kiểm tra xem đã có kết quả làm bài gần nhất chưa
    const result = loadExamResult(documentId);
    if (result) {
      setStatus({
        type: "completed",
        score: result.score,
        percent: result.percent,
      });
      return;
    }

    setStatus(null);
  }, [documentId]);

  if (!status) return null;

  if (status.type === "in_progress") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-950/70 dark:text-amber-300">
        <span>⏳</span> Đang làm dở
      </span>
    );
  }

  const score = status.score ?? 0;
  const isHigh = score >= 8;
  const isMed = score >= 5;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        isHigh
          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300"
          : isMed
            ? "bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300"
            : "bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300"
      }`}
    >
      <span>✓</span> {score.toFixed(1)}đ ({status.percent}%)
    </span>
  );
}
