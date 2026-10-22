"use client";

import { useCallback, useEffect, useState } from "react";

export function Lightbox({
  images,
  index,
  onClose,
}: {
  images: string[];
  index: number;
  onClose: () => void;
}) {
  const [current, setCurrent] = useState(index);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    setCurrent(index);
    setZoom(1);
  }, [index]);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % images.length);
    setZoom(1);
  }, [images.length]);

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + images.length) % images.length);
    setZoom(1);
  }, [images.length]);

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") next();
      if (event.key === "ArrowLeft") prev();
    }
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [next, prev, onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-black/95" role="dialog" aria-modal="true">
      <div className="flex items-center justify-between px-4 py-3 text-white">
        <span className="text-sm text-slate-300">
          {current + 1} / {images.length}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(1, Number((z - 0.5).toFixed(1))))}
            disabled={zoom <= 1}
            aria-label="Zoom out"
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-white/10 disabled:opacity-30"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-5 w-5">
              <circle cx="11" cy="11" r="7" strokeWidth={1.75} />
              <path strokeLinecap="round" strokeWidth={1.75} d="M21 21l-4.3-4.3M8 11h6" />
            </svg>
          </button>
          <span className="w-12 text-center text-sm text-slate-300">{Math.round(zoom * 100)}%</span>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(3, Number((z + 0.5).toFixed(1))))}
            disabled={zoom >= 3}
            aria-label="Zoom in"
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-white/10 disabled:opacity-30"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-5 w-5">
              <circle cx="11" cy="11" r="7" strokeWidth={1.75} />
              <path strokeLinecap="round" strokeWidth={1.75} d="M21 21l-4.3-4.3M11 8v6M8 11h6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="ml-2 flex h-9 w-9 items-center justify-center rounded-full hover:bg-white/10"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
      </div>

      <div
        className="relative flex-1 overflow-auto"
        onClick={(event) => {
          if (event.target === event.currentTarget) onClose();
        }}
      >
        <div className="flex min-h-full items-center justify-center p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[current]}
            alt=""
            onClick={() => setZoom((z) => (z === 1 ? 2 : 1))}
            style={{ transform: `scale(${zoom})`, transition: "transform 0.2s ease" }}
            className={`max-h-[80vh] max-w-full origin-center object-contain ${zoom === 1 ? "cursor-zoom-in" : "cursor-zoom-out"}`}
          />
        </div>
      </div>

      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            aria-label="Previous image"
            className="absolute left-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur hover:bg-white/20 sm:left-4"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Next image"
            className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur hover:bg-white/20 sm:right-4"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}
    </div>
  );
}
