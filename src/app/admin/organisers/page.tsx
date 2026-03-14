"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Users,
  Calendar,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/api";
import { useToast } from "@/contexts/toast-context";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
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
  };
  eventsCount: number;
  activeEventsCount?: number;
  totalRevenue?: number;
  lastEventDate?: string;
  metadata?: {
    status?: "active" | "suspended" | "inactive";
    statusReason?: string;
  };
}

interface OrganiserListParams {
  page: number;
  limit: number;
  search?: string;
  status?: string;
  sortBy: string;
  sortOrder: string;
}

interface OrganiserListResponse {
  data: Organiser[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface OrganiserStats {
  total: number;
  active: number;
  suspended: number;
  newThisMonth: number;
}

export default function OrganisersPage() {
  const [organisers, setOrganisers] = useState<Organiser[]>([]);
  const [stats, setStats] = useState<OrganiserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "createdAt" | "eventsCount">(
    "createdAt",
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "suspended" | "inactive"
  >("all");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(
    null,
  );
  const toast = useToast();

  const loadOrganisers = async (reset = false) => {
    try {
      if (reset) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      const currentPage = reset ? 1 : page;
      const params: OrganiserListParams = {
        page: currentPage,
        limit: 20,
        sortBy,
        sortOrder,
      };
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }
      if (statusFilter !== "all") {
        params.status = statusFilter;
      }

      const response = await apiClient.get<OrganiserListResponse>(
        "/admin/organisers",
        params,
      );

      if (reset) {
        setOrganisers(response.data || []);
        setPage(currentPage);
      } else {
        setOrganisers((prev) => [...prev, ...(response.data || [])]);
      }

      setHasMore(response.page < response.totalPages);
    } catch (error: any) {
      console.error("Failed to load organisers:", error);
      toast.error("Error", error.message || "Failed to load organisers");
      if (reset) {
        setOrganisers([]);
        setPage(1);
        setHasMore(false);
      }
    } finally {
      if (reset) {
        setLoading(false);
      } else {
        setLoadingMore(false);
      }
    }
  };

  const loadStats = async () => {
    try {
      const response = await apiClient.get<OrganiserStats>(
        "/admin/organisers/stats",
      );
      setStats(response);
    } catch (error: any) {
      console.error("Failed to load stats:", error);
      // Set default stats if API fails
      setStats({
        total: 0,
        active: 0,
        suspended: 0,
        newThisMonth: 0,
      });
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([loadOrganisers(true), loadStats()]);
      toast.success("Success", "Data refreshed successfully");
    } catch (error: any) {
      console.error("Failed to refresh:", error);
      toast.error("Error", "Failed to refresh data");
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Set new timeout for search debouncing
    const timer = setTimeout(
      () => {
        setPage(1);
        loadOrganisers(true);
      },
      searchQuery ? 500 : 0,
    );

    setSearchTimeout(timer);

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [searchQuery, sortBy, sortOrder, statusFilter]);

  useEffect(() => {
    // Load stats immediately with the page
    loadStats();
  }, []);

  useEffect(() => {
    if (page > 1) {
      loadOrganisers(false);
    }
  }, [page]);

  const handleLoadMore = () => {
    if (!loading && !loadingMore && hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this organiser? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      await apiClient.delete(`/admin/organisers/${id}`);
      toast.success("Success", "Organiser deleted successfully");
      loadOrganisers(true);
      loadStats();
    } catch (error: any) {
      console.error("Failed to delete organiser:", error);
      toast.error("Error", error.message || "Failed to delete organiser");
    }
  };

  const getStatusBadge = (organiser: Organiser) => {
    const status = organiser.metadata?.status || "active";

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
          <Badge className="bg-gray-100 text-gray-800 border-gray-300">
            Unknown
          </Badge>
        );
    }
  };

  // No need for client-side filtering since search is handled by the backend
  const filteredOrganisers = organisers;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Organisers</h1>
          <p className="text-sm text-slate-600">
            Manage event organisers and their activities on the platform
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing || loading}
            size="sm"
          >
            {refreshing ? (
              <>
                <div className="animate-spin mr-2 size-4 border-2 border-slate-300 border-t-slate-600 rounded-full"></div>
                Refreshing...
              </>
            ) : (
              <>
                <svg
                  className="mr-2 size-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Refresh
              </>
            )}
          </Button>
          <Link href="/admin/organisers/create">
            <Button>
              <Plus className="mr-2 size-4" />
              Add Organiser
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats ? (
          <>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-blue-100 p-3">
                  <Users className="size-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {stats.total}
                  </p>
                  <p className="text-sm text-slate-600">Total Organisers</p>
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
                    {stats.active}
                  </p>
                  <p className="text-sm text-slate-600">Active</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-red-100 p-3">
                  <Filter className="size-6 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {stats.suspended}
                  </p>
                  <p className="text-sm text-slate-600">Suspended</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-purple-100 p-3">
                  <Calendar className="size-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {stats.newThisMonth}
                  </p>
                  <p className="text-sm text-slate-600">New This Month</p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-gray-100 p-3 animate-pulse">
                    <div className="size-6 bg-gray-300 rounded"></div>
                  </div>
                  <div>
                    <div className="h-6 w-12 bg-gray-300 rounded animate-pulse mb-2"></div>
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            type="text"
            placeholder="Search organisers by name, description, email, or owner..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
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
        <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt">Date Created</SelectItem>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="eventsCount">Events Count</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={sortOrder}
          onValueChange={(value: any) => setSortOrder(value)}
        >
          <SelectTrigger className="w-full sm:w-[120px]">
            <SelectValue placeholder="Order" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">Descending</SelectItem>
            <SelectItem value="asc">Ascending</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={statusFilter}
          onValueChange={(value: any) => setStatusFilter(value)}
        >
          <SelectTrigger className="w-full sm:w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Organisers List */}
      {loading && organisers.length === 0 ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-2xl border border-slate-200 bg-slate-100"
            />
          ))}
        </div>
      ) : filteredOrganisers.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-12 text-center">
          <Users className="mx-auto size-12 text-slate-300" />
          <p className="mt-4 text-lg font-semibold text-slate-900">
            No organisers found
          </p>
          <p className="mt-2 text-sm text-slate-600">
            {searchQuery.trim()
              ? "Try adjusting your search query or filters"
              : "Get started by creating your first organiser"}
          </p>
          {(searchQuery.trim() || statusFilter !== "all") && (
            <div className="flex gap-2 mt-4">
              {searchQuery.trim() && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchQuery("")}
                >
                  Clear search
                </Button>
              )}
              {statusFilter !== "all" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setStatusFilter("all")}
                >
                  Clear status filter
                </Button>
              )}
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-slate-600">
              Showing {filteredOrganisers.length} organiser
              {filteredOrganisers.length !== 1 ? "s" : ""}
              {searchQuery.trim() && <span> for "{searchQuery.trim()}"</span>}
              {statusFilter !== "all" && (
                <span> with status "{statusFilter}"</span>
              )}
            </p>
            {loading && (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <div className="animate-spin size-4 border-2 border-slate-300 border-t-slate-600 rounded-full"></div>
                Searching...
              </div>
            )}
          </div>

          <div className="grid gap-4">
            {filteredOrganisers.map((organiser) => (
              <div
                key={organiser.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    {organiser.logoUrl ? (
                      <img
                        src={organiser.logoUrl}
                        alt={organiser.name}
                        className="size-16 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="flex size-16 items-center justify-center rounded-xl bg-gradient-to-br from-slate-900 to-slate-700">
                        <span className="text-lg font-bold text-white">
                          {organiser.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-slate-900">
                          {organiser.name}
                        </h3>
                        {getStatusBadge(organiser)}
                      </div>
                      {organiser.description && (
                        <p className="text-sm text-slate-600 line-clamp-2">
                          {organiser.description}
                        </p>
                      )}
                      <div className="space-y-1 text-sm text-slate-600">
                        <p>
                          <span className="font-medium">Owner:</span>{" "}
                          {organiser.owner?.firstName}{" "}
                          {organiser.owner?.lastName} ({organiser.owner?.email})
                        </p>
                        <p>
                          <span className="font-medium">Events:</span>{" "}
                          {organiser.eventsCount} total
                          {organiser.activeEventsCount !== undefined && (
                            <>, {organiser.activeEventsCount} active</>
                          )}
                        </p>
                        {organiser.totalRevenue !== undefined && (
                          <p>
                            <span className="font-medium">Revenue:</span> KES{" "}
                            {organiser.totalRevenue.toLocaleString()}
                          </p>
                        )}
                        <p>
                          <span className="font-medium">Created:</span>{" "}
                          {new Date(organiser.createdAt).toLocaleDateString()}
                        </p>
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
                        <Link href={`/admin/organisers/${organiser.id}`}>
                          <Eye className="mr-2 size-4" />
                          View Details
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/organisers/${organiser.id}/edit`}>
                          <Edit className="mr-2 size-4" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(organiser.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 size-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={handleLoadMore}
                disabled={loading || loadingMore}
                className="min-w-[120px]"
              >
                {loadingMore ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin size-4 border-2 border-slate-300 border-t-slate-600 rounded-full"></div>
                    Loading...
                  </div>
                ) : (
                  "Load More"
                )}
              </Button>
            </div>
          )}

          {!hasMore && filteredOrganisers.length > 0 && (
            <div className="text-center text-sm text-slate-500 py-4">
              No more organisers to load
            </div>
          )}
        </>
      )}
    </div>
  );
}
