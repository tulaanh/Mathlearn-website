"use client";

import { useEffect, useRef, useState } from "react";
import MathText from "./MathText";

type LazyMathTextProps = {
  text: string;
  className?: string;
  /** Bọc bằng span thay vì div — dùng khi thành phần nằm cùng dòng với chữ khác (ví dụ "1. <câu hỏi>"). */
  inline?: boolean;
};

/** Chỉ render KaTeX khi phần tử sắp hiển thị trong viewport,
 *  giảm chi phí parse đồng bộ khi danh sách dài. */
export default function LazyMathText({ text, className, inline }: LazyMathTextProps) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const content = visible ? (
    <MathText text={text} />
  ) : inline ? (
    <span className="inline-block h-5 w-24 animate-pulse rounded bg-slate-100 align-middle dark:bg-slate-800" aria-hidden />
  ) : (
    <div className="h-5 animate-pulse rounded bg-slate-100 dark:bg-slate-800" aria-hidden />
  );

  if (inline) {
    return (
      <span ref={ref as React.RefObject<HTMLSpanElement>} className={className}>
        {content}
      </span>
    );
  }
  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className={className}>
      {content}
    </div>
  );
}
