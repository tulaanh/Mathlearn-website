"use client";

import { useState } from "react";
import { documentTemplates, type EditorPreset } from "@/lib/document-templates";

/**
 * Bộ chọn mẫu có sẵn dạng gọn: mặc định chỉ là một nút, mở ra mới hiện lưới card
 * để khu soạn thảo chính không bị đẩy xuống thấp.
 */
export default function DocumentTemplatePicker({ onApply }: { onApply: (preset: EditorPreset) => void }) {
  const [open, setOpen] = useState(false);

  function choose(id: string) {
    const template = documentTemplates.find((t) => t.id === id);
    if (!template) return;
    if (!window.confirm(`Nạp mẫu "${template.name}" sẽ thay thế toàn bộ nội dung đang soạn. Tiếp tục?`)) return;
    onApply(template.build());
    setOpen(false);
  }

  return (
    <section className="rounded-2xl border border-indigo-200 bg-indigo-50/60 p-4 shadow-sm dark:border-indigo-900 dark:bg-indigo-950/20 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-bold dark:text-white">⚡ Mẫu có sẵn</h2>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            Nạp nhanh cấu trúc tài liệu từ mẫu dựng sẵn, rồi chỉnh sửa theo ý bạn.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="rounded-lg border border-indigo-300 bg-white px-3 py-2 text-xs font-bold text-indigo-600 hover:bg-indigo-50 dark:border-indigo-800 dark:bg-slate-900 dark:text-indigo-300 dark:hover:bg-indigo-950/40"
        >
          {open ? "▲ Đóng danh sách mẫu" : "▼ Chọn mẫu…"}
        </button>
      </div>

      {open && (
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {documentTemplates.map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={() => choose(template.id)}
              className="group rounded-xl border border-slate-200 bg-white p-3 text-left transition hover:-translate-y-0.5 hover:border-indigo-400 hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:hover:border-indigo-500"
            >
              <span className="text-xl">{template.icon}</span>
              <p className="mt-1.5 text-sm font-bold text-slate-900 group-hover:text-indigo-600 dark:text-white">{template.name}</p>
              <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">{template.tagline}</p>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

