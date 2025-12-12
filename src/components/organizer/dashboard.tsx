 "use client";

import type { ReactNode } from "react";
import { useState, useEffect } from "react";
import {
  Area,
  AreaChart as ReAreaChart,
  Bar,
  BarChart as ReBarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart as ReLineChart,
  Pie,
  PieChart as RePieChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip as ReTooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  organizerChartSeries,
  organizerDashboardClusters,
  organizerDashboardSales,
  organizerOpsSignals,
} from "@/data/organizer";
import { useAuth } from "@/contexts/auth-context";
import { getDashboardStats, getOrganiserAnalytics, getSalesTrend } from "@/lib/analytics-api";
import { apiClient } from "@/lib/api";
import {
  AreaChartInteractive,
  BarChartInteractive,
  ChartModal,
  SparklineInteractive,
} from "@/components/charts/chart-modal";
import { ChartTooltipContent } from "@/components/charts/chart-utils";

const chartColors = ["#0ea5e9", "#f97316", "#22c55e", "#8b5cf6", "#ec4899"];

const marketingAttribution = [
  { label: "SMS", value: 38 },
  { label: "Email", value: 24 },
  { label: "Affiliates", value: 20 },
  { label: "Paid", value: 18 },
];

const seatDemandCurve = [42, 55, 63, 71, 78, 74, 82, 89, 95, 102, 98];

const accentColorMap: Record<string, string> = {
  "text-rose-500": "#f43f5e",
  "text-amber-500": "#f59e0b",
  "text-emerald-500": "#10b981",
  "text-indigo-500": "#6366f1",
};

const audienceSegments = [
  { segment: "Owners", value: 34 },
  { segment: "Managers", value: 28 },
  { segment: "Finance", value: 16 },
  { segment: "Promoters", value: 12 },
  { segment: "Door Staff", value: 10 },
];

const promoterRadar = [
  { metric: "Referrals", score: 82 },
  { metric: "ROI", score: 76 },
  { metric: "Attendance", score: 88 },
  { metric: "Upsells", score: 69 },
  { metric: "Retention", score: 74 },
];

const staffUtilization = [
  { label: "HQ", value: 78, fill: "#0ea5e9" },
  { label: "Field", value: 66, fill: "#f97316" },
  { label: "Vendors", value: 54, fill: "#8b5cf6" },
];

const campaignVelocity = [
  { week: "W1", email: 12, sms: 18, affiliates: 6 },
  { week: "W2", email: 15, sms: 22, affiliates: 8 },
  { week: "W3", email: 13, sms: 24, affiliates: 11 },
  { week: "W4", email: 17, sms: 26, affiliates: 12 },
];

const addOnMomentum = [
  { label: "Shuttles", value: 42 },
  { label: "Hospitality", value: 33 },
  { label: "Merch", value: 27 },
  { label: "Wellness", value: 18 },
];

const payoutVelocity = [
  { month: "Jan", automated: 11, manual: 4 },
  { month: "Feb", automated: 12, manual: 3 },
  { month: "Mar", automated: 13, manual: 3.5 },
  { month: "Apr", automated: 14, manual: 2.8 },
];

const GeoAudiencePie = () => (
  <ResponsiveContainer width="100%" height="100%">
    <RePieChart>
      <ReTooltip content={<ChartTooltipContent />} />
      <Pie dataKey="value" data={audienceSegments} nameKey="segment" innerRadius="50%">
        {audienceSegments.map((entry, index) => (
          <Cell key={entry.segment} fill={chartColors[index % chartColors.length]} />
        ))}
      </Pie>
    </RePieChart>
  </ResponsiveContainer>
);

const PromoterRadarChart = () => (
  <ResponsiveContainer width="100%" height="100%">
    <RadarChart data={promoterRadar}>
      <PolarGrid className="stroke-slate-200" />
      <PolarAngleAxis dataKey="metric" className="text-xs text-slate-500" />
      <Radar
        name="Promoters"
        dataKey="score"
        stroke="#22c55e"
        fill="#22c55e"
        fillOpacity={0.2}
      />
    </RadarChart>
  </ResponsiveContainer>
);

const StaffRadialChart = () => (
  <ResponsiveContainer width="100%" height="100%">
    <RadialBarChart
      data={staffUtilization}
      innerRadius="20%"
      outerRadius="90%"
      startAngle={90}
      endAngle={-270}
    >
      <RadialBar
        dataKey="value"
        cornerRadius={8}
        background
      >
        {staffUtilization.map((entry) => (
          <Cell key={entry.label} fill={entry.fill} />
        ))}
      </RadialBar>
    </RadialBarChart>
  </ResponsiveContainer>
);

const CampaignStackChart = () => (
  <ResponsiveContainer width="100%" height="100%">
    <ReAreaChart data={campaignVelocity}>
      <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
      <XAxis
        dataKey="week"
        tickLine={false}
        axisLine={false}
        className="text-xs text-slate-500"
      />
      <YAxis hide />
      <ReTooltip content={<ChartTooltipContent />} />
      <Area type="monotone" dataKey="email" stackId="1" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} />
      <Area type="monotone" dataKey="sms" stackId="1" stroke="#f97316" fill="#f97316" fillOpacity={0.25} />
      <Area type="monotone" dataKey="affiliates" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.25} />
    </ReAreaChart>
  </ResponsiveContainer>
);

const AddOnBarChart = () => (
  <ResponsiveContainer width="100%" height="100%">
    <ReBarChart data={addOnMomentum}>
      <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
      <XAxis
        dataKey="label"
        tickLine={false}
        axisLine={false}
        className="text-xs text-slate-500"
      />
      <YAxis hide />
      <ReTooltip content={<ChartTooltipContent />} />
      <Bar dataKey="value" radius={[8, 8, 0, 0]}>
        {addOnMomentum.map((entry, index) => (
          <Cell key={entry.label} fill={chartColors[index % chartColors.length]} />
        ))}
      </Bar>
    </ReBarChart>
  </ResponsiveContainer>
);

const PayoutStackChart = () => (
  <ResponsiveContainer width="100%" height="100%">
    <ReAreaChart data={payoutVelocity}>
      <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
      <XAxis
        dataKey="month"
        tickLine={false}
        axisLine={false}
        className="text-xs text-slate-500"
      />
      <YAxis hide />
      <ReTooltip content={<ChartTooltipContent />} />
      <Area type="monotone" dataKey="automated" stackId="1" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.25} />
      <Area type="monotone" dataKey="manual" stackId="1" stroke="#f97316" fill="#f97316" fillOpacity={0.25} />
    </ReAreaChart>
  </ResponsiveContainer>
);

const getSeriesData = (series: (typeof organizerChartSeries)[number]) =>
  series.points.map((value, index) => ({
    label: `P${index + 1}`,
    value,
  }));

type ModalConfig = {
  title: string;
  description?: string;
  content: ReactNode;
};

// Helper to get organiserId from user
// For now, we'll try to get it from the user's organiser relationship
// In the future, this should be part of the user object or fetched separately
async function getUserOrganiserId(userId: string): Promise<string | null> {
  try {
    // Try to get organiser from user - this endpoint may need to be created
    // For now, we'll use a workaround: try to get events and extract organiserId
    const events = await apiClient.get<any[]>("/events?limit=1");
    if (events && events.length > 0 && events[0].organiserId) {
      return events[0].organiserId;
    }
    return null;
  } catch {
    return null;
  }
}

export function OrganizerDashboardPanels() {
  const { user } = useAuth();
  const [chartModal, setChartModal] = useState<ModalConfig | null>(null);
  const [showAllAnalytics, setShowAllAnalytics] = useState(false);
  const [dashboardStats, setDashboardStats] = useState<{
    ticketsSoldToday: number;
    grossRevenue: number;
    outstandingPayouts: number;
    checkInRate: number;
  } | null>(null);
  const [organiserAnalytics, setOrganiserAnalytics] = useState<{
    totalEvents: number;
    upcomingEvents: number;
    totalRevenue: number;
    totalTicketsSold: number;
  } | null>(null);
  const [salesTrend, setSalesTrend] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [organiserId, setOrganiserId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      // Get organiserId
      const orgId = await getUserOrganiserId(user.id);
      if (!orgId) {
        console.warn("Could not determine organiserId for user");
        setLoading(false);
        return;
      }
      setOrganiserId(orgId);

      // Fetch dashboard data in parallel
      const [stats, analytics, trend] = await Promise.all([
        getDashboardStats(orgId).catch(() => null),
        getOrganiserAnalytics(orgId).catch(() => null),
        getSalesTrend(orgId, 30).catch(() => []),
      ]);

      if (stats) {
        setDashboardStats({
          ticketsSoldToday: stats.ticketsSoldToday,
          grossRevenue: stats.grossRevenue,
          outstandingPayouts: stats.outstandingPayouts,
          checkInRate: stats.checkInRate,
        });
      }

      if (analytics) {
        setOrganiserAnalytics(analytics);
      }

      if (trend) {
        setSalesTrend(trend);
      }
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const openSparklineModal = (series: (typeof organizerChartSeries)[number]) => {
    setChartModal({
      title: series.title,
      description: `${series.frequency} • ${series.change}`,
      content: (
        <SparklineInteractive
          points={series.points}
          color={accentColorMap[series.accent] ?? "hsl(var(--chart-1))"}
        />
      ),
    });
  };

  const openMarketingModal = () => {
    setChartModal({
      title: "Marketing attribution",
      description: "Hover each bar to inspect how channels convert right now.",
      content: <BarChartInteractive data={marketingAttribution} />,
    });
  };

  const openSeatDemandModal = () => {
    setChartModal({
      title: "Seat demand curve",
      description: "Cursor tracking along the heat curve per drop.",
      content: (
        <AreaChartInteractive
          points={seatDemandCurve}
          accentClass="text-emerald-500"
        />
      ),
    });
  };

  const openCustomModal = (
    title: string,
    description: string,
    content: ReactNode,
  ) => {
    setChartModal({
      title,
      description,
      content,
    });
  };

  return (
    <section className="bg-white py-16 text-slate-900">
      <div className="mx-auto w-full max-w-7xl px-6 md:px-10 lg:px-16 space-y-10">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {loading ? (
            // Loading state
            Array.from({ length: 4 }).map((_, i) => (
            <article
                key={i}
                className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4 shadow-sm shadow-slate-200/60 animate-pulse"
              >
                <div className="h-4 bg-slate-200 rounded w-24 mb-3"></div>
                <div className="h-8 bg-slate-200 rounded w-32 mb-2"></div>
                <div className="h-4 bg-slate-200 rounded w-20 mb-2"></div>
                <div className="h-3 bg-slate-200 rounded w-full"></div>
              </article>
            ))
          ) : dashboardStats ? (
            // API data
            <>
              <article className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4 shadow-sm shadow-slate-200/60">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                  Tickets sold today
              </p>
              <p className="mt-3 text-2xl font-semibold text-slate-900">
                  {dashboardStats.ticketsSoldToday.toLocaleString()}
              </p>
              <p className="text-sm font-semibold text-emerald-600">
                  {organiserAnalytics ? `+${((dashboardStats.ticketsSoldToday / Math.max(organiserAnalytics.totalTicketsSold, 1)) * 100).toFixed(1)}% of total` : "Loading..."}
              </p>
                <p className="mt-2 text-xs text-slate-500">Live sales tracking</p>
            </article>
              <article className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4 shadow-sm shadow-slate-200/60">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                  Gross revenue
                </p>
                <p className="mt-3 text-2xl font-semibold text-slate-900">
                  KES {(dashboardStats.grossRevenue / 100).toLocaleString()}
                </p>
                <p className="text-sm font-semibold text-emerald-600">
                  {organiserAnalytics ? `${((dashboardStats.grossRevenue / Math.max(organiserAnalytics.totalRevenue, 1)) * 100).toFixed(1)}% of total` : "Loading..."}
                </p>
                <p className="mt-2 text-xs text-slate-500">All payment methods</p>
              </article>
              <article className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4 shadow-sm shadow-slate-200/60">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                  Outstanding payouts
                </p>
                <p className="mt-3 text-2xl font-semibold text-slate-900">
                  KES {(dashboardStats.outstandingPayouts / 100).toLocaleString()}
                </p>
                <p className="text-sm font-semibold text-emerald-600">
                  Pending settlement
                </p>
                <p className="mt-2 text-xs text-slate-500">Awaiting processing</p>
              </article>
              <article className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4 shadow-sm shadow-slate-200/60">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                  Check-in rate
                </p>
                <p className="mt-3 text-2xl font-semibold text-slate-900">
                  {dashboardStats.checkInRate.toFixed(1)}%
                </p>
                <p className="text-sm font-semibold text-emerald-600">
                  {dashboardStats.checkInRate > 80 ? "Excellent" : dashboardStats.checkInRate > 60 ? "Good" : "Needs attention"}
                </p>
                <p className="mt-2 text-xs text-slate-500">Across all events</p>
              </article>
            </>
          ) : (
            // Fallback to mock data if API fails
            <>
              <article className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4 shadow-sm shadow-slate-200/60">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                  Tickets sold today
                </p>
                <p className="mt-3 text-2xl font-semibold text-slate-900">12,480</p>
                <p className="text-sm font-semibold text-emerald-600">+14% vs yesterday</p>
                <p className="mt-2 text-xs text-slate-500">Peak 08:10 after SMS blast</p>
              </article>
              <article className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4 shadow-sm shadow-slate-200/60">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                  Gross revenue
                </p>
                <p className="mt-3 text-2xl font-semibold text-slate-900">KES 18.6M</p>
                <p className="text-sm font-semibold text-emerald-600">+9% WoW</p>
                <p className="mt-2 text-xs text-slate-500">MPesa 62%, Card 24%, Bank 10%</p>
              </article>
              <article className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4 shadow-sm shadow-slate-200/60">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                  Outstanding payouts
                </p>
                <p className="mt-3 text-2xl font-semibold text-slate-900">KES 6.4M</p>
                <p className="text-sm font-semibold text-emerald-600">3 organisers pending</p>
                <p className="mt-2 text-xs text-slate-500">Soundwave pending KYC</p>
              </article>
              <article className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4 shadow-sm shadow-slate-200/60">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                  Check-in rate
                </p>
                <p className="mt-3 text-2xl font-semibold text-slate-900">87%</p>
                <p className="text-sm font-semibold text-emerald-600">+5 pts day</p>
                <p className="mt-2 text-xs text-slate-500">VIP lanes fastest (92%)</p>
              </article>
            </>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {loading ? (
            // Loading state for charts
            Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="rounded-3xl border border-slate-200 bg-white/95 p-5 animate-pulse"
              >
                <div className="h-4 bg-slate-200 rounded w-32 mb-4"></div>
                <div className="h-8 bg-slate-200 rounded w-24 mb-2"></div>
                <div className="h-4 bg-slate-200 rounded w-20 mb-4"></div>
                <div className="h-40 bg-slate-100 rounded-2xl"></div>
              </div>
            ))
          ) : (
            // Chart series with API data
            (() => {
              // Transform sales trend data for charts
              const ticketVelocityData = salesTrend.length > 0
                ? salesTrend.map((item, index) => ({
                    label: `P${index + 1}`,
                    value: item.count,
                  }))
                : getSeriesData(organizerChartSeries[0]);

              const revenueData = salesTrend.length > 0
                ? salesTrend.map((item, index) => ({
                    label: `P${index + 1}`,
                    value: Math.round(item.revenue / 10000), // Convert to thousands
                  }))
                : getSeriesData(organizerChartSeries[1]);

              const totalTickets = salesTrend.reduce((sum, item) => sum + item.count, 0);
              const totalRevenue = salesTrend.reduce((sum, item) => sum + item.revenue, 0);
              const avgTicketPrice = totalTickets > 0 ? totalRevenue / totalTickets : 0;

              const charts = [
                {
                  title: "Ticket velocity",
                  value: `${totalTickets.toLocaleString()} sold`,
                  change: salesTrend.length > 0 ? `Last ${salesTrend.length} days` : "+18% vs last week",
                  points: ticketVelocityData.map(d => d.value),
                  accent: "text-rose-500",
                  frequency: "Rolling 30 days",
                  data: ticketVelocityData,
                },
                {
                  title: "Revenue capture",
                  value: `KES ${(totalRevenue / 100).toLocaleString()}`,
                  change: organiserAnalytics ? `${((totalRevenue / Math.max(organiserAnalytics.totalRevenue, 1)) * 100).toFixed(1)}% of total` : "+11% WoW",
                  points: revenueData.map(d => d.value),
                  accent: "text-amber-500",
                  frequency: "Daily net settlement",
                  data: revenueData,
                },
                {
                  title: "Marketing ROI",
                  value: avgTicketPrice > 0 ? `${(avgTicketPrice / 100).toFixed(0)} avg` : "4.3x blended",
                  change: "+0.6 uplift",
                  points: organizerChartSeries[2].points,
                  accent: "text-emerald-500",
                  frequency: "Channel mix (SMS + affiliates + ads)",
                  data: getSeriesData(organizerChartSeries[2]),
                },
              ];

              return charts.map((chart) => {
                const strokeColor = accentColorMap[chart.accent] ?? "#0f172a";
            return (
              <button
                type="button"
                    key={chart.title}
                    onClick={() => openSparklineModal({
                      title: chart.title,
                      value: chart.value,
                      change: chart.change,
                      points: chart.points,
                      accent: chart.accent,
                      frequency: chart.frequency,
                    })}
                className="rounded-3xl border border-slate-200 bg-white/95 p-5 text-left shadow-sm shadow-slate-200/60 transition hover:-translate-y-1 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                          {chart.title}
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-slate-900">
                          {chart.value}
                    </p>
                    <p className="text-sm font-semibold text-emerald-600">
                          {chart.change}
                    </p>
                  </div>
                  <span className="rounded-full border border-slate-200 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500">
                    Explore
                  </span>
                </div>
                <div className="mt-4 rounded-2xl bg-gradient-to-br from-white via-slate-50 to-white p-3">
                  <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                          <ReLineChart data={chart.data}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          className="stroke-slate-200"
                          vertical={false}
                        />
                        <XAxis
                          dataKey="label"
                          tickLine={false}
                          axisLine={false}
                          className="text-[10px] uppercase tracking-[0.2em] text-slate-400"
                        />
                        <YAxis hide />
                        <ReTooltip content={<ChartTooltipContent />} />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke={strokeColor}
                          strokeWidth={3}
                          dot={false}
                          activeDot={{ r: 6, fill: strokeColor }}
                        />
                      </ReLineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>{chart.frequency}</span>
                    <span>Peak</span>
                  </div>
                </div>
              </button>
            );
              });
            })()
          )}
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
              Analytics suite
            </p>
            <p className="text-sm text-slate-500">
              {showAllAnalytics
                ? "Showing the full analytics grid."
                : "Tap below to reveal the full analytics grid."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAllAnalytics((prev) => !prev)}
            className="inline-flex items-center justify-center rounded-2xl border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-900 transition hover:border-slate-400"
          >
            {showAllAnalytics ? "Hide extra analytics" : "View all analytics"}
          </button>
        </div>

        <div
          className={`${
            showAllAnalytics ? "grid" : "hidden lg:grid"
          } gap-6 xl:grid-cols-3`}
        >
          <button
            type="button"
            onClick={() =>
              openCustomModal(
                "Audience segments",
                "Workspace roles tapping into the portal.",
                <div className="h-80">
                  <GeoAudiencePie />
                </div>,
              )
            }
            className="rounded-[32px] border border-slate-200 bg-white p-6 text-left shadow-lg shadow-slate-200/60 transition hover:-translate-y-1 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
                Audience mix
              </p>
              <h3 className="text-xl font-semibold text-slate-900">
                Organiser seats online today
              </h3>
            </div>
            <div className="mt-6 h-56">
              <GeoAudiencePie />
            </div>
          </button>

          <button
            type="button"
            onClick={() =>
              openCustomModal(
                "Promoter radar",
                "Promoter performance across KPIs.",
                <div className="h-80">
                  <PromoterRadarChart />
                </div>,
              )
            }
            className="rounded-[32px] border border-slate-200 bg-white p-6 text-left shadow-lg shadow-slate-200/60 transition hover:-translate-y-1 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
                Promoter radar
              </p>
              <h3 className="text-xl font-semibold text-slate-900">
                Referrals • ROI • attendance
              </h3>
            </div>
            <div className="mt-6 h-56">
              <PromoterRadarChart />
            </div>
          </button>

          <button
            type="button"
            onClick={() =>
              openCustomModal(
                "Staff utilization",
                "Where hours are being consumed.",
                <div className="h-80">
                  <StaffRadialChart />
                </div>,
              )
            }
            className="rounded-[32px] border border-slate-200 bg-white p-6 text-left shadow-lg shadow-slate-200/60 transition hover:-translate-y-1 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
                Staff utilization
              </p>
              <h3 className="text-xl font-semibold text-slate-900">
                HQ vs field vs vendors
              </h3>
            </div>
            <div className="mt-6 h-56">
              <StaffRadialChart />
            </div>
          </button>
        </div>

        <div
          className={`${
            showAllAnalytics ? "grid" : "hidden lg:grid"
          } gap-6 xl:grid-cols-3`}
        >
          <button
            type="button"
            onClick={() =>
              openCustomModal(
                "Campaign velocity",
                "Stacked view of weekly campaign outputs.",
                <div className="h-80">
                  <CampaignStackChart />
                </div>,
              )
            }
            className="rounded-[32px] border border-slate-200 bg-white p-6 text-left shadow-lg shadow-slate-200/60 transition hover:-translate-y-1 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
                Campaign velocity
              </p>
              <h3 className="text-xl font-semibold text-slate-900">
                Email • SMS • affiliates
              </h3>
            </div>
            <div className="mt-6 h-56">
              <CampaignStackChart />
            </div>
          </button>

          <button
            type="button"
            onClick={() =>
              openCustomModal(
                "Add-on momentum",
                "Which add-ons are leading upsells.",
                <div className="h-80">
                  <AddOnBarChart />
                </div>,
              )
            }
            className="rounded-[32px] border border-slate-200 bg-white p-6 text-left shadow-lg shadow-slate-200/60 transition hover:-translate-y-1 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
                Add-on momentum
              </p>
              <h3 className="text-xl font-semibold text-slate-900">
                Hospitality vs shuttles vs merch
              </h3>
            </div>
            <div className="mt-6 h-56">
              <AddOnBarChart />
            </div>
          </button>

          <button
            type="button"
            onClick={() =>
              openCustomModal(
                "Payout velocity",
                "Automated vs manual releases per month.",
                <div className="h-80">
                  <PayoutStackChart />
                </div>,
              )
            }
            className="rounded-[32px] border border-slate-200 bg-white p-6 text-left shadow-lg shadow-slate-200/60 transition hover:-translate-y-1 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
                Payout velocity
              </p>
              <h3 className="text-xl font-semibold text-slate-900">
                Automated vs manual flow
              </h3>
            </div>
            <div className="mt-6 h-56">
              <PayoutStackChart />
            </div>
          </button>
        </div>

        <div
          className={`${
            showAllAnalytics ? "grid" : "hidden lg:grid"
          } gap-6 lg:grid-cols-2`}
        >
          <button
            type="button"
            onClick={openMarketingModal}
            className="rounded-[32px] border border-slate-200 bg-white p-6 text-left shadow-lg shadow-slate-200/60 transition hover:-translate-y-1 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
                  Marketing attribution
                </p>
                <h3 className="text-xl font-semibold text-slate-900">
                  Channel contribution to paid orders
                </h3>
                <p className="text-sm text-slate-500">
                  Real-time read on which lever is pulling weight today.
                </p>
              </div>
              <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                D3
              </span>
            </div>
            <div className="mt-6 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <ReBarChart data={marketingAttribution}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    className="text-xs text-slate-500"
                  />
                  <YAxis hide />
                  <ReTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {marketingAttribution.map((entry, index) => (
                      <Cell key={entry.label} fill={chartColors[index % chartColors.length]} />
                    ))}
                  </Bar>
                </ReBarChart>
              </ResponsiveContainer>
            </div>
          </button>

          <button
            type="button"
            onClick={openSeatDemandModal}
            className="rounded-[32px] border border-slate-200 bg-white p-6 text-left shadow-lg shadow-slate-200/60 transition hover:-translate-y-1 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
                  Seat demand
                </p>
                <h3 className="text-xl font-semibold text-slate-900">
                  Section heat per drop
                </h3>
                <p className="text-sm text-slate-500">
                  Fused from hold timers + demand models for the last 11 releases.
                </p>
              </div>
            </div>
            <div className="mt-6 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <ReAreaChart
                  data={seatDemandCurve.map((value, index) => ({
                    label: `Drop ${index + 1}`,
                    value,
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    className="text-xs text-slate-500"
                  />
                  <YAxis hide />
                  <ReTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#22c55e"
                    fill="#22c55e"
                    fillOpacity={0.2}
                    strokeWidth={3}
                  />
                </ReAreaChart>
              </ResponsiveContainer>
            </div>
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/60">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
                  Sales & marketing
                </p>
                <h3 className="text-xl font-semibold text-slate-900">
                  Promo ROI, affiliates, and tier automation
                </h3>
              </div>
              <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                Live
              </span>
            </div>
            <ul className="mt-6 space-y-4">
              {organizerDashboardSales.map((insight) => (
                <li
                  key={insight.title}
                  className="rounded-3xl border border-slate-100 bg-slate-50/70 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                        {insight.title}
                      </p>
                      <p className="text-lg font-semibold text-slate-900">
                        {insight.metric}
                      </p>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                      {insight.change}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{insight.description}</p>
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/60">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
                  Ops & support
                </p>
                <h3 className="text-xl font-semibold text-slate-900">
                  Gates, fraud, devices, and SLA guardrails
                </h3>
              </div>
              <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                Command
              </span>
            </div>
            <ul className="mt-6 space-y-4">
              {organizerOpsSignals.map((insight) => (
                <li
                  key={insight.title}
                  className="rounded-3xl border border-slate-100 bg-slate-50/70 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                        {insight.title}
                      </p>
                      <p className="text-lg font-semibold text-slate-900">
                        {insight.metric}
                      </p>
                    </div>
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-600">
                      {insight.change}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{insight.description}</p>
                </li>
              ))}
            </ul>
          </article>
        </div>
      </div>

      <ChartModal
        open={Boolean(chartModal)}
        title={chartModal?.title ?? ""}
        description={chartModal?.description}
        onClose={() => setChartModal(null)}
      >
        {chartModal?.content}
      </ChartModal>
    </section>
  );
}

export function OrganizerDashboardOverview() {
  return (
    <section className="bg-slate-50 py-16 text-slate-900">
      <div className="mx-auto w-full max-w-7xl px-6 md:px-10 lg:px-16">
        <div className="flex flex-col gap-4 pb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">
            Organizer dashboard
          </p>
          <h2 className="text-3xl font-semibold leading-tight">
            One command centre across events, cash, marketing, and ops.
          </h2>
          <p className="text-base text-slate-500">
            Widgets tuned for Kenyan organisers—MPesa payouts, gate throughput,
            affiliate ROI, and staff logs—no extra BI stack required.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {organizerDashboardClusters.map((cluster) => (
            <article
              key={cluster.title}
              className="rounded-[28px] border border-slate-200 bg-white/80 p-6 shadow-lg shadow-slate-200/70"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
                {cluster.title}
              </p>
              <h3 className="mt-2 text-xl font-semibold">{cluster.description}</h3>
              <ul className="mt-4 space-y-3 text-sm text-slate-600">
                {cluster.items.map((item) => (
                  <li
                    key={item}
                    className="rounded-2xl border border-slate-100 bg-slate-50 p-3"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

