"use client";

import { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { apiClient } from "@/lib/api";
import {
  Search,
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Download,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Refund = {
  id: string;
  orderNumber: string;
  ticketNumbers: string[];
  customerName: string;
  customerEmail: string;
  eventName: string;
  ticketType: string;
  originalAmount: number;
  refundAmount: number;
  refundType: "full" | "partial";
  reason: string;
  requestedBy: "customer" | "organizer" | "system";
  requestedAt: string;
  status: "pending" | "approved" | "rejected" | "processed" | "failed";
  processedAt: string | null;
  paymentMethod: string;
  paymentReference: string;
};

// Helper to get organiserId
async function getUserOrganiserId(): Promise<string | null> {
  try {
    const events = await apiClient.get<Array<{ organiserId?: string }>>("/events?limit=1");
    if (events && events.length > 0 && events[0].organiserId) {
      return events[0].organiserId;
    }
    return null;
  } catch {
    return null;
  }
}

// Map API refund to component format
function mapApiRefundToComponentRefund(apiRefund: {
  id: string;
  status: string;
  amountCents: number;
  reason?: string;
  createdAt: string;
  processedAt?: string | null;
  metadata?: Record<string, unknown>;
  order?: {
    orderNumber: string;
    totalAmountCents: number;
    buyer?: {
      firstName?: string;
      lastName?: string;
      email?: string;
    };
    items?: Array<{
      ticketTypeName: string;
      ticketType?: {
        event?: {
          title: string;
        };
      };
      tickets?: Array<{
        ticketNumber: string;
      }>;
    }>;
    payments?: Array<{
      method: string;
      transactionId?: string;
      reference?: string;
    }>;
  };
}): Refund {
  const order = apiRefund.order;
  const buyer = order?.buyer;
  
  // Get ticket numbers from order items
  const ticketNumbers: string[] = [];
  order?.items?.forEach((item) => {
    item.tickets?.forEach((ticket) => {
      if (ticket.ticketNumber) {
        ticketNumbers.push(ticket.ticketNumber);
      }
    });
  });

  // Get event info from first item's ticket type
  const firstItem = order?.items?.[0];
  const eventName = firstItem?.ticketType?.event?.title || "Unknown Event";
  const ticketType = firstItem?.ticketTypeName || "Unknown";

  // Get customer info
  const customerName = buyer
    ? `${buyer.firstName || ""} ${buyer.lastName || ""}`.trim() || "Guest"
    : "Guest";
  const customerEmail = buyer?.email || "";

  // Get payment info
  const payment = order?.payments?.[0];
  const paymentMethod = payment?.method?.toLowerCase() || "unknown";
  const paymentReference = payment?.transactionId || payment?.reference || "";

  // Map refund status
  const statusMap: Record<string, Refund["status"]> = {
    PENDING: "pending",
    APPROVED: "approved",
    REJECTED: "rejected",
    PROCESSED: "processed",
    FAILED: "failed",
  };
  const status = statusMap[apiRefund.status] || "pending";

  // Determine refund type
  const originalAmount = order?.totalAmountCents ? order.totalAmountCents / 100 : 0;
  const refundAmount = apiRefund.amountCents ? apiRefund.amountCents / 100 : 0;
  const refundType: "full" | "partial" = refundAmount >= originalAmount ? "full" : "partial";

  // Determine requested by from metadata or default to customer
  const requestedByFromMetadata = apiRefund.metadata?.requestedBy as string | undefined;
  const requestedBy: "customer" | "organizer" | "system" = 
    requestedByFromMetadata === "ORGANISER" || requestedByFromMetadata === "organizer" ? "organizer" :
    requestedByFromMetadata === "SYSTEM" || requestedByFromMetadata === "system" ? "system" : "customer";

  return {
    id: apiRefund.id,
    orderNumber: order?.orderNumber || "",
    ticketNumbers,
    customerName,
    customerEmail,
    eventName,
    ticketType,
    originalAmount,
    refundAmount,
    refundType,
    reason: apiRefund.reason || "",
    requestedBy,
    requestedAt: apiRefund.createdAt || new Date().toISOString(),
    status,
    processedAt: apiRefund.processedAt || null,
    paymentMethod,
    paymentReference,
  };
}

export function RefundManagement() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [refundTypeFilter, setRefundTypeFilter] = useState<string>("all");
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch refunds from API
  useEffect(() => {
    async function loadRefunds() {
      if (!user) return;

      try {
        setLoading(true);
        setError(null);

        const orgId = await getUserOrganiserId();
        if (!orgId) {
          setError("Could not determine organiser ID");
          setLoading(false);
          return;
        }

        // Fetch refunds from organiser dashboard endpoint
        const refundsResponse = await apiClient.get<Array<{
          id: string;
          status: string;
          amountCents: number;
          reason?: string;
          createdAt: string;
          processedAt?: string | null;
          metadata?: Record<string, unknown>;
          order?: {
            orderNumber: string;
            totalAmountCents: number;
            buyer?: {
              firstName?: string;
              lastName?: string;
              email?: string;
            };
            items?: Array<{
              ticketTypeName: string;
              ticketType?: {
                event?: {
                  title: string;
                };
              };
              tickets?: Array<{
                ticketNumber: string;
              }>;
            }>;
            payments?: Array<{
              method: string;
              transactionId?: string;
              reference?: string;
            }>;
          };
        }>>(`/organisers/${orgId}/refunds`);

        const fetchedRefunds = refundsResponse || [];
        const mappedRefunds = fetchedRefunds.map(mapApiRefundToComponentRefund);
        setRefunds(mappedRefunds);
    } catch (err: unknown) {
      console.error("Failed to load refunds:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to load refunds";
      setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }

    loadRefunds();
  }, [user]);

  const filteredRefunds = useMemo(() => {
    let filtered = refunds;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (refund) =>
          refund.orderNumber.toLowerCase().includes(query) ||
          refund.customerName.toLowerCase().includes(query) ||
          refund.customerEmail.toLowerCase().includes(query) ||
          refund.eventName.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((refund) => refund.status === statusFilter);
    }

    if (refundTypeFilter !== "all") {
      filtered = filtered.filter((refund) => refund.refundType === refundTypeFilter);
    }

    return filtered;
  }, [refunds, searchQuery, statusFilter, refundTypeFilter]);

  const totalStats = useMemo(() => {
    return {
      pending: refunds.filter((r) => r.status === "pending").length,
      approved: refunds.filter((r) => r.status === "approved").length,
      processed: refunds.filter((r) => r.status === "processed").length,
      totalRefundAmount: refunds
        .filter((r) => r.status === "pending" || r.status === "approved")
        .reduce((sum, r) => sum + r.refundAmount, 0),
    };
  }, [refunds]);

  // Export refunds to CSV
  const exportToCSV = () => {
    if (filteredRefunds.length === 0) {
      alert("No refunds to export");
      return;
    }

    try {
      setExporting(true);

      // Prepare CSV headers
      const headers = [
        "Refund ID",
        "Order Number",
        "Customer Name",
        "Customer Email",
        "Event Name",
        "Ticket Type",
        "Original Amount (KES)",
        "Refund Amount (KES)",
        "Refund Type",
        "Reason",
        "Requested By",
        "Requested At",
        "Status",
        "Processed At",
        "Payment Method",
        "Payment Reference",
        "Ticket Numbers",
      ];

      // Convert refunds to CSV rows
      const rows = filteredRefunds.map((refund) => {
        return [
          refund.id,
          refund.orderNumber,
          refund.customerName,
          refund.customerEmail,
          refund.eventName,
          refund.ticketType,
          refund.originalAmount.toFixed(2),
          refund.refundAmount.toFixed(2),
          refund.refundType,
          refund.reason,
          refund.requestedBy,
          new Date(refund.requestedAt).toLocaleString(),
          refund.status,
          refund.processedAt ? new Date(refund.processedAt).toLocaleString() : "",
          refund.paymentMethod,
          refund.paymentReference,
          refund.ticketNumbers.join("; "), // Join multiple ticket numbers with semicolon
        ];
      });

      // Combine headers and rows
      const csvContent = [
        headers.join(","),
        ...rows.map((row) =>
          row.map((cell) => {
            // Escape commas and quotes in cell values
            const cellValue = String(cell || "");
            if (cellValue.includes(",") || cellValue.includes('"') || cellValue.includes("\n")) {
              return `"${cellValue.replace(/"/g, '""')}"`;
            }
            return cellValue;
          }).join(",")
        ),
      ].join("\n");

      // Create blob and download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      
      // Generate filename with current date
      const dateStr = new Date().toISOString().split("T")[0];
      const filename = `refunds-export-${dateStr}.csv`;
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      console.error("Failed to export refunds:", err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      alert(`Failed to export refunds: ${errorMessage}`);
    } finally {
      setExporting(false);
    }
  };

  const getStatusBadge = (status: Refund["status"]) => {
    const config = {
      pending: {
        label: "Pending",
        className: "bg-amber-100 text-amber-700 border-amber-200",
        icon: Clock,
      },
      approved: {
        label: "Approved",
        className: "bg-blue-100 text-blue-700 border-blue-200",
        icon: CheckCircle2,
      },
      rejected: {
        label: "Rejected",
        className: "bg-red-100 text-red-700 border-red-200",
        icon: XCircle,
      },
      processed: {
        label: "Processed",
        className: "bg-green-100 text-green-700 border-green-200",
        icon: CheckCircle2,
      },
      failed: {
        label: "Failed",
        className: "bg-red-100 text-red-700 border-red-200",
        icon: XCircle,
      },
    };
    const statusConfig = config[status];
    const Icon = statusConfig.icon;
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${statusConfig.className}`}
      >
        <Icon className="size-3" />
        {statusConfig.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block size-8 animate-spin rounded-full border-4 border-solid border-slate-900 border-r-transparent"></div>
          <p className="text-sm text-slate-600">Loading refunds...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-red-200 bg-red-50 p-12 text-center">
        <AlertCircle className="mx-auto size-12 text-red-400" />
        <p className="mt-4 text-lg font-semibold text-red-900">Error loading refunds</p>
        <p className="mt-2 text-sm text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Clock className="size-4 text-amber-600" />
            <span>Pending</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{totalStats.pending}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <CheckCircle2 className="size-4 text-blue-600" />
            <span>Approved</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{totalStats.approved}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <CheckCircle2 className="size-4 text-green-600" />
            <span>Processed</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{totalStats.processed}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <DollarSign className="size-4 text-emerald-600" />
            <span>Total Pending</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            KES {totalStats.totalRefundAmount.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            type="text"
            placeholder="Search refunds..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm focus:border-slate-900 focus:ring-slate-900"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="processed">Processed</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={refundTypeFilter} onValueChange={setRefundTypeFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Refund Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="full">Full Refund</SelectItem>
            <SelectItem value="partial">Partial Refund</SelectItem>
          </SelectContent>
        </Select>
        <button
          onClick={exportToCSV}
          disabled={filteredRefunds.length === 0 || exporting}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {exporting ? (
            <>
              <div className="size-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700"></div>
              Exporting...
            </>
          ) : (
            <>
              <Download className="size-4" />
              Export
            </>
          )}
        </button>
      </div>

      {/* Refunds List */}
      <div className="space-y-4">
        {filteredRefunds.map((refund) => (
          <div
            key={refund.id}
            className="rounded-xl border border-slate-200 bg-white p-6 transition hover:shadow-lg"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h4 className="text-lg font-semibold text-slate-900">{refund.eventName}</h4>
                  {getStatusBadge(refund.status)}
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      refund.refundType === "full"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {refund.refundType === "full" ? "Full" : "Partial"} Refund
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-600">{refund.ticketType}</p>

                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <p className="text-xs text-slate-600">Customer</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {refund.customerName}
                    </p>
                    <p className="text-xs text-slate-600">{refund.customerEmail}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Order Number</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {refund.orderNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Refund Amount</p>
                    <p className="mt-1 text-lg font-bold text-slate-900">
                      KES {refund.refundAmount.toLocaleString()}
                    </p>
                    {refund.refundType === "partial" && (
                      <p className="text-xs text-slate-600">
                        of KES {refund.originalAmount.toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Requested</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {new Date(refund.requestedAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-slate-600 capitalize">
                      by {refund.requestedBy}
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs text-slate-600">Reason</p>
                  <p className="mt-1 text-sm text-slate-900">{refund.reason}</p>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {refund.ticketNumbers.map((ticketNumber) => (
                    <span
                      key={ticketNumber}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-mono font-semibold text-slate-900"
                    >
                      {ticketNumber}
                    </span>
                  ))}
                </div>
              </div>

              {refund.status === "pending" && (
                <div className="ml-4 flex flex-col gap-2">
                  <button className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700">
                    Approve
                  </button>
                  <button className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100">
                    Reject
                  </button>
                </div>
              )}
              {refund.status === "approved" && (
                <div className="ml-4">
                  <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
                    Process Refund
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredRefunds.length === 0 && (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-12 text-center">
          <DollarSign className="mx-auto size-12 text-slate-300" />
          <p className="mt-4 text-lg font-semibold text-slate-900">No refunds found</p>
          <p className="mt-2 text-sm text-slate-600">
            Adjust your filters or wait for refund requests to appear.
          </p>
        </div>
      )}
    </div>
  );
}

