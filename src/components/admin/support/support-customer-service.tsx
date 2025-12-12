"use client";

import { useState, useMemo, useEffect } from "react";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/contexts/toast-context";
import {
  Headphones,
  Search,
  Filter,
  Mail,
  Phone,
  MessageSquare,
  Clock,
  AlertCircle,
  CheckCircle2,
  User,
  Ticket,
  Download,
  Eye,
  RefreshCw,
  Edit2,
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

type TicketStatus = "open" | "in_progress" | "resolved" | "closed";

type SupportTicket = {
  id: string;
  ticketNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  subject: string;
  status: TicketStatus;
  priority: "low" | "medium" | "high" | "urgent";
  category: string;
  createdAt: string;
  lastActivity: string;
  assignedTo?: string;
  eventName?: string;
  orderId?: string;
};

const mockTickets: SupportTicket[] = [
  {
    id: "st-1",
    ticketNumber: "SUP-2024-001",
    customerName: "John Doe",
    customerEmail: "john@example.com",
    customerPhone: "+254 700 123 456",
    subject: "Ticket not received",
    status: "open",
    priority: "high",
    category: "Ticket Delivery",
    createdAt: "2024-03-15T09:00:00Z",
    lastActivity: "2024-03-15T09:00:00Z",
    eventName: "Nairobi Music Festival",
    orderId: "order-123",
  },
];

export function SupportCustomerService() {
  const { user } = useAuth();
  const toast = useToast();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [displayedCount, setDisplayedCount] = useState(9);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"tickets" | "customers" | "tools">("tickets");

  useEffect(() => {
    if (user && activeTab === "tickets") {
      loadTickets(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, activeTab, statusFilter, searchQuery]);

  const loadTickets = async (reset: boolean = true) => {
    if (!user) return;
    try {
      if (reset) {
        setLoading(true);
        setDisplayedCount(9);
      } else {
        setLoadingMore(true);
      }

      const page = reset ? 1 : Math.floor(displayedCount / 9) + 1;
      const status = statusFilter !== "all" ? statusFilter.toUpperCase() : undefined;
      
      const response = await apiClient.get<{
        data: Array<{
          id: string;
          ticketNumber?: string;
          subject: string;
          status: string;
          priority: string;
          category?: string;
          createdAt: string;
          updatedAt: string;
          user?: { firstName?: string; lastName?: string; email: string; phoneNumber?: string };
          organiser?: { name: string };
          assignedTo?: { firstName?: string; lastName?: string; email: string };
        }>;
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      }>(`/support-tickets/admin/all?page=${page}&limit=9&status=${status || ''}&search=${encodeURIComponent(searchQuery || '')}`);

      const mappedTickets: SupportTicket[] = (response.data || []).map((t) => ({
        id: t.id,
        ticketNumber: t.ticketNumber || `SUP-${t.id.slice(0, 8).toUpperCase()}`,
        customerName: t.user ? `${t.user.firstName || ''} ${t.user.lastName || ''}`.trim() || t.user.email : 'Unknown',
        customerEmail: t.user?.email || '',
        customerPhone: t.user?.phoneNumber || '',
        subject: t.subject,
        status: (t.status.toLowerCase() as TicketStatus) || 'open',
        priority: (t.priority.toLowerCase() as "low" | "medium" | "high" | "urgent") || 'medium',
        category: t.category || 'General',
        createdAt: t.createdAt,
        lastActivity: t.updatedAt,
        assignedTo: t.assignedTo ? `${t.assignedTo.firstName || ''} ${t.assignedTo.lastName || ''}`.trim() || t.assignedTo.email : undefined,
        eventName: t.organiser?.name,
      }));

      if (reset) {
        setTickets(mappedTickets);
      } else {
        setTickets(prev => [...prev, ...mappedTickets]);
      }

      setHasMore(response.total > displayedCount + mappedTickets.length);
    } catch (error) {
      console.error('Failed to load tickets:', error);
      toast.error('Failed to load tickets', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    setDisplayedCount(prev => prev + 9);
    loadTickets(false);
  };

  const handleExport = () => {
    const csv = [
      ['Ticket Number', 'Customer', 'Email', 'Subject', 'Status', 'Priority', 'Category', 'Assigned To', 'Created At'],
      ...tickets.map((t) => [
        t.ticketNumber,
        t.customerName,
        t.customerEmail,
        t.subject,
        t.status,
        t.priority,
        t.category,
        t.assignedTo || '',
        new Date(t.createdAt).toLocaleString(),
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin-support-tickets-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Exported', 'Support tickets exported to CSV');
  };

  const stats = useMemo(() => {
    return {
      total: tickets.length,
      open: tickets.filter((t) => t.status === "open").length,
      inProgress: tickets.filter((t) => t.status === "in_progress").length,
      urgent: tickets.filter((t) => t.priority === "urgent").length,
    };
  }, [tickets]);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-sm text-slate-600">Total Tickets</div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{stats.total}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-sm text-slate-600">Open</div>
          <p className="mt-2 text-2xl font-bold text-blue-600">{stats.open}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-sm text-slate-600">In Progress</div>
          <p className="mt-2 text-2xl font-bold text-amber-600">{stats.inProgress}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-sm text-slate-600">Urgent</div>
          <p className="mt-2 text-2xl font-bold text-red-600">{stats.urgent}</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="tickets">Support Tickets</TabsTrigger>
            <TabsTrigger value="customers">Customer Search</TabsTrigger>
            <TabsTrigger value="tools">Tools</TabsTrigger>
          </TabsList>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="mr-2 size-4" />
            Export
          </Button>
        </div>

        <TabsContent value="tickets" className="mt-6">
          <div className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search tickets..."
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
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {loading ? (
              <div className="flex items-center justify-center p-12">
                <div className="text-center">
                  <div className="mx-auto size-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
                  <p className="mt-4 text-sm text-slate-600">Loading tickets...</p>
                </div>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                          Ticket
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                          Customer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                          Subject
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                          Priority
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                          Created
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {tickets.map((ticket) => (
                        <tr key={ticket.id} className="hover:bg-slate-50">
                          <td className="whitespace-nowrap px-6 py-4">
                            <div className="text-sm font-semibold text-slate-900">
                              {ticket.ticketNumber}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm text-slate-900">{ticket.customerName}</div>
                              <div className="text-xs text-slate-500">{ticket.customerEmail}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-slate-900">{ticket.subject}</div>
                            {ticket.eventName && (
                              <div className="text-xs text-slate-500">{ticket.eventName}</div>
                            )}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4">
                            <TicketStatusBadge status={ticket.status} />
                          </td>
                          <td className="whitespace-nowrap px-6 py-4">
                            <PriorityBadge priority={ticket.priority} />
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">
                            {new Date(ticket.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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

                {tickets.length === 0 && !loadingMore && (
                  <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-12 text-center">
                    <p className="text-slate-600">No tickets found</p>
                  </div>
                )}
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="customers" className="mt-6">
          <CustomerSearchTab />
        </TabsContent>

        <TabsContent value="tools" className="mt-6">
          <SupportToolsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TicketStatusBadge({ status }: { status: TicketStatus }) {
  const config = {
    open: { label: "Open", className: "bg-blue-100 text-blue-700", icon: Clock },
    in_progress: { label: "In Progress", className: "bg-amber-100 text-amber-700", icon: Clock },
    resolved: { label: "Resolved", className: "bg-green-100 text-green-700", icon: CheckCircle2 },
    closed: { label: "Closed", className: "bg-slate-100 text-slate-700", icon: CheckCircle2 },
  };
  const statusConfig = config[status];
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

function PriorityBadge({ priority }: { priority: "low" | "medium" | "high" | "urgent" }) {
  const config = {
    low: { label: "Low", className: "bg-green-100 text-green-700" },
    medium: { label: "Medium", className: "bg-blue-100 text-blue-700" },
    high: { label: "High", className: "bg-amber-100 text-amber-700" },
    urgent: { label: "Urgent", className: "bg-red-100 text-red-700" },
  };
  const statusConfig = config[priority];
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusConfig.className}`}
    >
      {statusConfig.label}
    </span>
  );
}

function CustomerSearchTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [customers] = useState([
    {
      id: "cust-1",
      name: "John Doe",
      email: "john@example.com",
      phone: "+254 700 123 456",
      orders: 5,
      totalSpent: 25000,
      lastOrder: "2024-03-10",
      tickets: 12,
    },
  ]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <Input
          type="text"
          placeholder="Search by name, email, phone, or ticket number..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm"
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {customers.map((customer) => (
          <div
            key={customer.id}
            className="rounded-xl border border-slate-200 bg-white p-6"
          >
            <h3 className="text-lg font-semibold text-slate-900">{customer.name}</h3>
            <div className="mt-2 space-y-1 text-sm text-slate-600">
              <div>{customer.email}</div>
              <div>{customer.phone}</div>
              <div className="mt-3 flex items-center justify-between">
                <span>Orders:</span>
                <span className="font-semibold text-slate-900">{customer.orders}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Total Spent:</span>
                <span className="font-semibold text-slate-900">
                  KES {customer.totalSpent.toLocaleString()}
                </span>
              </div>
            </div>
            <div className="mt-4">
              <Button variant="outline" size="sm" className="w-full">
                View Full History
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SupportToolsTab() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-blue-100">
          <Ticket className="size-6 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900">Resend Ticket</h3>
        <p className="mt-2 text-sm text-slate-600">Resend tickets via email or SMS</p>
        <Button variant="outline" size="sm" className="mt-4">
          Open Tool
        </Button>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-green-100">
          <RefreshCw className="size-6 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900">Process Refund</h3>
        <p className="mt-2 text-sm text-slate-600">Issue full or partial refunds</p>
        <Button variant="outline" size="sm" className="mt-4">
          Open Tool
        </Button>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-purple-100">
          <Edit2 className="size-6 text-purple-600" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900">Edit Order</h3>
        <p className="mt-2 text-sm text-slate-600">Modify customer order details</p>
        <Button variant="outline" size="sm" className="mt-4">
          Open Tool
        </Button>
      </div>
    </div>
  );
}

