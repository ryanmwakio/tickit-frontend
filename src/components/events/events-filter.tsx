"use client";

import { useEffect, useState, useTransition } from "react";
import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Filter, X, Calendar, MapPin, DollarSign, SortAsc } from "lucide-react";
import { fetchEvents, mapEventToEventContent, EventResponseDto } from "@/lib/events-api";
import { getAllUniqueRegions } from "@/lib/event-utils";
import { EventContent } from "@/data/events";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";

type FilterState = {
  query: string;
  category: string | null;
  region: string | null;
  dateFrom: string | null;
  dateTo: string | null;
  priceMin: string | null;
  priceMax: string | null;
  sortBy: "date" | "price-low" | "price-high" | "title";
};

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

const sortOptions = [
  { value: "date", label: "Date (Earliest)" },
  { value: "price-low", label: "Price (Low to High)" },
  { value: "price-high", label: "Price (High to Low)" },
  { value: "title", label: "Title (A-Z)" },
];

export function EventsFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  // Use a ref to preserve filter panel state across URL changes
  const showFiltersRef = React.useRef(false);
  // Persist filter panel state in sessionStorage to survive URL changes
  const [showFilters, setShowFilters] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('events-filter-panel-open');
      return saved === 'true';
    }
    return false;
  });
  const [events, setEvents] = useState<EventContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [localState, setLocalState] = useState<FilterState>({
    query: searchParams.get("query") || "",
    category: searchParams.get("category") || null,
    region: searchParams.get("region") || null,
    dateFrom: searchParams.get("dateFrom") || null,
    dateTo: searchParams.get("dateTo") || null,
    priceMin: searchParams.get("priceMin") || null,
    priceMax: searchParams.get("priceMax") || null,
    sortBy: (searchParams.get("sortBy") as FilterState["sortBy"]) || "date",
  });

  // Sync ref and sessionStorage with state to preserve across URL changes
  React.useEffect(() => {
    showFiltersRef.current = showFilters;
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('events-filter-panel-open', showFilters.toString());
    }
  }, [showFilters]);

  // Fetch events to get available categories and regions
  useEffect(() => {
    async function loadEvents() {
      try {
        setLoading(true);
        const response = await fetchEvents({
          limit: 100,
          sortBy: "startsAt",
          sortOrder: "ASC",
        });
        
        // Handle different response formats
        let eventsArray: EventResponseDto[] = [];
        if (Array.isArray(response)) {
          eventsArray = response;
        } else if (response && response.data && Array.isArray(response.data)) {
          eventsArray = response.data;
        } else {
          console.error("Unexpected events data format in filter:", response);
          eventsArray = [];
        }
        
        const mappedEvents = eventsArray.map(mapEventToEventContent);
        setEvents(mappedEvents);
      } catch (error) {
        console.error("Failed to load events for filters:", error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    }
    loadEvents();
  }, []);

  // Get unique categories from events
  const availableCategories = Array.from(
    new Set(events.flatMap(event => event.categories))
  ).map(category => ({
    label: category,
    emoji: categoryEmojiMap[category] || "🎫",
  })).sort((a, b) => a.label.localeCompare(b.label));

  // Get unique regions from events
  const regions = ["All Locations", ...getAllUniqueRegions(events)];

  // Debounce timer for search
  const searchDebounceRef = React.useRef<NodeJS.Timeout | null>(null);
  // Debounce timer for date filters
  const dateDebounceRef = React.useRef<NodeJS.Timeout | null>(null);

  const updateFilters = (updates: Partial<FilterState>, immediate = false) => {
    const newState = { ...localState, ...updates };
    setLocalState(newState);
    
    // Keep filter panel open when updating filters
    // Only close if user explicitly clicks the filter button
    if (!showFilters && (updates.category || updates.region || updates.dateFrom || updates.dateTo || updates.priceMin || updates.priceMax)) {
      // Auto-open filter panel if a filter is being applied and panel is closed
      setShowFilters(true);
      showFiltersRef.current = true;
    }
    
    // For search queries, debounce the URL update
    if ('query' in updates && !immediate) {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
      searchDebounceRef.current = setTimeout(() => {
        updateURL(newState);
      }, 500); // 500ms debounce for search
      return;
    }
    
    // For date filters, debounce slightly to keep panel open
    if (('dateFrom' in updates || 'dateTo' in updates) && !immediate) {
      if (dateDebounceRef.current) {
        clearTimeout(dateDebounceRef.current);
      }
      dateDebounceRef.current = setTimeout(() => {
        updateURL(newState);
      }, 300); // 300ms debounce for dates
      return;
    }
    
    // For other filters, update immediately
    updateURL(newState);
  };

  const updateURL = (state: FilterState) => {
    const params = new URLSearchParams();
    
    if (state.query) params.set("query", state.query);
    if (state.category) params.set("category", state.category);
    if (state.region && state.region !== "All Locations") params.set("region", state.region);
    if (state.dateFrom) params.set("dateFrom", state.dateFrom);
    if (state.dateTo) params.set("dateTo", state.dateTo);
    if (state.priceMin) params.set("priceMin", state.priceMin);
    if (state.priceMax) params.set("priceMax", state.priceMax);
    if (state.sortBy && state.sortBy !== "date") params.set("sortBy", state.sortBy);

    // Use startTransition to mark URL updates as non-urgent, preventing layout shifts
    startTransition(() => {
      router.replace(`/events?${params.toString()}`, { scroll: false });
    });
  };

  // Cleanup debounce timers on unmount
  React.useEffect(() => {
    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
      if (dateDebounceRef.current) {
        clearTimeout(dateDebounceRef.current);
      }
    };
  }, []);

  const clearFilters = () => {
    setLocalState({
      query: "",
      category: null,
      region: null,
      dateFrom: null,
      dateTo: null,
      priceMin: null,
      priceMax: null,
      sortBy: "date",
    });
    router.push("/events", { scroll: false });
  };

  const hasActiveFilters = 
    localState.query ||
    localState.category ||
    (localState.region && localState.region !== "All Locations") ||
    localState.dateFrom ||
    localState.dateTo ||
    localState.priceMin ||
    localState.priceMax ||
    localState.sortBy !== "date";

  return (
    <div className="space-y-4 lg:space-y-4">
      {/* Search Bar - Sticky on Mobile */}
      <div className="sticky top-[72px] z-30 left-0 right-0 px-4 sm:px-6 lg:px-0 py-3 bg-white/95 backdrop-blur-sm border-b border-slate-100 shadow-sm lg:relative lg:py-0 lg:border-b-0 lg:bg-transparent lg:backdrop-blur-none lg:shadow-none lg:z-auto lg:left-auto lg:right-auto lg:top-auto">
        <div className="relative max-w-7xl mx-auto lg:mx-0 lg:max-w-none">
          <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400 z-10" />
          <Input
            type="text"
            placeholder="Search events by name, location, or tags..."
            value={localState.query}
            onChange={(e) => {
              // Update local state immediately for smooth UI
              const newQuery = e.target.value;
              setLocalState(prev => ({ ...prev, query: newQuery }));
              // Debounce the URL update and API call
              updateFilters({ query: newQuery }, false);
            }}
            className="w-full rounded-xl pl-12 pr-12 py-3"
          />
          {localState.query && (
            <button
              onClick={() => updateFilters({ query: "" })}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 z-10"
            >
              <X className="size-5" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Toggle & Sort - Sticky on Mobile */}
      <div className="sticky top-[136px] z-20 left-0 right-0 px-4 sm:px-6 lg:px-0 py-3 bg-white/95 backdrop-blur-sm border-b border-slate-100 shadow-sm lg:relative lg:py-0 lg:border-b-0 lg:bg-transparent lg:backdrop-blur-none lg:shadow-none lg:z-auto lg:top-auto lg:left-auto lg:right-auto">
        <div className="max-w-7xl mx-auto lg:mx-0 lg:max-w-none flex flex-wrap items-center gap-3">
          <button
          onClick={() => {
            const newState = !showFilters;
            showFiltersRef.current = newState;
            setShowFilters(newState);
            // Persist to sessionStorage
            if (typeof window !== 'undefined') {
              sessionStorage.setItem('events-filter-panel-open', newState.toString());
            }
          }}
          className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition ${
            showFilters || hasActiveFilters
              ? "border-slate-900 bg-slate-900 text-white"
              : "border-slate-200 text-slate-600 hover:border-slate-400 hover:text-slate-900"
          }`}
        >
          <Filter className="size-4" />
          Filters
          {hasActiveFilters && (
            <span className="ml-1 rounded-full bg-white/20 px-2 py-0.5 text-xs">
              Active
            </span>
          )}
        </button>

        <div className="flex items-center gap-2">
          <SortAsc className="size-4 text-slate-400" />
          <Select
            value={localState.sortBy}
            onValueChange={(value) => updateFilters({ sortBy: value as FilterState["sortBy"] })}
          >
            <SelectTrigger className="w-[200px] rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="ml-auto lg:ml-auto flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-400 hover:text-slate-900"
          >
            <X className="size-4" />
            Clear all
          </button>
        )}
        </div>
      </div>

      {/* Category Filters - Sticky on Mobile */}
      {loading ? (
        <div className="sticky top-[200px] z-10 left-0 right-0 px-4 sm:px-6 lg:px-0 py-3 bg-white/95 backdrop-blur-sm border-b border-slate-100 shadow-sm lg:relative lg:py-0 lg:border-b-0 lg:bg-transparent lg:backdrop-blur-none lg:shadow-none lg:z-auto lg:top-auto lg:left-auto lg:right-auto">
          <div className="max-w-7xl mx-auto lg:mx-0 lg:max-w-none">
            <div className="scrollbar-minimal flex snap-x gap-3 overflow-x-auto rounded-2xl sm:rounded-3xl border border-slate-100 bg-white p-3 sm:p-4 shadow-inner">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-10 w-32 animate-pulse bg-slate-200 rounded-full flex-shrink-0" />
              ))}
            </div>
          </div>
        </div>
      ) : availableCategories.length > 0 && (
        <div className="sticky top-[200px] z-10 left-0 right-0 px-4 sm:px-6 lg:px-0 py-3 bg-white/95 backdrop-blur-sm border-b border-slate-100 shadow-sm lg:relative lg:py-0 lg:border-b-0 lg:bg-transparent lg:backdrop-blur-none lg:shadow-none lg:z-auto lg:top-auto lg:left-auto lg:right-auto">
          <div className="max-w-7xl mx-auto lg:mx-0 lg:max-w-none">
            <div className="scrollbar-minimal flex snap-x gap-3 overflow-x-auto rounded-2xl sm:rounded-3xl border border-slate-100 bg-white p-3 sm:p-4 shadow-inner">
              {availableCategories.map((filter) => {
                const isActive = localState.category === filter.label;
                return (
                  <button
                    key={filter.label}
                    onClick={() => {
                      // Keep filter panel open when selecting category
                      if (!showFilters) {
                        setShowFilters(true);
                        showFiltersRef.current = true;
                      }
                      updateFilters({ category: isActive ? null : filter.label });
                    }}
                    className={`snap-start rounded-full border px-4 py-2 text-sm transition whitespace-nowrap ${
                      isActive
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-200 text-slate-600 hover:border-slate-400 hover:text-slate-900"
                    }`}
                  >
                    <span className="mr-2">{filter.emoji}</span>
                    {filter.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Advanced Filters Panel - stays open during filtering */}
      {showFilters && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl transition-all duration-200 ease-in-out" style={{ willChange: 'auto' }}>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Region Filter */}
            <div>
              <Label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
                <MapPin className="size-4" />
                Location
              </Label>
              <Select
                value={localState.region || "all"}
                onValueChange={(value) => {
                  // Keep filter panel open when selecting location
                  if (!showFilters) {
                    setShowFilters(true);
                    showFiltersRef.current = true;
                  }
                  updateFilters({
                    region: value === "all" ? null : value,
                  });
                }}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {regions.filter(r => r !== "All Locations").map((region) => (
                    <SelectItem key={region} value={region}>
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date From */}
            <div>
              <Label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Calendar className="size-4" />
                From Date
              </Label>
              <DatePicker
                value={localState.dateFrom || ""}
                onChange={(value) => {
                  // Keep filter panel open when selecting dates
                  if (!showFilters) {
                    setShowFilters(true);
                    showFiltersRef.current = true;
                  }
                  updateFilters({ dateFrom: value || null });
                }}
                placeholder="Select start date"
                className="mt-2"
              />
            </div>

            {/* Date To */}
            <div>
              <Label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Calendar className="size-4" />
                To Date
              </Label>
              <DatePicker
                value={localState.dateTo || ""}
                onChange={(value) => {
                  // Keep filter panel open when selecting dates
                  if (!showFilters) {
                    setShowFilters(true);
                    showFiltersRef.current = true;
                  }
                  updateFilters({ dateTo: value || null });
                }}
                placeholder="Select end date"
                className="mt-2"
              />
            </div>

            {/* Price Range */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <DollarSign className="size-4" />
                  Min Price
                </Label>
                <Input
                  type="number"
                  placeholder="KES"
                  value={localState.priceMin || ""}
                  onChange={(e) => {
                    // Keep filter panel open when entering price
                    if (!showFilters) {
                      setShowFilters(true);
                      showFiltersRef.current = true;
                    }
                    updateFilters({ priceMin: e.target.value || null });
                  }}
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <DollarSign className="size-4" />
                  Max Price
                </Label>
                <Input
                  type="number"
                  placeholder="KES"
                  value={localState.priceMax || ""}
                  onChange={(e) => {
                    // Keep filter panel open when entering price
                    if (!showFilters) {
                      setShowFilters(true);
                      showFiltersRef.current = true;
                    }
                    updateFilters({ priceMax: e.target.value || null });
                  }}
                  className="mt-2"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

