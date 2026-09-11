"use client";

import { useCallback, useEffect, useState } from "react";
import type { Chapter, Lesson } from "@/lib/types";
import { useProfile } from "@/components/ProfileProvider";

/**
 * ============================================================
 *  TIẾN TRÌNH HỌC TẬP (Đồng bộ hai chiều Database Supabase & LocalStorage)
 * ------------------------------------------------------------
 *  - Phân tách theo userId: Mỗi tài khoản có kho lưu trữ riêng biệt.
 *  - Nguồn chân lý: Bảng `user_progress` trên Database Supabase.
 *  - LocalStorage hoạt động như tầng đệm (cache) giúp hiển thị tức thì.
 *  - Bài học có bài test : tiến trình = điểm tốt nhất đã đạt (%)
 *  - Bài học lý thuyết   : 0% → bấm "Đánh dấu đã học" → 100%
 *  - Tiến trình chương   = trung bình tiến trình các bài học
 * ============================================================
 */

export type ProgressMap = Record<string, number>;

const STORAGE_KEY_PREFIX = "hoc-tap-progress";
const EVENT_NAME = "hoc-tap-progress-changed";

/** Lấy storage key được phân tách theo userId */
export function getProgressStorageKey(userId?: string | null): string {
  return userId ? `${STORAGE_KEY_PREFIX}-${userId}` : STORAGE_KEY_PREFIX;
}

/** Khóa lưu tiến trình của một bài học */
export function lessonKey(lesson: Lesson): string {
  return lesson.quizId ? `quiz:${lesson.quizId}` : `lesson:${lesson.id}`;
}

/** Khóa tiến trình của một tài liệu lý thuyết (0% → 100% khi đánh dấu hoàn thành) */
export function documentProgressKey(documentId: string): string {
  return `document:${documentId}`;
}

/** Khóa tiến trình điểm tốt nhất của một bài kiểm tra (tài liệu dạng test).
 *  Key tồn tại trong progress = đã nộp bài ít nhất một lần (kể cả khi điểm 0). */
export function documentTestProgressKey(testDocumentId: string): string {
  return `document-quiz:${testDocumentId}`;
}

/** Đọc toàn bộ tiến trình từ localStorage theo userId */
export function loadProgress(userId?: string | null): ProgressMap {
  if (typeof window === "undefined") return {};
  try {
    const key = getProgressStorageKey(userId);
    let raw = localStorage.getItem(key);
    // Tự động chuyển giao dữ liệu cũ (nếu có trước khi cập nhật hệ thống) sang tài khoản hiện tại
    if (!raw && userId) {
      const oldRaw = localStorage.getItem(STORAGE_KEY_PREFIX);
      if (oldRaw) {
        localStorage.setItem(key, oldRaw);
        localStorage.removeItem(STORAGE_KEY_PREFIX);
        raw = oldRaw;
      }
    }
    return raw ? (JSON.parse(raw) as ProgressMap) : {};
  } catch {
    return {};
  }
}

/** Lưu tiến trình vào localStorage theo userId và bắn event đồng bộ */
export function persist(map: ProgressMap, userId?: string | null) {
  if (typeof window === "undefined") return;
  try {
    const key = getProgressStorageKey(userId);
    localStorage.setItem(key, JSON.stringify(map));
  } catch {
    // bỏ qua nếu trình duyệt chặn localStorage
  }
  window.dispatchEvent(new Event(EVENT_NAME));
}

/** Xóa dữ liệu tiến trình học tập khỏi trình duyệt (khi đăng xuất) */
export function clearUserProgressStorage(userId?: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (userId) {
      localStorage.removeItem(getProgressStorageKey(userId));
    }
    localStorage.removeItem(STORAGE_KEY_PREFIX);
  } catch {
    // bỏ qua
  }
  window.dispatchEvent(new Event(EVENT_NAME));
}

/** Tiến trình trung bình (%) của cả chương */
export function chapterPercent(
  chapter: Chapter,
  progress: ProgressMap,
): number {
  if (chapter.lessons.length === 0) return 0;
  const sum = chapter.lessons.reduce(
    (acc, lesson) => acc + (progress[lessonKey(lesson)] ?? 0),
    0,
  );
  return Math.round(sum / chapter.lessons.length);
}

/**
 * Hook theo dõi tiến trình — tự cập nhật khi có thay đổi
 * Tự động đồng bộ với Supabase Database theo tài khoản đang đăng nhập.
 */
export function useProgress() {
  const { userId } = useProfile();
  // KHÔNG đọc localStorage trong initializer: lần render đầu trên client phải
  // khớp với server ({}), tránh lỗi hydration. Dữ liệu thật được nạp trong
  // useEffect ngay sau mount (updateLocal bên dưới).
  const [progress, setProgress] = useState<ProgressMap>({});

  // Khi userId đổi hoặc component mount: nạp cache local & đồng bộ từ Supabase
  useEffect(() => {
    const updateLocal = () => setProgress(loadProgress(userId));
    updateLocal();

    window.addEventListener(EVENT_NAME, updateLocal);
    window.addEventListener("storage", updateLocal);

    // Đồng bộ hai chiều từ Database Supabase về máy và ngược lại
    let isMounted = true;
    async function syncFromDatabase() {
      if (!userId) return;
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        if (!supabase) return;

        const { data, error } = await supabase
          .from("user_progress")
          .select("item_key, percent")
          .eq("user_id", userId);

        if (!error && isMounted) {
          const dbRows = data || [];
          const dbMap = new Map(dbRows.map((r) => [r.item_key, r.percent]));
          const current = loadProgress(userId);
          let hasDiff = false;
          const toUpload: { user_id: string; item_key: string; percent: number; updated_at: string }[] = [];

          // 1. Nạp từ DB vào local nếu DB có tiến trình cao hơn
          for (const row of dbRows) {
            if ((current[row.item_key] ?? 0) < row.percent) {
              current[row.item_key] = row.percent;
              hasDiff = true;
            }
          }

          // 2. Đẩy từ local lên DB nếu local có điểm mà DB chưa có (dữ liệu cũ chuyển giao)
          for (const [k, v] of Object.entries(current)) {
            if ((dbMap.get(k) ?? 0) < v) {
              toUpload.push({
                user_id: userId,
                item_key: k,
                percent: v,
                updated_at: new Date().toISOString(),
              });
            }
          }

          if (hasDiff) {
            persist(current, userId);
            setProgress({ ...current });
          }

          if (toUpload.length > 0) {
            supabase
              .from("user_progress")
              .upsert(toUpload, { onConflict: "user_id,item_key" })
              .then(() => {});
          }
        }
      } catch (err) {
        console.error("Lỗi khi nạp tiến trình từ Database:", err);
      }
    }

    syncFromDatabase();

    return () => {
      isMounted = false;
      window.removeEventListener(EVENT_NAME, updateLocal);
      window.removeEventListener("storage", updateLocal);
    };
  }, [userId]);

  /** Lưu tiến trình của một khóa (chỉ giữ điểm cao nhất) & ghi vào Database */
  const setPercent = useCallback(
    (key: string, percent: number) => {
      const map = loadProgress(userId);
      const value = Math.max(0, Math.min(100, Math.round(percent)));
      map[key] = Math.max(map[key] ?? 0, value);
      persist(map, userId);
      setProgress({ ...map });

      // Ghi nhận vào Database Supabase
      if (userId) {
        import("@/lib/supabase/client").then(({ createClient }) => {
          const supabase = createClient();
          if (supabase) {
            supabase
              .from("user_progress")
              .upsert(
                {
                  user_id: userId,
                  item_key: key,
                  percent: value,
                  updated_at: new Date().toISOString(),
                },
                { onConflict: "user_id,item_key" },
              )
              .then(({ error }) => {
                if (error) {
                  console.error("Lỗi lưu tiến trình vào Database:", error.message);
                }
              });
          }
        });
      }
    },
    [userId],
  );

  return { progress, setPercent };
}
