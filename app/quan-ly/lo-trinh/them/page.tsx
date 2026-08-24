import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import SupabaseConfigNotice from "@/components/SupabaseConfigNotice";
import PathEditor from "@/components/PathEditor";

export const metadata = { title: "Tạo lộ trình mới" };

export default async function AddPathPage() {
  if (!isSupabaseConfigured()) return <SupabaseConfigNotice />;
  const { user, profile } = await getCurrentUser();
  if (!user) redirect("/dang-nhap");
  if (profile?.role !== "teacher") redirect("/lo-trinh");

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-7">
        <Link
          href="/quan-ly/lo-trinh"
          className="mb-3 inline-block text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
        >
          ← Quay lại quản lý lộ trình
        </Link>
        <p className="mb-2 text-sm font-medium text-indigo-600">KHU VỰC GIÁO VIÊN</p>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">
          Tạo lộ trình mới
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Sau khi tạo lộ trình, hãy tạo chương và gán chúng vào lộ trình này.
        </p>
      </div>
      <PathEditor />
    </div>
  );
}
