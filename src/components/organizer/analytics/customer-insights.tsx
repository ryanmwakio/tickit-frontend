"use client";

import { useState, useEffect } from "react";
import {
  Users,
  TrendingUp,
  MapPin,
  Calendar,
  DollarSign,
  ArrowUpRight,
  Download,
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
  PieChart as RePieChart,
  Pie,
  Cell,
  LineChart as ReLineChart,
  Line,
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

const customerSegments = [
  { segment: "New Customers", count: 1240, percentage: 45, revenue: 2800000 },
  { segment: "Returning Customers", count: 1520, percentage: 55, revenue: 3850000 },
];

const ageDistribution = [
  { age: "18-24", count: 850, percentage: 31 },
  { age: "25-34", count: 1120, percentage: 41 },
  { age: "35-44", count: 520, percentage: 19 },
  { age: "45-54", count: 180, percentage: 7 },
  { age: "55+", count: 90, percentage: 2 },
];

const locationDistribution = [
  { location: "Nairobi", count: 1850, percentage: 67 },
  { location: "Mombasa", count: 420, percentage: 15 },
  { location: "Kisumu", count: 210, percentage: 8 },
  { location: "Nakuru", count: 180, percentage: 7 },
  { location: "Other", count: 100, percentage: 3 },
];

const topSpenders = [
  { customer: "Customer A", orders: 8, total: 125000, avgOrder: 15625 },
  { customer: "Customer B", orders: 6, total: 98000, avgOrder: 16333 },
  { customer: "Customer C", orders: 12, total: 156000, avgOrder: 13000 },
  { customer: "Customer D", orders: 5, total: 87000, avgOrder: 17400 },
  { customer: "Customer E", orders: 9, total: 112000, avgOrder: 12444 },
];

const customerLifetime = [
  { period: "Week 1", active: 420, new: 380, churned: 40 },
  { period: "Week 2", active: 480, new: 120, churned: 60 },
  { period: "Week 3", active: 520, new: 100, churned: 60 },
  { period: "Week 4", active: 560, new: 140, churned: 100 },
];

const chartColors = ["#0ea5e9", "#f97316", "#22c55e", "#8b5cf6", "#ec4899"];

export function CustomerInsights() {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState("30days");
  const [organiserAnalytics, setOrganiserAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadAnalytics();
    }
  }, [user]);

  const loadAnalytics = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const orgId = await getUserOrganiserId(user.id);
      if (orgId) {
        const analytics = await apiClient.get<{
          totalCustomers: number;
          newCustomers: number;
          returningCustomers: number;
          avgOrderValue: number;
          retentionRate: number;
          topSpenders: Array<{
            customer: string;
            orders: number;
            total: number;
            avgOrder: number;
          }>;
        }>(`/organisers/${orgId}/analytics/customers`).catch(() => null);
        setOrganiserAnalytics(analytics);
      }
    } catch (error) {
      console.error("Failed to load customer insights:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalStats = {
    totalCustomers: organiserAnalytics?.totalCustomers || 0,
    newCustomers: organiserAnalytics?.newCustomers || 0,
    returningCustomers: organiserAnalytics?.returningCustomers || 0,
    avgOrderValue: organiserAnalytics?.avgOrderValue || 0,
    retentionRate: organiserAnalytics?.retentionRate || 0,
  };

  const topSpendersData = organiserAnalytics?.topSpenders || topSpenders;

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
            <Users className="size-4 text-blue-600" />
            <span>Total Customers</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {totalStats.totalCustomers.toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <TrendingUp className="size-4 text-green-600" />
            <span>New Customers</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {totalStats.newCustomers.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-green-600">
            +{(totalStats.newCustomers / totalStats.totalCustomers) * 100}% of total
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Users className="size-4 text-purple-600" />
            <span>Returning</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {totalStats.returningCustomers.toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <DollarSign className="size-4 text-amber-600" />
            <span>Avg Order Value</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            KES {totalStats.avgOrderValue.toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <ArrowUpRight className="size-4 text-emerald-600" />
            <span>Retention Rate</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {totalStats.retentionRate}%
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
            <SelectItem value="7days">Last 7 Days</SelectItem>
            <SelectItem value="30days">Last 30 Days</SelectItem>
            <SelectItem value="3months">Last 3 Months</SelectItem>
            <SelectItem value="year">Last Year</SelectItem>
          </SelectContent>
        </Select>
        <button className="ml-auto inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
          <Download className="size-4" />
          Export Report
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Customer Segments */}
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">Customer Segments</h3>
          <ResponsiveContainer width="100%" height={250}>
            <RePieChart>
              <Pie
                data={customerSegments}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => percent ? `${name}: ${(percent * 100).toFixed(0)}%` : name}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {customerSegments.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={chartColors[index]} />
                ))}
              </Pie>
              <ReTooltip content={<ChartTooltipContent />} />
            </RePieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-3">
            {customerSegments.map((segment, index) => (
              <div key={segment.segment} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="size-3 rounded-full"
                    style={{ backgroundColor: chartColors[index] }}
                  />
                  <span className="text-sm font-semibold text-slate-900">{segment.segment}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-900">{segment.count}</p>
                  <p className="text-xs text-slate-600">
                    KES {(segment.revenue / 1000).toFixed(0)}k revenue
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Age Distribution */}
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">Age Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <ReBarChart data={ageDistribution}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
              <XAxis
                dataKey="age"
                tickLine={false}
                axisLine={false}
                className="text-sm text-slate-500"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                className="text-sm text-slate-500"
              />
              <ReTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                {ageDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                ))}
              </Bar>
            </ReBarChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {ageDistribution.map((age) => (
              <div key={age.age} className="flex items-center justify-between text-sm">
                <span className="text-slate-600">{age.age} years</span>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-slate-900">{age.count}</span>
                  <span className="text-slate-500">{age.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Location Distribution */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">Geographic Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <ReBarChart data={locationDistribution}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
            <XAxis
              dataKey="location"
              tickLine={false}
              axisLine={false}
              className="text-sm text-slate-500"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              className="text-sm text-slate-500"
            />
            <ReTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="count" radius={[8, 8, 0, 0]} fill="#0ea5e9">
              {locationDistribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
              ))}
            </Bar>
          </ReBarChart>
        </ResponsiveContainer>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-5">
          {locationDistribution.map((loc) => (
            <div key={loc.location} className="text-center">
              <p className="text-sm font-semibold text-slate-900">{loc.location}</p>
              <p className="mt-1 text-xl font-bold text-slate-900">{loc.count}</p>
              <p className="text-xs text-slate-600">{loc.percentage}%</p>
            </div>
          ))}
        </div>
      </div>

      {/* Top Spenders */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">Top Spenders</h3>
        <div className="space-y-3">
          {topSpendersData.map((customer: { customer: string; orders: number; total: number; avgOrder: number }, index: number) => (
            <div
              key={customer.customer}
              className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-4"
            >
              <div className="flex items-center gap-4">
                <div className="flex size-10 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                  {index + 1}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{customer.customer}</p>
                  <p className="text-sm text-slate-600">
                    {customer.orders} orders • Avg: KES {(customer.avgOrder / 100).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                  <p className="text-lg font-bold text-slate-900">
                  KES {(customer.total / 100).toLocaleString()}
                </p>
                <p className="text-xs text-slate-600">Total spent</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Customer Lifetime Value */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">Customer Activity Over Time</h3>
        <ResponsiveContainer width="100%" height={300}>
          <ReLineChart data={customerLifetime}>
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
            />
            <ReTooltip content={<ChartTooltipContent />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="active"
              stroke="#0ea5e9"
              strokeWidth={2}
              name="Active Customers"
              dot={{ fill: "#0ea5e9", r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="new"
              stroke="#22c55e"
              strokeWidth={2}
              name="New Customers"
              dot={{ fill: "#22c55e", r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="churned"
              stroke="#ef4444"
              strokeWidth={2}
              name="Churned"
              dot={{ fill: "#ef4444", r: 4 }}
            />
          </ReLineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

