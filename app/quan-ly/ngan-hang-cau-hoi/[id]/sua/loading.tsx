/** Skeleton trang sửa câu hỏi trong ngân hàng. */
import { FormSkeleton } from "@/components/Skeletons";

export default function Loading() {
  return (
    <div className="mx-auto max-w-3xl animate-pulse">
      <FormSkeleton />
    </div>
  );
}
