"use client";

import { useEffect, useState } from "react";

function remaining(target: string): number {
  return Math.max(0, new Date(target).getTime() - Date.now());
}

function display(ms: number): string {
  const total = Math.floor(ms / 1000);
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  if (days) return `${days} ngày ${String(hours).padStart(2, "0")} giờ`;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export default function EventCountdown({ target, label }: { target: string; label: string }) {
  const [ms, setMs] = useState(() => remaining(target));
  useEffect(() => {
    const timer = window.setInterval(() => setMs(remaining(target)), 1000);
    return () => window.clearInterval(timer);
  }, [target]);
  return <span>{label} {display(ms)}</span>;
}
