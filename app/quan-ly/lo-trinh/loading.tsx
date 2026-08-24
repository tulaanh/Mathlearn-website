/** Skeleton trang quản lý lộ trình — hiện ngay khi bấm vào mục quản lý. */
import { PageHeaderSkeleton, RowsSkeleton } from "@/components/Skeletons";

export default function Loading() {
  return (
    <div className="mx-auto max-w-[1380px] animate-pulse">
      <PageHeaderSkeleton />
      <RowsSkeleton count={4} />
    </div>
  );
}
