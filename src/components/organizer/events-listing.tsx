"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Edit,
  Eye,
  MoreVertical,
  Plus,
  Calendar,
  MapPin,
  DollarSign,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  Globe,
  Lock,
  ArrowRight,
  Trash2,
  Copy,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Star,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/contexts/toast-context";
import { useAuth } from "@/contexts/auth-context";
import {
  fetchOrganiserEvents,
  deleteEvent,
  requestEventApproval,
  createEvent,
  fetchEvent,
  EventResponseDto,
} from "@/lib/events-api";
import { apiClient } from "@/lib/api";
import { mapEventToEventContent } from "@/lib/events-api";

type EventStatus =
  | "draft"
  | "published"
  | "live"
  | "ended"
  | "cancelled"
  | "PENDING_APPROVAL"
  | "COMPLETED";

type OrganizerEvent = {
  id: string;
  title: string;
  slug: string;
  status: EventStatus;
  image: string;
  location: string;
  date: string;
  time: string;
  startDate?: string;
  endDate?: string;
  price: string;
  ticketsSold: number;
  totalTickets: number;
  revenue: string;
  hasTickets: boolean;
  hasPackages: boolean;
  isComplete: boolean;
  completionInfo?: {
    isComplete: boolean;
    requirements: Array<{
      type: string;
      completed: boolean;
      description: string;
      location: string;
    }>;
    missingRequirements: Array<{
      type: string;
      completed: boolean;
      description: string;
      location: string;
    }>;
    completionPercentage: number;
  };
};

// Helper to get organiserId
async function getUserOrganiserId(userId: string): Promise<string | null> {
  try {
    // Get organisers for the current user (filtered by ownerId on backend)
    const response = await apiClient.get<any>("/organisers?limit=1");

    // Handle paginated response - apiClient may return { data: [...], total: ... } or just array
    const organisers = Array.isArray(response)
      ? response
      : response?.data || response?.data?.data || [];

    if (organisers && organisers.length > 0 && organisers[0].id) {
      return organisers[0].id;
    }

    // Fallback: try to get from events (for backward compatibility)
    const eventsResponse = await apiClient.get<any>("/events?limit=1");
    const events = Array.isArray(eventsResponse)
      ? eventsResponse
      : eventsResponse?.data || eventsResponse?.data?.data || [];

    if (events && events.length > 0 && events[0].organiserId) {
      return events[0].organiserId;
    }

    return null;
  } catch (error) {
    console.error("Failed to get organiserId:", error);
    return null;
  }
}

// Enhanced completion checker for events with selected features
function getEventCompletionInfo(event: EventResponseDto) {
  const requirements: Array<{
    type: string;
    completed: boolean;
    description: string;
    location: string;
  }> = [];
  const selectedFeatures: string[] = Array.isArray(event.metadata?.features)
    ? (event.metadata.features as string[])
    : Array.isArray(event.metadata?.selectedFeatures)
      ? (event.metadata.selectedFeatures as string[])
      : [];

  // Core requirements for all events
  requirements.push({
    type: "basic",
    completed: !!(
      event.title &&
      event.description &&
      event.startsAt &&
      event.endsAt
    ),
    description: "Basic event information (title, description, dates)",
    location: "Basic Info tab",
  });

  requirements.push({
    type: "location",
    completed: !!(event.venue?.address || event.venue?.name),
    description: "Event venue/location details",
    location: "Basic Info tab",
  });

  requirements.push({
    type: "image",
    completed: !!(
      event.coverImageUrl ||
      (event.imageGalleryUrls && event.imageGalleryUrls.length > 0)
    ),
    description: "Event cover image or gallery images",
    location: "Gallery tab",
  });

  // Feature-specific requirements
  if (selectedFeatures.includes("custom_ticket_design")) {
    requirements.push({
      type: "ticket_design",
      completed: !!(
        event.metadata?.ticketDesign || (event.ticketTypes?.length ?? 0) > 0
      ),
      description: "Custom ticket design configuration",
      location: "Ticket Design tab",
    });
  }

  if (selectedFeatures.includes("seat_selection")) {
    requirements.push({
      type: "seat_map",
      completed: !!event.metadata?.seatMap,
      description: "Seat map configuration",
      location: "Seat Map tab",
    });
  }

  if (selectedFeatures.includes("dynamic_pricing")) {
    requirements.push({
      type: "pricing",
      completed: !!(
        event.metadata?.pricingRules ||
        event.ticketTypes?.some((tt) => tt.priceCents > 0)
      ),
      description: "Dynamic pricing rules setup",
      location: "Pricing & Packages tab",
    });
  }

  if (selectedFeatures.includes("sponsor_management")) {
    requirements.push({
      type: "sponsors",
      completed: !!(
        event.metadata?.sponsors && Array.isArray(event.metadata.sponsors) && event.metadata.sponsors.length > 0
      ),
      description: "Sponsor details and branding",
      location: "Sponsors tab",
    });
  }

  if (selectedFeatures.includes("merchandise")) {
    requirements.push({
      type: "merchandise",
      completed: !!(
        event.metadata?.merchandise && Array.isArray(event.metadata.merchandise) && event.metadata.merchandise.length > 0
      ),
      description: "Merchandise items configuration",
      location: "Merchandise tab",
    });
  }

  // Always require ticket types for draft events
  requirements.push({
    type: "tickets",
    completed: !!(event.ticketTypes && event.ticketTypes.length > 0),
    description: "At least one ticket type configured",
    location: "Event creation or management",
  });

  const missingRequirements = requirements.filter((req) => !req.completed);
  const isComplete = missingRequirements.length === 0;

  return {
    isComplete,
    requirements,
    missingRequirements,
    completionPercentage: Math.round(
      ((requirements.length - missingRequirements.length) /
        requirements.length) *
        100,
    ),
  };
}

// Map API event to OrganizerEvent format
function mapApiEventToOrganizerEvent(event: EventResponseDto): OrganizerEvent {
  const eventContent = mapEventToEventContent(event);
  const startsAt = new Date(event.startsAt);
  const endsAt = event.endsAt ? new Date(event.endsAt) : null;

  // Calculate tickets sold and total from ticket types
  const ticketsSold =
    event.ticketTypes?.reduce((sum: number, tt: { quantitySold?: number }) => sum + (tt.quantitySold || 0), 0) ||
    0;
  const totalTickets =
    event.ticketTypes?.reduce((sum: number, tt: { quantityTotal?: number }) => sum + (tt.quantityTotal || 0), 0) ||
    0;

  // Calculate revenue (simplified - would need order data for accurate revenue)
  const revenue =
    event.ticketTypes?.reduce((sum: number, tt: { quantitySold?: number; quantityTotal?: number; priceCents?: number }) => {
      return sum + ((tt.quantitySold || 0) * (tt.priceCents || 0)) / 100;
    }, 0) || 0;

  // Map backend status to frontend status
  let status: EventStatus = "draft";
  if (event.status === "PUBLISHED") status = "published";
  else if (event.status === "LIVE") status = "live";
  else if (event.status === "COMPLETED") status = "ended";
  else if (event.status === "CANCELLED") status = "cancelled";
  else if (event.status === "PENDING_APPROVAL")
    status = "PENDING_APPROVAL" as EventStatus;
  else status = "draft";

  // Format time (HH:MM AM/PM)
  const time = startsAt.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  // Get enhanced completion info
  const completionInfo = getEventCompletionInfo(event);

  return {
    id: event.id,
    title: event.title,
    slug: event.slug,
    status,
    image:
      event.coverImageUrl ||
      "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=800&q=80",
    location: event.venue?.address || event.venue?.name || "Location TBA",
    date: startsAt.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }),
    time,
    startDate: startsAt.toISOString().split("T")[0],
    endDate: endsAt?.toISOString().split("T")[0],
    price: eventContent.price,
    ticketsSold,
    totalTickets,
    revenue: `KES ${revenue.toLocaleString()}`,
    hasTickets: (event.ticketTypes?.length || 0) > 0,
    hasPackages: false, // TODO: Check if packages exist
    isComplete: completionInfo.isComplete,
    completionInfo: completionInfo,
  };
}

// Sample data fallback - in production, this would come from an API
const sampleEvents: OrganizerEvent[] = [
  {
    id: "1",
    title: "Nairobi Music Festival 2024",
    slug: "nairobi-music-festival-2024",
    status: "published",
    image:
      "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=800&q=80",
    location: "Nairobi, Kenya",
    date: "March 15, 2024",
    time: "6:00 PM",
    startDate: "2024-03-15",
    endDate: "2024-03-17",
    price: "From KES 5,000",
    ticketsSold: 450,
    totalTickets: 2000,
    revenue: "KES 2,250,000",
    hasTickets: true,
    hasPackages: true,
    isComplete: true,
  },
  {
    id: "2",
    title: "Wellness Retreat Weekend",
    slug: "wellness-retreat-weekend",
    status: "draft",
    image:
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80",
    location: "Mombasa, Kenya",
    date: "April 20, 2024",
    time: "9:00 AM",
    startDate: "2024-04-20",
    price: "From KES 12,000",
    ticketsSold: 0,
    totalTickets: 50,
    revenue: "KES 0",
    hasTickets: true,
    hasPackages: false,
    isComplete: false,
  },
  {
    id: "3",
    title: "Tech Conference 2024",
    slug: "tech-conference-2024",
    status: "live",
    image:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80",
    location: "Nairobi, Kenya",
    date: "Feb 10, 2024",
    time: "2:00 PM",
    startDate: "2024-02-10",
    endDate: "2024-02-11",
    price: "From KES 3,500",
    ticketsSold: 850,
    totalTickets: 1000,
    revenue: "KES 2,975,000",
    hasTickets: true,
    hasPackages: true,
    isComplete: true,
  },
  {
    id: "4",
    title: "Corporate Gala Dinner",
    slug: "corporate-gala-dinner",
    status: "ended",
    image:
      "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80",
    location: "Nairobi, Kenya",
    date: "Jan 25, 2024",
    time: "7:00 PM",
    startDate: "2024-01-25",
    price: "KES 15,000",
    ticketsSold: 200,
    totalTickets: 200,
    revenue: "KES 3,000,000",
    hasTickets: true,
    hasPackages: true,
    isComplete: true,
  },
];

const statusConfig: Record<
  EventStatus,
  { label: string; color: string; icon: React.ElementType }
> = {
  draft: {
    label: "Draft",
    color: "bg-slate-100 text-slate-700 border-slate-200",
    icon: Clock,
  },
  published: {
    label: "Published",
    color: "bg-blue-100 text-blue-700 border-blue-200",
    icon: Globe,
  },
  live: {
    label: "Live",
    color: "bg-green-100 text-green-700 border-green-200",
    icon: CheckCircle2,
  },
  ended: {
    label: "Ended",
    color: "bg-slate-100 text-slate-600 border-slate-200",
    icon: AlertCircle,
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-red-100 text-red-700 border-red-200",
    icon: AlertCircle,
  },
  PENDING_APPROVAL: {
    label: "Pending Approval",
    color: "bg-amber-100 text-amber-700 border-amber-200",
    icon: Clock,
  },
  COMPLETED: {
    label: "Completed",
    color: "bg-slate-100 text-slate-600 border-slate-200",
    icon: CheckCircle2,
  },
};

export function OrganizerEventsListing() {
  const { user } = useAuth();
  const [events, setEvents] = useState<OrganizerEvent[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [organiserId, setOrganiserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const itemsPerPage = 9;

  // Featured request modal state
  const [featuredModalOpen, setFeaturedModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<OrganizerEvent | null>(
    null,
  );
  const [pricing, setPricing] = useState<{
    costPerDayCents: number;
    currency: string;
  } | null>(null);
  const [days, setDays] = useState(7);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [notes, setNotes] = useState("");
  const [requestingFeatured, setRequestingFeatured] = useState(false);

  const toast = useToast();

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (user) {
      // Reset to page 1 and clear events when filters/search change
      setCurrentPage(1);
      setEvents([]);
      setError(null);
      loadEvents(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, filterStatus, debouncedSearchQuery]);

  // Load more events when currentPage changes (for load more button)
  useEffect(() => {
    if (user && currentPage > 1) {
      loadEvents(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const loadEvents = async (reset: boolean = true) => {
    if (!user) return;

    try {
      if (reset) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);

      // Get organiserId
      const orgId = await getUserOrganiserId(user.id);
      if (!orgId) {
        console.warn("Could not determine organiserId for user");
        if (reset) {
          setEvents([]);
          setLoading(false);
        } else {
          setLoadingMore(false);
        }
        return;
      }
      setOrganiserId(orgId);

      // Map frontend filter status to backend status
      let statusFilter: string | undefined;
      if (filterStatus === "all") {
        statusFilter = undefined; // Get all events regardless of status
      } else if (filterStatus === "draft") {
        statusFilter = "DRAFT";
      } else if (filterStatus === "published") {
        statusFilter = "PUBLISHED";
      } else if (filterStatus === "live") {
        statusFilter = "LIVE";
      } else if (filterStatus === "ended") {
        statusFilter = "COMPLETED";
      } else if (filterStatus === "cancelled") {
        statusFilter = "CANCELLED";
      } else if (filterStatus === "pending_approval") {
        statusFilter = "PENDING_APPROVAL";
      }

      // Build query params - use currentPage for pagination
      const queryParams: any = {
        page: currentPage,
        limit: itemsPerPage,
        sortBy: "startsAt",
        sortOrder: "DESC",
      };

      // Only add status filter if not "all"
      if (statusFilter) {
        queryParams.status = statusFilter;
      }

      // Add search if provided
      if (debouncedSearchQuery && debouncedSearchQuery.trim()) {
        queryParams.search = debouncedSearchQuery.trim();
      }

      // Fetch events from API with pagination
      const response = await fetchOrganiserEvents(orgId, queryParams);

      const mappedEvents = response.data.map(mapApiEventToOrganizerEvent);

      if (reset) {
        setEvents(mappedEvents);
      } else {
        // Append new events to existing ones
        setEvents((prev) => [...prev, ...mappedEvents]);
      }

      // Update pagination info
      const total = response.total || mappedEvents.length;
      setTotalItems(total);

      // Calculate totalPages from totalItems if not provided by API
      const calculatedTotalPages = response.totalPages
        ? response.totalPages
        : total > 0
          ? Math.ceil(total / itemsPerPage)
          : 1;
      setTotalPages(calculatedTotalPages);

      // Check if there are more pages to load
      // Similar logic to events page - show Load More if:
      // 1. We got exactly itemsPerPage events (full page), OR
      // 2. Total is greater than loaded events, OR
      // 3. Current page is less than total pages
      const currentEventsCount = reset
        ? mappedEvents.length
        : events.length + mappedEvents.length;
      let morePagesAvailable = false;

      // Always show if we got exactly itemsPerPage (full page)
      if (mappedEvents.length === itemsPerPage) {
        morePagesAvailable = true;
      }
      // Or if total is greater than loaded
      else if (total > currentEventsCount) {
        morePagesAvailable = true;
      }
      // Or if current page is less than total pages
      else if (currentPage < calculatedTotalPages) {
        morePagesAvailable = true;
      }
      // Otherwise, if we have events but aren't sure, show the button (conservative approach)
      else if (currentEventsCount > 0 && calculatedTotalPages > 1) {
        morePagesAvailable = true;
      }

      setHasMore(morePagesAvailable);
    } catch (err: any) {
      console.error("Failed to load events:", err);
      setError(err.message || "Failed to load events");
      if (reset) {
        setEvents([]);
        setTotalPages(1);
        setTotalItems(0);
      }
    } finally {
      if (reset) {
        setLoading(false);
      } else {
        setLoadingMore(false);
      }
    }
  };

  const handleLoadMore = () => {
    setCurrentPage((prev) => prev + 1);
  };

  // No need for client-side filtering since API handles it
  // Events are already filtered by the API based on status and search query
  const filteredEvents = events;

  const groupedEvents = filteredEvents.reduce(
    (acc, event) => {
      if (!acc[event.status]) {
        acc[event.status] = [];
      }
      acc[event.status].push(event);
      return acc;
    },
    {} as Record<EventStatus, OrganizerEvent[]>,
  );

  const handlePublish = async (eventId: string) => {
    const event = events.find((e) => e.id === eventId);
    if (!event || !event.isComplete) return;

    // Only draft events can request approval
    if (event.status !== "draft") {
      alert(
        `Cannot request approval for ${event.status} event. Only draft events can request approval.`,
      );
      return;
    }

    try {
      // Request approval for publishing
      await requestEventApproval(eventId);

      // Update local state
      setEvents((prev) =>
        prev.map((e) =>
          e.id === eventId
            ? { ...e, status: "PENDING_APPROVAL" as EventStatus }
            : e,
        ),
      );

      alert(
        "Event approval requested. It will be published after admin approval.",
      );
    } catch (err: any) {
      console.error("Failed to publish event:", err);

      // More specific error messages
      let errorMessage = err.message || "Failed to request approval for event";
      if (
        err.statusCode === 400 &&
        err.message?.includes("Only draft events")
      ) {
        errorMessage =
          "Only draft events can request approval. Please check the event status.";
      }

      alert(errorMessage);
    }
  };

  const handleDelete = async (eventId: string) => {
    if (!confirm("Are you sure you want to delete this event?")) {
      return;
    }

    try {
      await deleteEvent(eventId);
      // Remove from local state
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
    } catch (err: any) {
      console.error("Failed to delete event:", err);
      alert(err.message || "Failed to delete event");
    }
  };

  const handleDuplicate = async (eventId: string) => {
    if (!organiserId) {
      alert("Organiser ID not found. Please refresh the page.");
      return;
    }

    const event = events.find((e) => e.id === eventId);
    if (!event) return;

    try {
      // Fetch the full event data
      const fullEvent = await fetchEvent(eventId);

      // Create a copy with modified title and slug
      const duplicateData = {
        title: `${fullEvent.title} (Copy)`,
        slug: `${fullEvent.slug}-copy-${Date.now()}`,
        description: fullEvent.description,
        category: fullEvent.category,
        tags: fullEvent.tags,
        visibility: fullEvent.visibility,
        status: "DRAFT",
        startsAt:
          fullEvent.startsAt instanceof Date
            ? fullEvent.startsAt.toISOString()
            : new Date(fullEvent.startsAt).toISOString(),
        endsAt:
          fullEvent.endsAt instanceof Date
            ? fullEvent.endsAt.toISOString()
            : new Date(fullEvent.endsAt).toISOString(),
        timezone: fullEvent.timezone,
        capacity: fullEvent.capacity,
        coverImageUrl: fullEvent.coverImageUrl,
        imageGalleryUrls: fullEvent.imageGalleryUrls,
        venueId: fullEvent.venueId,
        metadata: fullEvent.metadata,
      };

      const newEvent = await createEvent(organiserId, duplicateData);
      const mappedEvent = mapApiEventToOrganizerEvent(newEvent);

      // Add to local state
      setEvents((prev) => [...prev, mappedEvent]);

      alert("Event duplicated successfully!");
    } catch (err: any) {
      console.error("Failed to duplicate event:", err);
      alert(err.message || "Failed to duplicate event");
    }
  };

  const handleRequestFeatured = async (event: OrganizerEvent) => {
    if (!organiserId) {
      toast.error("Error", "Organiser ID not found. Please refresh the page.");
      return;
    }

    // Check if event is ended
    if (event.status === "ended") {
      toast.error("Error", "Cannot feature ended events");
      return;
    }

    setSelectedEvent(event);
    setFeaturedModalOpen(true);

    // Load pricing
    try {
      const pricingData = await apiClient.get<{
        costPerDayCents: number;
        currency: string;
      }>(`/organisers/${organiserId}/featured/pricing`);
      setPricing(pricingData);

      // Set default dates (7 days from today)
      const today = new Date();
      const endDateObj = new Date(today);
      endDateObj.setDate(today.getDate() + 7);

      setStartDate(today.toISOString().split("T")[0]);
      setEndDate(endDateObj.toISOString().split("T")[0]);
      setDays(7);
    } catch (error) {
      console.error("Failed to load pricing:", error);
      toast.error("Error", "Failed to load pricing information");
    }
  };

  const handleSubmitFeaturedRequest = async () => {
    if (!organiserId || !selectedEvent || !pricing) {
      return;
    }

    // Calculate days from dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    const calculatedDays = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (calculatedDays <= 0) {
      toast.error("Error", "End date must be after start date");
      return;
    }

    setRequestingFeatured(true);
    try {
      await apiClient.post(`/organisers/${organiserId}/featured/request`, {
        eventId: selectedEvent.id,
        days: calculatedDays,
        startDate: startDate,
        endDate: endDate,
        notes: notes.trim() || undefined,
      });

      toast.success(
        "Success",
        "Featured request submitted successfully! Admin will review your request.",
      );
      setFeaturedModalOpen(false);
      setSelectedEvent(null);
      setNotes("");
    } catch (error: any) {
      console.error("Failed to submit featured request:", error);
      toast.error(
        "Error",
        error.message || "Failed to submit featured request",
      );
    } finally {
      setRequestingFeatured(false);
    }
  };

  // Calculate cost when days or pricing changes
  const totalCost = useMemo(() => {
    if (pricing && days) {
      return (pricing.costPerDayCents * days) / 100;
    }
    return 0;
  }, [pricing, days]);

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <svg
                className="size-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              <SelectItem value="draft">Drafts</SelectItem>
              <SelectItem value="pending_approval">Pending Approval</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="live">Live</SelectItem>
              <SelectItem value="ended">Past Events</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Link
            href="/organizer/events/create"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-slate-800 whitespace-nowrap"
          >
            <Plus className="size-4 flex-shrink-0" />
            <span>Create Event</span>
          </Link>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <p className="font-semibold">Error loading events</p>
          <p>{error}</p>
          <button
            onClick={() => loadEvents(true)}
            className="mt-2 text-sm font-semibold text-red-900 underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Events Grid */}
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="h-48 w-full animate-pulse bg-slate-200" />
              <div className="p-4 space-y-3">
                <div className="h-5 w-3/4 animate-pulse bg-slate-200 rounded" />
                <div className="h-4 w-1/2 animate-pulse bg-slate-200 rounded" />
                <div className="flex gap-2">
                  <div className="h-6 w-20 animate-pulse bg-slate-200 rounded-full" />
                  <div className="h-6 w-24 animate-pulse bg-slate-200 rounded-full" />
                </div>
                <div className="h-4 w-2/3 animate-pulse bg-slate-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-12 text-center">
          <Calendar className="mx-auto size-12 text-slate-300" />
          <p className="mt-4 text-lg font-semibold text-slate-900">
            No events found
          </p>
          <p className="mt-2 text-sm text-slate-600">
            {searchQuery
              ? "Try adjusting your search query"
              : "Create your first event to get started"}
          </p>
          {!searchQuery && (
            <Link
              href="/organizer/events/create"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <Plus className="size-4" />
              Create Event
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event) => {
            const StatusIcon = statusConfig[event.status].icon;
            const statusInfo = statusConfig[event.status];
            const progressPercentage = event.totalTickets
              ? (event.ticketsSold / event.totalTickets) * 100
              : 0;

            return (
              <div
                key={event.id}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-lg"
              >
                {/* Status Badge */}
                <div className="absolute right-4 top-4 z-10">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${statusInfo.color}`}
                  >
                    <StatusIcon className="size-3" />
                    {statusInfo.label}
                  </span>
                </div>

                {/* Event Image */}
                <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                  {event.image ? (
                    <Image
                      src={event.image}
                      alt={event.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300">
                      <span className="text-slate-500">No Image</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-sm font-semibold text-white drop-shadow-lg">
                      {event.title}
                    </p>
                  </div>
                </div>

                {/* Event Details */}
                <div className="p-6 space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <MapPin className="size-3.5" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <Calendar className="size-3.5" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <Clock className="size-3.5" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <DollarSign className="size-3.5" />
                      <span>{event.price}</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {event.status !== "draft" && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-900">
                          Tickets Sold
                        </span>
                        <span className="text-slate-600">
                          {event.ticketsSold} / {event.totalTickets}
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full bg-slate-900 transition-all"
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Revenue */}
                  {event.status !== "draft" && (
                    <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                      <span className="text-xs font-semibold text-slate-900">
                        Revenue
                      </span>
                      <span className="text-sm font-bold text-slate-900">
                        {event.revenue}
                      </span>
                    </div>
                  )}

                  {/* Completion Status */}
                  {event.status === "draft" && event.completionInfo && (
                    <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-900">
                          Completion
                        </span>
                        <span
                          className={
                            event.completionInfo.isComplete
                              ? "text-green-600 font-semibold"
                              : "text-amber-600 font-semibold"
                          }
                        >
                          {event.completionInfo.completionPercentage}%
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            event.completionInfo.isComplete
                              ? "bg-green-500"
                              : "bg-amber-500"
                          }`}
                          style={{
                            width: `${event.completionInfo.completionPercentage}%`,
                          }}
                        />
                      </div>

                      {/* Missing Requirements */}
                      {!event.completionInfo.isComplete &&
                        event.completionInfo.missingRequirements.length > 0 && (
                          <div className="space-y-1">
                            <p className="text-xs font-semibold text-slate-700">
                              Missing:
                            </p>
                            <div className="space-y-1">
                              {event.completionInfo.missingRequirements
                                .slice(0, 3)
                                .map((req, index) => (
                                  <div
                                    key={index}
                                    className="flex items-start gap-2 text-xs"
                                  >
                                    <AlertCircle className="size-3 text-amber-500 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1">
                                      <span className="text-slate-700">
                                        {req.description}
                                      </span>
                                      <span className="text-slate-500 block">
                                        → {req.location}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              {event.completionInfo.missingRequirements.length >
                                3 && (
                                <p className="text-xs text-slate-500 pl-5">
                                  +
                                  {event.completionInfo.missingRequirements
                                    .length - 3}{" "}
                                  more requirements
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                      {/* Completed Requirements Summary */}
                      {event.completionInfo.isComplete && (
                        <div className="flex items-center gap-2 text-xs text-green-700">
                          <CheckCircle2 className="size-3" />
                          <span>All requirements completed</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      {event.status === "draft" ? (
                        <>
                          <Link
                            href={`/organizer/events/edit/${event.slug}`}
                            className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                          >
                            <Edit className="size-4" />
                            Edit
                          </Link>
                          {event.isComplete && event.status === "draft" ? (
                            <button
                              onClick={() => handlePublish(event.id)}
                              className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                            >
                              <Globe className="size-4" />
                              Publish
                            </button>
                          ) : (
                            <button
                              disabled
                              className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-slate-300 px-3 py-2 text-sm font-semibold text-slate-500 cursor-not-allowed"
                              title="Complete all event details to publish"
                            >
                              <Lock className="size-4" />
                              Publish
                            </button>
                          )}
                        </>
                      ) : (
                        <>
                          <Link
                            href={`/events/${event.slug}`}
                            className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                            target="_blank"
                          >
                            <Eye className="size-4" />
                            View
                          </Link>
                          <Link
                            href={`/organizer/events/edit/${event.slug}`}
                            className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                          >
                            <Edit className="size-4" />
                            Edit
                          </Link>
                        </>
                      )}
                    </div>
                    {event.status !== "ended" && event.status !== "draft" && (
                      <button
                        onClick={() => handleRequestFeatured(event)}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-lg border-2 border-yellow-300 bg-yellow-50 px-3 py-2 text-sm font-semibold text-yellow-700 transition hover:border-yellow-400 hover:bg-yellow-100"
                      >
                        <Star className="size-4 fill-yellow-400 text-yellow-400" />
                        Request Featured
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Load More Button */}
      {!loading && events.length > 0 && hasMore && (
        <div className="flex justify-center pt-6 pb-4">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="group inline-flex items-center gap-2 rounded-xl border-2 border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-900 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {loadingMore ? (
              <>
                <div className="size-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900 shrink-0" />
                <span>Loading...</span>
              </>
            ) : (
              <>
                <span>Load more events</span>
                <ChevronDown className="size-5 transition-transform group-hover:translate-y-0.5 shrink-0" />
              </>
            )}
          </button>
        </div>
      )}

      {/* Featured Request Modal */}
      <Dialog open={featuredModalOpen} onOpenChange={setFeaturedModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Star className="size-5 fill-yellow-400 text-yellow-400" />
              Request Featured Status
            </DialogTitle>
            <DialogDescription>
              Request to feature "{selectedEvent?.title}" on the homepage. Admin
              will review your request.
            </DialogDescription>
          </DialogHeader>

          {pricing && (
            <div className="space-y-6 mt-4">
              {/* Pricing Info */}
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-slate-900">
                    Cost per day:
                  </span>
                  <span className="text-sm font-bold text-slate-900">
                    {pricing.currency}{" "}
                    {(pricing.costPerDayCents / 100).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Date Selection */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      if (e.target.value && endDate) {
                        const start = new Date(e.target.value);
                        const end = new Date(endDate);
                        const calculatedDays = Math.ceil(
                          (end.getTime() - start.getTime()) /
                            (1000 * 60 * 60 * 24),
                        );
                        if (calculatedDays > 0) {
                          setDays(calculatedDays);
                        }
                      }
                    }}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      if (startDate && e.target.value) {
                        const start = new Date(startDate);
                        const end = new Date(e.target.value);
                        const calculatedDays = Math.ceil(
                          (end.getTime() - start.getTime()) /
                            (1000 * 60 * 60 * 24),
                        );
                        if (calculatedDays > 0) {
                          setDays(calculatedDays);
                        }
                      }
                    }}
                    min={startDate || new Date().toISOString().split("T")[0]}
                  />
                </div>
              </div>

              {/* Days Input */}
              <div className="space-y-2">
                <Label htmlFor="days">Number of Days</Label>
                <Input
                  id="days"
                  type="number"
                  min="1"
                  value={days}
                  onChange={(e) => {
                    const newDays = parseInt(e.target.value) || 1;
                    setDays(newDays);
                    if (startDate) {
                      const start = new Date(startDate);
                      const end = new Date(start);
                      end.setDate(start.getDate() + newDays);
                      setEndDate(end.toISOString().split("T")[0]);
                    }
                  }}
                />
              </div>

              {/* Cost Breakdown */}
              <div className="rounded-lg border-2 border-yellow-300 bg-yellow-50 p-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-700">Days:</span>
                    <span className="text-sm font-semibold text-slate-900">
                      {days} days
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-700">
                      Cost per day:
                    </span>
                    <span className="text-sm font-semibold text-slate-900">
                      {pricing.currency}{" "}
                      {(pricing.costPerDayCents / 100).toLocaleString()}
                    </span>
                  </div>
                  <div className="border-t border-yellow-300 pt-2 mt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-base font-bold text-slate-900">
                        Total Cost:
                      </span>
                      <span className="text-lg font-bold text-yellow-700">
                        {pricing.currency} {totalCost.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes (Optional)</Label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full min-h-[100px] rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  placeholder="Add any additional information for the admin..."
                />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setFeaturedModalOpen(false);
                    setSelectedEvent(null);
                    setNotes("");
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitFeaturedRequest}
                  disabled={
                    requestingFeatured || !startDate || !endDate || days <= 0
                  }
                  className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white"
                >
                  {requestingFeatured ? "Submitting..." : "Submit Request"}
                </Button>
              </div>
            </div>
          )}

          {!pricing && (
            <div className="flex items-center justify-center py-8">
              <div className="size-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
