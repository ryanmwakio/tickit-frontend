"use client";

import { useState, useEffect } from "react";
import { TrendingUp, DollarSign, Percent, CreditCard, RefreshCw } from "lucide-react";
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

export function RevenueOverview() {
  const [revenueData, setRevenueData] = useState<{
    grossRevenue: number;
    netRevenue: number;
    platformFees: number;
    commission: number;
    vat: number;
    withholding: number;
    paymentBreakdown: Record<string, { amount: number; percentage: number }>;
  } | null>(null);
  const [organiserId, setOrganiserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  useEffect(() => {
    async function loadRevenue() {
      try {
        setLoading(true);
        const orgId = await getUserOrganiserId();
        if (!orgId) {
          setError("Could not determine organiser ID");
          return;
        }
        setOrganiserId(orgId);

        const data = await apiClient.get<{
          grossRevenue: number;
          netRevenue: number;
          platformFees: number;
          commission: number;
          vat: number;
          withholding: number;
          paymentBreakdown: Record<string, { amount: number; percentage: number }>;
        }>(`/organisers/${orgId}/finance/revenue`);

        setRevenueData(data);
      } catch (err: unknown) {
        console.error("Failed to load revenue:", err);
        const errorMessage = err instanceof Error ? err.message : "Failed to load revenue";
        setError(errorMessage);
        toast.error("Failed to load revenue", errorMessage);
      } finally {
        setLoading(false);
      }
    }

    loadRevenue();
  }, [toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <RefreshCw className="mx-auto size-8 animate-spin text-slate-400" />
          <p className="mt-4 text-sm text-slate-600">Loading revenue data...</p>
        </div>
      </div>
    );
  }

  if (error || !revenueData) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <DollarSign className="mx-auto size-8 text-red-600" />
        <p className="mt-4 text-sm font-semibold text-red-900">{error || "Failed to load revenue data"}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Revenue Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <DollarSign className="size-4 text-green-600" />
            <span>Gross Revenue</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            KES {(revenueData.grossRevenue / 100).toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <TrendingUp className="size-4 text-blue-600" />
            <span>Net Revenue</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            KES {(revenueData.netRevenue / 100).toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Percent className="size-4 text-purple-600" />
            <span>Platform Fees</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            KES {(revenueData.platformFees / 100).toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <CreditCard className="size-4 text-amber-600" />
            <span>VAT</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            KES {(revenueData.vat / 100).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Payment Channel Breakdown */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">Payment Channel Breakdown</h3>
        <div className="space-y-4">
          {Object.keys(revenueData.paymentBreakdown).length > 0 ? (
            Object.entries(revenueData.paymentBreakdown).map(([method, data]) => (
              <div key={method} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-slate-900 capitalize">
                    {method === 'MPESA' ? 'MPesa' : method === 'CARD' ? 'Card' : method === 'BANK_TRANSFER' ? 'Bank Transfer' : method === 'CASH' ? 'Cash' : method}
                  </span>
                  <span className="text-slate-600">
                    KES {(data.amount / 100).toLocaleString()} ({data.percentage}%)
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full bg-gradient-to-r from-slate-900 to-slate-700 transition-all"
                    style={{ width: `${data.percentage}%` }}
                  />
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500">No payment data available</p>
          )}
        </div>
      </div>

      {/* Fees Breakdown */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-600">Commission</p>
          <p className="mt-1 text-xl font-bold text-slate-900">
            KES {(revenueData.commission / 100).toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-600">Withholding Tax</p>
          <p className="mt-1 text-xl font-bold text-slate-900">
            KES {(revenueData.withholding / 100).toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-600">Total Fees</p>
          <p className="mt-1 text-xl font-bold text-slate-900">
            KES {((revenueData.platformFees + revenueData.commission) / 100).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}

