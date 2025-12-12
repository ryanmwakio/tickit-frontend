import { EventContent } from "@/data/events";

/**
 * Check if an event is in the past
 * An event is considered past if its end date (or start date if no end date) has passed
 */
export function isEventPast(event: EventContent): boolean {
  const now = new Date();
  const eventEndDate = event.endDate ? new Date(event.endDate) : new Date(event.startDate);
  return eventEndDate < now;
}

/**
 * Check if an event is currently happening (started but not ended)
 */
export function isEventLive(event: EventContent): boolean {
  const now = new Date();
  const startDate = new Date(event.startDate);
  const endDate = event.endDate ? new Date(event.endDate) : null;
  
  if (endDate) {
    return now >= startDate && now <= endDate;
  }
  // If no end date, consider it live if it started today
  return now >= startDate && now.toDateString() === startDate.toDateString();
}

/**
 * Get event status badge information
 */
export function getEventStatus(event: EventContent): {
  label: string;
  className: string;
  icon?: string;
} {
  if (isEventPast(event)) {
    return {
      label: "Event Ended",
      className: "bg-slate-100 text-slate-600 border-slate-200",
      icon: "✓",
    };
  }
  
  if (isEventLive(event)) {
    return {
      label: "Live Now",
      className: "bg-emerald-100 text-emerald-700 border-emerald-200",
      icon: "●",
    };
  }
  
  return {
    label: "Upcoming",
    className: "bg-blue-100 text-blue-700 border-blue-200",
  };
}

export function filterEvents(
  events: EventContent[],
  filters: {
    query?: string;
    category?: string;
    region?: string;
    dateFrom?: string;
    dateTo?: string;
    priceMin?: string;
    priceMax?: string;
  }
): EventContent[] {
  return events.filter((event) => {
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

    if (filters.priceMin || filters.priceMax) {
      const priceMatch = event.price.match(/[\d,]+/);
      if (!priceMatch) return false;
      const price = parseInt(priceMatch[0].replace(/,/g, ""), 10);
      if (filters.priceMin && price < parseInt(filters.priceMin, 10)) return false;
      if (filters.priceMax && price > parseInt(filters.priceMax, 10)) return false;
    }

    return true;
  });
}

export function getAllUniqueRegions(events: EventContent[]): string[] {
  const regions = new Set<string>();
  events.forEach((event) => {
    if (event.region) {
      regions.add(event.region);
    }
  });
  return Array.from(regions).sort();
}

export type GroupedEvents = {
  category: string;
  events: EventContent[];
}[];

export function groupEventsByCategory(events: EventContent[]): GroupedEvents {
  const grouped = new Map<string, EventContent[]>();

  events.forEach((event) => {
    event.categories.forEach((category) => {
      if (!grouped.has(category)) {
        grouped.set(category, []);
      }
      // Allow events to appear in multiple categories (which is expected)
      // Remove duplicates within each category using a Set based on slug
      const categoryEvents = grouped.get(category)!;
      const eventSlugs = new Set(categoryEvents.map((e) => e.slug));
      if (!eventSlugs.has(event.slug)) {
        categoryEvents.push(event);
      }
    });
  });

  // Convert to array and sort by category name
  return Array.from(grouped.entries())
    .map(([category, categoryEvents]) => ({
      category,
      events: categoryEvents, // Already deduplicated above
    }))
    .filter((group) => group.events.length > 0) // Remove empty groups
    .sort((a, b) => a.category.localeCompare(b.category));
}

export function paginateEvents<T>(events: T[], page: number, itemsPerPage: number): {
  paginatedEvents: T[];
  totalPages: number;
} {
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedEvents = events.slice(startIndex, endIndex);
  const totalPages = Math.ceil(events.length / itemsPerPage);
  return { paginatedEvents, totalPages };
}
