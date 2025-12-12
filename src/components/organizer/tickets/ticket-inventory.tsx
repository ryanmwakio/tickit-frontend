"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Package,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Download,
  Filter,
  Search,
  Calendar,
  DollarSign,
  Ticket,
  BarChart3,
  Loader2,
  ChevronDown,
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
import Image from "next/image";
import { useAuth } from "@/contexts/auth-context";
import { fetchOrganiserEvents, EventResponseDto } from "@/lib/events-api";
import { apiClient } from "@/lib/api";

// Helper to get organiserId
async function getUserOrganiserId(userId: string): Promise<string | null> {
  try {
    const response = await apiClient.get<any>("/events?limit=1");
    const events = Array.isArray(response) ? response : (response.data || []);
    if (events.length > 0 && events[0].organiserId) {
      return events[0].organiserId;
    }
    return null;
  } catch {
    return null;
  }
}

type TicketInventoryItem = {
  id: string;
  eventId: string;
  eventName: string;
  eventDate: string;
  eventImage: string;
  ticketType: string;
  totalQuantity: number;
  soldQuantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  price: number;
  revenue: number;
  status: "on_sale" | "sold_out" | "paused" | "upcoming" | "ended";
  salesStartDate: string;
  salesEndDate: string;
  capacityWarning: boolean;
};

export function TicketInventory() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [eventFilter, setEventFilter] = useState<string>("all");
  const [allInventory, setAllInventory] = useState<TicketInventoryItem[]>([]);
  const [inventory, setInventory] = useState<TicketInventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [organiserId, setOrganiserId] = useState<string | null>(null);
  const itemsPerPage = 9; // Number of inventory items per page

  // Reset to page 1 when filters change
  useEffect(() => {
    if (user) {
      setCurrentPage(1);
      setInventory([]);
      loadInventory(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, statusFilter, eventFilter]);

  const loadInventory = async (reset: boolean = true) => {
    if (!user) return;
    
    try {
      if (reset) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);
      
      const orgId = organiserId || await getUserOrganiserId(user.id);
      if (!orgId) {
        setError("Could not determine organiser ID");
        if (reset) {
          setLoading(false);
        } else {
          setLoadingMore(false);
        }
        return;
      }
      setOrganiserId(orgId);

      // Fetch events for the organizer with pagination
      const eventsResponse = await fetchOrganiserEvents(orgId, {
        page: 1,
        limit: 100, // API max limit
      });

      // Transform events and ticket types into inventory items
      const inventoryItems: TicketInventoryItem[] = [];
      
      for (const event of eventsResponse.data) {
        const eventDate = new Date(event.startsAt).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        });
        
        if (event.ticketTypes && event.ticketTypes.length > 0) {
          for (const ticketType of event.ticketTypes) {
            const totalQuantity = ticketType.quantityTotal || 0;
            const soldQuantity = ticketType.quantitySold || 0;
            const availableQuantity = totalQuantity - soldQuantity;
            const reservedQuantity = 0; // TODO: Get from reserved tickets if available
            const revenue = (soldQuantity * ticketType.priceCents) / 100;
            
            // Determine status
            let status: TicketInventoryItem["status"] = "on_sale";
            if (availableQuantity === 0 && totalQuantity > 0) {
              status = "sold_out";
            } else if (event.status === "COMPLETED") {
              status = "ended";
            } else if (event.status === "DRAFT") {
              status = "upcoming";
            }
            
            // Capacity warning (less than 10% available)
            const capacityWarning = totalQuantity > 0 && (availableQuantity / totalQuantity) < 0.1;
            
            inventoryItems.push({
              id: `${event.id}-${ticketType.id}`,
              eventId: event.id,
              eventName: event.title,
              eventDate,
              eventImage: event.coverImageUrl || "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=800&q=80",
              ticketType: ticketType.name,
              totalQuantity,
              soldQuantity,
              reservedQuantity,
              availableQuantity,
              price: ticketType.priceCents / 100,
              revenue,
              status,
              salesStartDate: event.salesStartsAt ? new Date(event.salesStartsAt).toISOString().split('T')[0] : "",
              salesEndDate: event.salesEndsAt ? new Date(event.salesEndsAt).toISOString().split('T')[0] : "",
              capacityWarning,
            });
          }
        }
      }

      // Cache all inventory items
      setAllInventory(inventoryItems);

      // Slice for current page
      const sliceEnd = itemsPerPage * (reset ? 1 : currentPage);
      setInventory(inventoryItems.slice(0, sliceEnd));

      // Update pagination info
      const total = eventsResponse.total || 0;
      setTotalItems(total);
      
      const calculatedTotalPages = Math.ceil(inventoryItems.length / itemsPerPage) || 1;
      setTotalPages(calculatedTotalPages);

      // Check if there are more pages to load
      const currentInventoryCount = itemsPerPage * (reset ? 1 : currentPage);
      const morePagesAvailable = inventoryItems.length > currentInventoryCount;
      setHasMore(morePagesAvailable);
    } catch (err: any) {
      console.error("Failed to load inventory:", err);
      setError(err.message || "Failed to load inventory");
      if (reset) {
        setInventory([]);
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
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    const sliceEnd = itemsPerPage * nextPage;
    setInventory(allInventory.slice(0, sliceEnd));
    setHasMore(allInventory.length > sliceEnd);
  };

  const filteredInventory = useMemo(() => {
    let items = inventory;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      items = items.filter(
        (item) =>
          item.eventName.toLowerCase().includes(query) ||
          item.ticketType.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== "all") {
      items = items.filter((item) => item.status === statusFilter);
    }

    if (eventFilter !== "all") {
      items = items.filter((item) => item.eventId === eventFilter);
    }

    return items;
  }, [inventory, searchQuery, statusFilter, eventFilter]);

  const totalStats = useMemo(() => {
    if (inventory.length === 0) {
      return {
        totalTickets: 0,
        soldTickets: 0,
        availableTickets: 0,
        totalRevenue: 0,
        sellThroughRate: 0,
      };
    }
    
    return {
      totalTickets: inventory.reduce((sum, item) => sum + item.totalQuantity, 0),
      soldTickets: inventory.reduce((sum, item) => sum + item.soldQuantity, 0),
      availableTickets: inventory.reduce((sum, item) => sum + item.availableQuantity, 0),
      totalRevenue: inventory.reduce((sum, item) => sum + item.revenue, 0),
      sellThroughRate: inventory.reduce((sum, item) => {
        if (item.totalQuantity > 0) {
          return sum + (item.soldQuantity / item.totalQuantity) * 100;
        }
        return sum;
      }, 0) / inventory.length,
    };
  }, [inventory]);

  const getStatusBadge = (status: TicketInventoryItem["status"]) => {
    const config = {
      on_sale: {
        label: "On Sale",
        className: "bg-green-100 text-green-700 border-green-200",
      },
      sold_out: {
        label: "Sold Out",
        className: "bg-red-100 text-red-700 border-red-200",
      },
      paused: {
        label: "Paused",
        className: "bg-amber-100 text-amber-700 border-amber-200",
      },
      upcoming: {
        label: "Upcoming",
        className: "bg-blue-100 text-blue-700 border-blue-200",
      },
      ended: {
        label: "Ended",
        className: "bg-slate-100 text-slate-700 border-slate-200",
      },
    };

    const statusConfig = config[status];

    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${statusConfig.className}`}
      >
        {statusConfig.label}
      </span>
    );
  };

  const uniqueEvents = useMemo(() => {
    const events = new Map();
    inventory.forEach((item) => {
      if (!events.has(item.eventId)) {
        events.set(item.eventId, {
          id: item.eventId,
          name: item.eventName,
        });
      }
    });
    return Array.from(events.values());
  }, [inventory]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Package className="size-4" />
            <span>Total Tickets</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {totalStats.totalTickets.toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <CheckCircle2 className="size-4 text-green-600" />
            <span>Sold</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {totalStats.soldTickets.toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Ticket className="size-4 text-blue-600" />
            <span>Available</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {totalStats.availableTickets.toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <DollarSign className="size-4 text-emerald-600" />
            <span>Revenue</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            KES {totalStats.totalRevenue.toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <BarChart3 className="size-4 text-purple-600" />
            <span>Sell-Through</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {totalStats.sellThroughRate.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            type="text"
            placeholder="Search by event name or ticket type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm focus:border-slate-900 focus:ring-slate-900"
          />
        </div>
        <Select value={eventFilter} onValueChange={setEventFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="All Events" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Events</SelectItem>
            {uniqueEvents.map((event) => (
              <SelectItem key={event.id} value={event.id}>
                {event.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="on_sale">On Sale</SelectItem>
            <SelectItem value="sold_out">Sold Out</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
            <SelectItem value="upcoming">Upcoming</SelectItem>
            <SelectItem value="ended">Ended</SelectItem>
          </SelectContent>
        </Select>
        <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
          <Download className="size-4" />
          Export
        </button>
      </div>

      {/* Inventory List */}
      <div className="space-y-4">
        {filteredInventory.map((item) => {
          const sellThroughRate = (item.soldQuantity / item.totalQuantity) * 100;
          const availablePercentage = (item.availableQuantity / item.totalQuantity) * 100;

          return (
            <div
              key={item.id}
              className={`rounded-xl border-2 bg-white p-6 transition hover:shadow-lg ${
                item.capacityWarning
                  ? "border-amber-200 bg-amber-50/30"
                  : "border-slate-200"
              }`}
            >
              <div className="flex flex-col gap-4 lg:flex-row">
                {/* Event Image */}
                <div className="relative h-32 w-full overflow-hidden rounded-lg bg-slate-100 lg:h-24 lg:w-32">
                  <Image
                    src={item.eventImage}
                    alt={item.eventName}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Content */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{item.eventName}</h3>
                      <p className="mt-1 flex items-center gap-2 text-sm text-slate-600">
                        <Calendar className="size-4" />
                        {item.eventDate}
                      </p>
                    </div>
                    {getStatusBadge(item.status)}
                  </div>

                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{item.ticketType}</p>
                      <p className="text-sm text-slate-600">
                        KES {item.price.toLocaleString()}
                      </p>
                    </div>
                    {item.capacityWarning && (
                      <div className="flex items-center gap-1 rounded-lg bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-700">
                        <AlertTriangle className="size-3.5" />
                        Low Stock
                      </div>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span>
                        {item.soldQuantity} sold • {item.availableQuantity} available • {item.reservedQuantity} reserved
                      </span>
                      <span className="font-semibold">{sellThroughRate.toFixed(1)}% sold</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full bg-gradient-to-r from-slate-900 to-slate-700 transition-all"
                        style={{ width: `${sellThroughRate}%` }}
                      />
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <div>
                      <p className="text-xs text-slate-600">Revenue</p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        KES {item.revenue.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600">Capacity</p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {item.totalQuantity}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600">Available</p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {item.availableQuantity}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredInventory.length === 0 && !loading && (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-12 text-center">
          <Package className="mx-auto size-12 text-slate-300" />
          <p className="mt-4 text-lg font-semibold text-slate-900">No tickets found</p>
          <p className="mt-2 text-sm text-slate-600">
            Adjust your filters or create ticket types for your events.
          </p>
        </div>
      )}

      {/* Load More Button */}
      {!loading && filteredInventory.length > 0 && hasMore && (
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
                <span>Load more</span>
                <ChevronDown className="size-5 transition-transform group-hover:translate-y-0.5 shrink-0" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

