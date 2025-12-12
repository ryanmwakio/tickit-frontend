"use client";

import { useEffect, useState, useMemo, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { EventsFilter } from "@/components/events/events-filter";
import { Pagination } from "@/components/events/pagination";
import { GroupedEventsList } from "@/components/events/grouped-events-list";
import { EventsGrid } from "@/components/events/events-grid";
import { fetchEvents, mapEventToEventContent, EventsListResponse, EventResponseDto } from "@/lib/events-api";
import { EventContent } from "@/data/events";
import { groupEventsByCategory } from "@/lib/event-utils";

const INITIAL_EVENTS_PER_CATEGORY = 9;
const EVENTS_PER_LOAD = 9;

export default function EventsPage() {
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(true);
  const [eventsData, setEventsData] = useState<EventsListResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Track loaded events per category
  const [categoryEvents, setCategoryEvents] = useState<Record<string, EventContent[]>>({});
  const [categoryTotals, setCategoryTotals] = useState<Record<string, number>>({});
  const [categoryPages, setCategoryPages] = useState<Record<string, number>>({});
  const [loadingCategories, setLoadingCategories] = useState<Set<string>>(new Set());

  const query = searchParams.get("query") || undefined;
  const category = searchParams.get("category") || undefined;
  const region = searchParams.get("region") || undefined;
  const dateFrom = searchParams.get("dateFrom") || undefined;
  const dateTo = searchParams.get("dateTo") || undefined;
  const priceMin = searchParams.get("priceMin") || undefined;
  const priceMax = searchParams.get("priceMax") || undefined;
  const sortBy = searchParams.get("sortBy") || "date";
  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const itemsPerPage = 12;

  // Map sortBy to API sortBy
  const apiSortBy = sortBy === "date" ? "startsAt" : sortBy === "title" ? "title" : "startsAt";
  const apiSortOrder = sortBy === "price-high" ? "DESC" : "ASC";

  // Fetch all categories first to know which categories exist
  useEffect(() => {
    async function loadCategories() {
      setLoading(true);
      try {
        // Fetch multiple pages (max 100 per page) to discover all categories
        const allEvents: EventContent[] = [];
        const categorySet = new Set<string>();
        let page = 1;
        let hasMore = true;
        const maxPages = 5; // Limit to 5 pages (500 events max) to avoid too many requests
        
        while (hasMore && page <= maxPages) {
          try {
            const response = await fetchEvents({
              limit: 100, // Maximum allowed by API
              page: page,
              sortBy: "startsAt",
              sortOrder: "ASC",
            });
            
            const eventsArray = Array.isArray(response) ? response : (response?.data || []);
            const mappedEvents = eventsArray.map(mapEventToEventContent);
            allEvents.push(...mappedEvents);
            
            // Collect unique categories
            mappedEvents.forEach(event => {
              event.categories.forEach(cat => categorySet.add(cat));
            });
            
            // Check if there are more pages
            if (Array.isArray(response)) {
              hasMore = eventsArray.length === 100; // If we got 100, there might be more
            } else {
              const total = response?.total || 0;
              const currentTotal = allEvents.length;
              hasMore = currentTotal < total && eventsArray.length === 100;
            }
            
            page++;
          } catch (err) {
            console.error(`Failed to load events page ${page}:`, err);
            hasMore = false;
          }
        }
        
        // Get unique categories
        const categories = Array.from(categorySet).sort();
        
        // Fetch 9 events per category initially
        const initialCategoryEvents: Record<string, EventContent[]> = {};
        const initialCategoryTotals: Record<string, number> = {};
        const initialCategoryPages: Record<string, number> = {};
        
        await Promise.all(
          categories.map(async (cat) => {
            try {
              const catResponse = await fetchEvents({
                category: cat,
                limit: INITIAL_EVENTS_PER_CATEGORY,
                page: 1,
                sortBy: "startsAt",
                sortOrder: "ASC",
              });
              
              const catEventsArray = Array.isArray(catResponse) ? catResponse : (catResponse?.data || []);
              const catMappedEvents = catEventsArray.map(mapEventToEventContent);
              
              initialCategoryEvents[cat] = catMappedEvents;
              
              // Get total from API response - always use the actual total from API if available
              if (Array.isArray(catResponse)) {
                // If response is an array, we don't know the total
                // Use heuristic: if we got exactly INITIAL_EVENTS_PER_CATEGORY, there might be more
                initialCategoryTotals[cat] = catMappedEvents.length === INITIAL_EVENTS_PER_CATEGORY 
                  ? catMappedEvents.length + 1 // Set to length + 1 to indicate there might be more
                  : catMappedEvents.length;
              } else {
                // Use the total from the API response - this is the actual total count
                const total = catResponse?.total;
                if (total !== undefined && total !== null && total > 0) {
                  // Use the actual total from API
                  initialCategoryTotals[cat] = total;
                } else {
                  // If total is not available from API, use heuristic
                  initialCategoryTotals[cat] = catMappedEvents.length === INITIAL_EVENTS_PER_CATEGORY
                    ? catMappedEvents.length + 1 // Set to length + 1 to indicate there might be more
                    : catMappedEvents.length;
                }
              }
              initialCategoryPages[cat] = 1;
            } catch (err) {
              console.error(`Failed to load events for category ${cat}:`, err);
              initialCategoryEvents[cat] = [];
              initialCategoryTotals[cat] = 0;
              initialCategoryPages[cat] = 1;
            }
          })
        );
        
        setCategoryEvents(initialCategoryEvents);
        setCategoryTotals(initialCategoryTotals);
        setCategoryPages(initialCategoryPages);
      } catch (err) {
        console.error("Failed to load categories:", err);
        setError("Failed to load events");
      } finally {
        setLoading(false);
      }
    }
    
    // Only load categories when no filters are active
    const hasActiveFilters = query || category || region || dateFrom || dateTo || priceMin || priceMax;
    if (!hasActiveFilters) {
      loadCategories();
    } else {
      setLoading(false);
    }
  }, [query, category, region, dateFrom, dateTo, priceMin, priceMax]); // Re-run when filters change

  useEffect(() => {
    // Debounce search queries to prevent flickering
    const timeoutId = setTimeout(async () => {
      async function loadEvents() {
        // Don't set loading to true if we already have data - prevents layout shifts
        // Only show loading on initial filter application
        const isInitialLoad = !eventsData;
        if (isInitialLoad) {
          setLoading(true);
        }
        setError(null);
        try {
          const params: {
            page: number;
            limit: number;
            sortBy: string;
            sortOrder: "ASC" | "DESC";
            search?: string;
            category?: string;
            city?: string;
            startsFrom?: string;
            startsTo?: string;
          } = {
            page: currentPage,
            limit: itemsPerPage,
            sortBy: apiSortBy,
            sortOrder: apiSortOrder,
          };

          if (query) params.search = query;
          if (category) params.category = category;
          if (region) params.city = region;
          if (dateFrom) params.startsFrom = dateFrom;
          if (dateTo) params.startsTo = dateTo;
          // Note: Price filtering would need to be done client-side or via a different API endpoint
          // For now, we'll fetch all and filter client-side if needed

          const response = await fetchEvents(params);
          // Use startTransition to prevent layout shifts during state updates
          startTransition(() => {
            setEventsData(response);
            setLoading(false);
          });
        } catch (err: unknown) {
          console.error("Failed to fetch events:", err);
          const errorMessage = err instanceof Error ? err.message : "Failed to load events";
          startTransition(() => {
            setError(errorMessage);
            setLoading(false);
          });
        }
      }

      // Only load events if there are active filters
      const hasActiveFilters = query || category || region || dateFrom || dateTo || priceMin || priceMax;
      if (hasActiveFilters) {
        loadEvents();
      }
    }, query ? 500 : 0); // Debounce only for search queries, immediate for other filters

    return () => clearTimeout(timeoutId);
  }, [query, category, region, dateFrom, dateTo, sortBy, currentPage, apiSortBy, apiSortOrder, itemsPerPage]);

  const hasActiveFilters =
    query ||
    category ||
    region ||
    dateFrom ||
    dateTo ||
    priceMin ||
    priceMax;

  // Only show full-page loading on initial load (no filters and no category events)
  // Otherwise, show inline loading states to prevent layout shifts
  const isInitialLoad = !hasActiveFilters && Object.keys(categoryEvents).length === 0 && !error;
  const showFullPageLoading = isInitialLoad && loading && !isPending;

  if (showFullPageLoading) {
    return (
      <div className="bg-white min-h-screen">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <EventsFilter />
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="group relative flex flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-lg">
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
      </div>
    );
  }

  // Handle different response formats for filtered events
  let eventsArray: EventResponseDto[] = [];
  let total = 0;
  let totalPages = 1;
  let page = 1;
  let limit = itemsPerPage;

  if (hasActiveFilters && eventsData) {
    if (Array.isArray(eventsData)) {
      eventsArray = eventsData;
      total = eventsArray.length;
      totalPages = Math.ceil(total / limit);
    } else if (eventsData.data && Array.isArray(eventsData.data)) {
      eventsArray = eventsData.data;
      total = eventsData.total ?? eventsArray.length;
      totalPages = eventsData.totalPages ?? Math.ceil(total / limit);
      page = eventsData.page ?? page;
      limit = eventsData.limit ?? limit;
    } else {
      console.error("Unexpected events data format:", eventsData);
      eventsArray = [];
    }
  }

  // Map API events to EventContent format
  const mappedEvents: EventContent[] = eventsArray.map(mapEventToEventContent);

  // Apply price filtering client-side if needed
  let filteredEvents = mappedEvents;
  if (priceMin || priceMax) {
    filteredEvents = mappedEvents.filter((event) => {
      const priceMatch = event.price.match(/[\d,]+/);
      if (!priceMatch) return false;
      const price = parseInt(priceMatch[0].replace(/,/g, ""), 10);
      if (priceMin && price < parseInt(priceMin, 10)) return false;
      if (priceMax && price > parseInt(priceMax, 10)) return false;
      return true;
    });
  }

  // Load more events for a specific category
  const loadMoreCategoryEvents = async (categoryName: string) => {
    if (loadingCategories.has(categoryName)) return;
    
    setLoadingCategories(prev => new Set(prev).add(categoryName));
    
    try {
      const currentPage = categoryPages[categoryName] || 1;
      const nextPage = currentPage + 1;
      
      // Fetch next batch of events for this category
      const response = await fetchEvents({
        category: categoryName,
        limit: EVENTS_PER_LOAD,
        page: nextPage,
        sortBy: "startsAt",
        sortOrder: "ASC",
      });
      
      const newEventsArray = Array.isArray(response) ? response : (response?.data || []);
      const newMappedEvents = newEventsArray.map(mapEventToEventContent);
      
      // Calculate the new count after appending events
      const newEventsCount = newMappedEvents.length;
      const currentEvents = categoryEvents[categoryName] || [];
      const updatedEventsCount = currentEvents.length + newEventsCount;
      
      // Append new events to existing ones for THIS category only
      setCategoryEvents(prev => ({
        ...prev,
        [categoryName]: [...currentEvents, ...newMappedEvents],
      }));
      
      setCategoryPages(prev => ({
        ...prev,
        [categoryName]: nextPage,
      }));
      
      // Update total for THIS category only based on what we got
      if (!Array.isArray(response) && response?.total !== undefined && response?.total !== null) {
        // Use the total from API response for this category
        setCategoryTotals(prev => ({
          ...prev,
          [categoryName]: response.total,
        }));
      } else {
        // If total is not available from API, update based on what we got for this category
        if (newEventsCount === EVENTS_PER_LOAD) {
          // We got a full page, there might be more for this category
          // Set total to updated count + 1 (to indicate there might be more)
          setCategoryTotals(prev => ({
            ...prev,
            [categoryName]: updatedEventsCount + 1,
          }));
        } else {
          // We got less than EVENTS_PER_LOAD, so this is all of them for this category
          // Set total to the actual count of loaded events for this category
          setCategoryTotals(prev => ({
            ...prev,
            [categoryName]: updatedEventsCount,
          }));
        }
      }
    } catch (err) {
      console.error(`Failed to load more events for category ${categoryName}:`, err);
    } finally {
      setLoadingCategories(prev => {
        const next = new Set(prev);
        next.delete(categoryName);
        return next;
      });
    }
  };

  // Group events by category when no category filter is active and no search
  const shouldGroupByCategory = !hasActiveFilters && !category;
  let groupedEvents: {
    category: string;
    events: EventContent[];
    totalCount: number;
    hasMore: boolean;
    onLoadMore: () => void;
    isLoadingMore: boolean;
  }[] = [];
  let paginatedEvents: typeof filteredEvents = [];

  if (shouldGroupByCategory) {
    // Use category events loaded per category
    groupedEvents = Object.entries(categoryEvents).map(([cat, events]) => {
      const total = categoryTotals[cat] || events.length;
      
      // Determine if there are more events for THIS specific category:
      // Show "Load more" if:
      // 1. Total from API > loaded events, OR
      // 2. We got exactly 9 events (or multiple of 9), OR
      // 3. Total is our heuristic (events.length + 1)
      // Hide "Load more" only when total === events.length AND we got less than 9 in the last load
      let hasMore = false;
      
      // Always show if we got exactly 9 or a multiple of 9 (full page)
      if (events.length === INITIAL_EVENTS_PER_CATEGORY || events.length % EVENTS_PER_LOAD === 0) {
        hasMore = true;
      }
      // Or if total is greater than loaded
      else if (total > events.length) {
        hasMore = true;
      }
      // Or if total is our heuristic
      else if (total === events.length + 1) {
        hasMore = true;
      }
      // Otherwise, check if total equals loaded (all loaded)
      else if (total === events.length && events.length < INITIAL_EVENTS_PER_CATEGORY) {
        // We got less than 9 and total equals loaded, all events are loaded
        hasMore = false;
      }
      // Default: if we have events and total doesn't match, assume there might be more
      else if (events.length > 0) {
        // Conservative: if we have events but aren't sure, show the button
        // It will be hidden when we confirm all are loaded
        hasMore = true;
      }
      
      // For display, show the actual total from API if we have it
      // If total is a heuristic (events.length + 1), we don't know the real total yet
      // So show the loaded count with a "+" or just the loaded count
      // But if we have a real total from API, use that
      let displayTotal = total;
      
      // If total is our heuristic (events.length + 1), we don't know the real total yet
      // Show the loaded count for now, it will update when we get the real total from API
      if (total === events.length + 1 && events.length > 0) {
        // This is a heuristic, show loaded count
        displayTotal = events.length;
      } else if (total > events.length) {
        // We have a real total from API that's greater than loaded
        displayTotal = total;
      } else if (total === events.length) {
        // Total equals loaded, show the actual total
        displayTotal = total;
      } else {
        // Fallback to loaded count
        displayTotal = events.length;
      }
      
      return {
        category: cat,
        events: events,
        totalCount: displayTotal,
        hasMore,
        onLoadMore: () => loadMoreCategoryEvents(cat),
        isLoadingMore: loadingCategories.has(cat),
      };
    }).sort((a, b) => a.category.localeCompare(b.category));
  } else {
    // Use paginated events from API
    paginatedEvents = filteredEvents;
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Fixed header section - doesn't change during filtering */}
      <section className="border-b border-slate-100 bg-linear-to-b from-white to-slate-50 relative">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          <div className="hidden lg:block">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
              Marketplace
            </p>
            <h1 className="mt-3 text-4xl font-semibold text-slate-900">
              All events plugged into MPesa-ready ticketing, offline ops, and
              resale guardrails.
            </h1>
            <p className="mt-3 max-w-3xl text-lg text-slate-600">
              Every showcase below already considers promo codes, waitlists,
              AR/AI features, seat maps, accessibility, and compliance handles
              pulled from the features blueprint.
            </p>
          </div>
          <EventsFilter />
        </div>
      </section>

      {/* Event cards section - only this area updates during filtering */}
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-14 min-h-[400px]">
        {hasActiveFilters && (
          <p className="mb-6 text-sm text-slate-500">
            Showing {filteredEvents.length} event(s)
            {query && (
              <>
                {" "}
                matching <span className="font-semibold">&quot;{query}&quot;</span>
              </>
            )}
            {category && (
              <>
                {" "}
                in <span className="font-semibold">{category}</span>
              </>
            )}
            {region && (
              <>
                {" "}
                at <span className="font-semibold">{region}</span>
              </>
            )}
          </p>
        )}
        {/* Show inline loading state only for the event cards area */}
        {hasActiveFilters && loading && !isPending ? (
          <div className="lg:grid lg:grid-cols-3 lg:gap-8">
            <div className="scrollbar-minimal no-scrollbar flex gap-4 overflow-x-auto scroll-smooth rounded-[32px] border border-slate-200 bg-white p-3 sm:p-4 lg:p-6 shadow-[0_15px_55px_rgba(15,23,42,0.08)] snap-x snap-mandatory mx-0 lg:hidden">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="w-72 shrink-0 snap-center flex flex-col rounded-[28px] border border-slate-100 bg-gradient-to-b from-white to-slate-50 p-4 shadow-[0_12px_45px_rgba(15,23,42,0.12)]">
                  <div className="h-48 w-full animate-pulse bg-slate-200 rounded-2xl" />
                  <div className="mt-4 space-y-2">
                    <div className="h-4 w-3/4 animate-pulse bg-slate-200 rounded" />
                    <div className="h-3 w-1/2 animate-pulse bg-slate-200 rounded" />
                    <div className="h-3 w-2/3 animate-pulse bg-slate-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
            <div className="hidden lg:contents">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex flex-col rounded-3xl border border-slate-100 bg-white shadow-xl shadow-slate-200/60">
                  <div className="h-48 w-full animate-pulse bg-slate-200" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 w-3/4 animate-pulse bg-slate-200 rounded" />
                    <div className="h-3 w-1/2 animate-pulse bg-slate-200 rounded" />
                    <div className="h-3 w-2/3 animate-pulse bg-slate-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : shouldGroupByCategory && groupedEvents.length > 0 ? (
          <GroupedEventsList groupedEvents={groupedEvents} />
        ) : filteredEvents.length === 0 && !loading ? (
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-12 text-center">
            <p className="text-lg font-semibold text-slate-900">No events found</p>
            <p className="mt-2 text-sm text-slate-600">
              Try adjusting your filters to see more results.
            </p>
          </div>
        ) : (
          <EventsGrid events={paginatedEvents} />
        )}

        {/* Pagination - only show for filtered views, not for grouped view */}
        {!shouldGroupByCategory && total > itemsPerPage && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={total}
            itemsPerPage={itemsPerPage}
          />
        )}
      </section>
    </div>
  );
}


