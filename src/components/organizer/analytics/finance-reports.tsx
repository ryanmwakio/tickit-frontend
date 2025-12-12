"use client";

import { useState, useEffect } from "react";
import {
  DollarSign,
  TrendingUp,
  FileText,
  Download,
  Calendar,
  Percent,
  Receipt,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { apiClient } from "@/lib/api";

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
import {
  BarChart as ReBarChart,
  Bar,
  LineChart as ReLineChart,
  Line,
  AreaChart as ReAreaChart,
  Area,
  PieChart as RePieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ReTooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { ChartTooltipContent } from "@/components/charts/chart-utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const revenueBreakdown = [
  { month: "Jan", gross: 1200000, net: 980000, fees: 220000 },
  { month: "Feb", gross: 1850000, net: 1510000, fees: 340000 },
  { month: "Mar", gross: 2400000, net: 1960000, fees: 440000 },
  { month: "Apr", gross: 3200000, net: 2620000, fees: 580000 },
  { month: "May", gross: 2800000, net: 2290000, fees: 510000 },
  { month: "Jun", gross: 3600000, net: 2950000, fees: 650000 },
];

const taxBreakdown = [
  { type: "VAT (16%)", amount: 1128000, percentage: 70 },
  { type: "Withholding Tax", amount: 360000, percentage: 22 },
  { type: "Other Taxes", amount: 120000, percentage: 8 },
];

const settlementSchedule = [
  { period: "Week 1", settled: 1200000, pending: 450000 },
  { period: "Week 2", settled: 1850000, pending: 320000 },
  { period: "Week 3", settled: 2400000, pending: 280000 },
  { period: "Week 4", settled: 3200000, pending: 180000 },
];

const feeBreakdown = [
  { category: "Platform Fee", amount: 1800000, percentage: 60 },
  { category: "Payment Processing", amount: 720000, percentage: 24 },
  { category: "Commission", amount: 480000, percentage: 16 },
];

const revenueByEvent = [
  { event: "Nairobi Music", revenue: 2800000, net: 2290000 },
  { event: "Wellness Retreat", revenue: 1850000, net: 1510000 },
  { event: "Tech Conference", revenue: 3200000, net: 2620000 },
];

const chartColors = ["#0ea5e9", "#f97316", "#22c55e", "#8b5cf6", "#ec4899"];

export function FinanceReports() {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState("6months");
  const [reportType, setReportType] = useState("all");
  const [organiserAnalytics, setOrganiserAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadFinanceData();
    }
  }, [user]);

  const loadFinanceData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const orgId = await getUserOrganiserId(user.id);
      if (orgId) {
        const months = timeRange === "30days" ? 1 : timeRange === "3months" ? 3 : timeRange === "6months" ? 6 : 12;
        const reports = await apiClient.get<{
          revenueBreakdown: Array<{ month: string; gross: number; net: number; fees: number }>;
          taxBreakdown: Array<{ type: string; amount: number; percentage: number }>;
          feeBreakdown: Array<{ category: string; amount: number; percentage: number }>;
          totalGross: number;
          totalNet: number;
          totalFees: number;
          totalTax: number;
          netMargin: number;
        }>(`/organisers/${orgId}/analytics/finance?months=${months}`).catch(() => null);
        setOrganiserAnalytics(reports);
      }
    } catch (error) {
      console.error("Failed to load finance data:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalStats = {
    totalGross: organiserAnalytics?.totalGross || 0,
    totalNet: organiserAnalytics?.totalNet || 0,
    totalFees: organiserAnalytics?.totalFees || 0,
    totalTax: organiserAnalytics?.totalTax || 0,
    netMargin: organiserAnalytics?.netMargin || 0,
  };

  const revenueBreakdownData = organiserAnalytics?.revenueBreakdown || revenueBreakdown;
  const taxBreakdownData = organiserAnalytics?.taxBreakdown || taxBreakdown;
  const feeBreakdownData = organiserAnalytics?.feeBreakdown || feeBreakdown;

  return (
    <div className="space-y-6">

      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-slate-200 bg-white p-4 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-24 mb-3"></div>
              <div className="h-8 bg-slate-200 rounded w-32"></div>
            </div>
          ))
        ) : (
          <>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <DollarSign className="size-4 text-green-600" />
            <span>Gross Revenue</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            KES {(totalStats.totalGross / 100000000).toFixed(1)}M
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <TrendingUp className="size-4 text-blue-600" />
            <span>Net Revenue</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            KES {(totalStats.totalNet / 100000000).toFixed(1)}M
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Receipt className="size-4 text-amber-600" />
            <span>Total Fees</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            KES {(totalStats.totalFees / 100000000).toFixed(1)}M
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Percent className="size-4 text-purple-600" />
            <span>Tax</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            KES {(totalStats.totalTax / 100000000).toFixed(1)}M
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <TrendingUp className="size-4 text-emerald-600" />
            <span>Net Margin</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {totalStats.netMargin}%
          </p>
        </div>
          </>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="30days">Last 30 Days</SelectItem>
            <SelectItem value="3months">Last 3 Months</SelectItem>
            <SelectItem value="6months">Last 6 Months</SelectItem>
            <SelectItem value="year">Last Year</SelectItem>
          </SelectContent>
        </Select>
        <Select value={reportType} onValueChange={setReportType}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Reports</SelectItem>
            <SelectItem value="settlement">Settlement</SelectItem>
            <SelectItem value="tax">Tax Reports</SelectItem>
            <SelectItem value="revenue">Revenue</SelectItem>
          </SelectContent>
        </Select>
        <button className="ml-auto inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
          <Download className="size-4" />
          Export Report
        </button>
      </div>

      {/* Revenue Breakdown */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">Revenue Breakdown</h3>
        <ResponsiveContainer width="100%" height={350}>
          <ReBarChart data={revenueBreakdownData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              className="text-sm text-slate-500"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              className="text-sm text-slate-500"
              tickFormatter={(value) => `KES ${(value / 1000).toFixed(0)}k`}
            />
            <ReTooltip content={<ChartTooltipContent />} />
            <Legend />
            <Bar dataKey="gross" fill="#0ea5e9" name="Gross Revenue" radius={[8, 8, 0, 0]} />
            <Bar dataKey="net" fill="#22c55e" name="Net Revenue" radius={[8, 8, 0, 0]} />
            <Bar dataKey="fees" fill="#f97316" name="Fees" radius={[8, 8, 0, 0]} />
          </ReBarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Tax Breakdown */}
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">Tax Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RePieChart>
              <Pie
                data={taxBreakdownData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => percent ? `${name}: ${(percent * 100).toFixed(0)}%` : name}
                outerRadius={100}
                fill="#8884d8"
                dataKey="amount"
              >
                {taxBreakdownData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={chartColors[index]} />
                ))}
              </Pie>
              <ReTooltip content={<ChartTooltipContent />} />
            </RePieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {taxBreakdownData.map((tax, index) => (
              <div key={tax.type} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="size-3 rounded-full"
                    style={{ backgroundColor: chartColors[index] }}
                  />
                  <span className="text-slate-600">{tax.type}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-slate-900">
                    KES {(tax.amount / 100000).toFixed(0)}k
                  </span>
                  <span className="text-slate-500">{tax.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fee Breakdown */}
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">Fee Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <ReBarChart data={feeBreakdownData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
              <XAxis type="number" hide />
              <YAxis
                dataKey="category"
                type="category"
                tickLine={false}
                axisLine={false}
                className="text-sm text-slate-500"
              />
              <ReTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="amount" radius={[0, 8, 8, 0]}>
                {feeBreakdownData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={chartColors[index]} />
                ))}
              </Bar>
            </ReBarChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {feeBreakdownData.map((fee, index) => (
              <div key={fee.category} className="flex items-center justify-between text-sm">
                <span className="text-slate-600">{fee.category}</span>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-slate-900">
                    KES {(fee.amount / 100000).toFixed(0)}k
                  </span>
                  <span className="text-slate-500">{fee.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Settlement Schedule */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">Settlement Schedule</h3>
        <ResponsiveContainer width="100%" height={300}>
          <ReAreaChart data={settlementSchedule}>
            <defs>
              <linearGradient id="settledGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="pendingGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
            <XAxis
              dataKey="period"
              tickLine={false}
              axisLine={false}
              className="text-sm text-slate-500"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              className="text-sm text-slate-500"
              tickFormatter={(value) => `KES ${(value / 1000).toFixed(0)}k`}
            />
            <ReTooltip content={<ChartTooltipContent />} />
            <Legend />
            <Area
              type="monotone"
              dataKey="settled"
              stroke="#22c55e"
              fillOpacity={1}
              fill="url(#settledGradient)"
              name="Settled"
            />
            <Area
              type="monotone"
              dataKey="pending"
              stroke="#f97316"
              fillOpacity={1}
              fill="url(#pendingGradient)"
              name="Pending"
            />
          </ReAreaChart>
        </ResponsiveContainer>
        <div className="mt-4 grid gap-4 sm:grid-cols-4">
          {settlementSchedule.map((period) => (
            <div key={period.period} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-sm font-semibold text-slate-900">{period.period}</p>
              <p className="mt-1 text-xs text-slate-600">
                Settled: KES {(period.settled / 1000).toFixed(0)}k
              </p>
              <p className="text-xs text-slate-600">
                Pending: KES {(period.pending / 1000).toFixed(0)}k
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Revenue by Event */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">Revenue by Event</h3>
        <ResponsiveContainer width="100%" height={300}>
          <ReBarChart data={revenueByEvent}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
            <XAxis
              dataKey="event"
              tickLine={false}
              axisLine={false}
              className="text-sm text-slate-500"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              className="text-sm text-slate-500"
              tickFormatter={(value) => `KES ${(value / 1000).toFixed(0)}k`}
            />
            <ReTooltip content={<ChartTooltipContent />} />
            <Legend />
            <Bar dataKey="revenue" fill="#0ea5e9" name="Gross Revenue" radius={[8, 8, 0, 0]} />
            <Bar dataKey="net" fill="#22c55e" name="Net Revenue" radius={[8, 8, 0, 0]} />
          </ReBarChart>
        </ResponsiveContainer>
        <div className="mt-4 space-y-2">
          {revenueByEvent.map((event) => {
            const margin = ((event.net / event.revenue) * 100).toFixed(1);
            return (
              <div
                key={event.event}
                className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-3"
              >
                <span className="font-semibold text-slate-900">{event.event}</span>
                <div className="flex items-center gap-4 text-sm">
                  <div className="text-right">
                    <p className="font-semibold text-slate-900">
                      KES {(event.net / 100000).toFixed(0)}k net
                    </p>
                    <p className="text-xs text-slate-600">
                      of KES {(event.revenue / 100000).toFixed(0)}k gross
                    </p>
                  </div>
                  <span className="font-semibold text-slate-900">{margin}% margin</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

