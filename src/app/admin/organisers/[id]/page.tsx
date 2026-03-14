"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Users,
  TrendingUp,
  DollarSign,
  MapPin,
  Edit,
  Eye,
  MoreVertical,
  CheckCircle,
  XCircle,
  Globe,
  Clock,
  AlertTriangle,
  Search,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/api";
import { useToast } from "@/contexts/toast-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import Link from "next/link";

interface Organiser {
  id: string;
  name: string;
  description?: string;
  logoUrl?: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  owner?: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    activeRole: string;
    status: string;
  };
  eventsCount: number;
  activeEventsCount: number;
  totalRevenue: number;
  lastEventDate?: string;
  metadata?: {
    status?: "active" | "suspended" | "inactive";
    statusReason?: string;
    [key: string]: any;
  };
}

interface Event {
  id: string;
  title: string;
  slug: string;
  description?: string;
  status:
    | "DRAFT"
    | "PENDING_APPROVAL"
    | "APPROVED"
    | "REJECTED"
    | "PUBLISHED"
    | "CANCELLED"
    | "COMPLETED";
  visibility: "PUBLIC" | "PRIVATE" | "UNLISTED";
  startsAt: string;
  endsAt: string;
  createdAt: string;
  venue?: {
    name: string;
    address?: string;
  };
  ticketTypes?: Array<{
    name: string;
    priceCents: number;
    quantity: number;
    sold: number;
  }>;
}

export default function OrganiserDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const [organiser, setOrganiser] = useState<Organiser | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [loadingMoreEvents, setLoadingMoreEvents] = useState(false);
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [actionType, setActionType] = useState<
    "publish" | "unpublish" | "approve" | "reject" | null
  >(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [actionReason, setActionReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Events pagination and filtering
  const [eventsPage, setEventsPage] = useState(1);
  const [hasMoreEvents, setHasMoreEvents] = useState(false);
  const [eventsSearchQuery, setEventsSearchQuery] = useState("");
  const [eventsStatusFilter, setEventsStatusFilter] = useState<string>("all");
  const [totalEvents, setTotalEvents] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const toast = useToast();

  const loadOrganiser = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<Organiser>(
        `/admin/organisers/${id}`,
      );
      setOrganiser(response);
    } catch (error: any) {
      console.error("Failed to load organiser:", error);
      toast.error("Error", error.message || "Failed to load organiser");
    } finally {
      setLoading(false);
    }
  };

  const loadEvents = async (reset = false) => {
    try {
      if (reset) {
        setEventsLoading(true);
      } else {
        setLoadingMoreEvents(true);
      }

      const currentPage = reset ? 1 : eventsPage;
      const params: any = {
        page: currentPage,
        limit: 20,
      };

      if (eventsSearchQuery.trim()) {
        params.search = eventsSearchQuery.trim();
      }

      if (eventsStatusFilter !== "all") {
        params.status = eventsStatusFilter.toUpperCase();
      }

      // First try to get events without search to see if organiser exists
      if (eventsSearchQuery.trim() && reset) {
        try {
          // Test query without search first to validate organiser
          await apiClient.get(`/admin/organisers/${id}/events`, {
            page: 1,
            limit: 1,
          });
        } catch (testError: any) {
          console.error("Organiser events endpoint not available:", testError);
          throw new Error("Unable to load events for this organiser");
        }
      }

      const response = await apiClient.get<{
        data: Event[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      }>(`/admin/organisers/${id}/events`, params);

      if (reset) {
        setEvents(response.data || []);
        setEventsPage(currentPage);
      } else {
        setEvents((prev) => [...prev, ...(response.data || [])]);
      }

      setTotalEvents(response.total || 0);
      setHasMoreEvents(
        (response.page || currentPage) < (response.totalPages || 1),
      );
    } catch (error: any) {
      console.error("Failed to load events:", error);

      // More specific error handling
      let errorMessage = "Failed to load events";
      if (error.statusCode === 500) {
        errorMessage = "Server error occurred. Please try again.";
        console.warn("Server error when loading events:", error);
      } else if (error.statusCode === 404) {
        errorMessage = "Organiser not found or has no events";
      } else if (error.statusCode === 0) {
        errorMessage =
          "Cannot connect to server. Please check your connection.";
      }

      // Only show toast if it's not a retry attempt
      if (!eventsSearchQuery.trim() || reset) {
        toast.error("Error", errorMessage);
      }
      if (reset) {
        setEvents([]);
        setEventsPage(1);
        setHasMoreEvents(false);
        setTotalEvents(0);
      }
    } finally {
      if (reset) {
        setEventsLoading(false);
      } else {
        setLoadingMoreEvents(false);
      }
    }
  };

  useEffect(() => {
    if (id) {
      loadOrganiser();
      loadEvents(true);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      const timer = setTimeout(
        () => {
          setEventsPage(1);
          loadEvents(true);
        },
        eventsSearchQuery ? 800 : 0, // Increased debounce to reduce 500 errors
      ); // Debounce search

      return () => clearTimeout(timer);
    }
  }, [eventsSearchQuery, eventsStatusFilter, id]);

  useEffect(() => {
    if (eventsPage > 1) {
      loadEvents(false);
    }
  }, [eventsPage]);

  const handleLoadMoreEvents = () => {
    if (!eventsLoading && !loadingMoreEvents && hasMoreEvents) {
      setEventsPage((prev) => prev + 1);
    }
  };

  const handleRefreshEvents = async () => {
    setRefreshing(true);
    try {
      await loadEvents(true);
      toast.success("Success", "Events refreshed successfully");
    } catch (error: any) {
      console.error("Failed to refresh events:", error);
      toast.error("Error", "Failed to refresh events");
    } finally {
      setRefreshing(false);
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-300">
            Active
          </Badge>
        );
      case "suspended":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-300">
            Suspended
          </Badge>
        );
      case "inactive":
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-300">
            Inactive
          </Badge>
        );
      default:
        return (
          <Badge className="bg-green-100 text-green-800 border-green-300">
            Active
          </Badge>
        );
    }
  };

  const getEventStatusBadge = (status: string) => {
    const statusMap = {
      DRAFT: {
        color: "bg-gray-100 text-gray-800 border-gray-300",
        label: "Draft",
      },
      PENDING_APPROVAL: {
        color: "bg-yellow-100 text-yellow-800 border-yellow-300",
        label: "Pending",
      },
      APPROVED: {
        color: "bg-blue-100 text-blue-800 border-blue-300",
        label: "Approved",
      },
      REJECTED: {
        color: "bg-red-100 text-red-800 border-red-300",
        label: "Rejected",
      },
      PUBLISHED: {
        color: "bg-green-100 text-green-800 border-green-300",
        label: "Published",
      },
      CANCELLED: {
        color: "bg-red-100 text-red-800 border-red-300",
        label: "Cancelled",
      },
      COMPLETED: {
        color: "bg-purple-100 text-purple-800 border-purple-300",
        label: "Completed",
      },
    };

    const config =
      statusMap[status as keyof typeof statusMap] || statusMap.DRAFT;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const handleEventAction = (
    event: Event,
    action: "publish" | "unpublish" | "approve" | "reject",
  ) => {
    setSelectedEvent(event);
    setActionType(action);
    setActionReason("");
    setActionModalOpen(true);
  };

  const handleSubmitAction = async () => {
    if (!selectedEvent || !actionType) return;

    try {
      setSubmitting(true);

      let endpoint = "";
      let body: any = {};

      switch (actionType) {
        case "publish":
          endpoint = `/admin/organisers/${id}/events/${selectedEvent.id}/publish`;
          break;
        case "unpublish":
          endpoint = `/admin/organisers/${id}/events/${selectedEvent.id}/unpublish`;
          body = { reason: actionReason };
          break;
        case "approve":
          endpoint = `/admin/organisers/${id}/events/${selectedEvent.id}/approve`;
          body = { notes: actionReason };
          break;
        case "reject":
          endpoint = `/admin/organisers/${id}/events/${selectedEvent.id}/reject`;
          body = { reason: actionReason };
          break;
      }

      await apiClient.post(endpoint, body);

      toast.success("Success", `Event ${actionType}d successfully`);
      setActionModalOpen(false);
      loadEvents(true); // Reload events to reflect changes
    } catch (error: any) {
      console.error(`Failed to ${actionType} event:`, error);
      toast.error("Error", error.message || `Failed to ${actionType} event`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-32 animate-pulse bg-slate-200 rounded"></div>
        <div className="space-y-4">
          <div className="h-32 animate-pulse bg-slate-200 rounded-2xl"></div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-24 animate-pulse bg-slate-200 rounded-2xl"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!organiser) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h2 className="text-xl font-semibold text-slate-900">
          Organiser not found
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          The organiser you're looking for doesn't exist or has been deleted.
        </p>
        <Link href="/admin/organisers">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="mr-2 size-4" />
            Back to Organisers
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/organisers">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Organiser Details
          </h1>
          <p className="text-sm text-slate-600">
            Manage organiser profile and events
          </p>
        </div>
      </div>

      {/* Organiser Info Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4 flex-1">
            {organiser.logoUrl ? (
              <img
                src={organiser.logoUrl}
                alt={organiser.name}
                className="size-20 rounded-xl object-cover"
              />
            ) : (
              <div className="flex size-20 items-center justify-center rounded-xl bg-gradient-to-br from-slate-900 to-slate-700">
                <span className="text-xl font-bold text-white">
                  {organiser.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold text-slate-900">
                  {organiser.name}
                </h2>
                {getStatusBadge(organiser.metadata?.status)}
              </div>
              {organiser.description && (
                <p className="text-sm text-slate-600">
                  {organiser.description}
                </p>
              )}
              <div className="grid grid-cols-1 gap-2 text-sm text-slate-600 sm:grid-cols-2">
                <div>
                  <span className="font-medium">Owner:</span>{" "}
                  {organiser.owner?.firstName} {organiser.owner?.lastName}
                </div>
                <div>
                  <span className="font-medium">Email:</span>{" "}
                  {organiser.owner?.email}
                </div>
                <div>
                  <span className="font-medium">User Role:</span>{" "}
                  {organiser.owner?.activeRole}
                </div>
                <div>
                  <span className="font-medium">Created:</span>{" "}
                  {new Date(organiser.createdAt).toLocaleDateString()}
                </div>
              </div>
              {organiser.metadata?.statusReason && (
                <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-3">
                  <p className="text-sm text-yellow-800">
                    <span className="font-medium">Status Reason:</span>{" "}
                    {organiser.metadata.statusReason}
                  </p>
                </div>
              )}
            </div>
          </div>
          <Link href={`/admin/organisers/${organiser.id}/edit`}>
            <Button variant="outline">
              <Edit className="mr-2 size-4" />
              Edit
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-100 p-3">
              <Calendar className="size-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {organiser.eventsCount}
              </p>
              <p className="text-sm text-slate-600">Total Events</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-green-100 p-3">
              <TrendingUp className="size-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {organiser.activeEventsCount}
              </p>
              <p className="text-sm text-slate-600">Active Events</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-purple-100 p-3">
              <DollarSign className="size-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                KES {organiser.totalRevenue.toLocaleString()}
              </p>
              <p className="text-sm text-slate-600">Total Revenue</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-orange-100 p-3">
              <Clock className="size-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">
                {organiser.lastEventDate
                  ? new Date(organiser.lastEventDate).toLocaleDateString()
                  : "No events"}
              </p>
              <p className="text-sm text-slate-600">Last Event</p>
            </div>
          </div>
        </div>
      </div>

      {/* Events Section */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                Events
                {!eventsLoading && !refreshing && (
                  <span className="ml-2 text-base font-normal text-slate-500">
                    ({totalEvents})
                  </span>
                )}
              </h3>
              <p className="text-sm text-slate-600">
                {!eventsLoading && !refreshing && (
                  <>
                    Showing {events.length} of {totalEvents} events
                    {eventsSearchQuery.trim() && (
                      <span> for "{eventsSearchQuery.trim()}"</span>
                    )}
                    {eventsStatusFilter !== "all" && (
                      <span> with status "{eventsStatusFilter}"</span>
                    )}
                  </>
                )}
                {(eventsLoading || refreshing) && (
                  <span>Loading events...</span>
                )}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshEvents}
                disabled={refreshing || eventsLoading}
              >
                {refreshing ? (
                  <>
                    <div className="animate-spin mr-2 size-4 border-2 border-slate-300 border-t-slate-600 rounded-full"></div>
                    Refreshing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 size-4" />
                    Refresh
                  </>
                )}
              </Button>
              <Link href={`/admin/organisers/${organiser?.id}/analytics`}>
                <Button variant="outline" size="sm">
                  View Analytics
                </Button>
              </Link>
            </div>
          </div>

          {/* Events Filters */}
          <div className="flex flex-col gap-3 mt-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                type="text"
                placeholder="Search events by title or description..."
                value={eventsSearchQuery}
                onChange={(e) => setEventsSearchQuery(e.target.value)}
                className="pl-10 pr-10"
                disabled={eventsLoading || refreshing}
              />
              {eventsSearchQuery && (
                <button
                  onClick={() => setEventsSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 disabled:opacity-50"
                  disabled={eventsLoading || refreshing}
                >
                  <svg
                    className="size-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>

            <Select
              value={eventsStatusFilter}
              onValueChange={(value: string) => setEventsStatusFilter(value)}
              disabled={eventsLoading || refreshing}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="pending_approval">
                  Pending Approval
                </SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Search Loading Indicator */}
          {(eventsLoading || refreshing) && (
            <div className="flex items-center justify-center gap-2 mt-3 py-2">
              <div className="animate-spin size-4 border-2 border-slate-300 border-t-slate-600 rounded-full"></div>
              <span className="text-sm text-slate-500">
                {refreshing ? "Refreshing events..." : "Searching events..."}
              </span>
            </div>
          )}
        </div>

        {eventsLoading && events.length === 0 ? (
          <div className="p-6 space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-20 animate-pulse bg-slate-200 rounded-xl"
              ></div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="mx-auto size-12 text-slate-300" />
            <p className="mt-4 text-lg font-semibold text-slate-900">
              No events found
            </p>
            <p className="mt-2 text-sm text-slate-600">
              {eventsSearchQuery.trim() || eventsStatusFilter !== "all"
                ? "No events match your search criteria. Try adjusting your filters."
                : "This organiser hasn't created any events yet."}
            </p>
            {(eventsSearchQuery.trim() || eventsStatusFilter !== "all") && (
              <div className="flex gap-2 mt-4 justify-center">
                {eventsSearchQuery.trim() && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEventsSearchQuery("")}
                  >
                    Clear search
                  </Button>
                )}
                {eventsStatusFilter !== "all" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEventsStatusFilter("all")}
                  >
                    Clear status filter
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEventsSearchQuery("");
                    setEventsStatusFilter("all");
                    setTimeout(() => loadEvents(true), 100);
                  }}
                >
                  Reset All Filters
                </Button>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="p-6 space-y-4">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-slate-900">
                          {event.title}
                        </h4>
                        {getEventStatusBadge(event.status)}
                        {event.visibility === "PRIVATE" && (
                          <Badge variant="outline" className="text-xs">
                            Private
                          </Badge>
                        )}
                      </div>
                      {event.description && (
                        <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                          {event.description}
                        </p>
                      )}
                      <div className="grid grid-cols-1 gap-2 text-xs text-slate-600 sm:grid-cols-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="size-3" />
                          {new Date(event.startsAt).toLocaleDateString()}
                        </div>
                        {event.venue && (
                          <div className="flex items-center gap-1">
                            <MapPin className="size-3" />
                            {event.venue.name}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Users className="size-3" />
                          {event.ticketTypes?.reduce(
                            (sum, tt) => sum + (tt.sold || 0),
                            0,
                          ) || 0}{" "}
                          sold
                        </div>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/events/${event.slug}`} target="_blank">
                            <Eye className="mr-2 size-4" />
                            View Public Page
                          </Link>
                        </DropdownMenuItem>
                        {event.status === "APPROVED" && (
                          <DropdownMenuItem
                            onClick={() => handleEventAction(event, "publish")}
                          >
                            <Globe className="mr-2 size-4" />
                            Publish Event
                          </DropdownMenuItem>
                        )}
                        {event.status === "PUBLISHED" && (
                          <DropdownMenuItem
                            onClick={() =>
                              handleEventAction(event, "unpublish")
                            }
                          >
                            <AlertTriangle className="mr-2 size-4" />
                            Unpublish Event
                          </DropdownMenuItem>
                        )}
                        {event.status === "PENDING_APPROVAL" && (
                          <>
                            <DropdownMenuItem
                              onClick={() =>
                                handleEventAction(event, "approve")
                              }
                            >
                              <CheckCircle className="mr-2 size-4" />
                              Approve Event
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleEventAction(event, "reject")}
                            >
                              <XCircle className="mr-2 size-4" />
                              Reject Event
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More Button */}
            {hasMoreEvents && (
              <div className="flex justify-center p-6 border-t border-slate-200">
                <Button
                  variant="outline"
                  onClick={handleLoadMoreEvents}
                  disabled={eventsLoading || loadingMoreEvents}
                  className="min-w-[120px]"
                >
                  {loadingMoreEvents ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin size-4 border-2 border-slate-300 border-t-slate-600 rounded-full"></div>
                      Loading...
                    </div>
                  ) : (
                    "Load More Events"
                  )}
                </Button>
              </div>
            )}

            {!hasMoreEvents && events.length > 0 && (
              <div className="text-center text-sm text-slate-500 py-4 border-t border-slate-200">
                No more events to load
              </div>
            )}
          </>
        )}
      </div>

      {/* Action Modal */}
      <Dialog open={actionModalOpen} onOpenChange={setActionModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {actionType === "publish" && "Publish Event"}
              {actionType === "unpublish" && "Unpublish Event"}
              {actionType === "approve" && "Approve Event"}
              {actionType === "reject" && "Reject Event"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "publish" &&
                "This will make the event visible to the public and available for ticket sales."}
              {actionType === "unpublish" &&
                "This will hide the event from public view. Please provide a reason."}
              {actionType === "approve" &&
                "This will approve the event and allow the organiser to publish it."}
              {actionType === "reject" &&
                "This will reject the event submission. Please provide a reason."}
            </DialogDescription>
          </DialogHeader>

          {selectedEvent && (
            <div className="space-y-4">
              <div className="rounded-lg border border-slate-200 p-3">
                <p className="font-medium text-slate-900">
                  {selectedEvent.title}
                </p>
                <p className="text-sm text-slate-600">
                  {new Date(selectedEvent.startsAt).toLocaleDateString()}
                </p>
              </div>

              {(actionType === "unpublish" ||
                actionType === "approve" ||
                actionType === "reject") && (
                <div className="space-y-2">
                  <Label>
                    {actionType === "approve" ? "Notes (Optional)" : "Reason"}
                    {actionType === "reject" && (
                      <span className="text-red-500"> *</span>
                    )}
                  </Label>
                  <Textarea
                    value={actionReason}
                    onChange={(e) => setActionReason(e.target.value)}
                    placeholder={
                      actionType === "unpublish"
                        ? "Why is this event being unpublished?"
                        : actionType === "approve"
                          ? "Add any notes for the organiser..."
                          : "Why is this event being rejected?"
                    }
                    rows={3}
                  />
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setActionModalOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitAction}
                  disabled={
                    submitting ||
                    (actionType === "reject" && !actionReason.trim())
                  }
                  className={`flex-1 ${
                    actionType === "publish" || actionType === "approve"
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : actionType === "unpublish" || actionType === "reject"
                        ? "bg-red-600 hover:bg-red-700 text-white"
                        : ""
                  }`}
                >
                  {submitting
                    ? "Processing..."
                    : actionType === "publish"
                      ? "Publish"
                      : actionType === "unpublish"
                        ? "Unpublish"
                        : actionType === "approve"
                          ? "Approve"
                          : "Reject"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
