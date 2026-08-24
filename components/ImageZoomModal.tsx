"use client";

import { useEffect, useState, useRef, useCallback } from "react";

export type ZoomImageItem = {
  src: string;
  caption?: string;
};

type Props = {
  images: ZoomImageItem[];
  initialIndex?: number;
  onClose: () => void;
};

export default function ImageZoomModal({ images, initialIndex = 0, onClose }: Props) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const currentImage = images[currentIndex] || images[0];

  const resetTransform = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  const handleNext = useCallback(() => {
    if (images.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % images.length);
    resetTransform();
  }, [images.length, resetTransform]);

  const handlePrev = useCallback(() => {
    if (images.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    resetTransform();
  }, [images.length, resetTransform]);

  const handleZoomIn = () => setScale((s) => Math.min(s + 0.3, 4));
  const handleZoomOut = () => {
    setScale((s) => {
      const next = Math.max(s - 0.3, 0.5);
      if (next <= 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  };

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "+" || e.key === "=") {
        handleZoomIn();
      } else if (e.key === "-") {
        handleZoomOut();
      } else if (e.key === "0") {
        resetTransform();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrev, onClose, resetTransform]);

  // Mouse drag panning when zoomed
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return;
    setIsDragging(true);
    dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || scale <= 1) return;
    setPosition({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      setScale((s) => Math.min(s + 0.2, 4));
    } else {
      setScale((s) => {
        const next = Math.max(s - 0.2, 0.6);
        if (next <= 1) setPosition({ x: 0, y: 0 });
        return next;
      });
    }
  };

  if (!currentImage) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-black/90 p-4 backdrop-blur-md select-none animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Thanh điều khiển trên cùng */}
      <div
        className="z-10 flex w-full max-w-5xl items-center justify-between gap-3 rounded-2xl bg-white/10 px-4 py-2.5 text-white backdrop-blur-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 text-sm font-medium">
          <span className="rounded-md bg-white/20 px-2 py-0.5 text-xs font-bold">
            🔍 {Math.round(scale * 100)}%
          </span>
          {images.length > 1 && (
            <span className="text-xs text-slate-300">
              ({currentIndex + 1} / {images.length})
            </span>
          )}
        </div>

        {/* Nút công cụ zoom */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={handleZoomIn}
            title="Phóng to (+)"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15 text-lg font-bold text-white transition hover:bg-white/25 active:scale-95"
          >
            +
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            title="Thu nhỏ (-)"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15 text-lg font-bold text-white transition hover:bg-white/25 active:scale-95"
          >
            -
          </button>
          <button
            type="button"
            onClick={resetTransform}
            title="Đặt lại kích thước (0)"
            className="hidden rounded-lg bg-white/15 px-2.5 py-1 text-xs font-semibold text-white transition hover:bg-white/25 active:scale-95 sm:inline-block"
          >
            ⟲ 100%
          </button>

          <a
            href={currentImage.src}
            target="_blank"
            rel="noreferrer"
            title="Mở ảnh gốc trong tab mới"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15 text-sm text-white transition hover:bg-white/25"
          >
            ↗
          </a>

          <button
            type="button"
            onClick={onClose}
            title="Đóng (Esc)"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600/80 text-sm font-bold text-white transition hover:bg-red-600 active:scale-95"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Vùng xem ảnh chính */}
      <div
        className="relative flex h-full w-full flex-1 items-center justify-center overflow-hidden"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        onClick={(e) => e.stopPropagation()}
        style={{ cursor: scale > 1 ? (isDragging ? "grabbing" : "grab") : "zoom-in" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={currentImage.src}
          alt={currentImage.caption || "Hình ảnh phóng to"}
          draggable={false}
          onClick={(e) => {
            e.stopPropagation();
            if (scale === 1) handleZoomIn();
          }}
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transition: isDragging ? "none" : "transform 0.15s ease-out",
          }}
          className="max-h-[82vh] max-w-[92vw] rounded-xl object-contain drop-shadow-2xl"
        />

        {/* Nút chuyển ảnh Trước / Sau nếu có nhiều ảnh */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              title="Ảnh trước (←)"
              className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-xl font-bold text-white backdrop-blur-md transition hover:bg-black/80 hover:scale-110 active:scale-95"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={handleNext}
              title="Ảnh tiếp theo (→)"
              className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-xl font-bold text-white backdrop-blur-md transition hover:bg-black/80 hover:scale-110 active:scale-95"
            >
              ›
            </button>
          </>
        )}
      </div>

      {/* Chú thích ảnh dưới cùng */}
      <div
        className="z-10 mt-2 max-w-3xl rounded-xl bg-black/60 px-4 py-2 text-center text-sm font-medium text-slate-200 backdrop-blur-md"
        onClick={(e) => e.stopPropagation()}
      >
        {currentImage.caption || "Hình ảnh lời giải chi tiết"}
        <span className="ml-2 text-xs text-slate-400">
          (Cuộn chuột hoặc bấm +/- để zoom, kéo rê để di chuyển)
        </span>
      </div>
    </div>
  );
}
