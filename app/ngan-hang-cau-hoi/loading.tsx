/** Skeleton trang ngân hàng câu hỏi phía học sinh. */
import { PageHeaderSkeleton, RowsSkeleton, StatsRowSkeleton } from "@/components/Skeletons";

export default function Loading() {
  return (
    <div className="mx-auto max-w-[1380px] animate-pulse">
      <PageHeaderSkeleton withAction={false} />
      <StatsRowSkeleton count={5} />
      <RowsSkeleton count={4} />
    </div>
  );
}
