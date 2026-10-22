"use client";

import { useState } from "react";
import Image from "next/image";
import { Lightbox } from "./Lightbox";

export function ZoomableImage({
  src,
  alt,
  className,
  sizes,
}: {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`group relative cursor-zoom-in overflow-hidden ${className ?? ""}`}
      >
        <Image
          src={src}
          alt={alt}
          fill
          className="object-contain transition duration-200 group-hover:scale-[1.02]"
          sizes={sizes}
        />
      </button>
      {open && <Lightbox images={[src]} index={0} onClose={() => setOpen(false)} />}
    </>
  );
}
