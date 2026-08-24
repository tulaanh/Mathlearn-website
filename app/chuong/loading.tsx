/** Skeleton trang danh sách chương — hiện ngay khi bấm vào mục "Chương học". */
import { CardGridSkeleton, PageHeaderSkeleton, SkeletonBar } from "@/components/Skeletons";

export default function Loading() {
  return (
    <div className="mx-auto max-w-[1380px] animate-pulse">
      <PageHeaderSkeleton />
      <div className="mb-6 flex flex-wrap gap-3">
        <SkeletonBar className="h-10 w-36 rounded-xl" />
        <SkeletonBar className="h-10 w-28 rounded-xl" />
      </div>
      <CardGridSkeleton count={6} />
    </div>
  );
}
