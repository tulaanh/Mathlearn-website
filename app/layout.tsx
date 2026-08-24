import type { Metadata } from "next";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import Sidebar from "@/components/Sidebar";
import LogoutButton from "@/components/LogoutButton";
import AccountInfo from "@/components/AccountInfo";
import MobileMenu from "@/components/MobileMenu";
import { ProfileProvider } from "@/components/ProfileProvider";
import { getCurrentUser } from "@/lib/supabase/server";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "MathLearn – Học Toán Online",
    template: "%s | Học Tập Online",
  },
  description:
    "Website học tập môn Toán: học theo chương, ôn luyện bài tập và kiểm tra theo chủ đề.",
};

// Chạy trước khi trang hiển thị để áp dụng đúng theme, tránh bị "nháy" sáng/tối
const themeInitScript = `
(function () {
  try {
    var saved = localStorage.getItem("theme");
    var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (saved === "dark" || (!saved && prefersDark)) {
      document.documentElement.classList.add("dark");
    }
  } catch (e) {}
})();
`;

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { user, profile } = await getCurrentUser();
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="flex min-h-screen flex-col bg-[#f8fafc] text-slate-900 antialiased dark:bg-[#090d16] dark:text-slate-100">
        <ProfileProvider
          userId={user?.id}
          initialProfile={
            profile
              ? { display_name: profile.display_name, role: profile.role }
              : null
          }
        >
        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 shadow-xs backdrop-blur-md print:!hidden dark:border-slate-800/80 dark:bg-[#0d1322]/90">
          <div className="flex h-[72px] items-center gap-2 px-3 sm:gap-4 sm:px-7 lg:px-9">
            <Link href="/" className="flex shrink-0 items-center gap-2 text-lg font-extrabold tracking-tight text-slate-950 sm:w-56 sm:gap-3 sm:text-xl dark:text-white">
              <span className="text-3xl font-light leading-none text-indigo-600 sm:text-4xl dark:text-indigo-400">Σ</span>
              <span>Math<span className="text-indigo-600 dark:text-indigo-400">Learn</span></span>
            </Link>
            <div className="relative hidden max-w-xl flex-1 md:block">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xl text-slate-400">⌕</span>
              <input aria-label="Tìm kiếm" placeholder="Tìm bài học, bài tập, chủ đề..." className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-12 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-[#131b2e] dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20" />
            </div>
            <div className="ml-auto flex items-center gap-2 sm:gap-5">
              <button aria-label="Thông báo" className="relative hidden text-2xl text-slate-600 hover:text-indigo-600 sm:block dark:text-slate-300 dark:hover:text-indigo-400">♧<span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">3</span></button>
              <ThemeToggle />
              <div className="hidden items-center gap-3 border-l border-slate-200 pl-4 sm:flex dark:border-slate-800">
                <AccountInfo email={user?.email} />
                {user ? <LogoutButton /> : <Link href="/dang-nhap" className="text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400">Đăng nhập</Link>}
              </div>
              <MobileMenu email={user?.email} />
            </div>
          </div>
        </header>

        <div className="flex flex-1">
          <Sidebar />
          <main className="min-w-0 flex-1 px-4 py-6 print:p-0 sm:px-7 lg:px-9 lg:py-7">
            {children}
          </main>
        </div>

        <footer className="border-t border-slate-200/80 bg-white py-6 text-center text-sm text-slate-500 print:!hidden dark:border-slate-800/80 dark:bg-[#0d1322] dark:text-slate-400">
          © {new Date().getFullYear()} MathLearn — Chúc các em học tốt! 🎓
        </footer>
        </ProfileProvider>
      </body>
    </html>
  );
}
