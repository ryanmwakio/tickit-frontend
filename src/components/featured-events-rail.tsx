"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  BarChart3,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Flame,
  Sparkles,
  Ticket,
  Clock,
} from "lucide-react";
import type { EventContent } from "@/data/events";
import { fetchEvents, mapEventToEventContent } from "@/lib/events-api";
import { isEventPast, getEventStatus } from "@/lib/event-utils";
import { getPlatformStats, type PlatformStats } from "@/lib/analytics-api";

type SegmentConfig = {
  id: string;
  label: string;
  subline: string;
  icon: typeof Sparkles;
  accent: string;
  slugs: string[];
  pulseColor?: string;
};

const segmentConfigs: SegmentConfig[] = [
  {
    id: "featured",
    label: "Featured",
    subline: "Editorial picks with VIP perks baked in.",
    icon: Sparkles,
    accent: "from-indigo-500/40 via-purple-500/20 to-transparent",
    slugs: [
      "sunset-sessions",
      "sanaa-fest",
      "founders-playbook",
      "vibes-and-vinyl",
    ],
    pulseColor: "bg-indigo-400",
  },
  {
    id: "hot",
    label: "Hot right now",
    subline: "Trending rails driven by live purchase spikes.",
    icon: Flame,
    accent: "from-orange-500/40 via-pink-500/20 to-transparent",
    slugs: [
      "naivasha-sundowner",
      "vibes-and-vinyl",
      "lamu-yoga-voyage",
      "sunset-sessions",
    ],
    pulseColor: "bg-orange-400",
  },
  {
    id: "live",
    label: "Live pulse",
    subline: "Ops dashboards glowing green; crews on the ground.",
    icon: Activity,
    accent: "from-emerald-500/40 via-lime-400/20 to-transparent",
    slugs: [
      "sunset-sessions",
      "sanaa-fest",
      "naivasha-sundowner",
      "lamu-yoga-voyage",
    ],
    pulseColor: "bg-emerald-400",
  },
];

// Default stats will be replaced with real-time data
const defaultStats = [
  { label: "Tickets moving", value: "Loading...", detail: "Real-time data" },
  { label: "MPesa ready", value: "Loading...", detail: "Instant payouts" },
  { label: "Waitlists live", value: "Loading...", detail: "Auto-resale armed" },
];

const formatNumber = (num: number) => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
};

const tickerMessages = [
  "Sunset Sessions unlocked 120 VIP resale slots.",
  "Naivasha Sundowner cruise activated shuttle add-ons.",
  "Sanaa Fest waitlist promoted 42 families in the last hour.",
  "Founders' Playbook triggered new NET-30 invoices for corporates.",
];

const liveSegments = new Set(["live"]);

export function FeaturedEventsRail() {
  const [activeSegment, setActiveSegment] = useState(segmentConfigs[0].id);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [events, setEvents] = useState<EventContent[]>([]);
  const [loading, setLoading] = useState(true);
  const railRef = useRef<HTMLDivElement | null>(null);

  const [featuredEvents, setFeaturedEvents] = useState<EventContent[]>([]);
  const [hotEvents, setHotEvents] = useState<EventContent[]>([]);
  const [liveEvents, setLiveEvents] = useState<EventContent[]>([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [stats, setStats] = useState(defaultStats);

  useEffect(() => {
    async function loadEvents() {
      try {
        setLoading(true);
        // Fetch events by segment
        const [featuredRes, hotRes, liveRes] = await Promise.all([
          fetchEvents({
            featured: true,
            limit: 20,
            sortBy: "startsAt",
            sortOrder: "ASC",
          }),
          fetchEvents({
            hotRightNow: true,
            limit: 20,
            sortBy: "startsAt",
            sortOrder: "ASC",
          }),
          fetchEvents({
            livePulse: true,
            limit: 20,
            sortBy: "startsAt",
            sortOrder: "ASC",
          }),
        ]);

        const featuredArray = Array.isArray(featuredRes)
          ? featuredRes
          : featuredRes?.data || [];
        const hotArray = Array.isArray(hotRes) ? hotRes : hotRes?.data || [];
        const liveArray = Array.isArray(liveRes)
          ? liveRes
          : liveRes?.data || [];

        setFeaturedEvents(featuredArray.map(mapEventToEventContent));
        setHotEvents(hotArray.map(mapEventToEventContent));
        setLiveEvents(liveArray.map(mapEventToEventContent));

        // Set all events for fallback
        setEvents(
          [...featuredArray, ...hotArray, ...liveArray].map(
            mapEventToEventContent,
          ),
        );
      } catch (error) {
        console.error("Failed to load events:", error);
        setEvents([]);
        setFeaturedEvents([]);
        setHotEvents([]);
        setLiveEvents([]);
      } finally {
        setLoading(false);
      }
    }
    loadEvents();
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setAnalyticsLoading(true);
      const data = await getPlatformStats();

      // Transform analytics data into stats format
      const salesVelocityChange = data.salesVelocityChange;
      const changeText =
        salesVelocityChange >= 0
          ? `+${salesVelocityChange.toFixed(1)}% WoW`
          : `${salesVelocityChange.toFixed(1)}% WoW`;

      setStats([
        {
          label: "Tickets moving",
          value: formatNumber(data.totalTicketsSold),
          detail: changeText,
        },
        {
          label: "MPesa ready",
          value: `${formatNumber(data.upcomingEvents)} events`,
          detail: "Instant payouts",
        },
        {
          label: "Waitlists live",
          value: `${data.checkInRate.toFixed(1)}% rate`,
          detail: "Auto-resale armed",
        },
      ]);
    } catch (error) {
      console.error("Failed to load analytics:", error);
      // Keep default stats on error
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const cardsBySegment: Record<string, EventContent[]> = useMemo(() => {
    return {
      featured: featuredEvents.length > 0 ? featuredEvents : events.slice(0, 4),
      hot: hotEvents.length > 0 ? hotEvents : events.slice(0, 4),
      live: liveEvents.length > 0 ? liveEvents : events.slice(0, 4),
    };
  }, [featuredEvents, hotEvents, liveEvents, events]);

  const activeCards = useMemo(
    () => cardsBySegment[activeSegment] ?? events.slice(0, 4),
    [activeSegment, cardsBySegment, events],
  );

  const activeConfig =
    segmentConfigs.find((segment) => segment.id === activeSegment) ??
    segmentConfigs[0];

  const updateScrollState = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;

    // Use requestAnimationFrame to ensure DOM is rendered
    requestAnimationFrame(() => {
      if (!rail) return;
      const scrollLeft = rail.scrollLeft;
      const clientWidth = rail.clientWidth;
      const scrollWidth = rail.scrollWidth;

      // Enable left scroll if we've scrolled right
      setCanScrollLeft(scrollLeft > 5);

      // Enable right scroll if there's more content to scroll
      const hasMoreContent = scrollLeft + clientWidth < scrollWidth - 5;
      setCanScrollRight(hasMoreContent);
    });
  }, []);

  // Determine if navigation buttons should be visible
  const shouldShowNavigation = useMemo(() => {
    return activeCards.length > 3 && !loading;
  }, [activeCards.length, loading]);

  const scrollRail = useCallback((direction: "left" | "right") => {
    const rail = railRef.current;
    if (!rail) return;
    const amount = direction === "left" ? -360 : 360;
    rail.scrollBy({ left: amount, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    rail.scrollTo({ left: 0, behavior: "smooth" });
    // Update scroll state after content changes and scroll completes
    setTimeout(() => updateScrollState(), 300);
  }, [activeSegment, updateScrollState]);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    // Initial state update with delay for content rendering
    const timeoutId = setTimeout(() => {
      updateScrollState();
    }, 400);

    rail.addEventListener("scroll", updateScrollState);
    window.addEventListener("resize", updateScrollState);

    return () => {
      clearTimeout(timeoutId);
      rail.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [updateScrollState, loading]);

  // Update scroll state when content changes
  useEffect(() => {
    if (!loading && activeCards.length > 0) {
      // If we have many events, enable right scroll immediately
      if (activeCards.length > 3) {
        setCanScrollRight(true);
      }

      const timeoutId = setTimeout(() => {
        updateScrollState();
      }, 200);
      return () => clearTimeout(timeoutId);
    }
  }, [activeCards, loading, updateScrollState]);

  if (loading) {
    return (
      <section className="relative overflow-hidden bg-white pb-8 pt-14 text-slate-900">
        <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-10 px-8">
          <div className="space-y-6">
            <div className="h-6 w-64 animate-pulse bg-slate-200 rounded" />
            <div className="h-4 w-96 animate-pulse bg-slate-200 rounded" />
          </div>
          <div className="scrollbar-minimal flex gap-4 overflow-x-auto">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="group relative flex min-w-[320px] flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-lg"
              >
                <div className="h-48 w-full animate-pulse bg-slate-200" />
                <div className="p-4 space-y-3">
                  <div className="h-4 w-3/4 animate-pulse bg-slate-200 rounded" />
                  <div className="h-3 w-1/2 animate-pulse bg-slate-200 rounded" />
                  <div className="flex gap-2">
                    <div className="h-6 w-20 animate-pulse bg-slate-200 rounded-full" />
                    <div className="h-6 w-24 animate-pulse bg-slate-200 rounded-full" />
                  </div>
                  <div className="h-4 w-2/3 animate-pulse bg-slate-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden bg-white pb-8 pt-14 text-slate-900">
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute inset-0 tix-grid" />
      </div>
      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-10 px-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-3 text-xs uppercase tracking-[0.4em] text-slate-500">
              <BarChart3 className="size-4 text-emerald-500" />
              Live rails monitored
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold leading-tight text-slate-900 md:text-5xl">
                Featured, hot, and live shows pulsing across Kenya right now.
              </h1>
              <p className="max-w-3xl text-sm text-slate-600">
                Tap directly into MPesa-ready collections curated from organiser
                ops, resale telemetry, and waitlist pressure. Every card already
                packs compliance, add-ons, and shuttle logistics—just wire it
                into your campaign.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-[0_6px_20px_rgba(15,23,42,0.06)]"
                >
                  {analyticsLoading ? (
                    <div className="animate-pulse">
                      <div className="h-7 w-16 bg-slate-200 rounded mb-2"></div>
                      <div className="h-3 w-20 bg-slate-200 rounded mb-1"></div>
                      <div className="h-3 w-12 bg-slate-200 rounded"></div>
                    </div>
                  ) : (
                    <>
                      <p className="text-2xl font-semibold text-slate-900">
                        {stat.value}
                      </p>
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                        {stat.label}
                      </p>
                      <p className="text-xs text-emerald-500">{stat.detail}</p>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_12px_35px_rgba(15,23,42,0.08)]">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
              Spotlight presets
            </p>
            <div className="flex flex-wrap gap-3">
              {segmentConfigs.map((segment) => {
                const Icon = segment.icon;
                const isActive = segment.id === activeSegment;
                return (
                  <button
                    key={segment.id}
                    type="button"
                    onClick={() => setActiveSegment(segment.id)}
                    className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition ${
                      isActive
                        ? "border-slate-900 bg-slate-900 text-white shadow-lg"
                        : "border-slate-200 text-slate-500 hover:border-slate-400 hover:text-slate-900"
                    }`}
                  >
                    <Icon className="size-4" />
                    {isActive && segment.pulseColor ? (
                      <span className="relative flex items-center">
                        <span
                          className={`absolute inline-flex h-4 w-4 animate-ping rounded-full opacity-40 ${segment.pulseColor}`}
                          aria-hidden
                        />
                        <span
                          className={`relative inline-flex h-2 w-2 rounded-full ${segment.pulseColor}`}
                        />
                      </span>
                    ) : null}
                    {segment.label}
                  </button>
                );
              })}
            </div>
            <p className="text-sm text-slate-600">{activeConfig.subline}</p>
          </div>
        </div>

        <div className="relative">
          <div
            ref={railRef}
            className="scrollbar-minimal no-scrollbar flex gap-6 overflow-x-auto scroll-smooth rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_15px_55px_rgba(15,23,42,0.08)] snap-x snap-mandatory"
          >
            {activeCards.map((event, idx) => {
              const isPast = isEventPast(event);
              const status = getEventStatus(event);
              return (
                <Link
                  key={event.slug}
                  href={`/events/${event.slug}`}
                  className={`group relative w-80 shrink-0 snap-center overflow-hidden rounded-[28px] border border-slate-100 bg-gradient-to-b from-white to-slate-50 p-4 shadow-[0_12px_45px_rgba(15,23,42,0.12)] transition hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(15,23,42,0.16)] ${isPast ? "opacity-75" : ""}`}
                >
                  <div className="relative h-56 overflow-hidden rounded-2xl">
                    <Image
                      src={event.heroImage}
                      alt={event.title}
                      fill
                      sizes="320px"
                      className={`object-cover transition duration-500 ${isPast ? "grayscale" : "group-hover:scale-110"}`}
                      onError={(e) => {
                        // Fallback to placeholder if image fails to load
                        const target = e.target as HTMLImageElement;
                        if (
                          target.src &&
                          !target.src.includes("data:image/svg+xml")
                        ) {
                          target.src =
                            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='800' viewBox='0 0 1200 800'%3E%3Crect fill='%23f1f5f9' width='1200' height='800'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='system-ui, -apple-system, sans-serif' font-size='48' font-weight='600' fill='%2394a3b8'%3EEvent Image%3C/text%3E%3Ctext x='50%25' y='55%25' dominant-baseline='middle' text-anchor='middle' font-family='system-ui, -apple-system, sans-serif' font-size='24' fill='%23cbd5e1'%3EPlaceholder%3C/text%3E%3C/svg%3E";
                        }
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                    {isPast && (
                      <div className="absolute top-3 right-3 z-20">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${status.className} backdrop-blur-md shadow-lg`}
                        >
                          <Clock className="size-3" />
                          {status.label}
                        </span>
                      </div>
                    )}
                    {liveSegments.has(activeSegment) ? (
                      <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1 rounded-full bg-black px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white shadow-lg shadow-black/60">
                        <span className="relative flex h-3 w-3">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                          <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
                        </span>
                        <span>Live</span>
                        <div className="ml-2 flex items-end gap-0.5">
                          {[0, 1, 2].map((bar) => (
                            <span
                              key={`rail-live-bar-${bar}-${event.slug}`}
                              className="inline-block w-0.5 rounded-full bg-white"
                              style={{
                                height: `${6 + bar * 2}px`,
                                animation:
                                  "equalizerBar 0.9s ease-in-out infinite",
                                animationDelay: `${bar * 0.15}s`,
                                transformOrigin: "center bottom",
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    ) : null}
                    <div className="absolute inset-x-4 bottom-4 flex items-center justify-between text-xs uppercase tracking-[0.3em] text-white/80">
                      <span>{event.region}</span>
                      <span>
                        {activeConfig.label} • #
                        {(idx + 1).toString().padStart(2, "0")}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 space-y-3">
                    <h3 className="text-xl font-semibold text-slate-900">
                      {event.title}
                    </h3>
                    <p className="text-sm text-slate-600 line-clamp-3">
                      {event.summary}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                      <span className="flex items-center gap-1">
                        <CalendarDays className="size-4 text-slate-500" />
                        {event.dateCard || event.dateFull}
                      </span>
                      <span className="flex items-center gap-1">
                        <Ticket className="size-4 text-slate-500" />
                        {event.price}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {event.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-slate-200/80 bg-slate-50 px-3 py-1 text-xs text-slate-600"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="pt-2">
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-sm font-semibold ${isPast ? "text-slate-500" : "text-slate-900"}`}
                        >
                          {event.price}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide ${
                            isPast
                              ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                              : "bg-slate-900 text-white"
                          }`}
                        >
                          {isPast ? "Event Ended" : "Get tickets"}
                          {!isPast && <span aria-hidden>→</span>}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {shouldShowNavigation && (
            <div className="pointer-events-auto absolute left-4 top-1/2 hidden -translate-y-1/2 gap-3 lg:flex">
              <button
                type="button"
                aria-label="Scroll events left"
                onClick={() => scrollRail("left")}
                disabled={!canScrollLeft}
                className={`rounded-full border-2 border-slate-300 bg-white p-3 text-slate-900 transition-all shadow-lg hover:bg-slate-50 hover:border-slate-400 hover:shadow-xl ${
                  !canScrollLeft &&
                  "cursor-not-allowed opacity-50 bg-slate-100 border-slate-200 text-slate-400"
                }`}
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                type="button"
                aria-label="Scroll events right"
                onClick={() => scrollRail("right")}
                disabled={!canScrollRight}
                className={`rounded-full border-2 border-slate-300 bg-white p-3 text-slate-900 transition-all shadow-lg hover:bg-slate-50 hover:border-slate-400 hover:shadow-xl ${
                  !canScrollRight &&
                  "cursor-not-allowed opacity-50 bg-slate-100 border-slate-200 text-slate-400"
                }`}
              >
                <ChevronRight className="size-5" />
              </button>
            </div>
          )}
        </div>

        <div className="rounded-full border border-slate-200 bg-white px-4 py-3 text-xs text-slate-600 shadow-[0_6px_24px_rgba(15,23,42,0.06)]">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-sm font-semibold text-slate-900">
              <BarChart3 className="size-4 text-emerald-500" />
              Live telemetry
            </span>
            <div className="flex flex-1 gap-8 overflow-x-auto whitespace-nowrap scrollbar-minimal no-scrollbar">
              {tickerMessages.map((message) => (
                <span key={message} className="text-slate-500">
                  {message}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
