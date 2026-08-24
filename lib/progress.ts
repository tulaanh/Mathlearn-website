"use client";

import { useCallback, useEffect, useState } from "react";
import type { Chapter, Lesson } from "@/lib/types";

/**
 * ============================================================
 *  TIẾN TRÌNH HỌC TẬP (lưu tại localStorage của trình duyệt)
 * ------------------------------------------------------------
 *  - Bài học có bài test : tiến trình = điểm tốt nhất đã đạt (%)
 *  - Bài học lý thuyết   : 0% → bấm "Đánh dấu đã học" → 100%
 *  - Tiến trình chương   = trung bình tiến trình các bài học
 * ============================================================
 */

export type ProgressMap = Record<string, number>;

const STORAGE_KEY = "hoc-tap-progress";
const EVENT_NAME = "hoc-tap-progress-changed";

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

/** Đọc toàn bộ tiến trình từ localStorage (chỉ gọi ở phía client) */
export function loadProgress(): ProgressMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ProgressMap) : {};
  } catch {
    return {};
  }
}

function persist(map: ProgressMap) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // bỏ qua nếu trình duyệt chặn localStorage
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
 * (kể cả khi nộp bài test ở trang khác hoặc tab khác)
 */
export function useProgress() {
  const [progress, setProgress] = useState<ProgressMap>({});

  useEffect(() => {
    const update = () => setProgress(loadProgress());
    update();
    window.addEventListener(EVENT_NAME, update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener(EVENT_NAME, update);
      window.removeEventListener("storage", update);
    };
  }, []);

  /** Lưu tiến trình của một khóa (chỉ giữ điểm cao nhất) */
  const setPercent = useCallback((key: string, percent: number) => {
    const map = loadProgress();
    const value = Math.max(0, Math.min(100, Math.round(percent)));
    map[key] = Math.max(map[key] ?? 0, value);
    persist(map);
  }, []);

  return { progress, setPercent };
}
