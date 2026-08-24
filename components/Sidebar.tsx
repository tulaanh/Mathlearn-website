"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useProfile } from "./ProfileProvider";
import { getNavItems, isNavActive } from "@/lib/nav";

export default function Sidebar() {
  const pathname = usePathname();
  const { profile } = useProfile();
  const items = getNavItems(profile?.role);

  return (
    <aside className="hidden w-64 shrink-0 border-r border-slate-200/80 bg-white px-4 py-6 print:!hidden md:block dark:border-slate-800/80 dark:bg-[#0d1322]">
      <nav aria-label="Điều hướng chính" className="space-y-2">
          {items.map((item) => {
            const active = isNavActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                active
                  ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400"
                  : "text-slate-600 hover:bg-slate-50 hover:text-indigo-600 dark:text-slate-400 dark:hover:bg-[#131b2e] dark:hover:text-indigo-300"
              }`}
            >
              <span className={`flex h-7 w-7 items-center justify-center rounded-lg text-lg transition-colors ${active ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/25 dark:text-indigo-300" : "bg-slate-100 text-slate-600 dark:bg-slate-800/60 dark:text-slate-400"}`}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="my-7 border-t border-slate-100 dark:border-slate-800/80" />
      <p className="px-4 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Tiện ích</p>
      <div className="mt-3 space-y-2">
        <Link href="/" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-indigo-600 dark:text-slate-400 dark:hover:bg-[#131b2e] dark:hover:text-indigo-300">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-base dark:bg-slate-800/60">★</span>
          Thành tích
        </Link>
        <Link href="/" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-indigo-600 dark:text-slate-400 dark:hover:bg-[#131b2e] dark:hover:text-indigo-300">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-base dark:bg-slate-800/60">⚙</span>
          Cài đặt
        </Link>
      </div>

      <div className="mt-10 rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/80 to-violet-50/50 p-5 text-center dark:border-indigo-900/40 dark:from-indigo-950/40 dark:to-violet-950/30">
        <div className="mx-auto mb-3 text-4xl">🌱</div>
        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Học một chút mỗi ngày</p>
        <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">Kiến thức vững chắc bắt đầu từ những bước nhỏ.</p>
      </div>
    </aside>
  );
}
