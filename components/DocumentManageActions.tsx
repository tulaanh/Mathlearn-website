"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { DocumentStatus } from "@/lib/document-types";

export default function DocumentManageActions({ id, status, storagePaths }: { id: string; status: DocumentStatus; storagePaths: string[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function changeStatus() {
    const supabase = createClient();
    if (!supabase) return setError("Chưa cấu hình Supabase.");
    setBusy(true); setError("");
    const { error: updateError } = await supabase.from("documents").update({ status: status === "published" ? "draft" : "published" }).eq("id", id);
    if (updateError) setError(updateError.message);
    else router.refresh();
    setBusy(false);
  }

  async function removeDocument() {
    if (!window.confirm("Xóa tài liệu này? Hành động này không thể hoàn tác.")) return;
    const supabase = createClient();
    if (!supabase) return setError("Chưa cấu hình Supabase.");
    setBusy(true); setError("");
    if (storagePaths.length) await supabase.storage.from("document-images").remove(storagePaths);
    const { error: deleteError } = await supabase.from("documents").delete().eq("id", id);
    if (deleteError) setError(deleteError.message);
    else router.refresh();
    setBusy(false);
  }

  return <div className="mt-3 flex flex-wrap items-center gap-2"><Link href={`/quan-ly/tai-lieu/${id}/sua`} className="rounded-lg border border-emerald-300 px-3 py-2 text-xs font-bold text-emerald-600">✏️ Sửa</Link><button disabled={busy} onClick={changeStatus} className="rounded-lg border border-indigo-300 px-3 py-2 text-xs font-bold text-indigo-600 disabled:opacity-50">{status === "published" ? "Chuyển thành nháp" : "Đăng công khai"}</button><button disabled={busy} onClick={removeDocument} className="rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-600 disabled:opacity-50">Xóa</button>{error && <span className="text-xs text-red-600">{error}</span>}</div>;
}
