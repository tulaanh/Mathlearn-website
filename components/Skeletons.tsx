/** Các khối skeleton dùng chung cho loading.tsx — đặt animate-pulse ở phần tử
 *  gốc của từng file loading để toàn bộ nội dung nhấp nháy đồng bộ. */

/** Thanh xám chung cho mọi đoạn chữ giả. */
export function SkeletonBar({ className = "h-4 w-40" }: { className?: string }) {
  return <div className={`rounded bg-slate-200 dark:bg-slate-800 ${className}`} />;
}

/** Header chuẩn các trang: kicker nhỏ + tiêu đề lớn + mô tả (+ nút bấm bên phải). */
export function PageHeaderSkeleton({ withAction = true }: { withAction?: boolean }) {
  return (
    <div className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
      <div>
        <SkeletonBar className="mb-2 h-4 w-32" />
        <SkeletonBar className="h-9 w-56 max-w-full" />
        <SkeletonBar className="mt-2 h-4 w-80 max-w-full" />
      </div>
      {withAction && <SkeletonBar className="h-12 w-44 rounded-xl" />}
    </div>
  );
}

/** Thẻ giả mô phỏng thẻ lộ trình / chương / tài liệu (badge, tiêu đề, mô tả, tiến trình). */
export function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800/80 dark:bg-[#131b2e]">
      <div className="mb-3 flex items-center gap-2">
        <SkeletonBar className="h-6 w-20 rounded-full" />
        <SkeletonBar className="h-6 w-14 rounded-full" />
      </div>
      <SkeletonBar className="mb-2 h-6 w-3/4" />
      <SkeletonBar className="mb-4 h-4 w-full" />
      <SkeletonBar className="mb-1 h-3 w-2/3" />
      <SkeletonBar className="h-2 w-full rounded-full" />
    </div>
  );
}

/** Lưới thẻ dùng cho các trang danh sách. */
export function CardGridSkeleton({
  count = 6,
  className = "sm:grid-cols-2 xl:grid-cols-3",
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={`grid gap-5 ${className}`}>
      {Array.from({ length: count }, (_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

/** Các hàng khối dùng cho trang quản lý dạng danh sách. */
export function RowsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="h-24 rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800/80 dark:bg-[#131b2e]"
        />
      ))}
    </div>
  );
}

/** Hàng ô thống kê (trang ngân hàng câu hỏi). */
export function StatsRowSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="h-[86px] rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900"
        />
      ))}
    </div>
  );
}

/** Khung form giả: link quay lại + header + thẻ chứa các cặp nhãn/ô nhập. */
export function FormSkeleton() {
  return (
    <>
      <SkeletonBar className="mb-4 h-4 w-40" />
      <div className="mb-7">
        <SkeletonBar className="mb-2 h-4 w-32" />
        <SkeletonBar className="h-9 w-64 max-w-full" />
        <SkeletonBar className="mt-2 h-4 w-96 max-w-full" />
      </div>
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800/80 dark:bg-[#131b2e]">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="mb-4">
            <SkeletonBar className="mb-2 h-4 w-28" />
            <SkeletonBar className="h-11 w-full rounded-xl" />
          </div>
        ))}
        <SkeletonBar className="h-12 w-40 rounded-xl" />
      </div>
    </>
  );
}
