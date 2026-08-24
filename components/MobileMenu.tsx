"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getNavItems, isNavActive } from "@/lib/nav";
import AccountInfo from "./AccountInfo";
import LogoutButton from "./LogoutButton";
import { useProfile } from "./ProfileProvider";

export default function MobileMenu({ email }: { email?: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { profile } = useProfile();
  const items = getNavItems(profile?.role);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      <button
        type="button"
        aria-label={open ? "Đóng menu" : "Mở menu"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 w-10 items-center justify-center rounded-xl text-2xl text-slate-600 transition-colors hover:bg-slate-100 hover:text-indigo-600 md:hidden dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-indigo-400"
      >
        {open ? "✕" : "☰"}
      </button>

      <div
        aria-hidden={!open}
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm transition-opacity duration-200 md:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        aria-hidden={!open}
        className={`fixed inset-y-0 right-0 z-40 flex w-[280px] max-w-[85vw] flex-col overflow-y-auto border-l border-slate-200/80 bg-white shadow-2xl transition-transform duration-200 md:hidden dark:border-slate-800/80 dark:bg-[#0d1322] ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800/80">
          <p className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Menu</p>
          <button
            type="button"
            aria-label="Đóng menu"
            onClick={() => setOpen(false)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            ✕
          </button>
        </div>

        <nav aria-label="Điều hướng mobile" className="space-y-1 px-4 py-4">
          {items.map((item) => {
            const active = isNavActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch
                onClick={() => setOpen(false)}
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

        <div className="mt-auto border-t border-slate-100 px-4 py-5 dark:border-slate-800/80">
          {email ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <AccountInfo email={email} />
              </div>
              <LogoutButton />
            </div>
          ) : (
            <Link
              href="/dang-nhap"
              onClick={() => setOpen(false)}
              className="block rounded-xl bg-indigo-600 px-4 py-3 text-center text-sm font-bold text-white transition-colors hover:bg-indigo-500"
            >
              Đăng nhập
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}
