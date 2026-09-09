"use client";

import { useRouter } from "next/navigation";
import { useProfile } from "@/components/ProfileProvider";
import { clearUserProgressStorage } from "@/lib/progress";
import { clearUserExamData } from "@/lib/exam-draft";

export default function LogoutButton() {
  const router = useRouter();
  const { userId } = useProfile();

  async function logout() {
    // 1. Dọn dẹp tiến trình và bài làm dở của tài khoản hiện tại trên trình duyệt
    clearUserProgressStorage(userId);
    clearUserExamData(userId);
    // Dọn dẹp cả key cũ không phân tách nếu còn sót lại
    clearUserProgressStorage();
    clearUserExamData();

    // 2. Đăng xuất phiên Supabase
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    if (supabase) await supabase.auth.signOut();

    // 3. Chuyển hướng về trang đăng nhập
    router.push("/dang-nhap");
    router.refresh();
  }

  return (
    <button
      onClick={logout}
      className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800"
    >
      Đăng xuất
    </button>
  );
}
