"use client";

import { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/contexts/toast-context";
import { apiClient } from "@/lib/api";
import { resendTickets, type Order as ApiOrder } from "@/lib/tickets-api";
import {
  Search,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Ticket,
  Download,
  Send,
  Ban,
  Edit,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  User,
  TrendingUp,
  DollarSign,
  Shield,
  AlertCircle,
  X,
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

type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  location?: string | null;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
  status: "active" | "blocked" | "flagged";
  orders: CustomerOrder[];
  allOrders?: CustomerOrder[];
  timeline: TimelineEvent[];
};

type CustomerOrder = {
  id: string;
  orderNumber: string;
  eventName: string;
  eventImage: string;
  ticketType: string;
  quantity: number;
  amount: number;
  date: string;
  status: string;
  orderId: string; // For API calls
};

type TimelineEvent = {
  id: string;
  type: "purchase" | "checkin" | "support" | "refund" | "transfer";
  title: string;
  description: string;
  date: string;
  metadata?: Record<string, unknown>;
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

// Map API order to CustomerOrder format
function mapApiOrderToCustomerOrder(apiOrder: ApiOrder): CustomerOrder {
  const firstItem = apiOrder.items?.[0];
  const eventName = firstItem?.ticketType?.event?.title || "Unknown Event";
  const eventImage = firstItem?.ticketType?.event?.coverImageUrl || "";
  const ticketType = firstItem?.ticketTypeName || "Unknown";
  const quantity = firstItem?.quantity || 0;
  const amount = apiOrder.totalAmountCents / 100;

  // Map order status to display format
  const statusMap: Record<string, string> = {
    PENDING: "pending",
    PAID: "confirmed",
    CANCELLED: "cancelled",
    REFUNDED: "refunded",
    PARTIALLY_REFUNDED: "refunded",
  };
  const displayStatus = statusMap[apiOrder.status] || apiOrder.status.toLowerCase();

  return {
    id: apiOrder.id,
    orderNumber: apiOrder.orderNumber,
    eventName,
    eventImage,
    ticketType,
    quantity,
    amount,
    date: apiOrder.createdAt,
    status: displayStatus,
    orderId: apiOrder.id,
  };
}

// Map API customer data to component format
function mapApiCustomerToComponentCustomer(
  apiCustomer: {
    id: string;
    name: string;
    email: string;
    phone: string;
    location?: string | null;
    totalOrders: number;
    totalSpent: number;
    lastOrderDate: string;
    status: "active" | "blocked" | "flagged";
    orders: ApiOrder[];
    allOrders?: ApiOrder[];
  },
  currentOrganiserId: string
): Customer {
  // Filter orders to only include those for the current organiser (safety check)
  const filteredOrders = apiCustomer.orders.filter(
    (order) => order.organiserId === currentOrganiserId
  );
  const filteredAllOrders = (apiCustomer.allOrders || apiCustomer.orders).filter(
    (order) => order.organiserId === currentOrganiserId
  );

  // Map orders
  const orders = filteredOrders.map(mapApiOrderToCustomerOrder);
  const allOrders = filteredAllOrders.map(mapApiOrderToCustomerOrder);

  // Build timeline from orders (only for current organiser)
  const timeline: TimelineEvent[] = [];
  
  allOrders.forEach((order) => {
    timeline.push({
      id: `purchase-${order.id}`,
      type: "purchase",
      title: `Purchased ${order.ticketType}`,
      description: `${order.quantity} ticket${order.quantity > 1 ? "s" : ""} for ${order.eventName}`,
      date: order.date,
      metadata: { orderId: order.id },
    });
  });

  // TODO: Add checkins, refunds, transfers from API when available (only for current organiser)

  return {
    id: apiCustomer.id,
    name: apiCustomer.name,
    email: apiCustomer.email,
    phone: apiCustomer.phone,
    location: apiCustomer.location,
    totalOrders: filteredOrders.length, // Use filtered count
    totalSpent: apiCustomer.totalSpent, // This is already calculated for current organiser only
    lastOrderDate: apiCustomer.lastOrderDate,
    status: apiCustomer.status,
    orders,
    allOrders,
    timeline,
  };
}

export function CustomerProfiles() {
  const { user } = useAuth();
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [displayedCount, setDisplayedCount] = useState(10); // Show 10 customers initially
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [organiserId, setOrganiserId] = useState<string | null>(null);

  // Fetch customers from API
  useEffect(() => {
    async function loadCustomers() {
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
        setOrganiserId(orgId);

        // Fetch customers from organiser dashboard endpoint
        const customersResponse = await apiClient.get<Array<{
          id: string;
          name: string;
          email: string;
          phone: string;
          location?: string | null;
          totalOrders: number;
          totalSpent: number;
          lastOrderDate: string;
          status: "active" | "blocked" | "flagged";
          orders: ApiOrder[];
          allOrders?: ApiOrder[];
        }>>(`/organisers/${orgId}/customers`);

        const mappedCustomers = (customersResponse || []).map((customer) =>
          mapApiCustomerToComponentCustomer(customer, orgId)
        );
        setCustomers(mappedCustomers);
        setDisplayedCount(10); // Reset to initial count
      } catch (err: unknown) {
        console.error("Failed to load customers:", err);
        const errorMessage = err instanceof Error ? err.message : "Failed to load customers";
        setError(errorMessage);
        toast.error("Failed to load customers", errorMessage);
      } finally {
        setLoading(false);
      }
    }

    loadCustomers();
  }, [user]);

  const filteredCustomers = useMemo(() => {
    let filtered = customers;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (customer) =>
          customer.name.toLowerCase().includes(query) ||
          customer.email.toLowerCase().includes(query) ||
          customer.phone.includes(query)
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((customer) => customer.status === statusFilter);
    }

    return filtered;
  }, [customers, searchQuery, statusFilter]);

  // Get displayed customers (for load more)
  const displayedCustomers = useMemo(() => {
    return filteredCustomers.slice(0, displayedCount);
  }, [filteredCustomers, displayedCount]);

  const hasMore = displayedCount < filteredCustomers.length;

  const loadMore = () => {
    setDisplayedCount(prev => Math.min(prev + 10, filteredCustomers.length));
  };

  const selectedCustomerData = selectedCustomer
    ? displayedCustomers.find((c) => c.id === selectedCustomer)
    : null;

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block size-8 animate-spin rounded-full border-4 border-solid border-slate-900 border-r-transparent"></div>
          <p className="text-sm text-slate-600">Loading customers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-red-200 bg-red-50 p-12 text-center">
        <AlertCircle className="mx-auto size-12 text-red-400" />
        <p className="mt-4 text-lg font-semibold text-red-900">Error loading customers</p>
        <p className="mt-2 text-sm text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm focus:border-slate-900 focus:ring-slate-900"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="blocked">Blocked</SelectItem>
            <SelectItem value="flagged">Flagged</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Customer List */}
        <div className="lg:col-span-1">
          <div className="space-y-3">
            {displayedCustomers.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 text-center">
                <User className="mx-auto size-8 text-slate-300" />
                <p className="mt-2 text-sm text-slate-600">No customers found</p>
              </div>
            ) : (
              <>
                {displayedCustomers.map((customer) => (
                  <button
                    key={customer.id}
                    onClick={() => setSelectedCustomer(customer.id)}
                    className={`w-full rounded-xl border-2 p-4 text-left transition ${
                      selectedCustomer === customer.id
                        ? "border-slate-900 bg-slate-50"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900">{customer.name}</h4>
                        <p className="mt-1 text-sm text-slate-600">{customer.email}</p>
                        <p className="mt-1 text-sm text-slate-600">{customer.phone}</p>
                      </div>
                      {customer.status === "blocked" && (
                        <Ban className="size-5 text-red-600" />
                      )}
                      {customer.status === "flagged" && (
                        <Shield className="size-5 text-amber-600" />
                      )}
                    </div>
                    <div className="mt-3 flex items-center gap-4 text-xs text-slate-600">
                      <span>{customer.totalOrders} orders</span>
                      <span>KES {(customer.totalSpent || 0).toLocaleString()}</span>
                    </div>
                  </button>
                ))}
                {hasMore && !searchQuery && (
                  <button
                    onClick={loadMore}
                    className="w-full rounded-xl border-2 border-slate-200 bg-white p-4 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Load More ({filteredCustomers.length - displayedCount} remaining)
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Customer Detail */}
        <div className="lg:col-span-2">
          {selectedCustomerData ? (
            <CustomerDetail
              customer={selectedCustomerData}
              organiserId={organiserId}
              onUpdate={() => {
                // Reload customers after update
                if (organiserId) {
                  apiClient.get(`/organisers/${organiserId}/customers`).then((response) => {
                    const mapped = (response || []).map((customer) =>
                      mapApiCustomerToComponentCustomer(customer, organiserId)
                    );
                    setCustomers(mapped);
                  });
                }
              }}
            />
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-12 text-center">
              <User className="mx-auto size-12 text-slate-300" />
              <p className="mt-4 text-lg font-semibold text-slate-900">Select a customer</p>
              <p className="mt-2 text-sm text-slate-600">
                Choose a customer from the list to view their profile and timeline
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CustomerDetail({
  customer,
  organiserId,
  onUpdate,
}: {
  customer: Customer;
  organiserId: string | null;
  onUpdate: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [showAllOrders, setShowAllOrders] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: customer.name.split(" ")[0] || "",
    lastName: customer.name.split(" ").slice(1).join(" ") || "",
    email: customer.email,
    phone: customer.phone,
  });
  const [saving, setSaving] = useState(false);
  const [blocking, setBlocking] = useState(false);
  const [resending, setResending] = useState(false);
  const [downloadingPDF, setDownloadingPDF] = useState<string | null>(null);

  const handleEdit = async () => {
    if (!organiserId) return;

    try {
      setSaving(true);
      await apiClient.patch(`/organisers/${organiserId}/customers/${customer.id}`, {
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        email: editForm.email,
        phoneNumber: editForm.phone,
      });
      setIsEditing(false);
      onUpdate();
      toast.success("Customer updated", "Customer information has been updated successfully");
    } catch (err: unknown) {
      console.error("Failed to update customer:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to update customer";
      toast.error("Failed to update customer", errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleBlock = async (blocked: boolean) => {
    if (!organiserId) return;

    // Use a custom confirmation dialog or just proceed (toast will show result)
    const proceed = window.confirm(
      blocked 
        ? "Are you sure you want to block this customer?" 
        : "Are you sure you want to unblock this customer?"
    );
    if (!proceed) return;

    try {
      setBlocking(true);
      await apiClient.patch(`/organisers/${organiserId}/customers/${customer.id}/block`, { blocked });
      onUpdate();
      toast.success(
        blocked ? "Customer blocked" : "Customer unblocked",
        `Customer has been ${blocked ? "blocked" : "unblocked"} successfully`
      );
    } catch (err: unknown) {
      console.error("Failed to block/unblock customer:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to update customer status";
      toast.error("Failed to update customer status", errorMessage);
    } finally {
      setBlocking(false);
    }
  };

  const handleDownloadPDF = async (orderId: string) => {
    try {
      setDownloadingPDF(orderId);
      
      // Get all tickets for this order
      const order = await apiClient.get<ApiOrder>(`/orders/${orderId}`);
      const tickets = order.items?.flatMap((item) => item.tickets || []) || [];

      if (tickets.length === 0) {
        toast.warning("No tickets found", "No tickets found for this order");
        setDownloadingPDF(null);
        return;
      }

      let successCount = 0;
      let failCount = 0;

      // Download PDF for each ticket
      for (const ticket of tickets) {
        try {
          // Use fetch directly for blob response since apiClient might not handle it correctly
          const token = apiClient.getAccessToken();
          const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
          const response = await fetch(`${API_BASE_URL}/tickets/${ticket.id}/pdf`, {
            headers: {
              'Authorization': token ? `Bearer ${token}` : '',
            },
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const blob = await response.blob();

          // Create download link
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `ticket-${ticket.ticketNumber}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          successCount++;
        } catch (err) {
          console.error(`Failed to download PDF for ticket ${ticket.id}:`, err);
          failCount++;
        }
      }

      if (successCount > 0) {
        toast.success(
          "PDF downloaded",
          `Successfully downloaded ${successCount} ticket PDF${successCount > 1 ? 's' : ''}`
        );
      }
      if (failCount > 0) {
        toast.warning(
          "Some downloads failed",
          `Failed to download ${failCount} ticket PDF${failCount > 1 ? 's' : ''}`
        );
      }
    } catch (err: unknown) {
      console.error("Failed to download PDF:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to download PDF";
      toast.error("Failed to download PDF", errorMessage);
    } finally {
      setDownloadingPDF(null);
    }
  };

  const handleResendTickets = async (orderId: string) => {
    try {
      await resendTickets(orderId, "email");
      toast.success("Tickets resent", "Tickets have been resent successfully via email");
    } catch (err: unknown) {
      console.error("Failed to resend tickets:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to resend tickets";
      toast.error("Failed to resend tickets", errorMessage);
    }
  };

  const handleResendAll = async () => {
    const proceed = window.confirm("Are you sure you want to resend all tickets for this customer?");
    if (!proceed) return;

    try {
      setResending(true);
      const allOrders = customer.allOrders || customer.orders;
      const paidOrders = allOrders.filter((o) => 
        o.status === "PAID" || 
        o.status === "confirmed" || 
        o.status === "paid"
      );

      if (paidOrders.length === 0) {
        toast.warning("No paid orders", "No paid orders found to resend tickets for");
        return;
      }

      let successCount = 0;
      let failCount = 0;

      for (const order of paidOrders) {
        try {
          await resendTickets(order.orderId, "email");
          successCount++;
        } catch (err) {
          console.error(`Failed to resend tickets for order ${order.orderId}:`, err);
          failCount++;
        }
      }

      if (successCount > 0) {
        toast.success(
          "Tickets resent",
          `Successfully resent tickets for ${successCount} order${successCount > 1 ? 's' : ''}`
        );
      }
      if (failCount > 0) {
        toast.warning(
          "Some resends failed",
          `Failed to resend tickets for ${failCount} order${failCount > 1 ? 's' : ''}`
        );
      }
    } catch (err: unknown) {
      console.error("Failed to resend all tickets:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to resend tickets";
      toast.error("Failed to resend tickets", errorMessage);
    } finally {
      setResending(false);
    }
  };

  const displayOrders = showAllOrders ? (customer.allOrders || customer.orders) : customer.orders;

  return (
    <div className="space-y-6">
      {/* Customer Header */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-xs text-slate-600">First Name</label>
                    <Input
                      value={editForm.firstName}
                      onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-600">Last Name</label>
                    <Input
                      value={editForm.lastName}
                      onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-600">Email</label>
                    <Input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-600">Phone</label>
                    <Input
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleEdit}
                    disabled={saving}
                    className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <h3 className="text-2xl font-semibold text-slate-900">{customer.name}</h3>
                  {customer.status === "blocked" && (
                    <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                      Blocked
                    </span>
                  )}
                  {customer.status === "flagged" && (
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                      Flagged
                    </span>
                  )}
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <p className="text-xs text-slate-600">Email</p>
                    <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-slate-900">
                      <Mail className="size-4" />
                      {customer.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Phone</p>
                    <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-slate-900">
                      <Phone className="size-4" />
                      {customer.phone}
                    </p>
                  </div>
                  {customer.location && (
                    <div>
                      <p className="text-xs text-slate-600">Location</p>
                      <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-slate-900">
                        <MapPin className="size-4" />
                        {customer.location}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-slate-600">Last Order</p>
                    <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-slate-900">
                      <Calendar className="size-4" />
                      {new Date(customer.lastOrderDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
          {!isEditing && (
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(true)}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <Edit className="mr-1 inline size-4" />
                Edit
              </button>
              <button
                onClick={() => handleBlock(customer.status !== "blocked")}
                disabled={blocking}
                className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  customer.status === "blocked"
                    ? "border border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                    : "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                } disabled:opacity-50`}
              >
                <Ban className="mr-1 inline size-4" />
                {customer.status === "blocked" ? "Unblock" : "Block"}
              </button>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs text-slate-600">Total Orders</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{customer.totalOrders}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs text-slate-600">Total Spent</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              KES {(customer.totalSpent || 0).toLocaleString()}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs text-slate-600">Average Order</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              KES {Math.round((customer.totalSpent || 0) / (customer.totalOrders || 1)).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Unified Timeline */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h4 className="mb-4 text-lg font-semibold text-slate-900">Customer Timeline</h4>
        <div className="space-y-4">
          {customer.timeline.length > 0 ? (
            customer.timeline.map((event) => (
              <TimelineItem key={event.id} event={event} />
            ))
          ) : (
            <p className="text-sm text-slate-600">No timeline events yet</p>
          )}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h4 className="text-lg font-semibold text-slate-900">Orders</h4>
          <div className="flex gap-2">
            {customer.allOrders && customer.allOrders.length > customer.orders.length && (
              <button
                onClick={() => setShowAllOrders(!showAllOrders)}
                className="text-sm font-semibold text-slate-700 hover:text-slate-900"
              >
                {showAllOrders ? "Show Less" : "View All"}
              </button>
            )}
            <button
              onClick={handleResendAll}
              disabled={resending}
              className="text-sm font-semibold text-slate-700 hover:text-slate-900 disabled:opacity-50"
            >
              {resending ? "Resending..." : "Resend All"}
            </button>
          </div>
        </div>
        <div className="space-y-4">
          {displayOrders.length > 0 ? (
            displayOrders.map((order) => (
              <OrderItem
                key={order.id}
                order={order}
                onDownloadPDF={() => handleDownloadPDF(order.orderId)}
                onResend={() => handleResendTickets(order.orderId)}
                isDownloading={downloadingPDF === order.orderId}
              />
            ))
          ) : (
            <p className="text-sm text-slate-600">No orders found</p>
          )}
        </div>
      </div>
    </div>
  );
}

function TimelineItem({ event }: { event: TimelineEvent }) {
  const getEventIcon = () => {
    switch (event.type) {
      case "purchase":
        return <Ticket className="size-4 text-green-600" />;
      case "checkin":
        return <CheckCircle2 className="size-4 text-blue-600" />;
      case "support":
        return <FileText className="size-4 text-purple-600" />;
      case "refund":
        return <DollarSign className="size-4 text-red-600" />;
      case "transfer":
        return <TrendingUp className="size-4 text-amber-600" />;
      default:
        return <Clock className="size-4 text-slate-600" />;
    }
  };

  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className="rounded-full border-2 border-slate-200 bg-white p-2">
          {getEventIcon()}
        </div>
        <div className="mt-2 h-full w-0.5 bg-slate-200" />
      </div>
      <div className="flex-1 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <h5 className="font-semibold text-slate-900">{event.title}</h5>
            <p className="mt-1 text-sm text-slate-600">{event.description}</p>
          </div>
          <span className="text-xs text-slate-500">
            {new Date(event.date).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
}

function OrderItem({
  order,
  onDownloadPDF,
  onResend,
  isDownloading = false,
}: {
  order: CustomerOrder;
  onDownloadPDF: () => void;
  onResend: () => void;
  isDownloading?: boolean;
}) {
  return (
    <div className="flex gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="relative h-16 w-16 overflow-hidden rounded-lg bg-slate-100">
        <Image
          src={order.eventImage || "/placeholder-event.jpg"}
          alt={order.eventName}
          fill
          className="object-cover"
        />
      </div>
      <div className="flex-1">
        <h5 className="font-semibold text-slate-900">{order.eventName}</h5>
        <p className="mt-1 text-sm text-slate-600">
          {order.ticketType} • {order.quantity} {order.quantity === 1 ? "ticket" : "tickets"}
        </p>
        <div className="mt-2 flex items-center gap-4 text-xs text-slate-600">
          <span>Order: {order.orderNumber}</span>
          <span>KES {order.amount.toLocaleString()}</span>
          <span>{new Date(order.date).toLocaleDateString()}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onDownloadPDF}
          disabled={isDownloading}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isDownloading ? (
            <>
              <div className="mr-1 inline size-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700"></div>
              Downloading...
            </>
          ) : (
            <>
              <Download className="mr-1 inline size-4" />
              PDF
            </>
          )}
        </button>
        <button
          onClick={onResend}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          <Send className="mr-1 inline size-4" />
          Resend
        </button>
      </div>
    </div>
  );
}
