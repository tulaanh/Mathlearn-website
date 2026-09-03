import { Suspense } from "react";
import HomeTabs from "@/components/HomeTabs";
import { CardGridSkeleton, SkeletonBar } from "@/components/Skeletons";
import { getChapters } from "@/lib/chapters";

export const revalidate = 3600;

export default function HomePage() {
  // Bọc Suspense để bấm về trang chủ cũng chuyển trang ngay rồi tải dữ liệu sau
  // (app/loading.tsx ở gốc chỉ hiện khi tải trang lần đầu, không hiện khi điều hướng).
  return (
    <Suspense fallback={<HomeSkeleton />}>
      <HomeContent />
    </Suspense>
  );
}

async function HomeContent() {
  const chapters = await getChapters();
  return <HomeTabs chapters={chapters} />;
}

function HomeSkeleton() {
  return (
    <div className="mx-auto max-w-[1380px] animate-pulse">
      {/* Header chào mừng */}
      <section className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <SkeletonBar className="h-4 w-56" />
          <SkeletonBar className="mt-2 h-9 w-72 max-w-full" />
        </div>
        <SkeletonBar className="h-12 w-36 rounded-xl" />
      </section>

      {/* 3 thẻ thống kê */}
      <section className="mb-6 grid gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-[118px] rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800/80 dark:bg-[#131b2e]"
          />
        ))}
      </section>

      {/* Hàng tab + lưới thẻ chương */}
      <div className="mb-6 flex gap-2">
        <SkeletonBar className="h-10 w-32 rounded-xl" />
        <SkeletonBar className="h-10 w-28 rounded-xl" />
        <SkeletonBar className="h-10 w-28 rounded-xl" />
      </div>
      <CardGridSkeleton count={6} />
    </div>
  );
}
