"use client";

import { useState } from "react";
import Image from "next/image";
import { Lightbox } from "./Lightbox";

type GalleryImage = { id: string; url: string };

export function ProjectGallery({ images, title }: { images: GalleryImage[]; title: string }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (images.length === 0) {
    return (
      <div className="flex aspect-[16/6] items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        No photos available
      </div>
    );
  }

  const urls = images.map((image) => image.url);

  return (
    <>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-4">
        <button
          type="button"
          onClick={() => setOpenIndex(0)}
          className="group relative aspect-[4/3] cursor-zoom-in overflow-hidden rounded-2xl bg-slate-100 sm:col-span-2 sm:row-span-2"
        >
          <Image
            src={images[0].url}
            alt={`${title} — photo 1`}
            fill
            className="object-cover transition duration-200 group-hover:scale-105"
            sizes="(min-width: 640px) 50vw, 100vw"
            priority
          />
        </button>
        {images.slice(1, 5).map((image, index) => (
          <button
            type="button"
            key={image.id}
            onClick={() => setOpenIndex(index + 1)}
            className="group relative hidden aspect-[4/3] cursor-zoom-in overflow-hidden rounded-2xl bg-slate-100 sm:block"
          >
            <Image
              src={image.url}
              alt={`${title} — photo ${index + 2}`}
              fill
              className="object-cover transition duration-200 group-hover:scale-105"
              sizes="25vw"
            />
          </button>
        ))}
      </div>

      {openIndex !== null && <Lightbox images={urls} index={openIndex} onClose={() => setOpenIndex(null)} />}
    </>
  );
}
