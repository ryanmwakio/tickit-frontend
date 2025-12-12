"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, Filter, Download, DollarSign, Clock, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiClient } from "@/lib/api";
import { useToast } from "@/contexts/toast-context";

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

type Transaction = {
  id: string;
  type: "payment" | "refund" | "payout" | "fee";
  amount: number;
  status: string;
  method: string;
  reference: string;
  date: string;
  orderId?: string;
  orderNumber?: string;
};

export function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [organiserId, setOrganiserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  useEffect(() => {
    async function loadTransactions() {
      try {
        setLoading(true);
        const orgId = await getUserOrganiserId();
        if (!orgId) {
          setError("Could not determine organiser ID");
          return;
        }
        setOrganiserId(orgId);

        const response = await apiClient.get<{
          data: Transaction[];
          total: number;
          hasMore: boolean;
        }>(`/organisers/${orgId}/finance/transactions?skip=0&take=100`);

        setTransactions(response.data || []);
      } catch (err: unknown) {
        console.error("Failed to load transactions:", err);
        const errorMessage = err instanceof Error ? err.message : "Failed to load transactions";
        setError(errorMessage);
        toast.error("Failed to load transactions", errorMessage);
      } finally {
        setLoading(false);
      }
    }

    loadTransactions();
  }, [toast]);

  const filteredTransactions = useMemo(() => {
    let filtered = transactions;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (txn) =>
          txn.reference.toLowerCase().includes(query) ||
          txn.orderId?.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((txn) => txn.status === statusFilter);
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter((txn) => txn.type === typeFilter);
    }

    return filtered;
  }, [transactions, searchQuery, statusFilter, typeFilter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <RefreshCw className="mx-auto size-8 animate-spin text-slate-400" />
          <p className="mt-4 text-sm text-slate-600">Loading transactions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <DollarSign className="mx-auto size-8 text-red-600" />
        <p className="mt-4 text-sm font-semibold text-red-900">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            type="text"
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm focus:border-slate-900 focus:ring-slate-900"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Transaction Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="payment">Payments</SelectItem>
            <SelectItem value="refund">Refunds</SelectItem>
            <SelectItem value="payout">Payouts</SelectItem>
            <SelectItem value="fee">Fees</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          onClick={() => {
            // Export transactions to CSV
            const csv = [
              ["Type", "Amount", "Status", "Method", "Reference", "Order", "Date"],
              ...filteredTransactions.map((txn) => [
                txn.type,
                (txn.amount / 100).toLocaleString(),
                txn.status,
                txn.method,
                txn.reference,
                txn.orderNumber || txn.orderId || "",
                new Date(txn.date).toLocaleDateString(),
              ]),
            ]
              .map((row) => row.map((cell) => `"${cell}"`).join(","))
              .join("\n");

            const blob = new Blob([csv], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `transactions-${new Date().toISOString().split("T")[0]}.csv`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success("Exported", "Transactions exported to CSV");
          }}
        >
          <Download className="mr-2 size-4" />
          Export
        </Button>
      </div>

      {filteredTransactions.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
          <DollarSign className="mx-auto size-12 text-slate-300" />
          <p className="mt-4 text-lg font-semibold text-slate-900">No transactions found</p>
          <p className="mt-2 text-sm text-slate-600">Transactions will appear here once orders are placed</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTransactions.map((txn) => (
          <div
            key={txn.id}
            className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4"
          >
            <div className="flex items-center gap-4">
              <div
                className={`rounded-lg p-3 ${
                  txn.type === "payment"
                    ? "bg-green-100"
                    : txn.type === "refund"
                    ? "bg-red-100"
                    : "bg-slate-100"
                }`}
              >
                <DollarSign
                  className={`size-5 ${
                    txn.type === "payment"
                      ? "text-green-600"
                      : txn.type === "refund"
                      ? "text-red-600"
                      : "text-slate-600"
                  }`}
                />
              </div>
              <div>
                <p className="font-semibold text-slate-900 capitalize">{txn.type}</p>
                <p className="text-sm text-slate-600">{txn.method} • {txn.reference}</p>
                {txn.orderNumber && (
                  <p className="text-xs text-slate-500">Order: {txn.orderNumber}</p>
                )}
              </div>
            </div>
            <div className="text-right">
              <p
                className={`text-lg font-bold ${
                  txn.amount > 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {txn.amount > 0 ? "+" : ""}KES {(Math.abs(txn.amount) / 100).toLocaleString()}
              </p>
              <p className="text-xs text-slate-500">
                {new Date(txn.date).toLocaleDateString()}
              </p>
              <span
                className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${
                  txn.status === "completed"
                    ? "bg-green-100 text-green-700"
                    : txn.status === "pending"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {txn.status === "completed" ? (
                  <CheckCircle2 className="size-3" />
                ) : (
                  <Clock className="size-3" />
                )}
                {txn.status}
              </span>
            </div>
          </div>
        ))}
        </div>
      )}
    </div>
  );
}

