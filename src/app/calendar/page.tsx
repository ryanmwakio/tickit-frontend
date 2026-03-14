"use client";

import { useState, useMemo, useEffect, useTransition } from "react";
import Link from "next/link";
import { CalendarGrid } from "@/components/calendar/calendar-grid";
import { CalendarFilters } from "@/components/calendar/calendar-filters";
import { AddToCalendarButton } from "@/components/calendar/add-to-calendar-button";
import { fetchEvents, mapEventToEventContent } from "@/lib/events-api";
import type { EventContent } from "@/data/events";
import { EventGridSkeleton } from "@/components/ui/skeleton";

type EventsByMonth = Record<string, EventContent[]>;

function groupEventsByMonth(eventsList: EventContent[]): EventsByMonth {
  const groups: EventsByMonth = {};
  const sorted = [...eventsList].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
  );

  for (const event of sorted) {
    const monthKey = new Date(event.startDate).toLocaleString("en-KE", {
      month: "long",
      year: "numeric",
    });
    if (!groups[monthKey]) {
      groups[monthKey] = [];
    }
    groups[monthKey].push(event);
  }
  return groups;
}

function formatDateRange(start: string, end?: string) {
  const startDate = new Date(start);
  const base = startDate.toLocaleString("en-KE", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });

  if (!end) {
    return base;
  }

  const endDate = new Date(end);
  const endFormatted = endDate.toLocaleString("en-KE", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });

  return `${base} – ${endFormatted}`;
}

const INITIAL_EVENTS_LIMIT = 20;
const EVENTS_PER_LOAD = 20;

export default function CalendarPage() {
  const [events, setEvents] = useState<EventContent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<EventContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [filters, setFilters] = useState<{
    search?: string;
    category?: string;
    region?: string;
    dateFrom?: string;
    dateTo?: string;
  }>({});

  // Fetch events from API (debounced for search) - initial load
  useEffect(() => {
    let isCancelled = false;
    const timeoutId = setTimeout(async () => {
      setLoading(true);
      setPage(1);
      try {
        const params: any = {
          page: 1,
          limit: INITIAL_EVENTS_LIMIT,
          sortBy: "startsAt",
          sortOrder: "ASC",
        };

        // Only fetch future events for calendar
        const now = new Date();
        params.startsFrom = filters.dateFrom || now.toISOString();

        if (filters.search) params.search = filters.search;
        if (filters.category) params.category = filters.category;
        if (filters.region) params.city = filters.region;
        if (filters.dateTo) params.startsTo = filters.dateTo;

        const response = await fetchEvents(params);
        
        if (isCancelled) return;
        
        const mappedEvents = response.data.map(mapEventToEventContent);
        const totalPages = response.totalPages || Math.ceil((response.total || mappedEvents.length) / INITIAL_EVENTS_LIMIT);
        const hasMoreEvents = response.page < totalPages && (response.total === undefined || mappedEvents.length < response.total);
        
        // Use startTransition to prevent UI blocking
        startTransition(() => {
          setEvents(mappedEvents);
          setFilteredEvents(mappedEvents);
          setHasMore(hasMoreEvents);
          setTotal(response.total || mappedEvents.length);
          setPage(1);
        });
      } catch (error) {
        if (isCancelled) return;
        console.error("Failed to load events:", error);
        setEvents([]);
        setFilteredEvents([]);
        setHasMore(false);
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }, filters.search ? 500 : 0); // Debounce search queries

    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
    };
  }, [filters]);

  // Load more events
  const loadMoreEvents = async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const params: any = {
        page: nextPage,
        limit: EVENTS_PER_LOAD,
        sortBy: "startsAt",
        sortOrder: "ASC",
      };

      const now = new Date();
      params.startsFrom = filters.dateFrom || now.toISOString();

      if (filters.search) params.search = filters.search;
      if (filters.category) params.category = filters.category;
      if (filters.region) params.city = filters.region;
      if (filters.dateTo) params.startsTo = filters.dateTo;

      const response = await fetchEvents(params);
      const mappedEvents = response.data.map(mapEventToEventContent);
      const totalPages = response.totalPages || Math.ceil((response.total || 0) / EVENTS_PER_LOAD);
      const hasMoreEvents = response.page < totalPages && (response.total === undefined || (events.length + mappedEvents.length) < response.total);

      startTransition(() => {
        setEvents((prev) => [...prev, ...mappedEvents]);
        setFilteredEvents((prev) => [...prev, ...mappedEvents]);
        setHasMore(hasMoreEvents);
        setPage(nextPage);
      });
    } catch (error) {
      console.error("Failed to load more events:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  const groups = useMemo(() => groupEventsByMonth(filteredEvents), [filteredEvents]);
  const monthEntries = Object.entries(groups);

  return (
    <div className="bg-white text-slate-900">
      <section className="border-b border-slate-100 bg-gradient-to-b from-white to-slate-50">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
            Calendar
          </p>
          <h1 className="text-4xl font-semibold">
            Plan events, retreats, and festivals with a single Kenya-first
            calendar.
          </h1>
          <p className="text-lg text-slate-600">
            We map each event to MPesa-ready checkout, seat holds, shuttles,
            wellness add-ons, and compliance flows. Click into any card for full
            detail or share a public listing.
          </p>
          
          {/* Calendar Filters - Moved to top */}
          <div className="mt-6">
            <CalendarFilters 
              events={events} 
              filteredEvents={filteredEvents}
              onFilterChange={setFilteredEvents}
              onFiltersChange={setFilters}
            />
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-14">

        {loading || isPending ? (
          <div className="space-y-10">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="h-8 w-48 bg-slate-200 rounded animate-pulse" />
                <div className="h-6 w-20 bg-slate-200 rounded animate-pulse" />
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                {[...Array(4)].map((_, i) => (
                  <EventGridSkeleton key={i} />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-10">
              {monthEntries.map(([month, monthEvents]) => (
                <div key={month} className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h2 className="text-2xl font-semibold">{month}</h2>
                    <span className="text-sm text-slate-500">
                      {monthEvents.length} events
                    </span>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2">
                    {monthEvents.map((event) => (
                      <div
                        key={event.slug}
                        className="rounded-3xl border border-slate-100 bg-white p-6 shadow-lg shadow-slate-200/60 transition hover:-translate-y-1 hover:shadow-2xl"
                      >
                        <div className="flex flex-col gap-4">
                          <div>
                            <div className="text-xs uppercase tracking-[0.3em] text-slate-400">
                              {event.region}
                            </div>
                            <Link
                              href={`/events/${event.slug}`}
                              className="mt-1 block text-xl font-semibold text-slate-900 hover:underline"
                            >
                              {event.title}
                            </Link>
                            <p className="text-sm text-slate-500">{event.location}</p>
                            <p className="mt-3 text-sm font-medium text-slate-900">
                              {formatDateRange(event.startDate, event.endDate)}
                            </p>
                            <p className="text-sm text-slate-500">{event.price}</p>
                            <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-600">
                              {event.tags.slice(0, 4).map((tag) => (
                                <span
                                  key={tag}
                                  className="rounded-full border border-slate-200 px-3 py-1"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <AddToCalendarButton event={event} size="sm" />
                            <Link
                              href={`/events/${event.slug}`}
                              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                            >
                              View Details
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Load More Button */}
            {hasMore && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={loadMoreEvents}
                  disabled={loadingMore}
                  className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingMore ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Loading...
                    </>
                  ) : (
                    `Load More Events${total > 0 ? ` (${filteredEvents.length} of ${total})` : ''}`
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </section>

      <section className="mx-auto w-full max-w-7xl px-3 sm:px-4 lg:px-6 xl:px-8 pb-8 sm:pb-12 lg:pb-16 xl:pb-20">
        <div className="mb-4 sm:mb-6 flex flex-col gap-2 sm:gap-3">
          <p className="text-[10px] sm:text-xs uppercase tracking-[0.4em] text-slate-500">
            Visual calendar
          </p>
          <h2 className="text-xl sm:text-2xl font-semibold text-slate-900">
            Snapshot of upcoming events
          </h2>
          <p className="max-w-3xl text-xs sm:text-sm text-slate-600">
            Tap any date to inspect the organiser-ready events tied to that day—perfect for sponsors, media teams, and shuttles. Click on any event to add it to your calendar.
          </p>
        </div>
        {loading || isPending ? (
          <div className="h-[400px] sm:h-[500px] lg:h-[600px] bg-slate-50 rounded-2xl sm:rounded-3xl animate-pulse" />
        ) : (
          <div className="overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0">
            <CalendarGrid events={filteredEvents} />
          </div>
        )}
      </section>
    </div>
  );
}


