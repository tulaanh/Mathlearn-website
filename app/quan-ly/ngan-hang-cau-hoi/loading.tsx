/** Skeleton trang ngân hàng câu hỏi — hiện ngay khi bấm vào mục quản lý. */
import { PageHeaderSkeleton, RowsSkeleton, StatsRowSkeleton } from "@/components/Skeletons";

export default function Loading() {
  return (
    <div className="mx-auto max-w-[1380px] animate-pulse">
      <PageHeaderSkeleton />
      <StatsRowSkeleton count={5} />
      <RowsSkeleton count={3} />
    </div>
  );
}
