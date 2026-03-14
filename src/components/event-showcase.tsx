"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Clock } from "lucide-react";
import { EventContent } from "@/data/events";
import { fetchEvents, mapEventToEventContent } from "@/lib/events-api";
import {
  groupEventsByCategory,
  isEventPast,
  getEventStatus,
} from "@/lib/event-utils";

// Category mapping with emojis
const categoryEmojiMap: Record<string, string> = {
  Nightlife: "🎧",
  Wellness: "🧘",
  Corporate: "🏢",
  "Family & lifestyle": "👨‍👩‍👧",
  "Food & culture": "🍲",
  "Campus life": "🎓",
  "Community impact": "🤝",
  "Creator exclusives": "💡",
  "Weekend escapes": "🌅",
  "Afro house": "🎧",
  "Top picks": "✨",
};

export function EventShowcase() {
  const [events, setEvents] = useState<EventContent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEvents() {
      try {
        setLoading(true);
        // Fetch events for showcase - get published events
        const response = await fetchEvents({
          limit: 100,
          sortBy: "startsAt",
          sortOrder: "ASC",
        });
        // Handle both direct array response and paginated response
        const eventsArray = Array.isArray(response)
          ? response
          : response?.data || [];
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

  // Group events by category and only include categories that have events
  const groupedEvents = useMemo(() => {
    const grouped = groupEventsByCategory(events);
    // Only return categories that have at least one event
    return grouped.filter((group) => group.events.length > 0);
  }, [events]);

  // Get unique categories with their emojis for filter buttons
  const availableCategories = useMemo(() => {
    const categorySet = new Set<string>();
    events.forEach((event) => {
      event.categories.forEach((cat) => categorySet.add(cat));
    });

    return Array.from(categorySet)
      .map((category) => ({
        label: category,
        emoji: categoryEmojiMap[category] || "🎫",
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [events]);

  if (loading) {
    return (
      <section
        className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-14 lg:py-16 text-slate-900"
        id="events"
      >
        <div className="mb-6 flex flex-col gap-3 sm:gap-4">
          <div className="h-8 w-64 animate-pulse bg-slate-200 rounded" />
          <div className="h-4 w-96 animate-pulse bg-slate-200 rounded" />
        </div>
        <div className="scrollbar-minimal flex snap-x gap-3 overflow-x-auto rounded-2xl sm:rounded-3xl border border-slate-100 bg-white p-3 sm:p-4 mb-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-10 w-32 animate-pulse bg-slate-200 rounded-full flex-shrink-0"
            />
          ))}
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="group relative flex flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-lg"
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
      </section>
    );
  }
  return (
    <section
      className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-14 lg:py-16 text-slate-900"
      id="events"
    >
      <div className="mb-6 flex flex-col gap-3 sm:gap-4">
        <p className="text-[10px] sm:text-xs uppercase tracking-[0.4em] text-slate-500">
          Curated splash
        </p>
        <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold leading-tight">
          Events grouped by vibe, geography, and exclusive features from the
          manifesto.
        </h2>
        <p className="max-w-3xl text-sm sm:text-base lg:text-lg text-slate-600 leading-relaxed">
          Cards already consider promo codes, bundles, resale locks, waitlists,
          accessibility filters, MPesa-ready checkout, and offline resilience.
          Swap mock data for live APIs later.
        </p>
      </div>

      {availableCategories.length > 0 && (
        <div className="scrollbar-minimal flex snap-x gap-3 overflow-x-auto rounded-3xl border border-slate-100 bg-white/80 p-4 shadow-inner">
          {availableCategories.map((filter) => (
            <button
              key={filter.label}
              className="snap-start rounded-xl border border-slate-200/80 bg-white/90 px-4 py-2 text-sm text-slate-600 transition hover:-translate-y-0.5 hover:border-slate-400 hover:text-slate-900 whitespace-nowrap"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{filter.emoji}</span>
                <span>{filter.label}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      <div className="mt-10 space-y-12">
        {groupedEvents.map((group) => {
          const categoryEmoji = categoryEmojiMap[group.category] || "🎫";
          return (
            <article key={group.category} className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                    {group.events.length} event
                    {group.events.length !== 1 ? "s" : ""} available
                  </p>
                  <h3 className="text-2xl font-semibold flex items-center gap-2">
                    <span>{categoryEmoji}</span>
                    {group.category}
                  </h3>
                </div>
                <Link
                  href={`/events?category=${encodeURIComponent(group.category)}`}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-600 transition hover:border-slate-400"
                >
                  View all
                </Link>
              </div>
              {/* Mobile: Horizontal Scroll, Desktop: Grid */}
              <div className="lg:grid lg:grid-cols-4 lg:gap-6">
                {/* Mobile Horizontal Scroll */}
                <div className="scrollbar-minimal no-scrollbar flex gap-4 overflow-x-auto scroll-smooth rounded-[32px] border border-slate-200 bg-white p-3 sm:p-4 lg:p-6 shadow-[0_15px_55px_rgba(15,23,42,0.08)] snap-x snap-mandatory mx-0 lg:hidden">
                  {group.events.slice(0, 8).map((event) => {
                    const isPast = isEventPast(event);
                    return (
                      <Link
                        key={event.slug}
                        href={`/events/${event.slug}`}
                        className="group relative w-64 shrink-0 snap-center flex flex-col rounded-[28px] border border-slate-100 bg-gradient-to-b from-white to-slate-50 p-4 shadow-[0_12px_45px_rgba(15,23,42,0.12)] transition hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(15,23,42,0.16)] overflow-hidden"
                      >
                        <div className="relative h-40 overflow-hidden rounded-2xl">
                          <Image
                            src={event.heroImage}
                            alt={event.title}
                            fill
                            sizes="256px"
                            className="object-cover transition duration-500 group-hover:scale-110"
                          />
                        </div>
                        <div className="flex flex-col gap-2 mt-4">
                          <div className="text-xs uppercase tracking-[0.3em] text-slate-400 truncate">
                            {event.location}
                          </div>
                          <p className="text-sm font-semibold line-clamp-2 leading-tight">
                            {event.title}
                          </p>
                          <p className="text-xs text-slate-500">
                            {event.dateCard || event.dateFull}
                          </p>
                          {event.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 text-xs text-slate-600">
                              {event.tags.slice(0, 2).map((tag) => (
                                <span
                                  key={tag}
                                  className="rounded-full border border-slate-200 px-2 py-0.5"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                          <div className="mt-2 flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                            <span className="text-xs font-bold text-slate-900 truncate">
                              {event.price}
                            </span>
                            <span className="inline-flex items-center gap-0.5 rounded-full bg-slate-900 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                              Tickets
                              <span aria-hidden>→</span>
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {/* Desktop Grid */}
                <div className="hidden lg:contents">
                  {group.events.slice(0, 8).map((event) => {
                    const isPast = isEventPast(event);
                    const status = getEventStatus(event);
                    return (
                      <Link
                        key={event.slug}
                        href={`/events/${event.slug}`}
                        className={`rounded-3xl border border-slate-100 bg-white p-4 shadow-lg shadow-slate-200/50 transition hover:-translate-y-1 hover:shadow-2xl overflow-hidden ${isPast ? "opacity-75" : ""}`}
                      >
                        <div className="relative overflow-hidden rounded-2xl">
                          <Image
                            src={event.heroImage}
                            alt={event.title}
                            width={400}
                            height={280}
                            className={`h-40 w-full object-cover ${isPast ? "grayscale" : ""}`}
                          />
                          {isPast && (
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-slate-900/30 to-transparent" />
                          )}
                          {isPast && (
                            <div className="absolute top-3 right-3">
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${status.className} backdrop-blur-sm shadow-lg`}
                              >
                                <Clock className="size-3" />
                                {status.label}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="mt-3 text-xs uppercase tracking-[0.3em] text-slate-400">
                          {event.location}
                        </div>
                        <p className="mt-1 text-lg font-semibold line-clamp-2">
                          {event.title}
                        </p>
                        <p className="text-sm text-slate-500">
                          {event.dateCard || event.dateFull}
                        </p>
                        {event.tags.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
                            {event.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="rounded-full border border-slate-200 px-3 py-1"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="mt-4 flex items-center justify-between">
                          <span
                            className={`text-sm font-semibold ${isPast ? "text-slate-500" : "text-slate-900"}`}
                          >
                            {event.price}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wide ${
                              isPast
                                ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                                : "bg-slate-900 text-white"
                            }`}
                          >
                            {isPast ? "Event Ended" : "Get tickets"}
                            {!isPast && <span aria-hidden>→</span>}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
