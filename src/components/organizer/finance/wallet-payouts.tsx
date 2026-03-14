"use client";

import { useState, useEffect } from "react";
import { Wallet, DollarSign, Download, Plus, Clock, CheckCircle2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api";
import { useToast } from "@/contexts/toast-context";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

export function WalletPayouts() {
  const [walletData, setWalletData] = useState<{
    availableBalance: number;
    pendingBalance: number;
    totalBalance: number;
    recentPayouts: Array<{
      id: string;
      amount: number;
      status: string;
      requestedAt: string;
      completedAt?: string;
      method: string;
    }>;
  } | null>(null);
  const [organiserId, setOrganiserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState("");
  const [payoutMethod, setPayoutMethod] = useState("MPESA");
  const toast = useToast();

  useEffect(() => {
    async function loadWallet() {
      try {
        setLoading(true);
        const orgId = await getUserOrganiserId();
        if (!orgId) {
          setError("Could not determine organiser ID");
          return;
        }
        setOrganiserId(orgId);

        const data = await apiClient.get<{
          availableBalance: number;
          pendingBalance: number;
          totalBalance: number;
          recentPayouts: Array<{
            id: string;
            amount: number;
            status: string;
            requestedAt: string;
            completedAt?: string;
            method: string;
          }>;
        }>(`/organisers/${orgId}/finance/wallet`);

        setWalletData(data as Parameters<typeof setWalletData>[0]);
      } catch (err: unknown) {
        console.error("Failed to load wallet:", err);
        const errorMessage = err instanceof Error ? err.message : "Failed to load wallet";
        setError(errorMessage);
        toast.error("Failed to load wallet", errorMessage);
      } finally {
        setLoading(false);
      }
    }

    loadWallet();
  }, [toast]);

  const handleRequestPayout = async () => {
    if (!organiserId || !walletData || !payoutAmount) return;

    try {
      const amount = parseFloat(payoutAmount) * 100; // Convert to cents
      if (amount > walletData.availableBalance) {
        toast.error("Insufficient balance", "Amount exceeds available balance");
        return;
      }

      await apiClient.post(`/organisers/${organiserId}/finance/payouts`, {
        amount,
        method: payoutMethod,
      });

      toast.success("Payout requested", "Your payout request has been submitted");
      setShowPayoutModal(false);
      setPayoutAmount("");

      // Reload wallet data
      const data = await apiClient.get(`/organisers/${organiserId}/finance/wallet`);
      setWalletData(data as Parameters<typeof setWalletData>[0]);
    } catch (err: unknown) {
      console.error("Failed to request payout:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to request payout";
      toast.error("Failed to request payout", errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <RefreshCw className="mx-auto size-8 animate-spin text-slate-400" />
          <p className="mt-4 text-sm text-slate-600">Loading wallet data...</p>
        </div>
      </div>
    );
  }

  if (error || !walletData) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <Wallet className="mx-auto size-8 text-red-600" />
        <p className="mt-4 text-sm font-semibold text-red-900">{error || "Failed to load wallet data"}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Wallet Balance */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Wallet className="size-4 text-green-600" />
            <span>Available Balance</span>
          </div>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            KES {(walletData.availableBalance / 100).toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-slate-600">Ready for withdrawal</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Clock className="size-4 text-amber-600" />
            <span>Pending Balance</span>
          </div>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            KES {(walletData.pendingBalance / 100).toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-slate-600">In settlement queue</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <DollarSign className="size-4 text-blue-600" />
            <span>Total Balance</span>
          </div>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            KES {(walletData.totalBalance / 100).toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-slate-600">All funds</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button onClick={() => setShowPayoutModal(true)}>
          <Plus className="mr-2 size-4" />
          Request Withdrawal
        </Button>
        <Button
          variant="outline"
          onClick={async () => {
            if (!organiserId) return;
            try {
              // Get transactions for export
              const transactions = await apiClient.get<{
                data: Array<{
                  type: string;
                  amount: number;
                  status: string;
                  method: string;
                  reference: string;
                  date: string;
                  orderNumber?: string;
                }>;
              }>(`/organisers/${organiserId}/finance/transactions?skip=0&take=1000`);

              const csv = [
                ["Type", "Amount", "Status", "Method", "Reference", "Order", "Date"],
                ...(transactions.data || []).map((txn) => [
                  txn.type,
                  (txn.amount / 100).toLocaleString(),
                  txn.status,
                  txn.method,
                  txn.reference,
                  txn.orderNumber || "",
                  new Date(txn.date).toLocaleDateString(),
                ]),
              ]
                .map((row) => row.map((cell) => `"${cell}"`).join(","))
                .join("\n");

              const blob = new Blob([csv], { type: "text/csv" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `wallet-statement-${new Date().toISOString().split("T")[0]}.csv`;
              a.click();
              URL.revokeObjectURL(url);
              toast.success("Exported", "Wallet statement exported to CSV");
            } catch (err: unknown) {
              console.error("Failed to export statement:", err);
              const errorMessage = err instanceof Error ? err.message : "Failed to export statement";
              toast.error("Failed to export", errorMessage);
            }
          }}
        >
          <Download className="mr-2 size-4" />
          Export Statement
        </Button>
      </div>

      {/* Recent Payouts */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">Recent Payouts</h3>
        <div className="space-y-4">
          {walletData.recentPayouts && walletData.recentPayouts.length > 0 ? (
            walletData.recentPayouts.map((payout) => (
            <div
              key={payout.id}
              className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-4"
            >
              <div>
                <p className="font-semibold text-slate-900">
                  KES {(payout.amount / 100).toLocaleString()}
                </p>
                <p className="mt-1 text-sm text-slate-600">{payout.method}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {new Date(payout.requestedAt).toLocaleDateString()}
                </p>
              </div>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                  payout.status === "completed"
                    ? "bg-green-100 text-green-700"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {payout.status === "completed" ? (
                  <CheckCircle2 className="size-3" />
                ) : (
                  <Clock className="size-3" />
                )}
                {payout.status}
              </span>
            </div>
            ))
          ) : (
            <p className="text-center text-sm text-slate-500 py-8">No recent payouts</p>
          )}
        </div>
      </div>

      {showPayoutModal && (
        <Dialog open={showPayoutModal} onOpenChange={setShowPayoutModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request Withdrawal</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Amount (KES)</Label>
                <Input
                  type="number"
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="mt-1"
                />
                {walletData && (
                  <p className="mt-1 text-xs text-slate-500">
                    Available: KES {(walletData.availableBalance / 100).toLocaleString()}
                  </p>
                )}
              </div>
              <div>
                <Label>Payment Method</Label>
                <Select value={payoutMethod} onValueChange={setPayoutMethod}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MPESA">MPesa</SelectItem>
                    <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowPayoutModal(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleRequestPayout} className="flex-1" disabled={!payoutAmount}>
                  Request
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

