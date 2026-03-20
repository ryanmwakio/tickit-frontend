"use client";

import { useState, useMemo, useEffect } from "react";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/contexts/toast-context";
import {
  Calendar,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Search,
  Filter,
  Globe,
  Lock,
  AlertCircle,
  CheckCircle2,
  Clock,
  MapPin,
  Users,
  DollarSign,
  Image as ImageIcon,
  Download,
  Copy,
  MoreVertical,
  Star,
  Activity,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Link from "next/link";

type EventStatus = "draft" | "published" | "live" | "ended" | "cancelled" | "pending_approval" | "approved" | "rejected" | "completed";

type AdminEvent = {
  id: string;
  title: string;
  slug: string;
  organizer: string;
  organizerId: string;
  status: EventStatus;
  visibility: "public" | "private" | "unlisted";
  startDate: string;
  endDate: string;
  location: string;
  category: string;
  ticketTypes: number;
  ticketsSold: number;
  totalCapacity: number;
  revenue: number;
  coverImage?: string;
  createdAt: string;
  lastModified: string;
  fraudScore?: number;
  complianceIssues: string[];
  featured?: boolean;
  livePulse?: boolean;
  hotRightNow?: boolean;
};

const mockEvents: AdminEvent[] = [
  {
    id: "event-1",
    title: "Nairobi Music Festival 2024",
    slug: "nairobi-music-festival-2024",
    organizer: "Flamingo Live",
    organizerId: "org-1",
    status: "published",
    visibility: "public",
    startDate: "2024-03-15",
    endDate: "2024-03-17",
    location: "Nairobi, Kenya",
    category: "Music",
    ticketTypes: 5,
    ticketsSold: 450,
    totalCapacity: 2000,
    revenue: 2250000,
    createdAt: "2024-01-01",
    lastModified: "2024-03-10",
    complianceIssues: [],
  },
  {
    id: "event-2",
    title: "Suspicious Tech Conference",
    slug: "suspicious-tech-conference",
    organizer: "Unknown Organizer",
    organizerId: "org-2",
    status: "pending_approval",
    visibility: "public",
    startDate: "2024-04-20",
    endDate: "2024-04-20",
    location: "Nairobi, Kenya",
    category: "Technology",
    ticketTypes: 3,
    ticketsSold: 0,
    totalCapacity: 500,
    revenue: 0,
    createdAt: "2024-03-14",
    lastModified: "2024-03-14",
    fraudScore: 0.85,
    complianceIssues: ["Unverified organizer", "Suspicious pricing pattern"],
  },
];

export function EventManagement() {
  const { user } = useAuth();
  const toast = useToast();
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [displayedCount, setDisplayedCount] = useState(9);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "flagged" | "featured" | "live">("all");
  const [eventStats, setEventStats] = useState<{
    total: number;
    published: number;
    featured: number;
    livePulse: number;
    pending: number;
    flagged: number;
    totalRevenue: number;
  } | null>(null);

  const [organisers, setOrganisers] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedOrganiserId, setSelectedOrganiserId] = useState<string | null>(null);
  const [generatingEvents, setGeneratingEvents] = useState(false);
  const [generationProgress, setGenerationProgress] = useState<{
    created: number;
    total: number;
  } | null>(null);

  useEffect(() => {
    if (user) {
      loadEventStats();
      loadEvents(true);
      loadOrganisersForGeneration();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (user) {
      loadEvents(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, searchQuery, statusFilter, activeTab]);

  const loadEventStats = async () => {
    if (!user) return;
    try {
      const stats = await apiClient.get<{
        total: number;
        published: number;
        featured: number;
        livePulse: number;
        pending: number;
        flagged: number;
        totalRevenue: number;
      }>('/admin/events/stats');
      setEventStats(stats);
    } catch (error) {
      console.error('Failed to load event stats:', error);
    }
  };

  const loadOrganisersForGeneration = async () => {
    try {
      const response = await apiClient.get<any>(`/admin/organisers`, {
        page: 1,
        limit: 50,
        sortBy: "createdAt",
        sortOrder: "desc",
      });

      const list = Array.isArray(response?.data) ? response.data : [];
      setOrganisers(
        list
          .map((o: any) => ({ id: String(o.id), name: String(o.name) }))
          .filter((o: any) => o.id && o.name),
      );
      setSelectedOrganiserId((prev) => prev ?? list[0]?.id ?? null);
    } catch (error: any) {
      console.error("Failed to load organisers:", error);
      toast.error("Failed", error?.message || "Failed to load organisers");
    }
  };

  const loadEvents = async (reset: boolean = true) => {
    if (!user) return;
    try {
      if (reset) {
        setLoading(true);
        setDisplayedCount(9);
      } else {
        setLoadingMore(true);
      }

      const page = reset ? 1 : Math.floor(displayedCount / 9) + 1;
      let status = statusFilter !== "all" ? statusFilter.toUpperCase() : undefined;
      let featured: boolean | undefined;
      let livePulse: boolean | undefined;
      
      // Handle tab-specific filters
      if (activeTab === "pending") {
        status = "PENDING_APPROVAL";
      } else if (activeTab === "featured") {
        featured = true;
      } else if (activeTab === "live") {
        livePulse = true;
      }
      
      const url = `/admin/events?page=${page}&limit=9${status ? `&status=${status}` : ''}${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ''}${featured !== undefined ? `&featured=${featured}` : ''}${livePulse !== undefined ? `&livePulse=${livePulse}` : ''}`;
      console.log('Loading events from:', url);
      
      const response = await apiClient.get<{
        data: Array<{
          id: string;
          title: string;
          slug: string;
          organiser?: { name: string; id: string };
          status: string;
          visibility?: string;
          startsAt: string;
          endsAt: string;
          venue?: { name: string; city?: string; country?: string };
          category?: string;
          ticketTypes?: Array<any>;
          createdAt: string;
          updatedAt: string;
          featured?: boolean;
          livePulse?: boolean;
          hotRightNow?: boolean;
        }>;
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      }>(url);

      console.log('Events response:', response);
      console.log('Response type:', Array.isArray(response) ? 'Array' : typeof response);
      console.log('Response keys:', Array.isArray(response) ? 'N/A (array)' : Object.keys(response));

      // Handle response format - apiClient now preserves pagination for paginated responses
      let eventsData: any[] = [];
      let responseTotal = 0;
      let responsePage = page;
      let responseLimit = 9;
      let responseTotalPages = 0;

      if (Array.isArray(response)) {
        // Response is directly an array (non-paginated or old format)
        eventsData = response;
        responseTotal = response.length;
        responseTotalPages = Math.ceil(responseTotal / responseLimit);
      } else if (response && typeof response === 'object' && 'data' in response) {
        // Response is a paginated object with data and pagination
        eventsData = Array.isArray(response.data) ? response.data : [];
        responseTotal = response.total || eventsData.length;
        responsePage = response.page || page;
        responseLimit = response.limit || 9;
        responseTotalPages = response.totalPages || Math.ceil(responseTotal / responseLimit);
      }

      console.log('Events data:', eventsData, 'Count:', eventsData.length);
      console.log('Pagination:', { total: responseTotal, page: responsePage, limit: responseLimit, totalPages: responseTotalPages });

      // Map events - stats will be calculated separately if needed
      const mappedEvents: AdminEvent[] = eventsData.map((e) => ({
        id: e.id,
        title: e.title,
        slug: e.slug,
        organizer: e.organiser?.name || 'Unknown',
        organizerId: e.organiser?.id || '',
        status: (e.status?.toLowerCase().replace(/-/g, '_') as EventStatus) || 'draft',
        visibility: (e.visibility as "public" | "private" | "unlisted") || 'public',
        startDate: e.startsAt,
        endDate: e.endsAt,
        featured: e.featured || false,
        livePulse: e.livePulse || false,
        hotRightNow: e.hotRightNow || false,
        location: e.venue ? `${e.venue.city || ''}, ${e.venue.country || ''}`.trim() : 'TBD',
        category: e.category || 'Other',
        ticketTypes: e.ticketTypes?.length || 0,
        ticketsSold: 0, // Will be calculated if needed
        totalCapacity: 0,
        revenue: 0, // Will be calculated if needed
        createdAt: e.createdAt,
        lastModified: e.updatedAt,
        complianceIssues: [],
      }));

      if (reset) {
        setEvents(mappedEvents);
      } else {
        setEvents(prev => [...prev, ...mappedEvents]);
      }

      setHasMore(responseTotal > displayedCount + mappedEvents.length);
    } catch (error) {
      console.error('Failed to load events:', error);
      console.error('Error details:', error instanceof Error ? error.message : error);
      toast.error('Failed', error instanceof Error ? error.message : 'Failed to load events');
      if (reset) {
        setEvents([]);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    setDisplayedCount(prev => prev + 9);
    loadEvents(false);
  };

  const handleExport = () => {
    const csv = [
      ['Title', 'Organizer', 'Status', 'Start Date', 'End Date', 'Location', 'Category', 'Tickets Sold', 'Revenue'],
      ...filteredEvents.map((e) => [
        e.title,
        e.organizer,
        e.status,
        e.startDate,
        e.endDate,
        e.location,
        e.category,
        e.ticketsSold.toString(),
        (e.revenue / 100).toLocaleString(),
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin-events-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Exported', 'Events exported to CSV');
  };

  const filteredEvents = events; // Already filtered by API

  const handleGenerateRandomEvents = async () => {
    if (generatingEvents) return;
    setGeneratingEvents(true);
    setGenerationProgress(null);

    try {
      const token = apiClient.getAccessToken();
      if (!token) {
        toast.error("Not authenticated", "Please login to generate events.");
        return;
      }

      const API_BASE_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

      const qs = new URLSearchParams();
      if (selectedOrganiserId) qs.set("organiserId", selectedOrganiserId);
      qs.set("count", "1000");

      const url = `${API_BASE_URL}/admin/events/generate-random/stream?${qs.toString()}`;

      const res = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "text/event-stream",
        },
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(
          text || `Failed to start generation (HTTP ${res.status})`,
        );
      }

      const reader = res.body?.getReader();
      if (!reader) {
        throw new Error("Missing response body from SSE endpoint");
      }

      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      let lastCreated = 0;
      let lastTotal = 1000;

      const handleBlock = (block: string) => {
        const trimmed = block.trim();
        if (!trimmed) return;

        const lines = trimmed.split("\n");
        const dataLines = lines
          .filter((l) => l.startsWith("data:"))
          .map((l) => l.replace(/^data:\s?/, ""));
        if (dataLines.length === 0) return;

        const payload = JSON.parse(dataLines.join("\n"));
        if (payload?.type === "progress") {
          lastCreated = payload.created;
          lastTotal = payload.total;
          setGenerationProgress({ created: payload.created, total: payload.total });
        }
        if (payload?.type === "done") {
          lastCreated = payload.created;
          lastTotal = payload.total;
          setGenerationProgress({ created: payload.created, total: payload.total });
        }
      };

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        // SSE event blocks are separated by a blank line.
        let boundaryIndex = buffer.indexOf("\n\n");
        while (boundaryIndex !== -1) {
          const block = buffer.slice(0, boundaryIndex);
          buffer = buffer.slice(boundaryIndex + 2);
          handleBlock(block);
          boundaryIndex = buffer.indexOf("\n\n");
        }
      }

      toast.success("Events generated", `Created ${lastCreated} events.`);
      loadEvents(true);
      loadEventStats();
    } catch (error: any) {
      console.error("Failed to generate events:", error);
      toast.error("Failed", error?.message || "Failed to generate events");
    } finally {
      setGeneratingEvents(false);
    }
  };

  const stats = useMemo(() => {
    if (eventStats) {
      return {
        total: eventStats.total,
        published: eventStats.published,
        pending: eventStats.pending,
        flagged: eventStats.flagged,
        featured: eventStats.featured,
        live: eventStats.livePulse,
        totalRevenue: eventStats.totalRevenue,
      };
    }
    // Fallback to calculated stats from current events
    return {
      total: events.length,
      published: events.filter((e) => e.status === "published" || e.status === "live").length,
      pending: events.filter((e) => e.status === "pending_approval").length,
      flagged: events.filter((e) => (e.fraudScore && e.fraudScore > 0.7) || e.complianceIssues.length > 0).length,
      featured: events.filter((e) => e.featured).length,
      live: events.filter((e) => e.livePulse).length,
      totalRevenue: events.reduce((sum, e) => sum + e.revenue, 0),
    };
  }, [events, eventStats]);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-7">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-sm text-slate-600">Total Events</div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{stats.total}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-sm text-slate-600">Published</div>
          <p className="mt-2 text-2xl font-bold text-green-600">{stats.published}</p>
        </div>
        <div className="rounded-xl border-2 border-yellow-300 bg-yellow-50 p-4">
          <div className="flex items-center gap-1 text-sm text-slate-600">
            <Star className="size-3 fill-yellow-400 text-yellow-400" />
            Featured
          </div>
          <p className="mt-2 text-2xl font-bold text-yellow-700">{stats.featured}</p>
        </div>
        <div className="rounded-xl border-2 border-green-300 bg-green-50 p-4">
          <div className="flex items-center gap-1 text-sm text-slate-600">
            <Activity className="size-3 text-green-600" />
            Live Pulse
          </div>
          <p className="mt-2 text-2xl font-bold text-green-700">{stats.live}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-sm text-slate-600">Pending Approval</div>
          <p className="mt-2 text-2xl font-bold text-amber-600">{stats.pending}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-sm text-slate-600">Flagged</div>
          <p className="mt-2 text-2xl font-bold text-red-600">{stats.flagged}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-sm text-slate-600">Total Revenue</div>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            KES {(stats.totalRevenue / 1000000).toFixed(1)}M
          </p>
        </div>
      </div>

      {/* Generate Events */}
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-slate-900">
              Generate Random Events
            </h3>
            <p className="text-sm text-slate-600">
              Creates 1000 draft events for today or future (never in the past),
              tied to an organiser.
            </p>
          </div>

          <Button
            onClick={handleGenerateRandomEvents}
            disabled={generatingEvents}
            className="sm:min-w-[220px]"
          >
            {generatingEvents ? "Generating..." : "Generate 1000 events"}
          </Button>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full sm:flex-1">
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Organiser
            </label>
            <Select
              value={selectedOrganiserId ?? "random"}
              onValueChange={(value) => {
                setSelectedOrganiserId(value === "random" ? null : value);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose organiser" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="random">Random organiser</SelectItem>
                {organisers.map((org) => (
                  <SelectItem key={org.id} value={org.id}>
                    {org.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {generatingEvents && generationProgress && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>Generating events…</span>
              <span>
                {generationProgress.created}/{generationProgress.total}
              </span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full bg-indigo-600 transition-[width] duration-200"
                style={{
                  width: `${Math.min(
                    100,
                    Math.round(
                      (generationProgress.created / generationProgress.total) * 100,
                    ),
                  )}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">All Events</TabsTrigger>
            <TabsTrigger value="featured">
              <Star className="mr-1 size-3 fill-yellow-400 text-yellow-400" />
              Featured ({stats.featured})
            </TabsTrigger>
            <TabsTrigger value="live">
              <Activity className="mr-1 size-3 text-green-600" />
              Live ({stats.live})
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending Approval ({stats.pending})
            </TabsTrigger>
            <TabsTrigger value="flagged">
              Flagged ({stats.flagged})
            </TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="mr-2 size-4" />
              Export
            </Button>
          </div>
        </div>

        <TabsContent value={activeTab} className="mt-6">
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search events, organizers, locations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="live">Live</SelectItem>
                  <SelectItem value="pending_approval">Pending Approval</SelectItem>
                  <SelectItem value="ended">Ended</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {Array.from(new Set(events.map(e => e.category).filter(Boolean))).map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Events Grid */}
            {loading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="h-40 w-full animate-pulse bg-slate-200 rounded-lg mb-4" />
                    <div className="space-y-2">
                      <div className="h-5 w-3/4 animate-pulse bg-slate-200 rounded" />
                      <div className="h-4 w-1/2 animate-pulse bg-slate-200 rounded" />
                      <div className="flex gap-2">
                        <div className="h-6 w-20 animate-pulse bg-slate-200 rounded-full" />
                        <div className="h-6 w-24 animate-pulse bg-slate-200 rounded-full" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredEvents.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>

                {hasMore && (
                  <div className="flex justify-center pt-4">
                    <Button
                      variant="outline"
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                    >
                      {loadingMore ? (
                        <>
                          <div className="mr-2 size-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
                          Loading...
                        </>
                      ) : (
                        'Load More'
                      )}
                    </Button>
                  </div>
                )}

                {filteredEvents.length === 0 && !loadingMore && (
                  <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-12 text-center">
                    <Calendar className="mx-auto size-12 text-slate-300" />
                    <p className="mt-4 text-lg font-semibold text-slate-900">No events found</p>
                  </div>
                )}
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function EventCard({ event }: { event: AdminEvent }) {
  const toast = useToast();
  
  // Determine card styling based on featured/live status
  const cardClassName = event.featured && event.livePulse
    ? "rounded-xl border-2 border-yellow-300 bg-gradient-to-br from-yellow-50 to-green-50 p-6 transition hover:shadow-lg"
    : event.featured
    ? "rounded-xl border-2 border-yellow-300 bg-yellow-50 p-6 transition hover:shadow-lg"
    : event.livePulse
    ? "rounded-xl border-2 border-green-300 bg-green-50 p-6 transition hover:shadow-lg"
    : "rounded-xl border border-slate-200 bg-white p-6 transition hover:shadow-lg";

  const handleToggleFeatured = async () => {
    try {
      if (event.featured) {
        // Remove featured status
        await apiClient.delete(`/admin/events/${event.id}/featured`);
        toast.success('Updated', 'Event removed from featured status');
      } else {
        // Set as featured
        await apiClient.put(`/admin/events/${event.id}/featured`, {
          featured: true,
        });
        toast.success('Updated', 'Event set as featured');
      }
      // Reload events after a short delay to show the toast
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      toast.error('Failed', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const handleToggleLivePulse = async () => {
    try {
      const newLivePulse = !event.livePulse;
      await apiClient.put(`/admin/events/${event.id}/live-pulse`, {
        livePulse: newLivePulse,
      });
      toast.success('Updated', `Event ${newLivePulse ? 'set as' : 'removed from'} live pulse`);
      // Reload events after a short delay to show the toast
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      toast.error('Failed', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  return (
    <div className={cardClassName}>
      <div className="mb-4 flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-slate-900">{event.title}</h3>
            {event.featured && (
              <Star className="size-4 fill-yellow-400 text-yellow-400" />
            )}
            {event.livePulse && (
              <Activity className="size-4 text-green-500" />
            )}
            {event.hotRightNow && (
              <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-700">
                Hot
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-slate-600">{event.organizer}</p>
        </div>
        <div className="flex items-center gap-2">
          {event.visibility === "public" ? (
            <Globe className="size-4 text-green-600" />
          ) : (
            <Lock className="size-4 text-slate-400" />
          )}
          {event.fraudScore && event.fraudScore > 0.7 && (
            <AlertCircle className="size-4 text-red-600" />
          )}
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-slate-600">
          <MapPin className="size-4" />
          <span>{event.location}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-600">
          <Calendar className="size-4" />
          <span>{new Date(event.startDate).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-600">
          <Users className="size-4" />
          <span>
            {event.ticketsSold} / {event.totalCapacity} tickets
          </span>
        </div>
        <div className="flex items-center gap-2 text-slate-600">
          <DollarSign className="size-4" />
          <span>KES {event.revenue.toLocaleString()}</span>
        </div>
      </div>

      {event.complianceIssues.length > 0 && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-xs font-semibold text-red-900">Compliance Issues:</p>
          <ul className="mt-1 space-y-1">
            {event.complianceIssues.map((issue, idx) => (
              <li key={idx} className="text-xs text-red-700">
                • {issue}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between">
          <StatusBadge status={event.status} />
          <div className="flex gap-2">
            <Link 
              href={`/events/${event.slug}`} 
              target="_blank"
              className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
            >
              <Eye className="size-4" />
            </Link>
            <Button variant="outline" size="sm">
              <Edit2 className="size-4" />
            </Button>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant={event.featured ? "default" : "outline"}
            size="sm"
            onClick={handleToggleFeatured}
            className={`flex-1 ${event.featured ? 'bg-yellow-600 hover:bg-yellow-700 text-white' : ''}`}
          >
            <Star className={`mr-1 size-3 ${event.featured ? 'fill-current' : ''}`} />
            {event.featured ? 'Remove Featured' : 'Feature'}
          </Button>
          <Button
            variant={event.livePulse ? "default" : "outline"}
            size="sm"
            onClick={handleToggleLivePulse}
            className={`flex-1 ${event.livePulse ? 'bg-green-600 hover:bg-green-700 text-white' : ''}`}
          >
            <Activity className="mr-1 size-3" />
            {event.livePulse ? 'Remove from Live' : 'Set Live'}
          </Button>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: EventStatus | string }) {
  const config: Record<string, { label: string; className: string; icon: any }> = {
    draft: { label: "Draft", className: "bg-slate-100 text-slate-700", icon: Clock },
    published: { label: "Published", className: "bg-blue-100 text-blue-700", icon: Globe },
    live: { label: "Live", className: "bg-green-100 text-green-700", icon: CheckCircle2 },
    ended: { label: "Ended", className: "bg-slate-100 text-slate-600", icon: Clock },
    completed: { label: "Completed", className: "bg-slate-100 text-slate-600", icon: CheckCircle2 },
    cancelled: { label: "Cancelled", className: "bg-red-100 text-red-700", icon: AlertCircle },
    pending_approval: {
      label: "Pending Approval",
      className: "bg-amber-100 text-amber-700",
      icon: Clock,
    },
    approved: {
      label: "Approved",
      className: "bg-green-100 text-green-700",
      icon: CheckCircle2,
    },
    rejected: {
      label: "Rejected",
      className: "bg-red-100 text-red-700",
      icon: AlertCircle,
    },
  };
  
  // Normalize status to lowercase and handle underscores/hyphens
  const normalizedStatus = status?.toLowerCase().replace(/-/g, '_') || 'draft';
  const statusConfig = config[normalizedStatus] || config.draft;
  const Icon = statusConfig.icon;
  
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${statusConfig.className}`}
    >
      <Icon className="size-3" />
      {statusConfig.label}
    </span>
  );
}

