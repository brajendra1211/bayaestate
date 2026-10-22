"use client";

import { useCallback, useEffect, useRef, useState } from "react";

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
  const [rotation, setRotation] = useState(0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragRef = useRef<{ startX: number; startY: number; panX: number; panY: number } | null>(null);
  const movedRef = useRef(0);
  const [dragging, setDragging] = useState(false);

  function resetView() {
    setZoom(1);
    setRotation(0);
    setPan({ x: 0, y: 0 });
  }

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % images.length);
    setZoom(1);
    setRotation(0);
    setPan({ x: 0, y: 0 });
  }, [images.length]);

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + images.length) % images.length);
    setZoom(1);
    setRotation(0);
    setPan({ x: 0, y: 0 });
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

  function zoomIn() {
    setZoom((z) => Math.min(4, Number((z + 0.5).toFixed(1))));
  }

  function zoomOut() {
    setZoom((z) => {
      const next = Math.max(1, Number((z - 0.5).toFixed(1)));
      if (next === 1) setPan({ x: 0, y: 0 });
      return next;
    });
  }

  function rotateLeft() {
    setRotation((r) => r - 90);
  }

  function rotateRight() {
    setRotation((r) => r + 90);
  }

  function handlePointerDown(event: React.PointerEvent) {
    if (zoom <= 1) return;
    dragRef.current = { startX: event.clientX, startY: event.clientY, panX: pan.x, panY: pan.y };
    movedRef.current = 0;
    setDragging(true);
    (event.target as HTMLElement).setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: React.PointerEvent) {
    if (!dragRef.current) return;
    const dx = event.clientX - dragRef.current.startX;
    const dy = event.clientY - dragRef.current.startY;
    movedRef.current = Math.max(movedRef.current, Math.abs(dx) + Math.abs(dy));
    setPan({ x: dragRef.current.panX + dx, y: dragRef.current.panY + dy });
  }

  function handlePointerUp() {
    dragRef.current = null;
    setDragging(false);
  }

  function toggleZoom() {
    if (movedRef.current > 5) return;
    if (zoom === 1) {
      setZoom(2);
    } else {
      setZoom(1);
      setPan({ x: 0, y: 0 });
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-black/95" role="dialog" aria-modal="true">
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-white">
        <span className="text-sm text-slate-300">
          {current + 1} / {images.length}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={zoomOut}
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
            onClick={zoomIn}
            disabled={zoom >= 4}
            aria-label="Zoom in"
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-white/10 disabled:opacity-30"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-5 w-5">
              <circle cx="11" cy="11" r="7" strokeWidth={1.75} />
              <path strokeLinecap="round" strokeWidth={1.75} d="M21 21l-4.3-4.3M11 8v6M8 11h6" />
            </svg>
          </button>

          <div className="mx-1 h-5 w-px bg-white/20" />

          <button
            type="button"
            onClick={rotateLeft}
            aria-label="Rotate left"
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-white/10"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 10H5V6" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M5.3 15A8 8 0 1012 4a8 8 0 00-6.7 3.6L5 10" />
            </svg>
          </button>
          <button
            type="button"
            onClick={rotateRight}
            aria-label="Rotate right"
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-white/10"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 10h4V6" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M18.7 15A8 8 0 1012 4a8 8 0 016.7 3.6L19 10" />
            </svg>
          </button>

          {(zoom !== 1 || rotation !== 0) && (
            <button
              type="button"
              onClick={resetView}
              className="ml-1 rounded-full px-3 py-1.5 text-xs font-medium hover:bg-white/10"
            >
              Reset
            </button>
          )}

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
        className="relative flex-1 touch-none overflow-hidden"
        onClick={(event) => {
          if (event.target === event.currentTarget) onClose();
        }}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <div className="flex h-full items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[current]}
            alt=""
            onClick={(event) => {
              event.stopPropagation();
              toggleZoom();
            }}
            onPointerDown={handlePointerDown}
            draggable={false}
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) rotate(${rotation}deg) scale(${zoom})`,
              transition: dragging ? "none" : "transform 0.2s ease",
            }}
            className={`max-h-[80vh] max-w-[92vw] select-none object-contain ${
              zoom > 1 ? (dragging ? "cursor-grabbing" : "cursor-grab") : "cursor-zoom-in"
            }`}
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
