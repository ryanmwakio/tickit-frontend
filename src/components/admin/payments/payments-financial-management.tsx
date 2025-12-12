"use client";

import { useState, useMemo, useEffect } from "react";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/contexts/toast-context";
import {
  DollarSign,
  CreditCard,
  Wallet,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Download,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
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
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

type PaymentStatus = "success" | "pending" | "failed" | "refunded" | "chargeback";

type Transaction = {
  id: string;
  orderId: string;
  customerName: string;
  eventName: string;
  amount: number;
  method: string;
  status: PaymentStatus;
  timestamp: string;
  organizerId: string;
  organizerName: string;
  fees: number;
  fraudFlagged: boolean;
};

const mockTransactions: Transaction[] = [
  {
    id: "txn-1",
    orderId: "order-123",
    customerName: "John Doe",
    eventName: "Nairobi Music Festival",
    amount: 5000,
    method: "MPesa",
    status: "success",
    timestamp: "2024-03-15T10:30:00Z",
    organizerId: "org-1",
    organizerName: "Flamingo Live",
    fees: 250,
    fraudFlagged: false,
  },
  {
    id: "txn-2",
    orderId: "order-124",
    customerName: "Jane Smith",
    eventName: "Tech Conference",
    amount: 3500,
    method: "Card",
    status: "pending",
    timestamp: "2024-03-15T11:00:00Z",
    organizerId: "org-2",
    organizerName: "Tech Events Co",
    fees: 175,
    fraudFlagged: false,
  },
];

export function PaymentsFinancialManagement() {
  const { user } = useAuth();
  const toast = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [displayedCount, setDisplayedCount] = useState(9);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"overview" | "transactions" | "reconciliation" | "wallets">("overview");

  useEffect(() => {
    if (user && activeTab === "transactions") {
      loadTransactions(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, activeTab, statusFilter, searchQuery]);

  const loadTransactions = async (reset: boolean = true) => {
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
          orderId: string;
          amountCents: number;
          method: string;
          status: string;
          createdAt: string;
          order?: {
            buyer?: { firstName?: string; lastName?: string; email: string };
            organiser?: { name: string; id: string };
            items?: Array<{ ticketType?: { event?: { title: string } } }>;
          };
        }>;
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      }>(`/admin/payments?page=${page}&limit=9&status=${status || ''}`);

      const mappedTransactions: Transaction[] = (response.data || []).map((p) => ({
        id: p.id,
        orderId: p.orderId,
        customerName: p.order?.buyer ? `${p.order.buyer.firstName || ''} ${p.order.buyer.lastName || ''}`.trim() || p.order.buyer.email : 'Unknown',
        eventName: p.order?.items?.[0]?.ticketType?.event?.title || 'Unknown Event',
        amount: Number(p.amountCents || 0),
        method: p.method || 'unknown',
        status: (p.status.toLowerCase() as PaymentStatus) || 'pending',
        timestamp: p.createdAt,
        organizerId: p.order?.organiser?.id || '',
        organizerName: p.order?.organiser?.name || 'Unknown',
        fees: Math.round(Number(p.amountCents || 0) * 0.04), // Estimate 4% fee
        fraudFlagged: false,
      }));

      if (reset) {
        setTransactions(mappedTransactions);
      } else {
        setTransactions(prev => [...prev, ...mappedTransactions]);
      }

      setHasMore(response.total > displayedCount + mappedTransactions.length);
    } catch (error) {
      console.error('Failed to load transactions:', error);
      toast.error('Failed to load transactions', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    setDisplayedCount(prev => prev + 9);
    loadTransactions(false);
  };

  const handleExport = () => {
    const csv = [
      ['Transaction ID', 'Order ID', 'Customer', 'Event', 'Amount', 'Method', 'Status', 'Organizer', 'Fees', 'Timestamp'],
      ...transactions.map((t) => [
        t.id,
        t.orderId,
        t.customerName,
        t.eventName,
        (t.amount / 100).toLocaleString(),
        t.method,
        t.status,
        t.organizerName,
        (t.fees / 100).toLocaleString(),
        new Date(t.timestamp).toLocaleString(),
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin-payments-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Exported', 'Payments exported to CSV');
  };

  const filteredTransactions = useMemo(() => {
    if (!searchQuery) return transactions;
    const query = searchQuery.toLowerCase();
    return transactions.filter(
      (t) =>
        t.customerName.toLowerCase().includes(query) ||
        t.eventName.toLowerCase().includes(query) ||
        t.orderId.toLowerCase().includes(query) ||
        t.organizerName.toLowerCase().includes(query)
    );
  }, [transactions, searchQuery]);

  const stats = useMemo(() => {
    return {
      totalRevenue: filteredTransactions.filter((t) => t.status === "success").reduce((sum, t) => sum + t.amount, 0),
      pending: filteredTransactions.filter((t) => t.status === "pending").length,
      failed: filteredTransactions.filter((t) => t.status === "failed").length,
      fraudFlagged: filteredTransactions.filter((t) => t.fraudFlagged).length,
      totalFees: filteredTransactions.reduce((sum, t) => sum + t.fees, 0),
    };
  }, [filteredTransactions]);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-sm text-slate-600">Total Revenue</div>
          <p className="mt-2 text-2xl font-bold text-green-600">
            KES {(stats.totalRevenue / 1000).toFixed(0)}k
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-sm text-slate-600">Pending</div>
          <p className="mt-2 text-2xl font-bold text-amber-600">{stats.pending}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-sm text-slate-600">Failed</div>
          <p className="mt-2 text-2xl font-bold text-red-600">{stats.failed}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-sm text-slate-600">Fraud Flagged</div>
          <p className="mt-2 text-2xl font-bold text-red-600">{stats.fraudFlagged}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-sm text-slate-600">Total Fees</div>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            KES {(stats.totalFees / 1000).toFixed(0)}k
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="reconciliation">Reconciliation</TabsTrigger>
            <TabsTrigger value="wallets">Organizer Wallets</TabsTrigger>
          </TabsList>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="mr-2 size-4" />
            Export
          </Button>
        </div>

        <TabsContent value="transactions" className="mt-6">
          <div className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search transactions..."
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
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {loading ? (
              <div className="flex items-center justify-center p-12">
                <div className="text-center">
                  <div className="mx-auto size-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
                  <p className="mt-4 text-sm text-slate-600">Loading transactions...</p>
                </div>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                          Transaction
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                          Customer/Event
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                          Method
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                          Time
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {filteredTransactions.map((txn) => (
                        <tr key={txn.id} className="hover:bg-slate-50">
                          <td className="whitespace-nowrap px-6 py-4">
                            <div>
                              <div className="text-sm font-semibold text-slate-900">{txn.id}</div>
                              <div className="text-xs text-slate-500">{txn.orderId}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm text-slate-900">{txn.customerName}</div>
                              <div className="text-xs text-slate-600">{txn.eventName}</div>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-900">
                            KES {(txn.amount / 100).toLocaleString()}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                            {txn.method}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4">
                            <PaymentStatusBadge status={txn.status} />
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">
                            {new Date(txn.timestamp).toLocaleString()}
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

                {filteredTransactions.length === 0 && !loadingMore && (
                  <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-12 text-center">
                    <p className="text-slate-600">No transactions found</p>
                  </div>
                )}
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="overview" className="mt-6">
          <PaymentOverview stats={stats} transactions={transactions} />
        </TabsContent>

        <TabsContent value="reconciliation" className="mt-6">
          <ReconciliationTab transactions={transactions} />
        </TabsContent>

        <TabsContent value="wallets" className="mt-6">
          <OrganizerWalletsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PaymentOverview({
  stats,
  transactions,
}: {
  stats: { totalRevenue: number; pending: number; failed: number; fraudFlagged: number; totalFees: number };
  transactions: Transaction[];
}) {
  const methodBreakdown = useMemo(() => {
    const breakdown: Record<string, { count: number; amount: number }> = {};
    transactions.forEach((t) => {
      if (!breakdown[t.method]) {
        breakdown[t.method] = { count: 0, amount: 0 };
      }
      breakdown[t.method].count++;
      if (t.status === "success") {
        breakdown[t.method].amount += t.amount;
      }
    });
    return breakdown;
  }, [transactions]);

  const hourlyData = [
    { hour: "00:00", revenue: 45000, transactions: 12 },
    { hour: "06:00", revenue: 120000, transactions: 35 },
    { hour: "12:00", revenue: 320000, transactions: 85 },
    { hour: "18:00", revenue: 580000, transactions: 150 },
    { hour: "20:00", revenue: 720000, transactions: 180 },
    { hour: "22:00", revenue: 480000, transactions: 120 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Payment Method Breakdown */}
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">Payment Methods</h3>
          <div className="space-y-3">
            {Object.entries(methodBreakdown).map(([method, data]) => (
              <div key={method} className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-slate-900">{method}</div>
                  <div className="text-xs text-slate-600">{data.count} transactions</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-slate-900">
                    KES {(data.amount / 1000).toFixed(0)}k
                  </div>
                  <div className="text-xs text-slate-600">
                    {((data.amount / stats.totalRevenue) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue by Hour */}
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">Revenue by Hour</h3>
          <div className="space-y-3">
            {hourlyData.map((hour) => (
              <div key={hour.hour} className="flex items-center justify-between">
                <span className="text-sm text-slate-600">{hour.hour}</span>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-semibold text-slate-900">
                    KES {(hour.revenue / 1000).toFixed(0)}k
                  </span>
                  <span className="text-xs text-slate-500">{hour.transactions} txn</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">Recent Transactions</h3>
        <div className="space-y-2">
          {transactions.slice(0, 5).map((txn) => (
            <div
              key={txn.id}
              className="flex items-center justify-between rounded-lg border border-slate-200 p-3"
            >
              <div>
                <div className="text-sm font-semibold text-slate-900">{txn.customerName}</div>
                <div className="text-xs text-slate-600">{txn.eventName}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-slate-900">
                  KES {txn.amount.toLocaleString()}
                </div>
                <PaymentStatusBadge status={txn.status} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ReconciliationTab({ transactions }: { transactions: Transaction[] }) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  const reconciliationData = useMemo(() => {
    const successful = transactions.filter((t) => t.status === "success");
    const totalAmount = successful.reduce((sum, t) => sum + t.amount, 0);
    const totalFees = successful.reduce((sum, t) => sum + t.fees, 0);
    const netAmount = totalAmount - totalFees;

    return {
      totalTransactions: successful.length,
      totalAmount,
      platformFees: totalFees * 0.6,
      paymentFees: totalFees * 0.4,
      netAmount,
      reconciled: totalAmount * 0.95, // Mock 95% reconciled
      pending: totalAmount * 0.05,
    };
  }, [transactions]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div>
          <Label className="text-sm font-semibold text-slate-900">Reconciliation Date</Label>
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="mt-1"
          />
        </div>
        <Button>
          <Download className="mr-2 size-4" />
          Export Statement
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">Summary</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Total Transactions:</span>
              <span className="font-semibold text-slate-900">
                {reconciliationData.totalTransactions}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Gross Revenue:</span>
              <span className="font-semibold text-slate-900">
                KES {(reconciliationData.totalAmount / 1000).toFixed(0)}k
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Platform Fees:</span>
              <span className="font-semibold text-slate-900">
                KES {(reconciliationData.platformFees / 1000).toFixed(0)}k
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Payment Processing Fees:</span>
              <span className="font-semibold text-slate-900">
                KES {(reconciliationData.paymentFees / 1000).toFixed(0)}k
              </span>
            </div>
            <div className="border-t border-slate-200 pt-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-900">Net Amount:</span>
                <span className="text-lg font-bold text-green-600">
                  KES {(reconciliationData.netAmount / 1000).toFixed(0)}k
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">Reconciliation Status</h3>
          <div className="space-y-4">
            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-slate-600">Reconciled</span>
                <span className="font-semibold text-green-600">
                  KES {(reconciliationData.reconciled / 1000).toFixed(0)}k
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-200">
                <div
                  className="h-2 rounded-full bg-green-500"
                  style={{ width: "95%" }}
                />
              </div>
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-slate-600">Pending</span>
                <span className="font-semibold text-amber-600">
                  KES {(reconciliationData.pending / 1000).toFixed(0)}k
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-200">
                <div
                  className="h-2 rounded-full bg-amber-500"
                  style={{ width: "5%" }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function OrganizerWalletsTab() {
  const [wallets] = useState([
    {
      id: "wallet-1",
      organizerId: "org-1",
      organizerName: "Flamingo Live",
      available: 2250000,
      pending: 450000,
      onHold: 120000,
      totalPayouts: 8500000,
      lastPayout: "2024-03-10",
    },
    {
      id: "wallet-2",
      organizerId: "org-2",
      organizerName: "Tech Events Co",
      available: 1500000,
      pending: 320000,
      onHold: 80000,
      totalPayouts: 5200000,
      lastPayout: "2024-03-08",
    },
  ]);

  return (
    <div className="space-y-6">
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                Organizer
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                Available
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                Pending
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                On Hold
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                Total Payouts
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                Last Payout
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {wallets.map((wallet) => (
              <tr key={wallet.id} className="hover:bg-slate-50">
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="text-sm font-semibold text-slate-900">{wallet.organizerName}</div>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-green-600">
                  KES {(wallet.available / 1000).toFixed(0)}k
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-amber-600">
                  KES {(wallet.pending / 1000).toFixed(0)}k
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-red-600">
                  KES {(wallet.onHold / 1000).toFixed(0)}k
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-900">
                  KES {(wallet.totalPayouts / 1000).toFixed(0)}k
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                  {new Date(wallet.lastPayout).toLocaleDateString()}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right">
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const config = {
    success: { label: "Success", className: "bg-green-100 text-green-700", icon: CheckCircle2 },
    pending: { label: "Pending", className: "bg-amber-100 text-amber-700", icon: Clock },
    failed: { label: "Failed", className: "bg-red-100 text-red-700", icon: AlertTriangle },
    refunded: { label: "Refunded", className: "bg-blue-100 text-blue-700", icon: RefreshCw },
    chargeback: { label: "Chargeback", className: "bg-red-100 text-red-700", icon: AlertTriangle },
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

