import Link from "next/link";
import { redirect } from "next/navigation";
import { getTeacherLearningPaths } from "@/lib/learning-paths";
import { getCurrentUser } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import SupabaseConfigNotice from "@/components/SupabaseConfigNotice";
import PathManageList from "@/components/PathManageList";

export const metadata = { title: "Quản lý lộ trình" };

export default async function ManagePathsPage() {
  if (!isSupabaseConfigured()) return <SupabaseConfigNotice />;
  const { user, profile } = await getCurrentUser();
  if (!user) redirect("/dang-nhap");
  if (profile?.role !== "teacher") redirect("/lo-trinh");
  const paths = await getTeacherLearningPaths();

  return (
    <div className="mx-auto max-w-[1380px]">
      <div className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-sm font-medium text-indigo-600">KHU VỰC GIÁO VIÊN</p>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">
            Quản lý lộ trình
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Tạo lộ trình học và gán các chương vào từng lộ trình.
          </p>
        </div>
        <Link
          href="/quan-ly/lo-trinh/them"
          className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 hover:shadow-indigo-500/30 dark:shadow-none"
        >
          + Thêm lộ trình
        </Link>
      </div>

      <PathManageList initialPaths={paths} />
    </div>
  );
}
