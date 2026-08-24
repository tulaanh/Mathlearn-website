export default function SupabaseConfigNotice() {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-900 dark:border-amber-900/70 dark:bg-amber-950/30 dark:text-amber-100">
      <h2 className="text-lg font-bold">Cần cấu hình Supabase</h2>
      <p className="mt-2 text-sm leading-6">
        Tạo file <code className="rounded bg-amber-100 px-1.5 py-0.5 dark:bg-amber-900/60">.env.local</code> từ
        <code className="ml-1 rounded bg-amber-100 px-1.5 py-0.5 dark:bg-amber-900/60">.env.example</code>, điền URL và anon key của dự án Supabase, sau đó chạy lại website.
      </p>
      <p className="mt-3 text-xs leading-5 text-amber-800 dark:text-amber-200">
        Tiếp theo, chạy <code>supabase/schema.sql</code> trong SQL Editor và tạo tài khoản trong Authentication.
      </p>
    </div>
  );
}
