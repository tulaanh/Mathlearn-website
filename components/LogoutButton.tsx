"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  async function logout() {
    // Import động để supabase-js không bị kéo vào client bundle của mọi trang
    // chỉ vì nút đăng xuất nằm trong root layout.
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    if (supabase) await supabase.auth.signOut();
    router.push("/dang-nhap");
    router.refresh();
  }
  return <button onClick={logout} className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800">Đăng xuất</button>;
}
