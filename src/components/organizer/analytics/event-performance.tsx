"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp,
  Users,
  Ticket,
  Eye,
  Target,
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
  LineChart as ReLineChart,
  Line,
  AreaChart as ReAreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ReTooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from "recharts";
import { ChartTooltipContent } from "@/components/charts/chart-utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const eventPerformance = [
  {
    event: "Nairobi Music Festival",
    views: 12500,
    purchases: 5200,
    conversion: 41.6,
    revenue: 2800000,
    checkInRate: 87,
  },
  {
    event: "Wellness Retreat",
    views: 8200,
    purchases: 3200,
    conversion: 39.0,
    revenue: 1850000,
    checkInRate: 92,
  },
  {
    event: "Tech Conference",
    views: 15600,
    purchases: 6400,
    conversion: 41.0,
    revenue: 3200000,
    checkInRate: 85,
  },
];

const marketingAttribution = [
  { channel: "SMS", conversions: 1850, revenue: 980000, roi: 4.2 },
  { channel: "Email", conversions: 1240, revenue: 680000, roi: 3.8 },
  { channel: "Affiliates", conversions: 980, revenue: 540000, roi: 5.1 },
  { channel: "Paid Ads", conversions: 750, revenue: 420000, roi: 2.9 },
  { channel: "Organic", conversions: 380, revenue: 180000, roi: 8.5 },
];

const checkInTrends = [
  { date: "Day 1", checkedIn: 420, expected: 520, rate: 80.8 },
  { date: "Day 2", checkedIn: 580, expected: 650, rate: 89.2 },
  { date: "Day 3", checkedIn: 650, expected: 720, rate: 90.3 },
  { date: "Day 4", checkedIn: 720, expected: 800, rate: 90.0 },
  { date: "Day 5", checkedIn: 850, expected: 950, rate: 89.5 },
];

const seatMapHeatmap = [
  { section: "VIP A", demand: 95, revenue: 950000 },
  { section: "VIP B", demand: 88, revenue: 880000 },
  { section: "Premium", demand: 82, revenue: 820000 },
  { section: "Standard A", demand: 75, revenue: 750000 },
  { section: "Standard B", demand: 68, revenue: 680000 },
  { section: "General", demand: 92, revenue: 920000 },
];

const eventMetrics = [
  { metric: "View Rate", score: 85 },
  { metric: "Conversion", score: 78 },
  { metric: "Check-in", score: 92 },
  { metric: "Retention", score: 68 },
  { metric: "Satisfaction", score: 88 },
];

const chartColors = ["#0ea5e9", "#f97316", "#22c55e", "#8b5cf6", "#ec4899"];

export function EventPerformance() {
  const { user } = useAuth();
  const [selectedEvent, setSelectedEvent] = useState("all");
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
          events: Array<{
            eventId: string;
            eventName: string;
            views: number;
            purchases: number;
            conversion: number;
            revenue: number;
            checkInRate: number;
          }>;
          totalViews: number;
          totalPurchases: number;
          avgConversion: number;
          totalRevenue: number;
          avgCheckInRate: number;
        }>(`/organisers/${orgId}/analytics/events`).catch(() => null);
        setOrganiserAnalytics(analytics);
      }
    } catch (error) {
      console.error("Failed to load event performance:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalStats = {
    totalViews: organiserAnalytics?.totalViews || 0,
    totalPurchases: organiserAnalytics?.totalPurchases || 0,
    avgConversion: organiserAnalytics?.avgConversion || 0,
    totalRevenue: organiserAnalytics?.totalRevenue || 0,
    avgCheckInRate: organiserAnalytics?.avgCheckInRate || 0,
  };

  const eventPerformanceData = organiserAnalytics?.events || eventPerformance;

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
            <Eye className="size-4 text-blue-600" />
            <span>Total Views</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {totalStats.totalViews.toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Ticket className="size-4 text-green-600" />
            <span>Total Purchases</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {totalStats.totalPurchases.toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Target className="size-4 text-purple-600" />
            <span>Avg Conversion</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {totalStats.avgConversion.toFixed(1)}%
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <TrendingUp className="size-4 text-amber-600" />
            <span>Total Revenue</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            KES {(totalStats.totalRevenue / 100000000).toFixed(1)}M
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Users className="size-4 text-emerald-600" />
            <span>Check-in Rate</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {totalStats.avgCheckInRate.toFixed(1)}%
          </p>
        </div>
          </>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
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

      {/* Event Performance Comparison */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">Event Performance Comparison</h3>
        <ResponsiveContainer width="100%" height={350}>
          <ReBarChart data={eventPerformanceData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
            <XAxis
              dataKey="event"
              tickLine={false}
              axisLine={false}
              className="text-xs text-slate-500"
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              yAxisId="left"
              tickLine={false}
              axisLine={false}
              className="text-sm text-slate-500"
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tickLine={false}
              axisLine={false}
              className="text-sm text-slate-500"
              tickFormatter={(value) => `${value}%`}
            />
            <ReTooltip content={<ChartTooltipContent />} />
            <Legend />
            <Bar yAxisId="left" dataKey="revenue" fill="#0ea5e9" name="Revenue (KES)" radius={[8, 8, 0, 0]} />
            <Bar yAxisId="right" dataKey="conversion" fill="#f97316" name="Conversion %" radius={[8, 8, 0, 0]} />
          </ReBarChart>
        </ResponsiveContainer>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {eventPerformanceData.map((event) => (
            <div key={event.event} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <h4 className="font-semibold text-slate-900">{event.event}</h4>
              <div className="mt-2 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Views:</span>
                  <span className="font-semibold">{event.views.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Purchases:</span>
                  <span className="font-semibold">{event.purchases.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Conversion:</span>
                  <span className="font-semibold">{event.conversion.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Revenue:</span>
                  <span className="font-semibold">KES {(event.revenue / 100000).toFixed(0)}k</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Check-in:</span>
                  <span className="font-semibold">{event.checkInRate}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Marketing Attribution */}
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">Marketing Channel Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <ReBarChart data={marketingAttribution}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
              <XAxis
                dataKey="channel"
                tickLine={false}
                axisLine={false}
                className="text-sm text-slate-500"
              />
              <YAxis
                yAxisId="left"
                tickLine={false}
                axisLine={false}
                className="text-sm text-slate-500"
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tickLine={false}
                axisLine={false}
                className="text-sm text-slate-500"
              />
              <ReTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Bar
                yAxisId="left"
                dataKey="revenue"
                fill="#0ea5e9"
                name="Revenue (KES)"
                radius={[8, 8, 0, 0]}
              />
              <Bar
                yAxisId="right"
                dataKey="roi"
                fill="#22c55e"
                name="ROI (x)"
                radius={[8, 8, 0, 0]}
              />
            </ReBarChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {marketingAttribution.map((channel, index) => (
              <div key={channel.channel} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="size-3 rounded-full"
                    style={{ backgroundColor: chartColors[index % chartColors.length] }}
                  />
                  <span className="font-semibold text-slate-900">{channel.channel}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-slate-600">{channel.conversions} conversions</span>
                  <span className="font-semibold text-slate-900">
                    {channel.roi}x ROI
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Check-in Trends */}
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">Check-in Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <ReAreaChart data={checkInTrends}>
              <defs>
                <linearGradient id="checkinGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0.1} />
                </linearGradient>
              </defs>
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
              />
              <ReTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Area
                type="monotone"
                dataKey="checkedIn"
                stroke="#22c55e"
                fillOpacity={1}
                fill="url(#checkinGradient)"
                name="Checked In"
              />
              <Line
                type="monotone"
                dataKey="expected"
                stroke="#ef4444"
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Expected"
                dot={false}
              />
            </ReAreaChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {checkInTrends.map((day) => (
              <div key={day.date} className="flex items-center justify-between text-sm">
                <span className="text-slate-600">{day.date}</span>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-slate-900">
                    {day.checkedIn} / {day.expected}
                  </span>
                  <span className="text-slate-500">{day.rate.toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Seat Map Heatmap */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">Seat Map Demand Heatmap</h3>
        <ResponsiveContainer width="100%" height={300}>
          <ReBarChart data={seatMapHeatmap}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
            <XAxis
              dataKey="section"
              tickLine={false}
              axisLine={false}
              className="text-sm text-slate-500"
            />
            <YAxis
              yAxisId="left"
              tickLine={false}
              axisLine={false}
              className="text-sm text-slate-500"
              tickFormatter={(value) => `${value}%`}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tickLine={false}
              axisLine={false}
              className="text-sm text-slate-500"
              tickFormatter={(value) => `KES ${(value / 1000).toFixed(0)}k`}
            />
            <ReTooltip content={<ChartTooltipContent />} />
            <Legend />
            <Bar
              yAxisId="left"
              dataKey="demand"
              fill="#8b5cf6"
              name="Demand %"
              radius={[8, 8, 0, 0]}
            />
            <Bar
              yAxisId="right"
              dataKey="revenue"
              fill="#ec4899"
              name="Revenue (KES)"
              radius={[8, 8, 0, 0]}
            />
          </ReBarChart>
        </ResponsiveContainer>
      </div>

      {/* Event Metrics Radar */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">Event Performance Metrics</h3>
        <ResponsiveContainer width="100%" height={350}>
          <RadarChart data={eventMetrics}>
            <PolarGrid />
            <PolarAngleAxis
              dataKey="metric"
              tick={{ fill: "#64748b", fontSize: 12 }}
            />
            <Radar
              name="Performance"
              dataKey="score"
              stroke="#0ea5e9"
              fill="#0ea5e9"
              fillOpacity={0.6}
            />
            <ReTooltip content={<ChartTooltipContent />} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

