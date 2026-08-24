/** Skeleton trang quản lý tài liệu — hiện ngay khi bấm vào mục quản lý. */
import { CardGridSkeleton, PageHeaderSkeleton } from "@/components/Skeletons";

export default function Loading() {
  return (
    <div className="mx-auto max-w-[1380px] animate-pulse">
      <PageHeaderSkeleton />
      <CardGridSkeleton count={6} className="sm:grid-cols-2 lg:grid-cols-3" />
    </div>
  );
}
