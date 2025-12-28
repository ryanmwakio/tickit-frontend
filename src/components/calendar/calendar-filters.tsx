"use client";

import React, { useState, useMemo, useCallback } from "react";
import { Search, Filter, X, Calendar, MapPin, Download } from "lucide-react";
import { getAllUniqueRegions } from "@/lib/event-utils";
import type { EventContent } from "@/data/events";

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
import { Button } from "@/components/ui/button";
import {
  generateICSContentMultiple,
  downloadICSFile,
  generateGoogleCalendarURL,
} from "@/lib/calendar-export";

type CalendarFiltersProps = {
  events: EventContent[];
  filteredEvents?: EventContent[]; // The currently displayed/filtered events
  onFilterChange: (filteredEvents: EventContent[]) => void;
  onFiltersChange?: (filters: {
    search?: string;
    category?: string;
    region?: string;
    dateFrom?: string;
    dateTo?: string;
  }) => void;
};

const getAllRegions = (eventsList: EventContent[]) => {
  return ["All Locations", ...getAllUniqueRegions(eventsList)];
};

export function CalendarFilters({ events, filteredEvents, onFilterChange, onFiltersChange }: CalendarFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);
  const regions = getAllRegions(events);
  const [filters, setFilters] = useState({
    query: "",
    category: null as string | null,
    region: null as string | null,
    dateFrom: null as string | null,
    dateTo: null as string | null,
  });

  // Get unique categories from events
  const availableCategories = useMemo(() => {
    const categorySet = new Set<string>();
    events.forEach(event => {
      event.categories.forEach(cat => categorySet.add(cat));
    });
    
    return Array.from(categorySet)
      .map(category => ({
        label: category,
        emoji: categoryEmojiMap[category] || "🎫",
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [events]);

  // Update parent when filters change (debounced for search)
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      // Notify parent of filter changes for API calls
      if (onFiltersChange) {
        onFiltersChange({
          search: filters.query || undefined,
          category: filters.category || undefined,
          region: filters.region && filters.region !== "All Locations" ? filters.region : undefined,
          dateFrom: filters.dateFrom || undefined,
          dateTo: filters.dateTo || undefined,
        });
      }
    }, filters.query ? 500 : 0); // Debounce search, immediate for other filters

    return () => clearTimeout(timeoutId);
  }, [filters, onFiltersChange]);

  // Client-side filtering for immediate UI updates (only if events are provided)
  React.useEffect(() => {
    if (events.length === 0) {
      onFilterChange([]);
      return;
    }

    const filtered = events.filter((event) => {
      if (filters.query) {
        const query = filters.query.toLowerCase();
        if (
          !event.title.toLowerCase().includes(query) &&
          !event.location.toLowerCase().includes(query) &&
          !event.summary.toLowerCase().includes(query) &&
          !event.tags.some((tag) => tag.toLowerCase().includes(query))
        ) {
          return false;
        }
      }

      if (filters.category) {
        if (!event.categories.includes(filters.category) && !event.tags.includes(filters.category)) {
          return false;
        }
      }

      if (filters.region && filters.region !== "All Locations") {
        if (event.region !== filters.region) {
          return false;
        }
      }

      if (filters.dateFrom) {
        const eventDate = new Date(event.startDate);
        const fromDate = new Date(filters.dateFrom);
        if (eventDate < fromDate) {
          return false;
        }
      }

      if (filters.dateTo) {
        const eventDate = new Date(event.startDate);
        const toDate = new Date(filters.dateTo);
        toDate.setHours(23, 59, 59, 999);
        if (eventDate > toDate) {
          return false;
        }
      }

      return true;
    });
    onFilterChange(filtered);
  }, [events, filters, onFilterChange]);

  const updateFilters = useCallback((updates: Partial<typeof filters>) => {
    setFilters((prevFilters) => ({ ...prevFilters, ...updates }));
  }, []);

  const clearFilters = () => {
    setFilters({
      query: "",
      category: null,
      region: null,
      dateFrom: null,
      dateTo: null,
    });
  };

  const hasActiveFilters =
    filters.query ||
    filters.category ||
    (filters.region && filters.region !== "All Locations") ||
    filters.dateFrom ||
    filters.dateTo;

  const handleExportAll = () => {
    try {
      // Use filteredEvents if provided (the events currently displayed), otherwise filter events
      const eventsToExport = filteredEvents && filteredEvents.length > 0 
        ? filteredEvents 
        : events.filter((event) => {
            if (filters.query) {
              const query = filters.query.toLowerCase();
              if (
                !event.title.toLowerCase().includes(query) &&
                !event.location.toLowerCase().includes(query) &&
                !event.summary.toLowerCase().includes(query) &&
                !event.tags.some((tag) => tag.toLowerCase().includes(query))
              ) {
                return false;
              }
            }

            if (filters.category) {
              if (!event.categories.includes(filters.category) && !event.tags.includes(filters.category)) {
                return false;
              }
            }

            if (filters.region && filters.region !== "All Locations") {
              if (event.region !== filters.region) {
                return false;
              }
            }

            if (filters.dateFrom) {
              const eventDate = new Date(event.startDate);
              const fromDate = new Date(filters.dateFrom);
              if (eventDate < fromDate) {
                return false;
              }
            }

            if (filters.dateTo) {
              const eventDate = new Date(event.startDate);
              const toDate = new Date(filters.dateTo);
              toDate.setHours(23, 59, 59, 999);
              if (eventDate > toDate) {
                return false;
              }
            }

            return true;
          });
      
      if (eventsToExport.length === 0) {
        alert("No events to export. Please adjust your filters or wait for events to load.");
        return;
      }
      
      const icsContent = generateICSContentMultiple(eventsToExport);
      const filename = `tickit-events-${new Date().toISOString().split("T")[0]}.ics`;
      downloadICSFile(icsContent, filename);
    } catch (error) {
      console.error("Failed to export calendar:", error);
      alert("Failed to export calendar. Please try again.");
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Export */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            type="text"
            placeholder="Search events..."
            value={filters.query}
            onChange={(e) => updateFilters({ query: e.target.value })}
            className="w-full rounded-xl pl-10 pr-10"
          />
          {filters.query && (
            <button
              onClick={() => updateFilters({ query: "" })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleExportAll}
            className="flex items-center gap-2"
          >
            <Download className="size-4" />
            <span className="hidden sm:inline">Export All</span>
            <span className="sm:hidden">Export</span>
          </Button>
          <Button
            variant={showFilters || hasActiveFilters ? "default" : "outline"}
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="size-4" />
            Filters
            {hasActiveFilters && (
              <span className="ml-1 rounded-full bg-white/20 px-2 py-0.5 text-xs">
                Active
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Quick Category Filters */}
      {availableCategories.length > 0 && (
        <div className="flex snap-x gap-2 overflow-x-auto pb-2">
          {availableCategories.slice(0, 8).map((filter) => {
            const isActive = filters.category === filter.label;
            return (
              <button
                key={filter.label}
                onClick={() =>
                  updateFilters({ category: isActive ? null : filter.label })
                }
                className={`snap-start rounded-full border px-4 py-1.5 text-sm transition whitespace-nowrap ${
                  isActive
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 text-slate-600 hover:border-slate-400 hover:text-slate-900"
                }`}
              >
                <span className="mr-1.5">{filter.emoji}</span>
                {filter.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Advanced Filters</h3>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
              >
                <X className="size-4" />
                Clear all
              </button>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Region Filter */}
            <div>
              <Label className="mb-2 flex items-center gap-2 text-sm font-semibold">
                <MapPin className="size-4" />
                Location
              </Label>
              <Select
                value={filters.region || "all"}
                onValueChange={(value) =>
                  updateFilters({ region: value === "all" ? null : value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {regions.filter((r) => r !== "All Locations").map((region) => (
                    <SelectItem key={region} value={region}>
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date From */}
            <div>
              <Label className="mb-2 flex items-center gap-2 text-sm font-semibold">
                <Calendar className="size-4" />
                From Date
              </Label>
              <DatePicker
                value={filters.dateFrom || ""}
                onChange={(value) => updateFilters({ dateFrom: value || null })}
                placeholder="Select start date"
              />
            </div>

            {/* Date To */}
            <div>
              <Label className="mb-2 flex items-center gap-2 text-sm font-semibold">
                <Calendar className="size-4" />
                To Date
              </Label>
              <DatePicker
                value={filters.dateTo || ""}
                onChange={(value) => updateFilters({ dateTo: value || null })}
                placeholder="Select end date"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

