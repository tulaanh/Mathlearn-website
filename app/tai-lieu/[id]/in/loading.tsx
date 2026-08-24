/** Skeleton trang bản in tài liệu — hiện ngay khi mở trang xuất bản in. */
import { SkeletonBar } from "@/components/Skeletons";

export default function Loading() {
  return (
    <div className="mx-auto max-w-3xl animate-pulse print:!hidden">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-white sm:p-10">
        <SkeletonBar className="h-8 w-2/3" />
        <SkeletonBar className="mt-3 h-4 w-1/3" />
        <div className="mt-8 space-y-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <SkeletonBar key={i} className="h-4 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
