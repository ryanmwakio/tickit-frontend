"use client";

import { useState, useMemo, useEffect } from "react";
import {
  TrendingUp,
  DollarSign,
  Ticket,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Calendar,
  Filter,
} from "lucide-react";
import {
  LineChart as ReLineChart,
  Line,
  BarChart as ReBarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell,
  AreaChart as ReAreaChart,
  Area,
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

// Mock data fallback
const mockSalesOverTime = [
  { date: "Jan", sales: 1200000, tickets: 420 },
  { date: "Feb", sales: 1850000, tickets: 650 },
  { date: "Mar", sales: 2400000, tickets: 850 },
  { date: "Apr", sales: 3200000, tickets: 1120 },
  { date: "May", sales: 2800000, tickets: 980 },
  { date: "Jun", sales: 3600000, tickets: 1250 },
];

const conversionFunnel = [
  { stage: "Views", count: 12500, percentage: 100 },
  { stage: "Add to Cart", count: 8500, percentage: 68 },
  { stage: "Checkout Start", count: 6200, percentage: 49.6 },
  { stage: "Payment Initiated", count: 5800, percentage: 46.4 },
  { stage: "Completed", count: 5200, percentage: 41.6 },
];

const revenueByTicketType = [
  { type: "VIP Pass", revenue: 2800000, count: 560 },
  { type: "General Admission", revenue: 2100000, count: 1050 },
  { type: "Early Bird", revenue: 1200000, count: 600 },
  { type: "Backstage", revenue: 450000, count: 75 },
  { type: "Free", revenue: 0, count: 200 },
];

const revenueByPaymentMethod = [
  { method: "MPesa", revenue: 4200000, percentage: 63, count: 1850 },
  { method: "Card", revenue: 1800000, percentage: 27, count: 580 },
  { method: "Bank Transfer", revenue: 450000, percentage: 7, count: 145 },
  { method: "Airtel Money", revenue: 300000, percentage: 4.5, count: 125 },
  { method: "Cash", revenue: 0, percentage: 0, count: 0 },
];

const hourlySales = [
  { hour: "00:00", sales: 45000 },
  { hour: "06:00", sales: 120000 },
  { hour: "12:00", sales: 320000 },
  { hour: "18:00", sales: 580000 },
  { hour: "20:00", sales: 720000 },
  { hour: "22:00", sales: 480000 },
];

const chartColors = ["#0ea5e9", "#f97316", "#22c55e", "#8b5cf6", "#ec4899"];

export function SalesAnalytics() {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState("6months");
  const [selectedEvent, setSelectedEvent] = useState("all");
  const [salesTrend, setSalesTrend] = useState<any[]>([]);
  const [organiserAnalytics, setOrganiserAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [organiserId, setOrganiserId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadSalesData();
    }
  }, [user, timeRange]);

  const loadSalesData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const orgId = await getUserOrganiserId(user.id);
      if (!orgId) {
        setLoading(false);
        return;
      }
      setOrganiserId(orgId);

      const days = timeRange === "7days" ? 7 : timeRange === "30days" ? 30 : timeRange === "3months" ? 90 : timeRange === "6months" ? 180 : 365;
      
      const analytics = await apiClient.get<{
        salesTrend: Array<{ date: string; revenue: number; count: number }>;
        revenueByTicketType: Array<{ type: string; revenue: number; count: number }>;
        revenueByPaymentMethod: Array<{ method: string; revenue: number; count: number; percentage: number }>;
      }>(`/organisers/${orgId}/analytics/sales?days=${days}`);

      setSalesTrend(analytics.salesTrend || []);
      setOrganiserAnalytics(analytics);
    } catch (error) {
      console.error("Failed to load sales data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Transform sales trend into salesOverTime format
  const salesOverTime = useMemo(() => {
    if (salesTrend.length > 0) {
      return salesTrend.map((item) => ({
        date: new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        sales: item.revenue,
        tickets: item.count,
      }));
    }
    return mockSalesOverTime;
  }, [salesTrend]);

  // Transform revenue by ticket type
  const revenueByTicketTypeData = useMemo(() => {
    if (organiserAnalytics?.revenueByTicketType?.length > 0) {
      return organiserAnalytics.revenueByTicketType.map((item: any) => ({
        type: item.type,
        revenue: item.revenue,
        count: item.count,
      }));
    }
    return revenueByTicketType;
  }, [organiserAnalytics]);

  // Transform revenue by payment method
  const revenueByPaymentMethodData = useMemo(() => {
    if (organiserAnalytics?.revenueByPaymentMethod?.length > 0) {
      const total = organiserAnalytics.revenueByPaymentMethod.reduce((sum: number, item: any) => sum + item.revenue, 0);
      return organiserAnalytics.revenueByPaymentMethod.map((item: any) => ({
        method: item.method,
        revenue: item.revenue,
        count: item.count,
        percentage: total > 0 ? Math.round((item.revenue / total) * 100 * 10) / 10 : 0,
      }));
    }
    return revenueByPaymentMethod;
  }, [organiserAnalytics]);

  const totalStats = useMemo(() => {
    const totalRevenue = salesOverTime.reduce((sum, item) => sum + item.sales, 0);
    const totalTickets = salesOverTime.reduce((sum, item) => sum + item.tickets, 0);
    const avgTicketPrice = totalTickets > 0 ? totalRevenue / totalTickets : 0;
    const conversionRate = conversionFunnel.length > 0 && conversionFunnel[4]?.count && conversionFunnel[0]?.count
      ? (conversionFunnel[4].count / conversionFunnel[0].count) * 100
      : 0;
    
    const previousPeriodRevenue = salesOverTime.length > 1 
      ? salesOverTime.slice(0, Math.floor(salesOverTime.length / 2)).reduce((sum, item) => sum + item.sales, 0)
      : 0;
    const growth = previousPeriodRevenue > 0 
      ? ((totalRevenue - previousPeriodRevenue) / previousPeriodRevenue) * 100 
      : 12.5;
    
    return {
      totalRevenue,
      totalTickets,
      avgTicketPrice,
      conversionRate,
      growth,
    };
  }, [salesOverTime]);

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-slate-200 bg-white p-4 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-24 mb-3"></div>
              <div className="h-8 bg-slate-200 rounded w-32 mb-2"></div>
              <div className="h-3 bg-slate-200 rounded w-20"></div>
            </div>
          ))
        ) : (
          <>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <DollarSign className="size-4 text-green-600" />
            <span>Total Revenue</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">
                KES {(totalStats.totalRevenue / 100).toLocaleString()}
          </p>
          <p className="mt-1 flex items-center gap-1 text-xs text-green-600">
            <ArrowUpRight className="size-3" />
                {totalStats.growth > 0 ? "+" : ""}{totalStats.growth.toFixed(1)}% vs previous period
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Ticket className="size-4 text-blue-600" />
            <span>Tickets Sold</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {totalStats.totalTickets.toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <TrendingUp className="size-4 text-purple-600" />
            <span>Avg Ticket Price</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            KES {Math.round(totalStats.avgTicketPrice).toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Users className="size-4 text-amber-600" />
            <span>Conversion Rate</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {totalStats.conversionRate.toFixed(1)}%
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <ArrowUpRight className="size-4 text-emerald-600" />
            <span>Growth</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">
                {totalStats.growth > 0 ? "+" : ""}{totalStats.growth.toFixed(1)}%
          </p>
        </div>
          </>
        )}
      </div>


      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">Last 7 Days</SelectItem>
            <SelectItem value="30days">Last 30 Days</SelectItem>
            <SelectItem value="3months">Last 3 Months</SelectItem>
            <SelectItem value="6months">Last 6 Months</SelectItem>
            <SelectItem value="year">Last Year</SelectItem>
          </SelectContent>
        </Select>
        <Select value={selectedEvent} onValueChange={setSelectedEvent}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Events</SelectItem>
            <SelectItem value="event-1">Nairobi Music Festival</SelectItem>
            <SelectItem value="event-2">Wellness Retreat</SelectItem>
            <SelectItem value="event-3">Tech Conference</SelectItem>
          </SelectContent>
        </Select>
        <button className="ml-auto inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
          <Download className="size-4" />
          Export Report
        </button>
      </div>

      {/* Sales Over Time */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">Sales Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <ReLineChart data={salesOverTime}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
            <XAxis
              dataKey="date"
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
            <Line
              type="monotone"
              dataKey="sales"
              stroke="#0ea5e9"
              strokeWidth={2}
              name="Revenue (KES)"
              dot={{ fill: "#0ea5e9", r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="tickets"
              stroke="#f97316"
              strokeWidth={2}
              name="Tickets"
              dot={{ fill: "#f97316", r: 4 }}
            />
          </ReLineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Conversion Funnel */}
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">Conversion Funnel</h3>
          <ResponsiveContainer width="100%" height={300}>
            <ReBarChart data={conversionFunnel} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
              <XAxis type="number" hide />
              <YAxis
                dataKey="stage"
                type="category"
                tickLine={false}
                axisLine={false}
                className="text-sm text-slate-500"
              />
              <ReTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" fill="#0ea5e9" radius={[0, 8, 8, 0]}>
                {conversionFunnel.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                ))}
              </Bar>
            </ReBarChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2 text-sm">
            {conversionFunnel.map((stage, index) => (
              <div key={stage.stage} className="flex items-center justify-between">
                <span className="text-slate-600">{stage.stage}</span>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-slate-900">{stage.count.toLocaleString()}</span>
                  <span className="text-slate-500">{stage.percentage.toFixed(1)}%</span>
                  {index > 0 && (
                    <span className="text-xs text-slate-400">
                      ({((stage.percentage / conversionFunnel[index - 1].percentage) * 100).toFixed(1)}% conversion)
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue by Ticket Type */}
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">Revenue by Ticket Type</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RePieChart>
              <Pie
                data={revenueByTicketTypeData.filter((item: { revenue: number }) => item.revenue > 0)}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => percent ? `${name}: ${(percent * 100).toFixed(0)}%` : name}
                outerRadius={100}
                fill="#8884d8"
                dataKey="revenue"
              >
                {revenueByTicketTypeData
                  .filter((item: { revenue: number }) => item.revenue > 0)
                  .map((entry: { revenue: number }, index: number) => (
                    <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                  ))}
              </Pie>
              <ReTooltip content={<ChartTooltipContent />} />
            </RePieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {revenueByTicketTypeData.map((type: { type: string; revenue: number; count: number }, index: number) => (
              <div key={type.type} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="size-3 rounded-full"
                    style={{
                      backgroundColor:
                        type.revenue > 0 ? chartColors[index % chartColors.length] : "#e2e8f0",
                    }}
                  />
                  <span className="text-slate-600">{type.type}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-slate-900">
                    KES {(type.revenue / 100).toLocaleString()}
                  </span>
                  <span className="text-slate-500">{type.count} tickets</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Revenue by Payment Method */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">Revenue by Payment Method</h3>
        <ResponsiveContainer width="100%" height={300}>
          <ReBarChart data={revenueByPaymentMethodData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
            <XAxis
              dataKey="method"
              tickLine={false}
              axisLine={false}
              className="text-sm text-slate-500"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              className="text-sm text-slate-500"
              tickFormatter={(value) => `KES ${(value / 100000).toFixed(0)}k`}
            />
            <ReTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="revenue" radius={[8, 8, 0, 0]}>
              {revenueByPaymentMethodData.map((entry: { method: string; revenue: number }, index: number) => (
                <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
              ))}
            </Bar>
          </ReBarChart>
        </ResponsiveContainer>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-5">
          {revenueByPaymentMethodData.map((method: { method: string; revenue: number; percentage: number; count: number }, index: number) => (
            <div key={method.method} className="text-center">
              <p className="text-sm font-semibold text-slate-900">{method.method}</p>
              <p className="mt-1 text-lg font-bold text-slate-900">
                KES {(method.revenue / 100000).toFixed(0)}k
              </p>
              <p className="text-xs text-slate-600">{method.percentage.toFixed(1)}%</p>
              <p className="text-xs text-slate-500">{method.count} transactions</p>
            </div>
          ))}
        </div>
      </div>

      {/* Hourly Sales Pattern */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">Hourly Sales Pattern</h3>
        <ResponsiveContainer width="100%" height={250}>
          <ReAreaChart data={hourlySales}>
            <defs>
              <linearGradient id="hourlyGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
            <XAxis
              dataKey="hour"
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
            <Area
              type="monotone"
              dataKey="sales"
              stroke="#0ea5e9"
              fillOpacity={1}
              fill="url(#hourlyGradient)"
            />
          </ReAreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

