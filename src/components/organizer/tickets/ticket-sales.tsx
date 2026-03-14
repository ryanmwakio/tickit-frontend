"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Search,
  Filter,
  Download,
  Eye,
  FileText,
  Calendar,
  DollarSign,
  User,
  Mail,
  Phone,
  Ticket,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  Loader2,
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
import { useAuth } from "@/contexts/auth-context";
import { getOrders, Order, OrderItem, Ticket as OrderTicket } from "@/lib/tickets-api";
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

type TicketSale = {
  id: string;
  orderNumber: string;
  ticketNumber: string;
  eventName: string;
  eventImage: string;
  ticketType: string;
  price: number;
  quantity: number;
  totalAmount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  purchaseDate: string;
  paymentMethod: "mpesa" | "card" | "bank" | "cash" | "airtel";
  paymentStatus: "paid" | "pending" | "failed" | "refunded";
  orderStatus: "confirmed" | "pending" | "cancelled" | "refunded";
  checkInStatus: "not_checked_in" | "checked_in" | "no_show";
  refundStatus: "none" | "partial" | "full";
};

export function TicketSales() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [eventFilter, setEventFilter] = useState<string>("all");
  const [sales, setSales] = useState<TicketSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch orders from API
  useEffect(() => {
    async function loadSales() {
      if (!user) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const organiserId = await getUserOrganiserId(user.id);
        if (!organiserId) {
          setError("Could not determine organiser ID");
          setLoading(false);
          return;
        }

        // Fetch orders with pagination
        let allOrders: any[] = [];
        let currentPage = 1;
        const pageLimit = 100; // API max limit
        
        while (true) {
          const ordersResponse = await getOrders({
            organiserId,
            page: currentPage,
            limit: pageLimit,
            status: statusFilter !== "all" ? statusFilter : undefined,
          });
          
          allOrders = [...allOrders, ...ordersResponse.data];
          
          if (ordersResponse.data.length < pageLimit || currentPage >= ordersResponse.totalPages) {
            break;
          }
          
          currentPage++;
        }

        // Transform orders to TicketSale format
        const transformedSales: TicketSale[] = [];
        
        for (const order of allOrders) {
          // Get event details for each order item
          for (const item of order.items || []) {
            // Get tickets for this order item
            const tickets = item.tickets || [];
            
            if (tickets.length === 0) {
              // If no tickets, create one sale entry for the order item
              const eventName = item.ticketTypeName || "Unknown Event";
              transformedSales.push({
                id: `${order.id}-${item.id}`,
                orderNumber: order.orderNumber,
                ticketNumber: `TIX-${order.orderNumber}`,
                eventName,
                eventImage: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=800&q=80",
                ticketType: item.ticketTypeName,
                price: item.unitPriceCents / 100,
                quantity: item.quantity,
                totalAmount: item.totalPriceCents / 100,
                customerName: order.buyer ? `${order.buyer.firstName || ""} ${order.buyer.lastName || ""}`.trim() || "Guest" : "Guest",
                customerEmail: order.buyer?.email || "",
                customerPhone: order.buyer?.phoneNumber || "",
                purchaseDate: order.createdAt,
                paymentMethod: "mpesa", // TODO: Get from payment
                paymentStatus: order.status === "CONFIRMED" ? "paid" : order.status === "PENDING" ? "pending" : order.status === "CANCELLED" ? "failed" : "pending",
                orderStatus: order.status === "CONFIRMED" ? "confirmed" : order.status === "PENDING" ? "pending" : order.status === "CANCELLED" ? "cancelled" : "pending",
                checkInStatus: "not_checked_in", // TODO: Get from ticket status
                refundStatus: "none", // TODO: Get from refunds
              });
            } else {
              // Create a sale entry for each ticket
              for (const ticket of tickets) {
                const eventName = item.ticketTypeName || "Unknown Event";
                transformedSales.push({
                  id: ticket.id,
                  orderNumber: order.orderNumber,
                  ticketNumber: ticket.ticketNumber,
                  eventName,
                  eventImage: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=800&q=80",
                  ticketType: item.ticketTypeName,
                  price: item.unitPriceCents / 100,
                  quantity: 1,
                  totalAmount: item.unitPriceCents / 100,
                  customerName: ticket.attendeeName || order.buyer ? `${order.buyer?.firstName || ""} ${order.buyer?.lastName || ""}`.trim() || "Guest" : "Guest",
                  customerEmail: ticket.attendeeEmail || order.buyer?.email || "",
                  customerPhone: ticket.attendeePhone || order.buyer?.phoneNumber || "",
                  purchaseDate: order.createdAt,
                  paymentMethod: "mpesa", // TODO: Get from payment
                  paymentStatus: order.status === "CONFIRMED" ? "paid" : order.status === "PENDING" ? "pending" : order.status === "CANCELLED" ? "failed" : "pending",
                  orderStatus: order.status === "CONFIRMED" ? "confirmed" : order.status === "PENDING" ? "pending" : order.status === "CANCELLED" ? "cancelled" : "pending",
                  checkInStatus: ticket.status === "CHECKED_IN" ? "checked_in" : ticket.status === "VOIDED" ? "no_show" : "not_checked_in",
                  refundStatus: "none", // TODO: Get from refunds
                });
              }
            }
          }
        }

        setSales(transformedSales);
      } catch (err: any) {
        console.error("Failed to load sales:", err);
        setError(err.message || "Failed to load sales");
      } finally {
        setLoading(false);
      }
    }

    loadSales();
  }, [user, statusFilter]);

  const filteredSales = useMemo(() => {
    let filtered = sales;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = sales.filter(
        (sale) =>
          sale.orderNumber.toLowerCase().includes(query) ||
          sale.ticketNumber.toLowerCase().includes(query) ||
          sale.customerName.toLowerCase().includes(query) ||
          sale.customerEmail.toLowerCase().includes(query) ||
          sale.customerPhone.includes(query) ||
          sale.eventName.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((sale) => sale.orderStatus === statusFilter);
    }

    if (paymentFilter !== "all") {
      filtered = filtered.filter((sale) => sale.paymentStatus === paymentFilter);
    }

    if (eventFilter !== "all") {
      filtered = filtered.filter((sale) => sale.eventName === eventFilter);
    }

    return filtered;
  }, [sales, searchQuery, statusFilter, paymentFilter, eventFilter]);

  const totalStats = useMemo(() => {
    return {
      totalOrders: sales.length,
      totalRevenue: sales.reduce((sum, sale) => sum + sale.totalAmount, 0),
      paidOrders: sales.filter((s) => s.paymentStatus === "paid").length,
      pendingOrders: sales.filter((s) => s.paymentStatus === "pending").length,
      checkedIn: sales.filter((s) => s.checkInStatus === "checked_in").length,
    };
  }, [sales]);

  const uniqueEvents = useMemo(() => {
    const events = new Set(sales.map((sale) => sale.eventName));
    return Array.from(events);
  }, [sales]);

  const getStatusBadge = (status: TicketSale["orderStatus"]) => {
    const config = {
      confirmed: { label: "Confirmed", className: "bg-green-100 text-green-700" },
      pending: { label: "Pending", className: "bg-amber-100 text-amber-700" },
      cancelled: { label: "Cancelled", className: "bg-red-100 text-red-700" },
      refunded: { label: "Refunded", className: "bg-slate-100 text-slate-700" },
    };
    const statusConfig = config[status];
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${statusConfig.className}`}
      >
        {statusConfig.label}
      </span>
    );
  };

  const getPaymentBadge = (status: TicketSale["paymentStatus"]) => {
    const config = {
      paid: { label: "Paid", className: "bg-green-100 text-green-700" },
      pending: { label: "Pending", className: "bg-amber-100 text-amber-700" },
      failed: { label: "Failed", className: "bg-red-100 text-red-700" },
      refunded: { label: "Refunded", className: "bg-slate-100 text-slate-700" },
    };
    const statusConfig = config[status];
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${statusConfig.className}`}
      >
        {statusConfig.label}
      </span>
    );
  };

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
            <Ticket className="size-4" />
            <span>Total Orders</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {totalStats.totalOrders}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <DollarSign className="size-4 text-emerald-600" />
            <span>Total Revenue</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            KES {totalStats.totalRevenue.toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <CheckCircle2 className="size-4 text-green-600" />
            <span>Paid</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {totalStats.paidOrders}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Clock className="size-4 text-amber-600" />
            <span>Pending</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {totalStats.pendingOrders}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <TrendingUp className="size-4 text-blue-600" />
            <span>Checked In</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {totalStats.checkedIn}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            type="text"
            placeholder="Search by order number, ticket number, customer name, email, phone..."
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
              <SelectItem key={event} value={event}>
                {event}
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
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>
        <Select value={paymentFilter} onValueChange={setPaymentFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Payment Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Payments</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>
        <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
          <Download className="size-4" />
          Export
        </button>
      </div>

      {/* Sales List */}
      <div className="space-y-4">
        {filteredSales.map((sale) => (
          <div
            key={sale.id}
            className="rounded-xl border border-slate-200 bg-white p-6 transition hover:shadow-lg"
          >
            <div className="flex flex-col gap-4 lg:flex-row">
              {/* Event Image */}
              <div className="relative h-32 w-full overflow-hidden rounded-lg bg-slate-100 lg:h-24 lg:w-32">
                <Image
                  src={sale.eventImage}
                  alt={sale.eventName}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Content */}
              <div className="flex-1 space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{sale.eventName}</h3>
                    <p className="mt-1 text-sm text-slate-600">{sale.ticketType}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {getStatusBadge(sale.orderStatus)}
                    {getPaymentBadge(sale.paymentStatus)}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <p className="text-xs text-slate-600">Order Number</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {sale.orderNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Ticket Number</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {sale.ticketNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Amount</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      KES {sale.totalAmount.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Purchase Date</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {new Date(sale.purchaseDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <p className="text-xs text-slate-600">Customer</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {sale.customerName}
                    </p>
                    <p className="mt-1 text-xs text-slate-600 flex items-center gap-1">
                      <Mail className="size-3" />
                      {sale.customerEmail}
                    </p>
                    <p className="mt-1 text-xs text-slate-600 flex items-center gap-1">
                      <Phone className="size-3" />
                      {sale.customerPhone}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Payment Method</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900 capitalize">
                      {sale.paymentMethod}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Check-In Status</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900 capitalize">
                      {sale.checkInStatus.replace("_", " ")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-start gap-2 lg:flex-col">
                <button className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                  <Eye className="size-4" />
                  View
                </button>
                <button className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                  <FileText className="size-4" />
                  Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredSales.length === 0 && (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-12 text-center">
          <Ticket className="mx-auto size-12 text-slate-300" />
          <p className="mt-4 text-lg font-semibold text-slate-900">No sales found</p>
          <p className="mt-2 text-sm text-slate-600">
            Adjust your filters or wait for ticket sales to appear.
          </p>
        </div>
      )}
    </div>
  );
}

