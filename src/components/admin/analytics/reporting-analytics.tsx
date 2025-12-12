"use client";

import { useState, useMemo, useEffect } from "react";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/contexts/toast-context";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Users,
  Download,
  Calendar,
  FileText,
  PieChart,
  MapPin,
  Ticket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart as ReLineChart,
  Line,
  BarChart as ReBarChart,
  Bar,
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

export function ReportingAnalytics() {
  const { user } = useAuth();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<"sales" | "attendees" | "financial">("sales");
  const [dateRange, setDateRange] = useState("30days");
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<{
    salesTrend: Array<{ date: string; revenue: number; tickets: number }>;
    revenueByEvent: Array<{ eventName: string; revenue: number; orders: number }>;
    paymentMethods: Array<{ method: string; total: number; count: number }>;
    attendeeStats: Array<{ eventName: string; checkins: number }>;
  } | null>(null);

  useEffect(() => {
    if (user) {
      loadAnalytics();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, dateRange]);

  const loadAnalytics = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const days = dateRange === "7days" ? 7 : dateRange === "30days" ? 30 : dateRange === "90days" ? 90 : 365;
      const data = await apiClient.get<{
        salesTrend: Array<{ date: string; revenue: number; tickets: number }>;
        revenueByEvent: Array<{ eventName: string; revenue: number; orders: number }>;
        paymentMethods: Array<{ method: string; total: number; count: number }>;
        attendeeStats: Array<{ eventName: string; checkins: number }>;
      }>(`/admin/analytics/platform?days=${days}`);
      setAnalyticsData(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
      toast.error('Failed to load analytics', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!analyticsData) return;
    
    const csv = [
      ['Date', 'Revenue', 'Tickets'],
      ...analyticsData.salesTrend.map((s) => [
        s.date,
        (s.revenue / 100).toLocaleString(),
        s.tickets.toString(),
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Exported', 'Analytics exported to CSV');
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="sales">Sales Reports</TabsTrigger>
            <TabsTrigger value="attendees">Attendee Analytics</TabsTrigger>
            <TabsTrigger value="financial">Financial Reports</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 Days</SelectItem>
                <SelectItem value="30days">Last 30 Days</SelectItem>
                <SelectItem value="90days">Last 90 Days</SelectItem>
                <SelectItem value="year">Last Year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={handleExport} disabled={loading || !analyticsData}>
              <Download className="mr-2 size-4" />
              Export
            </Button>
          </div>
        </div>

        <TabsContent value="sales" className="mt-6">
          <SalesReportsTab data={analyticsData} loading={loading} />
        </TabsContent>

        <TabsContent value="attendees" className="mt-6">
          <AttendeeAnalyticsTab data={analyticsData} loading={loading} />
        </TabsContent>

        <TabsContent value="financial" className="mt-6">
          <FinancialReportsTab data={analyticsData} loading={loading} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SalesReportsTab({ data, loading }: { data: any; loading: boolean }) {
  const salesData = data?.salesTrend?.map((s: any) => ({
    date: new Date(s.date).toLocaleDateString('en-US', { weekday: 'short' }),
    revenue: s.revenue / 100,
    tickets: s.tickets,
  })) || [];

  const eventRevenue = data?.revenueByEvent?.map((e: any) => ({
    event: e.eventName.length > 15 ? e.eventName.substring(0, 15) + '...' : e.eventName,
    revenue: e.revenue / 100,
  })) || [];

  const chartColors = ["#0ea5e9", "#f97316", "#22c55e"];

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <ReLineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
              <XAxis dataKey="date" className="text-sm text-slate-500" />
              <YAxis
                tickFormatter={(value) => `KES ${(value / 1000).toFixed(0)}k`}
                className="text-sm text-slate-500"
              />
              <ReTooltip content={<ChartTooltipContent />} />
              <Line type="monotone" dataKey="revenue" stroke="#0ea5e9" strokeWidth={2} />
            </ReLineChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">Revenue by Event</h3>
          <ResponsiveContainer width="100%" height={300}>
            <ReBarChart data={eventRevenue}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
              <XAxis dataKey="event" className="text-sm text-slate-500" />
              <YAxis
                tickFormatter={(value) => `KES ${(value / 1000).toFixed(0)}k`}
                className="text-sm text-slate-500"
              />
              <ReTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="revenue" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
            </ReBarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">Sales Summary</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm text-slate-600">Total Revenue</div>
            <p className="mt-2 text-2xl font-bold text-slate-900">KES 19.75M</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm text-slate-600">Total Tickets</div>
            <p className="mt-2 text-2xl font-bold text-slate-900">7,190</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm text-slate-600">Avg Ticket Price</div>
            <p className="mt-2 text-2xl font-bold text-slate-900">KES 2,747</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function AttendeeAnalyticsTab({ data, loading }: { data: any; loading: boolean }) {
  const attendeeData = data?.attendeeStats?.map((a: any) => ({
    event: a.eventName.length > 15 ? a.eventName.substring(0, 15) + '...' : a.eventName,
    checkins: a.checkins,
  })) || [];
  
  const locationData = [
    { location: "Nairobi", count: 1850, percentage: 67 },
    { location: "Mombasa", count: 420, percentage: 15 },
    { location: "Kisumu", count: 210, percentage: 8 },
    { location: "Nakuru", count: 180, percentage: 7 },
  ];

  const chartColors = ["#0ea5e9", "#f97316", "#22c55e", "#8b5cf6"];

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">Geographic Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RePieChart>
              <Pie
                data={locationData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => percent ? `${name}: ${(percent * 100).toFixed(0)}%` : name}
                outerRadius={100}
                fill="#8884d8"
                dataKey="count"
              >
                {locationData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                ))}
              </Pie>
              <ReTooltip content={<ChartTooltipContent />} />
            </RePieChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">Top Locations</h3>
          <div className="space-y-3">
            {locationData.map((loc) => (
              <div key={loc.location} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="size-4 text-slate-600" />
                  <span className="text-sm font-medium text-slate-900">{loc.location}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-semibold text-slate-900">{loc.count}</span>
                  <span className="text-sm text-slate-600">{loc.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function FinancialReportsTab({ data, loading }: { data: any; loading: boolean }) {
  const totalRevenue = data?.salesTrend?.reduce((sum: number, s: any) => sum + s.revenue, 0) || 0;
  const platformFees = totalRevenue * 0.05;
  const vat = (totalRevenue - platformFees) * 0.16;
  const netProfit = totalRevenue - platformFees - vat;
  
  const paymentMethodData = data?.paymentMethods?.map((pm: any) => ({
    method: pm.method,
    total: pm.total / 100,
    count: pm.count,
  })) || [];

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="flex items-center justify-center p-12">
          <div className="text-center">
            <div className="mx-auto size-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
            <p className="mt-4 text-sm text-slate-600">Loading financial data...</p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <h3 className="mb-4 text-lg font-semibold text-slate-900">Platform Fees</h3>
              <p className="text-3xl font-bold text-slate-900">KES {(platformFees / 100).toLocaleString()}</p>
              <p className="mt-2 text-sm text-slate-600">5% of gross revenue</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <h3 className="mb-4 text-lg font-semibold text-slate-900">VAT</h3>
              <p className="text-3xl font-bold text-slate-900">KES {(vat / 100).toLocaleString()}</p>
              <p className="mt-2 text-sm text-slate-600">16% of net revenue</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <h3 className="mb-4 text-lg font-semibold text-slate-900">Net Profit</h3>
              <p className="text-3xl font-bold text-green-600">KES {(netProfit / 100).toLocaleString()}</p>
              <p className="mt-2 text-sm text-slate-600">After all fees and taxes</p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold text-slate-900">Payment Method Breakdown</h3>
            <ResponsiveContainer width="100%" height={300}>
              <ReBarChart data={paymentMethodData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
                <XAxis dataKey="method" className="text-sm text-slate-500" />
                <YAxis
                  tickFormatter={(value) => `KES ${(value / 1000).toFixed(0)}k`}
                  className="text-sm text-slate-500"
                />
                <ReTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="total" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
              </ReBarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}

