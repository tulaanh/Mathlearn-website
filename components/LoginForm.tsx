"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    if (!supabase) {
      setError("Website chưa được cấu hình Supabase.");
      setLoading(false);
      return;
    }
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError("Email hoặc mật khẩu không đúng. Hãy kiểm tra lại tài khoản được giáo viên cấp.");
      setLoading(false);
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs transition-colors dark:border-slate-800/80 dark:bg-[#131b2e] sm:p-8">
      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Email
        <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-4 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-[#0d1322] dark:text-white dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20" />
      </label>
      <label className="mt-4 block text-sm font-semibold text-slate-700 dark:text-slate-300">Mật khẩu
        <input required type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-4 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-[#0d1322] dark:text-white dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20" />
      </label>
      {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">{error}</p>}
      <button disabled={loading} className="mt-6 w-full rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-indigo-700 disabled:cursor-wait disabled:opacity-60">{loading ? "Đang đăng nhập..." : "Đăng nhập"}</button>
      <p className="mt-4 text-center text-xs leading-5 text-slate-500 dark:text-slate-400">Tài khoản học sinh do giáo viên tạo. Website không mở đăng ký công khai.</p>
    </form>
  );
}
