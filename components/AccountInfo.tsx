"use client";

import { useProfile } from "./ProfileProvider";

export default function AccountInfo({ email }: { email?: string }) {
  const { profile } = useProfile();
  const isTeacher = profile?.role === "teacher";

  return (
    <>
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-200 to-violet-300 text-xl">
        {isTeacher ? "👨🏻‍🏫" : "👨🏻‍🎓"}
      </div>
      <div className="hidden lg:block">
        <p className="text-sm font-bold text-slate-900 dark:text-white">
          {profile?.display_name ?? email ?? "Khách"}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {isTeacher ? "Giáo viên Toán" : email ? "Học sinh" : "Chưa đăng nhập"}
        </p>
      </div>
    </>
  );
}
