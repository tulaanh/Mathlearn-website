/** Skeleton trang kết quả bài kiểm tra — hiện ngay khi nộp bài chuyển sang trang kết quả. */
import { SkeletonBar } from "@/components/Skeletons";

export default function Loading() {
  return (
    <div className="mx-auto max-w-3xl animate-pulse">
      {/* Khung điểm tổng quan */}
      <div className="mb-6 rounded-2xl border border-slate-200/80 bg-white p-6 dark:border-slate-800/80 dark:bg-[#131b2e] sm:p-8">
        <SkeletonBar className="h-6 w-44" />
        <SkeletonBar className="mt-4 h-12 w-64 max-w-full" />
        <SkeletonBar className="mt-3 h-4 w-1/2" />
      </div>

      {/* Khung đáp án chi tiết */}
      <div className="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-6 dark:border-slate-800/80 dark:bg-[#131b2e] sm:p-8">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"
          >
            <SkeletonBar className="h-4 w-1/2" />
            <SkeletonBar className="mt-3 h-10 w-full rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
