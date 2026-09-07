"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { useProfile } from "./ProfileProvider";
import {
  REMINDER_CHECK_MS,
  REMINDER_INTERVAL_MS,
  REMINDER_MESSAGES,
  REMINDER_SETTINGS_EVENT,
  TOAST_DURATION_MS,
  getReminderBaseline,
  incrementReminderShownCount,
  isReminderEnabled,
  setReminderBaseline,
  setReminderEnabled,
} from "@/lib/study-reminder";

type StudyReminderContextValue = {
  /** Đánh dấu một luồng làm bài kiểm tra đang hoạt động để hoãn lời nhắc */
  setExamActive: (source: string, active: boolean) => void;
};

const StudyReminderContext = createContext<StudyReminderContextValue>({
  setExamActive: () => {},
});

export function useStudyReminder() {
  return useContext(StudyReminderContext);
}

/** Provider nhắc nhở học tập mỗi 30 phút; hoãn lời nhắc nếu đang làm bài kiểm tra. */
export default function StudyReminderProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = useProfile();
  const [mounted, setMounted] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const examActiveRef = useRef<Set<string>>(new Set());
  const pendingRef = useRef(false);
  const enabledRef = useRef(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  const showToast = useCallback(() => {
    const count = incrementReminderShownCount();
    setReminderBaseline(Date.now());
    pendingRef.current = false;
    setToast(REMINDER_MESSAGES[(count - 1) % REMINDER_MESSAGES.length]);
  }, []);

  const tick = useCallback(() => {
    if (!profile || !enabledRef.current) return;
    const baseline = getReminderBaseline();
    if (Date.now() - baseline < REMINDER_INTERVAL_MS) return;
    // Đang làm bài kiểm tra → hoãn lời nhắc đến sau khi nộp bài
    if (examActiveRef.current.size > 0) {
      pendingRef.current = true;
      return;
    }
    showToast();
  }, [profile, showToast]);

  const setExamActive = useCallback(
    (source: string, active: boolean) => {
      if (active) {
        examActiveRef.current.add(source);
      } else {
        examActiveRef.current.delete(source);
      }
      // Bài kiểm tra vừa kết thúc và có lời nhắc đang hoãn → hiện ngay
      if (examActiveRef.current.size === 0 && pendingRef.current) {
        showToast();
      }
    },
    [showToast],
  );

  // Khởi tạo baseline và bộ đếm định kỳ (chỉ với user đã đăng nhập)
  useEffect(() => {
    if (!profile) return;
    // Nếu đã quá 30 phút kể từ lần nhắc trước (mở lại web) thì đếm lại từ đầu
    if (Date.now() - getReminderBaseline() >= REMINDER_INTERVAL_MS) {
      setReminderBaseline(Date.now());
    }
    const timer = window.setInterval(tick, REMINDER_CHECK_MS);
    // Tab bị throttle ở nền: kiểm tra ngay khi người dùng quay lại tab
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") tick();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [profile, tick]);

  // Đồng bộ cài đặt bật/tắt từ nút chuông hoặc tab khác
  useEffect(() => {
    enabledRef.current = isReminderEnabled();
    const syncEnabled = () => {
      enabledRef.current = isReminderEnabled();
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key === "study-reminder-enabled") syncEnabled();
    };
    window.addEventListener(REMINDER_SETTINGS_EVENT, syncEnabled);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(REMINDER_SETTINGS_EVENT, syncEnabled);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  // Toast tự ẩn
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), TOAST_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const handleDisable = useCallback(() => {
    setReminderEnabled(false);
    setToast(null);
  }, []);

  const value = useMemo(() => ({ setExamActive }), [setExamActive]);

  return (
    <StudyReminderContext.Provider value={value}>
      {children}
      {mounted && toast
        ? createPortal(
            <div className="fixed bottom-4 right-4 z-[60] w-[min(92vw,380px)]">
              <div className="pointer-events-auto flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-900/10 dark:border-slate-700 dark:bg-[#131b2e] dark:shadow-black/40">
                <span className="text-2xl leading-none" aria-hidden>
                  📚
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    Nhắc nhở học tập
                  </p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    {toast}
                  </p>
                  <div className="mt-3 flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => setToast(null)}
                      className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-500"
                    >
                      Đã hiểu
                    </button>
                    <button
                      type="button"
                      onClick={handleDisable}
                      className="text-xs font-medium text-slate-500 transition hover:text-slate-800 hover:underline dark:text-slate-400 dark:hover:text-slate-200"
                    >
                      Tắt nhắc nhở
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  aria-label="Đóng"
                  onClick={() => setToast(null)}
                  className="text-lg leading-none text-slate-400 transition hover:text-slate-600 dark:hover:text-slate-200"
                >
                  ✕
                </button>
              </div>
            </div>,
            document.body,
          )
        : null}
    </StudyReminderContext.Provider>
  );
}
