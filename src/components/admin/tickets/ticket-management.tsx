"use client";

import { useState, useMemo, useEffect } from "react";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/contexts/toast-context";
import {
  Ticket,
  Search,
  Filter,
  Download,
  Eye,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Users,
  DollarSign,
  Calendar,
  FileText,
  QrCode,
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

type TicketStatus = "valid" | "used" | "voided" | "refunded" | "expired";

type AdminTicket = {
  id: string;
  ticketNumber: string;
  eventTitle: string;
  eventId: string;
  ticketType: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  status: TicketStatus;
  purchaseDate: string;
  price: number;
  qrCode: string;
  scannedAt?: string;
  scannedBy?: string;
  orderId: string;
  fraudFlagged: boolean;
};

const mockTickets: AdminTicket[] = [
  {
    id: "ticket-1",
    ticketNumber: "TIX-2024-001234",
    eventTitle: "Nairobi Music Festival 2024",
    eventId: "event-1",
    ticketType: "VIP Pass",
    customerName: "John Doe",
    customerEmail: "john@example.com",
    customerPhone: "+254 700 123 456",
    status: "valid",
    purchaseDate: "2024-03-01T10:00:00Z",
    price: 5000,
    qrCode: "qr-abc123",
    orderId: "order-123",
    fraudFlagged: false,
  },
  {
    id: "ticket-2",
    ticketNumber: "TIX-2024-001235",
    eventTitle: "Nairobi Music Festival 2024",
    eventId: "event-1",
    ticketType: "General Admission",
    customerName: "Jane Smith",
    customerEmail: "jane@example.com",
    customerPhone: "+254 711 234 567",
    status: "used",
    purchaseDate: "2024-03-02T14:30:00Z",
    price: 2500,
    qrCode: "qr-def456",
    scannedAt: "2024-03-15T18:30:00Z",
    scannedBy: "Gate 1 Scanner",
    orderId: "order-124",
    fraudFlagged: false,
  },
];

export function AdminTicketManagement() {
  const { user } = useAuth();
  const toast = useToast();
  const [tickets, setTickets] = useState<AdminTicket[]>([]);
  const [displayedCount, setDisplayedCount] = useState(9);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"all" | "fraud" | "operations">("all");

  useEffect(() => {
    if (user) {
      loadTickets(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, statusFilter, activeTab, searchQuery]);

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
          ticketNumber: string;
          status: string;
          createdAt: string;
          orderItem?: {
            order?: {
              id?: string;
              buyer?: { firstName?: string; lastName?: string; email: string; phoneNumber?: string };
            };
          };
          ticketType?: { name: string };
          event?: { title: string; id: string };
          checkins?: Array<{ createdAt: string; staff?: { firstName?: string; lastName?: string } }>;
        }>;
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      }>(`/admin/tickets?page=${page}&limit=9&status=${status || ''}&search=${encodeURIComponent(searchQuery || '')}`);

      const mappedTickets: AdminTicket[] = (response.data || []).map((t) => {
        const buyer = t.orderItem?.order?.buyer;
        const latestCheckin = t.checkins && t.checkins.length > 0 ? t.checkins[t.checkins.length - 1] : null;
        
        return {
          id: t.id,
          ticketNumber: t.ticketNumber,
          eventTitle: t.event?.title || 'Unknown Event',
          eventId: t.event?.id || '',
          ticketType: t.ticketType?.name || 'Unknown',
          customerName: buyer ? `${buyer.firstName || ''} ${buyer.lastName || ''}`.trim() || buyer.email : 'Unknown',
          customerEmail: buyer?.email || '',
          customerPhone: buyer?.phoneNumber || '',
          status: (t.status.toLowerCase() as TicketStatus) || 'valid',
          purchaseDate: t.createdAt,
          price: 0, // Would need to get from order
          qrCode: t.id,
          scannedAt: latestCheckin?.createdAt,
          scannedBy: latestCheckin?.staff ? `${latestCheckin.staff.firstName || ''} ${latestCheckin.staff.lastName || ''}`.trim() : undefined,
          orderId: t.orderItem?.order?.id || '',
          fraudFlagged: false, // Would need fraud detection logic
        };
      });

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
      ['Ticket Number', 'Event', 'Ticket Type', 'Customer', 'Email', 'Status', 'Purchase Date', 'Scanned At'],
      ...tickets.map((t) => [
        t.ticketNumber,
        t.eventTitle,
        t.ticketType,
        t.customerName,
        t.customerEmail,
        t.status,
        new Date(t.purchaseDate).toLocaleString(),
        t.scannedAt ? new Date(t.scannedAt).toLocaleString() : '',
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin-tickets-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Exported', 'Tickets exported to CSV');
  };

  const filteredTickets = activeTab === "fraud" ? tickets.filter((t) => t.fraudFlagged) : tickets;

  const stats = useMemo(() => {
    return {
      total: tickets.length,
      valid: tickets.filter((t) => t.status === "valid").length,
      used: tickets.filter((t) => t.status === "used").length,
      fraudFlagged: tickets.filter((t) => t.fraudFlagged).length,
      totalRevenue: tickets.reduce((sum, t) => sum + t.price, 0),
    };
  }, [tickets]);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-sm text-slate-600">Total Tickets</div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{stats.total}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-sm text-slate-600">Valid</div>
          <p className="mt-2 text-2xl font-bold text-green-600">{stats.valid}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-sm text-slate-600">Used</div>
          <p className="mt-2 text-2xl font-bold text-blue-600">{stats.used}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-sm text-slate-600">Fraud Flagged</div>
          <p className="mt-2 text-2xl font-bold text-red-600">{stats.fraudFlagged}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-sm text-slate-600">Revenue</div>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            KES {(stats.totalRevenue / 1000).toFixed(0)}k
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">All Tickets</TabsTrigger>
            <TabsTrigger value="fraud">
              Fraud Flagged ({stats.fraudFlagged})
            </TabsTrigger>
            <TabsTrigger value="operations">Operations</TabsTrigger>
          </TabsList>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="mr-2 size-4" />
            Export
          </Button>
        </div>

        <TabsContent value={activeTab} className="mt-6">
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search by ticket number, customer, email, phone..."
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
                  <SelectItem value="valid">Valid</SelectItem>
                  <SelectItem value="used">Used</SelectItem>
                  <SelectItem value="voided">Voided</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
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
                {/* Tickets Table */}
                <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                          Ticket
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                          Event
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                          Customer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                          Price
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-700">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {filteredTickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-slate-50">
                      <td className="whitespace-nowrap px-6 py-4">
                        <div>
                          <div className="text-sm font-semibold text-slate-900">
                            {ticket.ticketNumber}
                          </div>
                          <div className="text-xs text-slate-500">{ticket.ticketType}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-900">{ticket.eventTitle}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-slate-900">
                            {ticket.customerName}
                          </div>
                          <div className="text-xs text-slate-500">{ticket.customerEmail}</div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <StatusBadge status={ticket.status} />
                        {ticket.fraudFlagged && (
                          <span className="ml-2 text-red-600">
                            <AlertTriangle className="size-4" />
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-900">
                        KES {ticket.price.toLocaleString()}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="size-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <RefreshCw className="size-4" />
                          </Button>
                        </div>
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

            {filteredTickets.length === 0 && !loadingMore && (
              <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-12 text-center">
                <p className="text-slate-600">No tickets found</p>
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

function StatusBadge({ status }: { status: TicketStatus }) {
  const config = {
    valid: { label: "Valid", className: "bg-green-100 text-green-700", icon: CheckCircle2 },
    used: { label: "Used", className: "bg-blue-100 text-blue-700", icon: CheckCircle2 },
    voided: { label: "Voided", className: "bg-red-100 text-red-700", icon: XCircle },
    refunded: { label: "Refunded", className: "bg-amber-100 text-amber-700", icon: RefreshCw },
    expired: { label: "Expired", className: "bg-slate-100 text-slate-700", icon: XCircle },
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

