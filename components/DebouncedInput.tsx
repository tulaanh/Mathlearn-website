"use client";

import { useEffect, useRef, useState } from "react";

/** Ô nhập giữ state cục bộ, chỉ commit lên state của cha sau khi ngừng gõ ~400ms
 *  (hoặc khi ô nhập mất tiêu điểm) để việc gõ không kích re-render component cha trên từng phím. */
export default function DebouncedInput({
  value,
  disabled,
  placeholder,
  className,
  onCommit,
}: {
  value: string;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  onCommit: (value: string) => void;
}) {
  const [local, setLocal] = useState(value);
  const synced = useRef(value);
  const onCommitRef = useRef(onCommit);
  onCommitRef.current = onCommit;

  // Cha đổi giá trị từ nguồn khác (vd. bấm "Làm lại") — đồng bộ lại ô nhập
  useEffect(() => {
    if (value !== synced.current) {
      synced.current = value;
      setLocal(value);
    }
  }, [value]);

  // Debounce kiểu trailing: mỗi phím gõ đặt lại hẹn giờ, effect closure luôn thấy local mới nhất
  useEffect(() => {
    if (local === synced.current) return;
    const t = setTimeout(() => {
      synced.current = local;
      onCommitRef.current(local);
    }, 400);
    return () => clearTimeout(t);
  }, [local]);

  function commitNow() {
    if (local !== synced.current) {
      synced.current = local;
      onCommitRef.current(local);
    }
  }

  return (
    <input
      type="text"
      value={local}
      disabled={disabled}
      placeholder={placeholder}
      onChange={(e) => setLocal(e.target.value)}
      onBlur={commitNow}
      className={className}
    />
  );
}
