import Link from "next/link";

type Props = {
  basePath: string;
  /** Các param hiện tại của URL (giữ nguyên bộ lọc khi chuyển trang). */
  params: Record<string, string | undefined>;
  page: number;
  total: number;
  pageSize: number;
};

/** Pager thuần server (chỉ là Link, không cần JS client). */
export default function Pagination({ basePath, params, page, total, pageSize }: Props) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  const hrefFor = (p: number) => {
    const sp = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value) sp.set(key, value);
    }
    if (p > 1) sp.set("page", String(p));
    const qs = sp.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  // Hiện tối đa 5 số trang quanh trang hiện tại.
  const start = Math.max(1, Math.min(page - 2, totalPages - 4));
  const end = Math.min(totalPages, start + 4);
  const pages: number[] = [];
  for (let p = start; p <= end; p += 1) pages.push(p);

  const linkClass =
    "flex h-9 min-w-9 items-center justify-center rounded-lg border px-2 text-sm font-semibold";
  const idleClass = `${linkClass} border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800`;
  const activeClass = `${linkClass} border-indigo-600 bg-indigo-600 text-white`;

  return (
    <nav aria-label="Phân trang" className="mt-6 flex flex-wrap items-center justify-center gap-1.5">
      {page > 1 && (
        <Link href={hrefFor(page - 1)} className={idleClass} aria-label="Trang trước">
          ←
        </Link>
      )}
      {start > 1 && (
        <>
          <Link href={hrefFor(1)} className={idleClass}>1</Link>
          {start > 2 && <span className="px-1 text-slate-400">…</span>}
        </>
      )}
      {pages.map((p) => (
        <Link key={p} href={hrefFor(p)} className={p === page ? activeClass : idleClass} aria-current={p === page ? "page" : undefined}>
          {p}
        </Link>
      ))}
      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="px-1 text-slate-400">…</span>}
          <Link href={hrefFor(totalPages)} className={idleClass}>{totalPages}</Link>
        </>
      )}
      {page < totalPages && (
        <Link href={hrefFor(page + 1)} className={idleClass} aria-label="Trang sau">
          →
        </Link>
      )}
      <span className="ml-3 text-xs text-slate-500 dark:text-slate-400">
        Trang {page}/{totalPages} · {total} kết quả
      </span>
    </nav>
  );
}
