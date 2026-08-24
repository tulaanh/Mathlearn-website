/** Skeleton trang sinh đề theo ma trận. */
import { FormSkeleton } from "@/components/Skeletons";

export default function Loading() {
  return (
    <div className="mx-auto max-w-4xl animate-pulse">
      <FormSkeleton />
    </div>
  );
}
