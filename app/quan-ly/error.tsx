"use client";

import ErrorFallback from "@/components/ErrorFallback";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function QuanLyError({ error, reset }: Props) {
  return <ErrorFallback error={error} reset={reset} />;
}
