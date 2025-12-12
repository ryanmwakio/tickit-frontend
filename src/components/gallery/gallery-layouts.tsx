"use client";

import Image from "next/image";
import type { EventMediaItem } from "@/data/events";

type GalleryLayout = "grid" | "masonry" | "carousel" | "stack" | "featured";

type GalleryLayoutsProps = {
  media: EventMediaItem[];
  layout: GalleryLayout;
  title?: string;
  onImageClick?: (index: number) => void;
};

export function GalleryLayouts({ media, layout, title, onImageClick }: GalleryLayoutsProps) {
  const images = media.filter((item) => item.type === "image");

  if (images.length === 0) {
    return null;
  }

  const handleClick = (index: number) => {
    onImageClick?.(index);
  };

  switch (layout) {
    case "grid":
      return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((item, index) => (
            <button
              key={`${item.src}-${index}`}
              type="button"
              onClick={() => handleClick(index)}
              className="group relative aspect-video w-full overflow-hidden rounded-2xl border border-slate-200 transition hover:scale-105 hover:shadow-lg"
            >
              <Image
                src={item.src}
                alt={item.caption || title || `Gallery image ${index + 1}`}
                fill
                className="object-cover transition group-hover:scale-110"
              />
            </button>
          ))}
        </div>
      );

    case "masonry":
      return (
        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
          {images.map((item, index) => (
            <button
              key={`${item.src}-${index}`}
              type="button"
              onClick={() => handleClick(index)}
              className="group relative mb-4 block w-full overflow-hidden rounded-2xl border border-slate-200 transition hover:scale-[1.02] hover:shadow-lg"
            >
              <div className="relative aspect-[4/5] w-full">
                <Image
                  src={item.src}
                  alt={item.caption || title || `Gallery image ${index + 1}`}
                  fill
                  className="object-cover transition group-hover:scale-110"
                />
              </div>
            </button>
          ))}
        </div>
      );

    case "carousel":
      return (
        <div className="scrollbar-minimal flex gap-4 overflow-x-auto pb-4">
          {images.map((item, index) => (
            <button
              key={`${item.src}-${index}`}
              type="button"
              onClick={() => handleClick(index)}
              className="relative h-64 w-80 flex-shrink-0 overflow-hidden rounded-2xl border border-slate-200 transition hover:scale-105 hover:shadow-lg"
            >
              <Image
                src={item.src}
                alt={item.caption || title || `Gallery image ${index + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      );

    case "stack":
      return (
        <div className="space-y-4">
          {images.map((item, index) => (
            <button
              key={`${item.src}-${index}`}
              type="button"
              onClick={() => handleClick(index)}
              className="group relative block w-full overflow-hidden rounded-2xl border border-slate-200 transition hover:shadow-lg"
            >
              <div className="relative aspect-[21/9] w-full">
                <Image
                  src={item.src}
                  alt={item.caption || title || `Gallery image ${index + 1}`}
                  fill
                  className="object-cover transition group-hover:scale-105"
                />
              </div>
            </button>
          ))}
        </div>
      );

    case "featured":
      return (
        <div className="space-y-4">
          {images.length > 0 && (
            <button
              type="button"
              onClick={() => handleClick(0)}
              className="group relative block w-full overflow-hidden rounded-3xl border border-slate-200 transition hover:shadow-xl"
            >
              <div className="relative aspect-[16/9] w-full">
                <Image
                  src={images[0].src}
                  alt={images[0].caption || title || "Featured image"}
                  fill
                  className="object-cover transition group-hover:scale-105"
                  priority
                />
              </div>
            </button>
          )}
          {images.length > 1 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {images.slice(1).map((item, index) => (
                <button
                  key={`${item.src}-${index + 1}`}
                  type="button"
                  onClick={() => handleClick(index + 1)}
                  className="group relative aspect-video w-full overflow-hidden rounded-2xl border border-slate-200 transition hover:scale-105 hover:shadow-lg"
                >
                  <Image
                    src={item.src}
                    alt={item.caption || title || `Gallery image ${index + 2}`}
                    fill
                    className="object-cover transition group-hover:scale-110"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      );

    default:
      return null;
  }
}

