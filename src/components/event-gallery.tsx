"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Facebook,
  Instagram,
  Maximize2,
  MessageCircle,
  Minimize2,
  Play,
  Share2,
  Smartphone,
  X,
} from "lucide-react";
import type { EventMediaItem } from "@/data/events";

type EventGalleryProps = {
  media: EventMediaItem[];
  title: string;
};

type SharePayload = {
  pageUrl: string;
  mediaUrl: string;
  title: string;
};

type ShareTarget = {
  label: string;
  icon: typeof Facebook;
  buildUrl: (payload: SharePayload) => string;
};

const shareTargets: ShareTarget[] = [
  {
    label: "WhatsApp",
    icon: MessageCircle,
    buildUrl: ({ pageUrl, title }) =>
      `https://wa.me/?text=${encodeURIComponent(`${title}\n${pageUrl}`)}`,
  },
  {
    label: "TikTok",
    icon: Smartphone,
    buildUrl: ({ pageUrl, title }) =>
      `https://www.tiktok.com/share?url=${encodeURIComponent(pageUrl)}&title=${encodeURIComponent(title)}`,
  },
  {
    label: "Instagram",
    icon: Instagram,
    buildUrl: ({ pageUrl }) => `https://www.instagram.com/?url=${encodeURIComponent(pageUrl)}`,
  },
  {
    label: "Facebook",
    icon: Facebook,
    buildUrl: ({ pageUrl }) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`,
  },
  {
    label: "Message",
    icon: MessageCircle,
    buildUrl: ({ pageUrl, title }) =>
      `sms:?&body=${encodeURIComponent(`${title} ${pageUrl}`)}`,
  },
];

export function EventGallery({ media, title }: EventGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  const mediaItems = useMemo(
    () => media.filter((item): item is EventMediaItem => Boolean(item?.src)),
    [media],
  );

  const activeMedia = mediaItems[activeIndex];
  const canZoom = activeMedia?.type === "image";

  const openLightbox = useCallback((index: number) => {
    setActiveIndex(index);
    setIsLightboxOpen(true);
    setIsZoomed(false);
  }, []);

  const closeLightbox = useCallback(() => {
    setIsLightboxOpen(false);
    setIsZoomed(false);
  }, []);

  const showNext = useCallback(() => {
    if (mediaItems.length === 0) return;
    setActiveIndex((prev) => {
      const nextIndex = (prev + 1) % mediaItems.length;
      if (mediaItems[nextIndex]?.type !== "image") {
        setIsZoomed(false);
      }
      return nextIndex;
    });
  }, [mediaItems]);

  const showPrev = useCallback(() => {
    if (mediaItems.length === 0) return;
    setActiveIndex((prev) => {
      const nextIndex = (prev - 1 + mediaItems.length) % mediaItems.length;
      if (mediaItems[nextIndex]?.type !== "image") {
        setIsZoomed(false);
      }
      return nextIndex;
    });
  }, [mediaItems]);

  const handleToggleZoom = useCallback(() => {
    if (mediaItems[activeIndex]?.type !== "image") return;
    setIsZoomed((prev) => !prev);
  }, [activeIndex, mediaItems]);

  const handleShare = useCallback(
    (target: ShareTarget) => {
      if (typeof window === "undefined") return;
      const pageUrl = window.location.href;
      const payload: SharePayload = {
        pageUrl,
        mediaUrl: mediaItems[activeIndex]?.src ?? pageUrl,
        title,
      };
      const url = target.buildUrl(payload);
      window.open(url, "_blank", "noopener,noreferrer");
    },
    [activeIndex, mediaItems, title],
  );

  const handleSystemShare = useCallback(async () => {
    if (typeof navigator === "undefined" || typeof window === "undefined") return;
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          url: window.location.href,
          text: title,
        });
      } catch {
        // ignore aborts
      }
    } else {
      window.open(window.location.href, "_blank", "noopener,noreferrer");
    }
  }, [title]);

  useEffect(() => {
    if (!isLightboxOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      const tagName = (event.target as HTMLElement | null)?.tagName;
      const isTypingTarget = tagName === "INPUT" || tagName === "TEXTAREA";
      if (isTypingTarget) return;
      if (event.key === "Escape") {
        event.preventDefault();
        closeLightbox();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        showNext();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        showPrev();
      } else if ((event.key === " " || event.key === "Enter") && canZoom) {
        event.preventDefault();
        handleToggleZoom();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [canZoom, closeLightbox, handleToggleZoom, isLightboxOpen, showNext, showPrev]);

  if (mediaItems.length === 0) {
    return null;
  }

  const renderPreviewMedia = (
    item: EventMediaItem | undefined,
    variant: "primary" | "thumb",
  ) => {
    if (!item) return null;
    const wrapperClass =
      variant === "primary"
        ? "relative w-full overflow-hidden rounded-3xl aspect-[4/3] sm:aspect-[16/9]"
        : "relative h-full w-full overflow-hidden rounded-2xl";
    const mediaClass =
      variant === "primary"
        ? "object-cover transition duration-300 group-hover:scale-[1.015]"
        : "object-cover";
    if (item.type === "video") {
      return (
        <div className={wrapperClass}>
          <video
            className={`h-full w-full ${mediaClass}`}
            src={item.src}
            poster={item.poster}
            muted
            loop
            playsInline
            autoPlay
          />
          <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
            <Play className="size-3.5" /> Video
          </span>
        </div>
      );
    }
    return (
      <div className={wrapperClass}>
      <Image
        src={item.src}
        alt={item.caption ?? title}
          fill
        sizes={variant === "primary" ? "(max-width: 1024px) 100vw, 70vw" : "200px"}
          className={mediaClass}
        priority={variant === "primary"}
      />
      </div>
    );
  };

  return (
    <>
      <div className="space-y-3 sm:space-y-4">
        <button
          type="button"
          className="group block w-full overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-100"
          onClick={() => openLightbox(0)}
        >
          {renderPreviewMedia(mediaItems[0], "primary")}
        </button>
        {mediaItems.length > 1 && (
          <div className="scrollbar-minimal no-scrollbar flex gap-2 sm:gap-3 overflow-x-auto snap-x snap-mandatory -mx-3 sm:-mx-4 lg:-mx-6 px-3 sm:px-4 lg:px-6">
            {mediaItems.slice(1).map((item, idx) => (
              <button
                key={`${item.src}-${idx}`}
                type="button"
                className="relative h-24 w-32 sm:h-32 sm:w-48 lg:h-36 lg:w-56 flex-shrink-0 overflow-hidden rounded-xl sm:rounded-2xl border border-slate-100 transition hover:-translate-y-0.5 hover:shadow-lg snap-center"
                onClick={() => openLightbox(idx + 1)}
              >
                {renderPreviewMedia(item, "thumb")}
              </button>
            ))}
          </div>
        )}
      </div>

      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur">
          <button
            type="button"
            aria-label="Close gallery"
            className="absolute right-3 sm:right-6 top-3 sm:top-6 rounded-full border border-white/40 bg-black/60 p-1.5 sm:p-2 text-white transition hover:bg-black z-10"
            onClick={closeLightbox}
          >
            <X className="size-4 sm:size-5" />
          </button>
          <button
            type="button"
            aria-label="Previous media"
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 rounded-full border border-white/40 bg-black/50 p-2 sm:p-3 text-white transition hover:bg-black z-10"
            onClick={showPrev}
          >
            <ChevronLeft className="size-5 sm:size-6" />
          </button>
          <button
            type="button"
            aria-label="Next media"
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 rounded-full border border-white/40 bg-black/50 p-2 sm:p-3 text-white transition hover:bg-black z-10"
            onClick={showNext}
          >
            <ChevronRight className="size-5 sm:size-6" />
          </button>
          <div className="flex w-full max-w-5xl flex-col gap-3 sm:gap-4 px-2 sm:px-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 text-white">
              <p className="text-xs sm:text-sm uppercase tracking-[0.3em] text-white/70">
                Gallery
              </p>
              <div className="flex gap-1.5 sm:gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  className={`rounded-full border border-white/40 px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-white transition flex-1 sm:flex-initial ${
                    canZoom
                      ? "bg-black/50 hover:bg-black"
                      : "cursor-not-allowed bg-black/30 opacity-60"
                  }`}
                  onClick={handleToggleZoom}
                  disabled={!canZoom}
                >
                  <span className="flex items-center justify-center gap-1">
                    {isZoomed ? (
                      <>
                        <Minimize2 className="size-3 sm:size-3.5" />
                        <span className="hidden sm:inline">Minimize</span>
                      </>
                    ) : (
                      <>
                        <Maximize2 className="size-3 sm:size-3.5" />
                        <span className="hidden sm:inline">{canZoom ? "Maximize" : "Image only"}</span>
                      </>
                    )}
                  </span>
                </button>
                <button
                  type="button"
                  className="rounded-full border border-white/40 bg-black/50 px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-black flex-1 sm:flex-initial"
                  onClick={handleSystemShare}
                >
                  <span className="flex items-center justify-center gap-1">
                    <Share2 className="size-3 sm:size-3.5" />
                    <span className="hidden sm:inline">Share</span>
                  </span>
                </button>
              </div>
            </div>
            <div className="relative flex h-[60vh] sm:h-[70vh] w-full items-center justify-center overflow-hidden rounded-2xl sm:rounded-3xl border border-white/20 bg-black/40 p-2 sm:p-4">
              {activeMedia?.type === "video" ? (
                <video
                  key={activeMedia.src}
                  src={activeMedia.src}
                  poster={activeMedia.poster}
                  controls
                  autoPlay
                  playsInline
                  className="h-full w-full rounded-2xl object-contain"
                />
              ) : (
                <button
                  type="button"
                  className={`relative flex h-full w-full items-center justify-center overflow-hidden rounded-2xl transition ${
                    isZoomed ? "cursor-zoom-out" : "cursor-zoom-in"
                  }`}
                  onClick={handleToggleZoom}
                  aria-label={isZoomed ? "Minimize image" : "Maximize image"}
                >
                  <Image
                    src={activeMedia?.src ?? ""}
                    alt={activeMedia?.caption ?? title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 70vw"
                    className={`pointer-events-none object-contain transition duration-500 ${
                      isZoomed ? "scale-110" : "scale-100"
                    }`}
                    priority
                  />
                </button>
              )}
            </div>
            <div className="rounded-xl sm:rounded-2xl border border-white/15 bg-white/5 p-3 sm:p-4 text-white">
              <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] sm:tracking-[0.4em] text-white/60">
                Share this moment
              </p>
              {activeMedia?.caption && (
                <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-white/80 break-words">{activeMedia.caption}</p>
              )}
              <div className="mt-2 sm:mt-3 flex flex-wrap gap-1.5 sm:gap-2">
                {shareTargets.map((target) => (
                  <button
                    key={target.label}
                    type="button"
                    className="flex items-center gap-1.5 sm:gap-2 rounded-full border border-white/30 bg-white/10 px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-semibold uppercase tracking-wide transition hover:bg-white/20"
                    onClick={() => handleShare(target)}
                  >
                    <target.icon className="size-3 sm:size-3.5" />
                    <span className="hidden sm:inline">{target.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

