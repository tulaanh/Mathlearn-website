import Link from "next/link";
import LoginForm from "@/components/LoginForm";
import SupabaseConfigNotice from "@/components/SupabaseConfigNotice";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export const metadata = { title: "Đăng nhập" };

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md py-8">
      <Link href="/" className="mb-6 inline-block text-sm font-semibold text-indigo-600 hover:underline">← Về trang chủ</Link>
      <div className="mb-6"><p className="mb-2 text-sm font-medium text-indigo-600">KHU VỰC HỌC TẬP</p><h1 className="text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">Đăng nhập</h1><p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Đăng nhập bằng tài khoản do giáo viên cung cấp.</p></div>
      {isSupabaseConfigured() ? <LoginForm /> : <SupabaseConfigNotice />}
    </div>
  );
}
