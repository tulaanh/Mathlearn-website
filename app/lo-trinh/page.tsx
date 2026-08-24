import Link from "next/link";
import { getLearningPaths } from "@/lib/learning-paths";
import PathCard from "@/components/PathCard";

export const metadata = { title: "Lộ trình học" };

export default async function LearningPathsPage() {
  const paths = await getLearningPaths();

  return (
    <div className="mx-auto max-w-[1380px]">
      <div className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-sm font-medium text-indigo-600">LỘ TRÌNH HỌC TẬP</p>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">
            Lộ trình học
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Chọn một lộ trình do giáo viên đăng và học theo từng chương.
          </p>
        </div>
        <Link href="/" className="text-sm font-bold text-indigo-600 hover:underline">
          ← Về tổng quan
        </Link>
      </div>

      {paths.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-700 bg-white dark:bg-[#131b2e]">
          <div className="mx-auto mb-4 text-5xl">🧭</div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Chưa có lộ trình học nào. Nội dung sẽ xuất hiện khi giáo viên đăng lộ trình mới.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {paths.map((path) => (
            <PathCard key={path.id} path={path} />
          ))}
        </div>
      )}
    </div>
  );
}
