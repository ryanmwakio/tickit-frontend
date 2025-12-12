"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Sparkles, Clock } from "lucide-react";
import { EventContent } from "@/data/events";
import { heroStats } from "@/data/content";
import { Input } from "@/components/ui/input";
import { fetchEvents, mapEventToEventContent } from "@/lib/events-api";
import { isEventPast, getEventStatus } from "@/lib/event-utils";

// Category mapping with emojis
const categoryEmojiMap: Record<string, string> = {
  "Nightlife": "🎧",
  "Wellness": "🧘",
  "Corporate": "🏢",
  "Family & lifestyle": "👨‍👩‍👧",
  "Food & culture": "🍲",
  "Campus life": "🎓",
  "Community impact": "🤝",
  "Creator exclusives": "💡",
  "Weekend escapes": "🌅",
  "Afro house": "🎧",
  "Top picks": "✨",
};

export function Hero() {
  const router = useRouter();
  const [events, setEvents] = useState<EventContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [livePulseActive, setLivePulseActive] = useState(false);
  const [searchResults, setSearchResults] = useState<EventContent[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Fetch events for hero section
  useEffect(() => {
    async function loadEvents() {
      try {
        setLoading(true);
        const response = await fetchEvents({
          limit: 20,
          sortBy: "startsAt",
          sortOrder: "ASC",
        });
        // Handle both direct array response and paginated response
        const eventsArray = Array.isArray(response) ? response : (response?.data || []);
        const mappedEvents = eventsArray.map(mapEventToEventContent);
        setEvents(mappedEvents);
      } catch (error) {
        console.error("Failed to load events:", error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    }
    loadEvents();
  }, []);

  // Fetch search results from API when query or category changes
  useEffect(() => {
    const searchQuery = query.trim();
    const hasSearch = searchQuery.length > 0 || activeCategory !== null;

    if (!hasSearch) {
      setSearchResults([]);
      return;
    }

    // Debounce search API calls
    const timeoutId = setTimeout(async () => {
      try {
        setSearchLoading(true);
        const params: {
          limit: number;
          sortBy: string;
          sortOrder: "ASC" | "DESC";
          search?: string;
          category?: string;
        } = {
          limit: 5,
          sortBy: "startsAt",
          sortOrder: "ASC",
        };

        if (searchQuery) {
          params.search = searchQuery;
        }
        if (activeCategory) {
          params.category = activeCategory;
        }

        const response = await fetchEvents(params);
        // Handle both direct array response and paginated response
        const eventsArray = Array.isArray(response) ? response : (response?.data || []);
        const mappedEvents = eventsArray.map(mapEventToEventContent);
        setSearchResults(mappedEvents);
      } catch (error) {
        console.error("Failed to search events:", error);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [query, activeCategory]);

  // Get first 3 events for hero display
  const heroEvents = useMemo(() => events.slice(0, 3), [events]);

  // Get unique categories from events
  const availableCategories = useMemo(() => {
    const categorySet = new Set<string>();
    events.forEach(event => {
      event.categories.forEach(cat => categorySet.add(cat));
    });
    return Array.from(categorySet).map(category => ({
      label: category,
      emoji: categoryEmojiMap[category] || "🎫",
    })).sort((a, b) => a.label.localeCompare(b.label));
  }, [events]);

  useEffect(() => {
    const styleId = "hero-live-pulse-styles";
    if (document.getElementById(styleId)) {
      return;
    }
    const style = document.createElement("style");
    style.id = styleId;
    style.innerHTML = `
      @keyframes pulseGlow {
        0% { opacity: 0.2; }
        50% { opacity: 0.6; }
        100% { opacity: 0.2; }
      }

      @keyframes liveCard {
        0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(248, 113, 113, 0.3); }
        55% { transform: scale(1.01); box-shadow: 0 0 0 8px rgba(248, 113, 113, 0); }
        100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(248, 113, 113, 0); }
      }

      @keyframes equalizerBar {
        0% { transform: scaleY(0.4); }
        50% { transform: scaleY(1); }
        100% { transform: scaleY(0.4); }
      }
    `;
    document.head.appendChild(style);
  }, []);


  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) {
      params.set("query", query.trim());
    }
    if (activeCategory) {
      params.set("category", activeCategory);
    }
    router.push(`/events?${params.toString()}`);
  };

  return (
    <section className="relative overflow-x-hidden bg-white pb-12 sm:pb-16 lg:pb-20 pt-4 sm:pt-6 text-slate-900">
      <div className="pointer-events-none absolute inset-0 opacity-60 overflow-hidden">
        <div className="absolute inset-0 tix-grid" />
      </div>
      <div className="relative mx-auto grid w-full max-w-7xl gap-6 sm:gap-8 lg:gap-12 lg:grid-cols-[1.1fr,0.9fr] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:gap-6 lg:gap-8 min-w-0">
          <div className="inline-flex w-full sm:w-fit items-center gap-1.5 sm:gap-2 rounded-full border border-slate-200 bg-white px-2.5 sm:px-3 lg:px-4 py-1 text-[9px] sm:text-[10px] lg:text-xs uppercase tracking-[0.25em] sm:tracking-[0.3em] text-slate-500 flex-wrap">
            <Sparkles className="size-3 sm:size-4 text-amber-400 shrink-0" />
            <span className="whitespace-nowrap text-[9px] sm:text-[10px] lg:text-xs">Events & ticketing suite</span>
            <button
              type="button"
              onClick={() => setLivePulseActive((prev) => !prev)}
              className={`ml-1 sm:ml-2 lg:ml-3 rounded-full border px-2 py-0.5 sm:px-2 lg:px-3 text-[9px] sm:text-[10px] lg:text-[11px] font-semibold uppercase tracking-[0.25em] sm:tracking-[0.3em] transition whitespace-nowrap shrink-0 ${
                livePulseActive
                  ? "border-red-500 text-red-500"
                  : "border-slate-200 text-slate-500"
              }`}
            >
              {livePulseActive ? "Live pulse on" : "Live pulse"}
            </button>
          </div>
          <h1 className="text-balance text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-semibold leading-tight break-words hyphens-auto">
            Splash into Kenya&apos;s most curated events — powered by MPesa-ready
            ticketing rails.
          </h1>
          <p className="w-full text-xs sm:text-sm md:text-base lg:text-lg text-slate-600 leading-relaxed break-words">
            Discover premium festivals, wellness retreats, conferences, creator
            pop-ups, and family experiences. Every card maps back to features in
            the 300-item blueprint, already wired for MPesa, waitlists, resale,
            and offline scanning once APIs land.
          </p>
          <form
            onSubmit={handleSearchSubmit}
            className="space-y-2.5 sm:space-y-3 rounded-xl sm:rounded-2xl border border-slate-200 bg-white p-2.5 sm:p-3 lg:p-4 shadow-lg shadow-slate-200/60 w-full max-w-full"
          >
            <div className="flex flex-col gap-2.5 sm:gap-3 md:flex-row">
              <div className="relative flex items-center md:flex-1">
                <Search className="absolute left-3 sm:left-4 size-3.5 sm:size-4 text-slate-400" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by city, organiser, vibe, tag..."
                  className="w-full rounded-xl bg-slate-50 pl-9 sm:pl-10 lg:pl-12 pr-3 sm:pr-4 py-2 sm:py-2.5 lg:py-3 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400"
                />
              </div>
              <button
                type="submit"
                className="rounded-xl bg-slate-900 px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5 lg:py-3 text-[10px] sm:text-xs lg:text-sm font-semibold text-white shadow-lg shadow-slate-400/40 whitespace-nowrap"
              >
                Search events
              </button>
            </div>
            {!loading && availableCategories.length > 0 && (
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {availableCategories.slice(0, 6).map((filter) => {
                  const isActive = activeCategory === filter.label;
                  return (
                    <button
                      type="button"
                      key={filter.label}
                      onClick={() =>
                        setActiveCategory(isActive ? null : filter.label)
                      }
                      className={`rounded-full border px-2 sm:px-2.5 lg:px-3 py-0.5 sm:py-1 text-[9px] sm:text-[10px] lg:text-xs whitespace-nowrap ${
                        isActive
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-slate-200 text-slate-600 hover:border-slate-400"
                      }`}
                    >
                      <span className="mr-1">{filter.emoji}</span> {filter.label}
                    </button>
                  );
                })}
              </div>
            )}
            {(query.trim() || activeCategory) && (
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                {searchLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid border-slate-900 border-r-transparent"></div>
                    <p className="ml-3 text-sm text-slate-600">Searching...</p>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="space-y-3">
                    {searchResults.map((result) => (
                      <Link
                        key={result.slug}
                        href={`/events/${result.slug}`}
                        className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-400"
                      >
                        <div>
                          <p className="font-semibold text-slate-900">
                            {result.title}
                          </p>
                          <p className="text-xs text-slate-500">
                            {result.location} • {result.dateCard || result.dateFull}
                          </p>
                        </div>
                        <span className="text-xs text-slate-500">
                          {result.price}
                        </span>
                      </Link>
                    ))}
                    <Link
                      href={`/events?query=${encodeURIComponent(
                        query.trim(),
                      )}${activeCategory ? `&category=${encodeURIComponent(activeCategory)}` : ""}`}
                      className="text-xs font-semibold text-slate-900 underline"
                    >
                      View all results →
                    </Link>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">
                    No events match your search. Try another keyword or
                    category.
                  </p>
                )}
              </div>
            )}
          </form>
          <div className="grid gap-2.5 sm:gap-3 lg:gap-4 grid-cols-1 sm:grid-cols-3">
            {heroStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl sm:rounded-2xl border border-slate-200 bg-linear-to-br from-white to-slate-50 p-2.5 sm:p-3 lg:p-4"
              >
                <p className="text-[9px] sm:text-[10px] lg:text-xs uppercase tracking-[0.25em] sm:tracking-[0.3em] text-slate-400 leading-tight">
                  {stat.label}
                </p>
                <p className="text-lg sm:text-xl lg:text-2xl font-semibold text-slate-900 mt-1 break-words">
                  {stat.value}
                </p>
                <p className="text-[10px] sm:text-xs lg:text-sm text-slate-500 mt-1 break-words">{stat.detail}</p>
              </div>
            ))}
          </div>
        </div>
        {/* Mobile: Horizontal Scroll, Desktop: Grid */}
        {loading ? (
          <div className="lg:grid lg:grid-cols-3 lg:gap-4 min-w-0">
            <div className="scrollbar-minimal no-scrollbar flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory rounded-[32px] border border-slate-200 bg-white p-3 sm:p-4 lg:p-6 shadow-[0_15px_55px_rgba(15,23,42,0.08)] lg:hidden">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="group relative flex min-w-[280px] flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-lg">
                  <div className="h-48 w-full animate-pulse bg-slate-200" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 w-3/4 animate-pulse bg-slate-200 rounded" />
                    <div className="h-3 w-1/2 animate-pulse bg-slate-200 rounded" />
                    <div className="h-4 w-2/3 animate-pulse bg-slate-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
            <div className="hidden lg:grid lg:grid-cols-3 lg:gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="group relative flex flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-lg">
                  <div className="h-64 w-full animate-pulse bg-slate-200" />
                  <div className="p-6 space-y-4">
                    <div className="h-5 w-3/4 animate-pulse bg-slate-200 rounded" />
                    <div className="h-4 w-1/2 animate-pulse bg-slate-200 rounded" />
                    <div className="h-4 w-2/3 animate-pulse bg-slate-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : heroEvents.length > 0 ? (
          <div className="lg:grid lg:grid-cols-3 lg:gap-4 min-w-0">
            {/* Mobile Horizontal Scroll */}
            <div className="scrollbar-minimal no-scrollbar flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory rounded-[32px] border border-slate-200 bg-white p-3 sm:p-4 lg:p-6 shadow-[0_15px_55px_rgba(15,23,42,0.08)] lg:hidden">
              {heroEvents.map((event) => {
                const isPast = isEventPast(event!);
                const status = getEventStatus(event!);
                return (
              <Link
                key={event!.slug}
                href={`/events/${event!.slug}`}
                className={`group relative w-72 shrink-0 snap-center flex flex-col rounded-[28px] border border-slate-100 bg-gradient-to-b from-white to-slate-50 p-4 shadow-[0_12px_45px_rgba(15,23,42,0.12)] transition hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(15,23,42,0.16)] overflow-hidden ${
                  livePulseActive ? "relative" : ""
                } ${isPast ? 'opacity-75' : ''}`}
              >
                {livePulseActive && !isPast ? (
                  <span className="absolute inset-0 animate-[pulseGlow_1.5s_ease-in-out_infinite] rounded-2xl border border-red-200/60 bg-gradient-to-br from-red-50/40 via-transparent to-transparent z-10" />
                ) : null}
                <div className="relative h-48 overflow-hidden rounded-2xl">
                  <Image
                    src={event!.heroImage}
                    alt={event!.title}
                    fill
                    sizes="288px"
                    className={`object-cover transition duration-500 ${
                      isPast 
                        ? 'grayscale' 
                        : livePulseActive
                        ? "animate-[liveCard_2s_ease-in-out_infinite] group-hover:scale-110"
                        : "group-hover:scale-110"
                    }`}
                  />
                  {isPast && (
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-slate-900/30 to-transparent" />
                  )}
                  {isPast ? (
                    <div className="absolute top-2 right-2 z-20">
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${status.className} backdrop-blur-sm shadow-lg`}>
                        <Clock className="size-3" />
                        {status.label}
                      </span>
                    </div>
                  ) : livePulseActive ? (
                    <div className="absolute bottom-2 left-2 z-20 flex items-center gap-1 rounded-full bg-black/70 px-2 sm:px-3 py-1 text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.2em] text-white shadow-lg shadow-black/40">
                      <span className="relative flex h-3 w-3">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                        <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
                      </span>
                      <span>Live</span>
                      <div className="ml-2 flex items-end gap-0.5">
                        {[0, 1, 2].map((bar) => (
                          <span
                            key={`hero-live-bar-${bar}`}
                            className="inline-block w-0.5 rounded-full bg-white"
                            style={{
                              height: `${6 + bar * 2}px`,
                              animation: "equalizerBar 0.9s ease-in-out infinite",
                              animationDelay: `${bar * 0.15}s`,
                              transformOrigin: "center bottom",
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
                <div className="flex flex-col gap-2 mt-4">
                  <div className="text-xs uppercase tracking-[0.3em] text-slate-400 truncate">
                    {event!.location}
                  </div>
                  <p className="text-sm sm:text-base font-semibold text-slate-900 line-clamp-2 leading-tight">
                    {event!.title}
                  </p>
                  <p className="text-xs text-slate-500">
                    {event!.dateCard || event!.dateFull} • {event!.price}
                  </p>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 text-xs text-slate-600">
                    {event!.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-slate-200 px-2 py-0.5"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
              );
            })}
          </div>
          
          {/* Desktop Grid */}
          <div className="hidden lg:contents">
            {heroEvents.map((event) => {
              const isPast = isEventPast(event!);
              const status = getEventStatus(event!);
              return (
              <Link
              key={event!.slug}
              href={`/events/${event!.slug}`}
              className={`rounded-3xl border border-slate-100 bg-white p-4 shadow-xl shadow-slate-200 transition hover:-translate-y-1 hover:shadow-2xl overflow-hidden ${
                livePulseActive && !isPast ? "relative" : ""
              } ${isPast ? 'opacity-75' : ''}`}
            >
              {livePulseActive && !isPast ? (
                <span className="absolute inset-0 animate-[pulseGlow_1.5s_ease-in-out_infinite] rounded-2xl sm:rounded-3xl border border-red-200/60 bg-gradient-to-br from-red-50/40 via-transparent to-transparent" />
              ) : null}
              <div className="relative overflow-hidden rounded-2xl">
              <Image
                src={event!.heroImage}
                alt={event!.title}
                width={420}
                height={300}
                  className={`h-28 sm:h-32 md:h-36 lg:h-40 w-full object-cover ${
                    isPast 
                      ? 'grayscale'
                      : livePulseActive
                      ? "animate-[liveCard_2s_ease-in-out_infinite]"
                      : ""
                  }`}
                />
                {isPast && (
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-slate-900/30 to-transparent" />
                )}
                {isPast ? (
                  <div className="absolute top-2 right-2">
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${status.className} backdrop-blur-sm shadow-lg`}>
                      <Clock className="size-3" />
                      {status.label}
                    </span>
                  </div>
                ) : livePulseActive ? (
                  <div className="absolute bottom-1.5 left-1.5 sm:bottom-2 sm:left-2 flex items-center gap-0.5 sm:gap-1 rounded-full bg-black/70 px-2 py-0.5 sm:px-3 sm:py-1 text-[8px] sm:text-[10px] font-semibold uppercase tracking-[0.2em] text-white shadow-lg shadow-black/40">
                    <span className="relative flex h-2 w-2 sm:h-3 sm:w-3">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 sm:h-3 sm:w-3 rounded-full bg-red-500" />
                    </span>
                    <span>Live</span>
                    <div className="ml-1 sm:ml-2 flex items-end gap-0.5">
                      {[0, 1, 2].map((bar) => (
                        <span
                          key={`eq-${bar}`}
                          className="inline-block w-0.5 rounded-full bg-white"
                          style={{
                            height: `${4 + bar * 1.5}px`,
                            animation: "equalizerBar 0.9s ease-in-out infinite",
                            animationDelay: `${bar * 0.15}s`,
                            transformOrigin: "center bottom",
                          }}
                        />
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
              <div className="mt-2 sm:mt-3 text-[10px] sm:text-xs uppercase tracking-[0.3em] text-slate-400">
                {event!.location}
              </div>
              <p className="mt-1 text-xs sm:text-sm lg:text-lg font-semibold text-slate-900 line-clamp-2">
                {event!.title}
              </p>
              <p className="text-[10px] sm:text-xs lg:text-sm text-slate-500">
                {event!.dateCard || event!.dateFull} • {event!.price}
              </p>
              <div className="mt-2 sm:mt-3 flex flex-wrap gap-1 sm:gap-2 text-[10px] sm:text-xs text-slate-600">
                {event!.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-slate-200 px-2 py-0.5 sm:px-3 sm:py-1"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              </Link>
              );
            })}
          </div>
        </div>
        ) : null}
      </div>
    </section>
  );
}

declare global {
  interface CSSStyleDeclaration {
    bleeding?: string;
  }
}



