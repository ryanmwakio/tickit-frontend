"use client";

import { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { type Order as ApiOrder } from "@/lib/tickets-api";
import { apiClient } from "@/lib/api";
import {
  Search,
  Filter,
  Eye,
  Edit,
  FileText,
  Download,
  Send,
  DollarSign,
  XCircle,
  CheckCircle2,
  Clock,
  Calendar,
  User,
  Mail,
  Phone,
  Ticket,
  AlertCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";

type Order = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  eventName: string;
  eventImage: string;
  ticketType: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  fees: number;
  total: number;
  purchaseDate: string;
  paymentMethod: "mpesa" | "card" | "bank" | "cash";
  paymentReference: string;
  orderStatus: "pending" | "confirmed" | "cancelled" | "refunded";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  ticketNumbers: string[];
  notes: OrderNote[];
};

type OrderNote = {
  id: string;
  content: string;
  author: string;
  createdAt: string;
};

// Helper to get organiserId
async function getUserOrganiserId(userId: string): Promise<string | null> {
  try {
    const events = await apiClient.get<any[]>("/events?limit=1");
    if (events && events.length > 0 && events[0].organiserId) {
      return events[0].organiserId;
    }
    return null;
  } catch {
    return null;
  }
}

// Map API order to component format
function mapApiOrderToComponentOrder(apiOrder: ApiOrder): Order {
  const buyer = apiOrder.buyer;
  const customerName = buyer
    ? `${buyer.firstName || ""} ${buyer.lastName || ""}`.trim() || "Guest"
    : "Guest";
  const customerEmail = buyer?.email || "";
  const customerPhone = buyer?.phoneNumber || "";

  // Get first item for display (most orders have one item, but we'll show the first)
  const firstItem = apiOrder.items?.[0];
  const ticketType = firstItem?.ticketTypeName || "Unknown";
  const quantity = firstItem?.quantity || 0;
  const unitPrice = firstItem ? firstItem.unitPriceCents / 100 : 0;
  const subtotal = firstItem ? firstItem.totalPriceCents / 100 : 0;

  // Calculate fees (difference between order total and item totals)
  const itemsTotal = apiOrder.items?.reduce((sum, item) => sum + item.totalPriceCents, 0) || 0;
  const orderTotal = apiOrder.totalAmountCents / 100;
  const fees = orderTotal - (itemsTotal / 100);

  // Get event info from first item's ticket type
  const eventName = firstItem?.ticketType?.event?.title || "Unknown Event";
  const eventImage = firstItem?.ticketType?.event?.coverImageUrl || "";

  // Get ticket numbers from order items
  const ticketNumbers: string[] = [];
  apiOrder.items?.forEach((item) => {
    item.tickets?.forEach((ticket) => {
      if (ticket.ticketNumber) {
        ticketNumbers.push(ticket.ticketNumber);
      }
    });
  });

  // Get payment info
  const payment = apiOrder.payments?.[0];
  const paymentMethodRaw = payment?.method?.toLowerCase() || "unknown";
  // Map payment method to component format
  const paymentMethodMap: Record<string, Order["paymentMethod"]> = {
    mpesa: "mpesa",
    card: "card",
    bank_transfer: "bank",
    cash: "cash",
  };
  const paymentMethod = paymentMethodMap[paymentMethodRaw] || "mpesa";
  const paymentReference = payment?.transactionId || payment?.reference || "";

  // Map order status
  const orderStatusMap: Record<string, Order["orderStatus"]> = {
    PENDING: "pending",
    PAID: "confirmed",
    CANCELLED: "cancelled",
    REFUNDED: "refunded",
    PARTIALLY_REFUNDED: "refunded",
  };
  const orderStatus = orderStatusMap[apiOrder.status] || "pending";

  // Map payment status based on order status and payment
  let paymentStatus: Order["paymentStatus"] = "pending";
  if (apiOrder.status === "PAID") {
    paymentStatus = "paid";
  } else if (apiOrder.status === "CANCELLED") {
    paymentStatus = "failed";
  } else if (apiOrder.status === "REFUNDED" || apiOrder.status === "PARTIALLY_REFUNDED") {
    paymentStatus = "refunded";
  }

  return {
    id: apiOrder.id,
    orderNumber: apiOrder.orderNumber,
    customerName,
    customerEmail,
    customerPhone,
    eventName,
    eventImage,
    ticketType,
    quantity,
    unitPrice,
    subtotal,
    fees,
    total: orderTotal,
    purchaseDate: apiOrder.createdAt,
    paymentMethod: paymentMethod as Order["paymentMethod"],
    paymentReference,
    orderStatus,
    paymentStatus,
    ticketNumbers,
    notes: [], // Notes would need to be added to the API if needed
  };
}

export function OrderWorkbench() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [allApiOrders, setAllApiOrders] = useState<ApiOrder[]>([]); // Store all fetched API orders (unfiltered)
  const [displayedCount, setDisplayedCount] = useState(9); // Number of orders to display
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [organiserId, setOrganiserId] = useState<string | null>(null);
  const [totalFetched, setTotalFetched] = useState(0); // Track total fetched from API (before filtering)

  // Fetch initial orders from API
  useEffect(() => {
    async function loadInitialOrders() {
      if (!user) return;

      try {
        setLoading(true);
        setError(null);
        setDisplayedCount(9); // Reset to initial count when filters change

        const orgId = await getUserOrganiserId(user.id);
        if (!orgId) {
          setError("Could not determine organiser ID");
          setLoading(false);
          return;
        }
        setOrganiserId(orgId);

        // Fetch first 9 orders
        const ordersResponse = await apiClient.get<{
          data: ApiOrder[];
          total: number;
          hasMore: boolean;
        }>(`/organisers/${orgId}/orders?skip=0&take=9`);

        const fetchedOrders = ordersResponse?.data || [];
        setHasMore(ordersResponse?.hasMore || false);
        setTotalFetched(fetchedOrders.length);

        // Store all fetched orders (unfiltered)
        setAllApiOrders(fetchedOrders);

        // Filter by status if needed
        let filteredOrders = fetchedOrders;
        if (orderStatusFilter !== "all") {
          filteredOrders = fetchedOrders.filter(
            (order) => order.status === orderStatusFilter.toUpperCase()
          );
        }

        // Map all filtered orders to component format, but only display first 9
        const allMappedOrders = filteredOrders.map(mapApiOrderToComponentOrder);
        setOrders(allMappedOrders.slice(0, 9));
      } catch (err: any) {
        console.error("Failed to load orders:", err);
        setError(err.message || "Failed to load orders");
      } finally {
        setLoading(false);
      }
    }

    loadInitialOrders();
  }, [user, orderStatusFilter]);

  // Load more orders
  const loadMoreOrders = async () => {
    if (!organiserId || loadingMore) return;

    // Filter allApiOrders by status to get the actual filtered count
    const filteredApiOrders = orderStatusFilter !== "all"
      ? allApiOrders.filter((order) => order.status === orderStatusFilter.toUpperCase())
      : allApiOrders;

    // If we have more filtered orders already fetched, just show more of them
    if (displayedCount < filteredApiOrders.length) {
      const allMappedOrders = filteredApiOrders.map(mapApiOrderToComponentOrder);
      const newDisplayedCount = Math.min(displayedCount + 9, filteredApiOrders.length);
      setDisplayedCount(newDisplayedCount);
      setOrders(allMappedOrders.slice(0, newDisplayedCount));
      return;
    }

    // Otherwise, fetch more from API
    if (!hasMore) return;

    try {
      setLoadingMore(true);

      // Calculate how many we've already fetched from API (use totalFetched, not filtered count)
      const skip = totalFetched;
      
      // Fetch next 9 orders
      const ordersResponse = await apiClient.get<{
        data: ApiOrder[];
        total: number;
        hasMore: boolean;
      }>(`/organisers/${organiserId}/orders?skip=${skip}&take=9`);

      const fetchedOrders = ordersResponse?.data || [];
      setHasMore(ordersResponse?.hasMore || false);
      setTotalFetched(totalFetched + fetchedOrders.length);

      // Append new orders to existing list (unfiltered)
      const updatedApiOrders = [...allApiOrders, ...fetchedOrders];
      setAllApiOrders(updatedApiOrders);

      // Filter by status if needed
      let filteredOrders = updatedApiOrders;
      if (orderStatusFilter !== "all") {
        filteredOrders = updatedApiOrders.filter(
          (order) => order.status === orderStatusFilter.toUpperCase()
        );
      }

      // Map all filtered orders to component format
      const allMappedOrders = filteredOrders.map(mapApiOrderToComponentOrder);
      
      // Update displayed orders (show 9 more)
      const newDisplayedCount = displayedCount + 9;
      setDisplayedCount(newDisplayedCount);
      setOrders(allMappedOrders.slice(0, newDisplayedCount));
    } catch (err: any) {
      console.error("Failed to load more orders:", err);
      setError(err.message || "Failed to load more orders");
    } finally {
      setLoadingMore(false);
    }
  };

  const filteredOrders = useMemo(() => {
    let filtered = orders;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.orderNumber.toLowerCase().includes(query) ||
          order.customerName.toLowerCase().includes(query) ||
          order.customerEmail.toLowerCase().includes(query) ||
          order.customerPhone.includes(query) ||
          order.eventName.toLowerCase().includes(query) ||
          order.ticketNumbers.some((tn) => tn.toLowerCase().includes(query)) ||
          order.paymentReference.toLowerCase().includes(query)
      );
    }

    if (paymentStatusFilter !== "all") {
      filtered = filtered.filter((order) => order.paymentStatus === paymentStatusFilter);
    }

    return filtered;
  }, [orders, searchQuery, paymentStatusFilter]);

  // Check if there are more orders to load (only when not searching)
  // Filter allApiOrders by status to get the actual filtered count
  const filteredApiOrders = useMemo(() => {
    if (orderStatusFilter !== "all") {
      return allApiOrders.filter(
        (order) => order.status === orderStatusFilter.toUpperCase()
      );
    }
    return allApiOrders;
  }, [allApiOrders, orderStatusFilter]);

  // We can load more if: there are more from API, and we've displayed all currently fetched filtered orders
  // OR if we have more filtered orders already fetched that we haven't displayed yet
  const hasMoreFiltered = displayedCount < filteredApiOrders.length;
  const canLoadMore = !searchQuery && (hasMore || hasMoreFiltered);

  // Export orders to CSV
  const exportToCSV = async () => {
    if (!organiserId) {
      alert("Unable to export: Organiser ID not found");
      return;
    }

    try {
      setExporting(true);

      // Fetch all orders matching current filters
      let allOrdersToExport: ApiOrder[] = [];
      let skip = 0;
      const take = 100; // Fetch in batches of 100
      let hasMoreOrders = true;

      while (hasMoreOrders) {
        const ordersResponse = await apiClient.get<{
          data: ApiOrder[];
          total: number;
          hasMore: boolean;
        }>(`/organisers/${organiserId}/orders?skip=${skip}&take=${take}`);

        const fetchedOrders = ordersResponse?.data || [];
        
        // Filter by status if needed
        let filteredFetched = fetchedOrders;
        if (orderStatusFilter !== "all") {
          filteredFetched = fetchedOrders.filter(
            (order) => order.status === orderStatusFilter.toUpperCase()
          );
        }

        allOrdersToExport = [...allOrdersToExport, ...filteredFetched];
        
        hasMoreOrders = ordersResponse?.hasMore || false;
        skip += take;

        // Safety limit to prevent infinite loops
        if (skip > 10000) break;
      }

      if (allOrdersToExport.length === 0) {
        alert("No orders to export matching the current filters");
        setExporting(false);
        return;
      }

      // Map all orders to component format
      const mappedOrders = allOrdersToExport.map(mapApiOrderToComponentOrder);

      // Apply search and payment status filters
      let finalOrders = mappedOrders;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        finalOrders = mappedOrders.filter(
          (order) =>
            order.orderNumber.toLowerCase().includes(query) ||
            order.customerName.toLowerCase().includes(query) ||
            order.customerEmail.toLowerCase().includes(query) ||
            order.customerPhone.includes(query) ||
            order.eventName.toLowerCase().includes(query) ||
            order.ticketNumbers.some((tn) => tn.toLowerCase().includes(query)) ||
            order.paymentReference.toLowerCase().includes(query)
        );
      }

      if (paymentStatusFilter !== "all") {
        finalOrders = finalOrders.filter(
          (order) => order.paymentStatus === paymentStatusFilter
        );
      }

      if (finalOrders.length === 0) {
        alert("No orders to export matching the current filters");
        setExporting(false);
        return;
      }

      // Prepare CSV headers
      const headers = [
        "Order Number",
        "Customer Name",
        "Customer Email",
        "Customer Phone",
        "Event Name",
        "Ticket Type",
        "Quantity",
        "Unit Price (KES)",
        "Subtotal (KES)",
        "Fees (KES)",
        "Total (KES)",
        "Purchase Date",
        "Payment Method",
        "Payment Reference",
        "Order Status",
        "Payment Status",
        "Ticket Numbers",
      ];

      // Convert orders to CSV rows
      const rows = finalOrders.map((order) => {
        return [
          order.orderNumber,
          order.customerName,
          order.customerEmail,
          order.customerPhone,
          order.eventName,
          order.ticketType,
          order.quantity.toString(),
          order.unitPrice.toFixed(2),
          order.subtotal.toFixed(2),
          order.fees.toFixed(2),
          order.total.toFixed(2),
          new Date(order.purchaseDate).toLocaleString(),
          order.paymentMethod,
          order.paymentReference,
          order.orderStatus,
          order.paymentStatus,
          order.ticketNumbers.join("; "), // Join multiple ticket numbers with semicolon
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
      const filename = `orders-export-${dateStr}.csv`;
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error("Failed to export orders:", err);
      alert(`Failed to export orders: ${err.message || "Unknown error"}`);
    } finally {
      setExporting(false);
    }
  };

  const selectedOrderData = selectedOrder
    ? filteredOrders.find((o) => o.id === selectedOrder)
    : null;

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block size-8 animate-spin rounded-full border-4 border-solid border-slate-900 border-r-transparent"></div>
          <p className="text-sm text-slate-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-red-200 bg-red-50 p-12 text-center">
        <AlertCircle className="mx-auto size-12 text-red-400" />
        <p className="mt-4 text-lg font-semibold text-red-900">Error loading orders</p>
        <p className="mt-2 text-sm text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search & Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
          <Input
            type="text"
            placeholder="Search by order number, customer name, email, phone, ticket number, QR code, or payment reference..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-12 pr-4 text-sm focus:border-slate-900 focus:ring-slate-900"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <Filter className="size-4" />
            Filters
          </button>

          <Select value={orderStatusFilter} onValueChange={setOrderStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Order Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>

          <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Payment Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Payments</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>

          <button
            onClick={exportToCSV}
            disabled={!organiserId || loading || exporting}
            className="ml-auto inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
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
      </div>

      {/* Orders List */}
      <div className="grid gap-4">
        {filteredOrders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            isSelected={selectedOrder === order.id}
            onSelect={() => setSelectedOrder(selectedOrder === order.id ? null : order.id)}
          />
        ))}
      </div>

      {filteredOrders.length === 0 && !loading && (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-12 text-center">
          <FileText className="mx-auto size-12 text-slate-300" />
          <p className="mt-4 text-lg font-semibold text-slate-900">No orders found</p>
          <p className="mt-2 text-sm text-slate-600">
            Adjust your search or filters to find orders
          </p>
        </div>
      )}

      {/* Load More Button */}
      {filteredOrders.length > 0 && canLoadMore && (
        <div className="flex justify-center pt-4">
          <button
            onClick={loadMoreOrders}
            disabled={loadingMore}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loadingMore ? (
              <>
                <div className="size-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700"></div>
                Loading...
              </>
            ) : (
              <>
                Load More
              </>
            )}
          </button>
        </div>
      )}

      {filteredOrders.length > 0 && !hasMore && !searchQuery && allApiOrders.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
          <p className="text-sm text-slate-600">All orders loaded ({allApiOrders.length} total)</p>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrderData && (
        <OrderDetailModal
          order={selectedOrderData}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
}

function OrderCard({
  order,
  isSelected,
  onSelect,
}: {
  order: Order;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const getStatusBadge = (status: Order["orderStatus"]) => {
    const config = {
      pending: { label: "Pending", className: "bg-amber-100 text-amber-700" },
      confirmed: { label: "Confirmed", className: "bg-green-100 text-green-700" },
      cancelled: { label: "Cancelled", className: "bg-red-100 text-red-700" },
      refunded: { label: "Refunded", className: "bg-slate-100 text-slate-700" },
    };
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${config[status].className}`}
      >
        {config[status].label}
      </span>
    );
  };

  return (
    <div
      onClick={onSelect}
      className={`cursor-pointer rounded-xl border-2 bg-white p-6 transition hover:shadow-lg ${
        isSelected ? "border-slate-900" : "border-slate-200"
      }`}
    >
      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="relative h-32 w-full overflow-hidden rounded-lg bg-slate-100 lg:h-24 lg:w-32">
          <Image
            src={order.eventImage}
            alt={order.eventName}
            fill
            className="object-cover"
          />
        </div>

        <div className="flex-1 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">{order.eventName}</h3>
              <p className="mt-1 text-sm text-slate-600">{order.ticketType}</p>
            </div>
            {getStatusBadge(order.orderStatus)}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-xs text-slate-600">Order Number</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{order.orderNumber}</p>
            </div>
            <div>
              <p className="text-xs text-slate-600">Customer</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{order.customerName}</p>
              <p className="mt-1 text-xs text-slate-600">{order.customerEmail}</p>
            </div>
            <div>
              <p className="text-xs text-slate-600">Amount</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                KES {order.total.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-600">Date</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {new Date(order.purchaseDate).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-600">
            <span>
              {order.quantity} {order.quantity === 1 ? "ticket" : "tickets"}
            </span>
            <span className="capitalize">{order.paymentMethod}</span>
            <span>Ref: {order.paymentReference}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function OrderDetailModal({ order, onClose }: { order: Order; onClose: () => void }) {
  const [internalNote, setInternalNote] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-semibold text-slate-900">Order Details</h3>
            <p className="mt-1 text-sm text-slate-600">{order.orderNumber}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-600 transition hover:bg-slate-100"
          >
            <XCircle className="size-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Customer Info */}
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h4 className="mb-4 font-semibold text-slate-900">Customer Information</h4>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-slate-600">Name</p>
                <p className="mt-1 font-semibold text-slate-900">{order.customerName}</p>
              </div>
              <div>
                <p className="text-xs text-slate-600">Email</p>
                <p className="mt-1 font-semibold text-slate-900">{order.customerEmail}</p>
              </div>
              <div>
                <p className="text-xs text-slate-600">Phone</p>
                <p className="mt-1 font-semibold text-slate-900">{order.customerPhone}</p>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h4 className="mb-4 font-semibold text-slate-900">Order Summary</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Subtotal</span>
                <span className="text-sm font-semibold text-slate-900">
                  KES {order.subtotal.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Fees</span>
                <span className="text-sm font-semibold text-slate-900">
                  KES {order.fees.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-3">
                <span className="font-semibold text-slate-900">Total</span>
                <span className="font-semibold text-slate-900">
                  KES {order.total.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Ticket Numbers */}
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h4 className="mb-4 font-semibold text-slate-900">Ticket Numbers</h4>
            <div className="flex flex-wrap gap-2">
              {order.ticketNumbers.map((ticketNumber) => (
                <span
                  key={ticketNumber}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-mono font-semibold text-slate-900"
                >
                  {ticketNumber}
                </span>
              ))}
            </div>
          </div>

          {/* Internal Notes */}
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h4 className="mb-4 font-semibold text-slate-900">Internal Notes</h4>
            <div className="space-y-3">
              {order.notes.length > 0 ? (
                order.notes.map((note) => (
                  <div key={note.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <p className="text-sm text-slate-900">{note.content}</p>
                    <p className="mt-1 text-xs text-slate-600">
                      {note.author} • {new Date(note.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-600">No internal notes</p>
              )}
              <div className="flex gap-2">
                <Input
                  value={internalNote}
                  onChange={(e) => setInternalNote(e.target.value)}
                  placeholder="Add internal note..."
                  className="flex-1"
                />
                <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
                  Add Note
                </button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <button className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
              <Download className="size-4" />
              Download PDF
            </button>
            <button className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
              <Send className="size-4" />
              Resend Tickets
            </button>
            <button className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100">
              <DollarSign className="size-4" />
              Process Refund
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

