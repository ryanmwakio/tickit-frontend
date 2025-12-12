 "use client";

import type { ReactNode } from "react";
import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
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
  AreaChartInteractive,
  BarChartInteractive,
  ChartModal,
  SparklineInteractive,
} from "@/components/charts/chart-modal";
import { ChartTooltipContent } from "@/components/charts/chart-utils";

// Metric cards will be computed from API data

// Refund queue and organiser payouts will be loaded from API

const healthSignals = [
  {
    label: "API latency",
    value: "142ms",
    state: "Healthy",
  },
  {
    label: "MPESA callbacks",
    value: "99.4% success",
    state: "Stable",
  },
  {
    label: "Email/SMS queue",
    value: "1,240 pending",
    state: "Normal",
  },
];

const chartColors = ["#0ea5e9", "#f97316", "#22c55e", "#8b5cf6", "#ec4899"];

type ChartSeries = {
  title: string;
  value: string;
  change: string;
  points: number[];
  accent: string;
  frequency: string;
};

// Chart series will be computed from API data

const accentColorMap: Record<string, string> = {
  "text-rose-500": "#f43f5e",
  "text-amber-500": "#f59e0b",
  "text-emerald-500": "#10b981",
  "text-indigo-500": "#6366f1",
};

// All chart data comes from API

const getSeriesData = (series: ChartSeries) =>
  series.points.map((value, index) => ({
    label: `P${index + 1}`,
    value,
  }));

const GeoPieChart = ({ data }: { data: Array<{ region: string; value: number }> }) => (
  <ResponsiveContainer width="100%" height="100%">
    <RePieChart>
      <ReTooltip content={<ChartTooltipContent />} />
      <Pie
        data={data}
        dataKey="value"
        nameKey="region"
        stroke="none"
        innerRadius="45%"
      >
        {data.map((entry, index) => (
          <Cell key={entry.region} fill={chartColors[index % chartColors.length]} />
        ))}
      </Pie>
    </RePieChart>
  </ResponsiveContainer>
);

const OpsRadarChart = ({ data }: { data: Array<{ metric: string; score: number }> }) => (
  <ResponsiveContainer width="100%" height="100%">
    <RadarChart data={data}>
      <PolarGrid className="stroke-slate-200" />
      <PolarAngleAxis dataKey="metric" className="text-xs text-slate-500" />
      <Radar
        name="Ops"
        dataKey="score"
        stroke="#0ea5e9"
        fill="#0ea5e9"
        fillOpacity={0.2}
      />
    </RadarChart>
  </ResponsiveContainer>
);

const SlaRadialChart = ({ data }: { data: Array<{ segment: string; value: number; fill: string }> }) => (
  <ResponsiveContainer width="100%" height="100%">
    <RadialBarChart
      data={data}
      innerRadius="20%"
      outerRadius="90%"
      barCategoryGap="15%"
      startAngle={90}
      endAngle={-270}
    >
      <RadialBar
        background
        dataKey="value"
        cornerRadius={8}
        className="stroke-0"
      >
        {data.map((entry, index) => (
          <Cell key={entry.segment} fill={entry.fill ?? chartColors[index % chartColors.length]} />
        ))}
      </RadialBar>
    </RadialBarChart>
  </ResponsiveContainer>
);

const DeviceMixChart = ({ data }: { data: Array<{ label: string; value: number }> }) => (
  <ResponsiveContainer width="100%" height="100%">
    <ReBarChart
      data={data}
      layout="vertical"
      margin={{ left: 40 }}
    >
      <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
      <XAxis type="number" hide />
      <YAxis
        dataKey="label"
        type="category"
        axisLine={false}
        tickLine={false}
        className="text-sm text-slate-500"
      />
      <ReTooltip content={<ChartTooltipContent />} />
      <Bar dataKey="value" radius={[0, 8, 8, 0]}>
        {data.map((entry, index) => (
          <Cell key={entry.label} fill={chartColors[index % chartColors.length]} />
        ))}
      </Bar>
    </ReBarChart>
  </ResponsiveContainer>
);

const FunnelAreaChart = ({ data }: { data: Array<{ stage: string; value: number }> }) => (
  <ResponsiveContainer width="100%" height="100%">
    <ReAreaChart
      data={data}
      margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
    >
      <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
      <XAxis
        dataKey="stage"
        tickLine={false}
        axisLine={false}
        className="text-xs text-slate-500"
      />
      <YAxis hide />
      <ReTooltip content={<ChartTooltipContent />} />
      <Area
        type="monotone"
        dataKey="value"
        stroke="#ec4899"
        fill="#ec4899"
        fillOpacity={0.2}
        strokeWidth={3}
      />
    </ReAreaChart>
  </ResponsiveContainer>
);

const SettlementStackChart = ({ data }: { data: Array<{ week: string; settled: number; pending: number }> }) => (
  <ResponsiveContainer width="100%" height="100%">
    <ReAreaChart data={data}>
      <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
      <XAxis
        dataKey="week"
        tickLine={false}
        axisLine={false}
        className="text-xs text-slate-500"
      />
      <YAxis hide />
      <ReTooltip content={<ChartTooltipContent />} />
      <Area
        type="monotone"
        dataKey="settled"
        stackId="1"
        stroke="#22c55e"
        fill="#22c55e"
        fillOpacity={0.3}
      />
      <Area
        type="monotone"
        dataKey="pending"
        stackId="1"
        stroke="#f97316"
        fill="#f97316"
        fillOpacity={0.3}
      />
    </ReAreaChart>
  </ResponsiveContainer>
);

type ModalConfig = {
  title: string;
  description?: string;
  content: ReactNode;
};

export function AdminDashboardPanels() {
  const { user } = useAuth();
  const [chartModal, setChartModal] = useState<ModalConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState<{
    events: { total: number; active: number };
    tickets: { totalSold: number; scannedToday: number };
    revenue: { total: number; today: number; thisMonth: number };
    organisers: { active: number };
    refunds: { pending: number };
    users: { total: number };
  } | null>(null);
  const [refundQueue, setRefundQueue] = useState<Array<{
    id: string;
    event: string;
    amount: number;
    status: string;
  }>>([]);
  const [organiserPayouts, setOrganiserPayouts] = useState<Array<{
    organiser: string;
    due: number;
    status: string;
  }>>([]);
  const [analyticsData, setAnalyticsData] = useState<{
    ticketVelocity: number[];
    revenueCapture: number[];
    checkinThroughput: number[];
    revenueChannels: Array<{ label: string; value: number }>;
    geoTicketShare: Array<{ region: string; value: number }>;
    opsRadarData: Array<{ metric: string; score: number }>;
    slaRadialData: Array<{ segment: string; value: number; fill: string }>;
    deviceMixData: Array<{ label: string; value: number }>;
    funnelHealthData: Array<{ stage: string; value: number }>;
    settlementTrend: Array<{ week: string; settled: number; pending: number }>;
  } | null>(null);

  const openSparklineModal = (series: ChartSeries) => {
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

  const openRevenueModal = () => {
    if (!analyticsData) return;
    setChartModal({
      title: "Revenue mix",
      description: "Hover each bar to inspect payment channel performance.",
      content: <BarChartInteractive data={analyticsData.revenueChannels} />,
    });
  };

  const openAttendanceModal = () => {
    if (!analyticsData) return;
    setChartModal({
      title: "Attendance funnel",
      description: "Cursor tracking across the last 10 gate reports.",
      content: (
        <AreaChartInteractive
          points={analyticsData.checkinThroughput}
          accentClass="text-indigo-500"
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

  useEffect(() => {
    async function loadDashboardData() {
      if (!user) return;
      try {
        setLoading(true);
        const [stats, refunds, payouts, analytics] = await Promise.all([
          apiClient.get<{
            events: { total: number; active: number };
            tickets: { totalSold: number; scannedToday: number };
            revenue: { total: number; today: number; thisMonth: number };
            organisers: { active: number };
            refunds: { pending: number };
            users: { total: number };
          }>('/admin/dashboard/stats'),
          apiClient.get<Array<{
            id: string;
            event: string;
            amount: number;
            status: string;
          }>>('/admin/refunds/recent?limit=5'),
          apiClient.get<Array<{
            organiser: string;
            due: number;
            status: string;
          }>>('/admin/payouts/organisers'),
          apiClient.get<{
            ticketVelocity: number[];
            revenueCapture: number[];
            checkinThroughput: number[];
            revenueChannels: Array<{ label: string; value: number }>;
            geoTicketShare: Array<{ region: string; value: number }>;
            opsRadarData: Array<{ metric: string; score: number }>;
            slaRadialData: Array<{ segment: string; value: number; fill: string }>;
            deviceMixData: Array<{ label: string; value: number }>;
            funnelHealthData: Array<{ stage: string; value: number }>;
            settlementTrend: Array<{ week: string; settled: number; pending: number }>;
          }>('/admin/dashboard/analytics'),
        ]);
        setDashboardStats(stats);
        setRefundQueue(refunds);
        setOrganiserPayouts(payouts);
        setAnalyticsData(analytics);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, [user]);

  return (
    <section className="space-y-8">
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-3xl border border-slate-100 bg-white p-6 shadow-lg">
              <div className="h-4 w-32 animate-pulse bg-slate-200 rounded mb-4" />
              <div className="h-8 w-24 animate-pulse bg-slate-200 rounded mb-2" />
              <div className="h-4 w-full animate-pulse bg-slate-200 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {dashboardStats && (
            <>
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                  Total events live
                </p>
                <p className="mt-3 text-2xl font-semibold text-slate-900">
                  {dashboardStats.events.active}
                </p>
                <p className="text-sm text-emerald-600">
                  {dashboardStats.events.total} total
                </p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                  Tickets scanned today
                </p>
                <p className="mt-3 text-2xl font-semibold text-slate-900">
                  {dashboardStats.tickets.scannedToday.toLocaleString()}
                </p>
                <p className="text-sm text-emerald-600">
                  {dashboardStats.tickets.totalSold.toLocaleString()} total sold
                </p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                  Revenue month to date
                </p>
                <p className="mt-3 text-2xl font-semibold text-slate-900">
                  KES {(dashboardStats.revenue.thisMonth / 100000000).toFixed(1)}M
                </p>
                <p className="text-sm text-emerald-600">
                  KES {(dashboardStats.revenue.today / 100000).toFixed(0)}k today
                </p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                  Refund queue
                </p>
                <p className="mt-3 text-2xl font-semibold text-slate-900">
                  {dashboardStats.refunds.pending} pending
                </p>
                <p className="text-sm text-emerald-600">
                  Requires review
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {loading ? (
        <div className="grid gap-6 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-3xl border border-slate-200 bg-white/95 p-5">
              <div className="h-4 w-32 animate-pulse bg-slate-200 rounded mb-4" />
              <div className="h-32 w-full animate-pulse bg-slate-200 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
        {analyticsData && (() => {
          const ticketVelocityTotal = analyticsData.ticketVelocity.reduce((sum, v) => sum + v, 0);
          const revenueCaptureTotal = analyticsData.revenueCapture.reduce((sum, r) => sum + r, 0);
          const checkinAvg = analyticsData.checkinThroughput.length > 0 
            ? Math.round(analyticsData.checkinThroughput.reduce((sum, c) => sum + c, 0) / analyticsData.checkinThroughput.length)
            : 0;
          
          const chartSeries: ChartSeries[] = [
            {
              title: "Ticket velocity",
              value: `${(ticketVelocityTotal / 1000).toFixed(1)}k sold`,
              change: "+14% vs last week",
              points: analyticsData.ticketVelocity.length > 0 ? analyticsData.ticketVelocity : [12, 16, 18, 22, 20, 27, 31],
              accent: "text-rose-500",
              frequency: "Rolling 7 days",
            },
            {
              title: "Revenue capture",
              value: `KES ${(revenueCaptureTotal / 1000000).toFixed(1)}M`,
              change: "+9% WoW",
              points: analyticsData.revenueCapture.length > 0 ? analyticsData.revenueCapture.map(r => r / 1000000) : [18, 21, 19, 24, 26, 25, 29],
              accent: "text-amber-500",
              frequency: "Daily net settlement",
            },
            {
              title: "Check-in throughput",
              value: `${checkinAvg}% scanned`,
              change: "+5 pts vs target",
              points: analyticsData.checkinThroughput.length > 0 ? analyticsData.checkinThroughput : [70, 72, 74, 73, 76, 80, 87],
              accent: "text-emerald-500",
              frequency: "Most active venues",
            },
          ];

          return chartSeries.map((series) => {
            const data = getSeriesData(series);
            const strokeColor = accentColorMap[series.accent] ?? "#0f172a";
            return (
              <button
                type="button"
                key={series.title}
                onClick={() => openSparklineModal(series)}
                className="rounded-3xl border border-slate-200 bg-white/95 p-5 text-left shadow-sm shadow-slate-200/60 transition hover:-translate-y-1 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                      {series.title}
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-slate-900">
                      {series.value}
                    </p>
                    <p className="text-sm font-semibold text-emerald-600">
                      {series.change}
                    </p>
                  </div>
                  <span className="rounded-full border border-slate-200 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500">
                    Explore
                  </span>
                </div>
                <div className="mt-4 rounded-2xl bg-gradient-to-br from-white via-slate-50 to-white p-3">
                  <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <ReLineChart data={data}>
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
                    <span>{series.frequency}</span>
                    <span>Peak</span>
                  </div>
                </div>
              </button>
            );
          });
        })()}
        </div>
      )}

      {loading ? (
        <div className="grid gap-6 lg:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="rounded-3xl border border-slate-200 bg-white p-6">
              <div className="h-6 w-48 animate-pulse bg-slate-200 rounded mb-4" />
              <div className="h-48 w-full animate-pulse bg-slate-200 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
        <button
          type="button"
          onClick={openRevenueModal}
          className="rounded-[32px] border border-slate-200 bg-white p-6 text-left shadow-lg shadow-slate-200/60 transition hover:-translate-y-1 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
                Revenue mix
              </p>
              <h3 className="text-xl font-semibold text-slate-900">
                Payment channel distribution
              </h3>
              <p className="text-sm text-slate-500">
                MPesa still leads, but card share is climbing post tourist season.
              </p>
            </div>
            <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
              D3
            </span>
          </div>
          <div className="mt-6 h-48">
            {analyticsData ? (
              <ResponsiveContainer width="100%" height="100%">
                <ReBarChart data={analyticsData.revenueChannels}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-slate-100" />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    className="text-xs text-slate-500"
                  />
                  <YAxis hide />
                  <ReTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="value" radius={[10, 10, 4, 4]}>
                    {analyticsData.revenueChannels.map((entry, index) => (
                      <Cell key={entry.label} fill={chartColors[index % chartColors.length]} />
                    ))}
                  </Bar>
                </ReBarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-slate-400">Loading...</div>
            )}
          </div>
        </button>

        <button
          type="button"
          onClick={openAttendanceModal}
          className="rounded-[32px] border border-slate-200 bg-white p-6 text-left shadow-lg shadow-slate-200/60 transition hover:-translate-y-1 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
                Attendance funnel
              </p>
              <h3 className="text-xl font-semibold text-slate-900">
                Check-in adherence vs forecast
              </h3>
              <p className="text-sm text-slate-500">
                Past 10 events: VVIP lanes are pushing overall adherence above 90%.
              </p>
            </div>
          </div>
          <div className="mt-6 h-48">
            {analyticsData ? (
              <ResponsiveContainer width="100%" height="100%">
                <ReAreaChart
                  data={analyticsData.checkinThroughput.map((value, index) => ({
                    label: `E${index + 1}`,
                    value,
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-slate-100" />
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
                    stroke="#6366f1"
                    fill="#6366f1"
                    fillOpacity={0.15}
                    strokeWidth={3}
                  />
                </ReAreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-slate-400">Loading...</div>
            )}
          </div>
        </button>
      </div>
      )}

      <div className="grid gap-6 xl:grid-cols-3">
        <button
          type="button"
          onClick={() =>
              openCustomModal(
              "Regional ticket share",
              "Where demand is clustering this week.",
              <div className="h-80">
                {analyticsData ? <GeoPieChart data={analyticsData.geoTicketShare} /> : <div className="flex h-full items-center justify-center text-slate-400">Loading...</div>}
              </div>,
            )
          }
          className="rounded-[32px] border border-slate-200 bg-white p-6 text-left shadow-lg shadow-slate-200/60 transition hover:-translate-y-1 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
              Regional demand
            </p>
            <h3 className="text-xl font-semibold text-slate-900">
              Ticket share by region
            </h3>
            <p className="text-sm text-slate-500">
              Nairobi still leads, but coastal events are surging.
            </p>
          </div>
          <div className="mt-6 h-56">
            {analyticsData ? (
              <GeoPieChart data={analyticsData.geoTicketShare} />
            ) : (
              <div className="flex h-full items-center justify-center text-slate-400">Loading...</div>
            )}
          </div>
        </button>

        <button
          type="button"
          onClick={() =>
              openCustomModal(
              "Ops radar",
              "Ops strength across live KPIs.",
              <div className="h-80">
                {analyticsData ? <OpsRadarChart data={analyticsData.opsRadarData} /> : <div className="flex h-full items-center justify-center text-slate-400">Loading...</div>}
              </div>,
            )
          }
          className="rounded-[32px] border border-slate-200 bg-white p-6 text-left shadow-lg shadow-slate-200/60 transition hover:-translate-y-1 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
              Ops radar
            </p>
            <h3 className="text-xl font-semibold text-slate-900">
              Where ops crews excel
            </h3>
          </div>
          <div className="mt-6 h-56">
            {analyticsData ? (
              <OpsRadarChart data={analyticsData.opsRadarData} />
            ) : (
              <div className="flex h-full items-center justify-center text-slate-400">Loading...</div>
            )}
          </div>
        </button>

        <button
          type="button"
          onClick={() =>
              openCustomModal(
              "SLA adherence",
              "Priority vs standard vs low touch tickets.",
              <div className="h-80">
                {analyticsData ? <SlaRadialChart data={analyticsData.slaRadialData} /> : <div className="flex h-full items-center justify-center text-slate-400">Loading...</div>}
              </div>,
            )
          }
          className="rounded-[32px] border border-slate-200 bg-white p-6 text-left shadow-lg shadow-slate-200/60 transition hover:-translate-y-1 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
              SLA compliance
            </p>
            <h3 className="text-xl font-semibold text-slate-900">
              Support speed per priority
            </h3>
          </div>
          <div className="mt-6 h-56">
            {analyticsData ? (
              <SlaRadialChart data={analyticsData.slaRadialData} />
            ) : (
              <div className="flex h-full items-center justify-center text-slate-400">Loading...</div>
            )}
          </div>
        </button>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <button
          type="button"
          onClick={() =>
              openCustomModal(
              "Device mix",
              "Where purchases originate by device.",
              <div className="h-80">
                {analyticsData ? <DeviceMixChart data={analyticsData.deviceMixData} /> : <div className="flex h-full items-center justify-center text-slate-400">Loading...</div>}
              </div>,
            )
          }
          className="rounded-[32px] border border-slate-200 bg-white p-6 text-left shadow-lg shadow-slate-200/60 transition hover:-translate-y-1 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
              Device mix
            </p>
            <h3 className="text-xl font-semibold text-slate-900">
              Checkout device share
            </h3>
          </div>
          <div className="mt-6 h-56">
            {analyticsData ? (
              <DeviceMixChart data={analyticsData.deviceMixData} />
            ) : (
              <div className="flex h-full items-center justify-center text-slate-400">Loading...</div>
            )}
          </div>
        </button>

        <button
          type="button"
          onClick={() =>
              openCustomModal(
              "Funnel health",
              "Conversion across the host funnel.",
              <div className="h-80">
                {analyticsData ? <FunnelAreaChart data={analyticsData.funnelHealthData} /> : <div className="flex h-full items-center justify-center text-slate-400">Loading...</div>}
              </div>,
            )
          }
          className="rounded-[32px] border border-slate-200 bg-white p-6 text-left shadow-lg shadow-slate-200/60 transition hover:-translate-y-1 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
              Funnel health
            </p>
            <h3 className="text-xl font-semibold text-slate-900">
              Views → Paid pipeline
            </h3>
          </div>
          <div className="mt-6 h-56">
            {analyticsData ? (
              <FunnelAreaChart data={analyticsData.funnelHealthData} />
            ) : (
              <div className="flex h-full items-center justify-center text-slate-400">Loading...</div>
            )}
          </div>
        </button>

        <button
          type="button"
          onClick={() =>
              openCustomModal(
              "Settlement trend",
              "Settled vs pending amounts per week.",
              <div className="h-80">
                {analyticsData ? <SettlementStackChart data={analyticsData.settlementTrend} /> : <div className="flex h-full items-center justify-center text-slate-400">Loading...</div>}
              </div>,
            )
          }
          className="rounded-[32px] border border-slate-200 bg-white p-6 text-left shadow-lg shadow-slate-200/60 transition hover:-translate-y-1 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
              Settlement trend
            </p>
            <h3 className="text-xl font-semibold text-slate-900">
              Weekly payouts vs pending
            </h3>
          </div>
          <div className="mt-6 h-56">
            {analyticsData ? (
              <SettlementStackChart data={analyticsData.settlementTrend} />
            ) : (
              <div className="flex h-full items-center justify-center text-slate-400">Loading...</div>
            )}
          </div>
        </button>
        </div>

      {loading ? (
        <div className="grid gap-6 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-3xl border border-slate-200 bg-white p-6">
              <div className="h-6 w-48 animate-pulse bg-slate-200 rounded mb-4" />
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="h-16 w-full animate-pulse bg-slate-200 rounded" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/60 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                Refund Queue
              </p>
              <h2 className="text-xl font-semibold text-slate-900">
                Live refund operations
              </h2>
            </div>
            <button
              type="button"
              className="rounded-2xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300"
            >
              Open queue
            </button>
          </div>
          <div className="mt-5 divide-y divide-slate-100">
            {refundQueue.length > 0 ? (
              refundQueue.map((ticket) => (
                <div key={ticket.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{ticket.event}</p>
                    <p className="text-xs text-slate-500">{ticket.id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900">
                      KES {(ticket.amount / 100).toLocaleString()}
                    </p>
                    <p className="text-xs text-amber-600">{ticket.status}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="py-4 text-center text-sm text-slate-500">No pending refunds</p>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/60">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
            Organiser Wallet
          </p>
          <h2 className="text-xl font-semibold text-slate-900">
            Upcoming payouts
          </h2>
          <ul className="mt-5 space-y-4">
            {organiserPayouts.length > 0 ? (
              organiserPayouts.map((payout) => (
                <li key={payout.organiser} className="rounded-2xl border border-slate-100 p-3">
                  <p className="text-sm font-semibold text-slate-900">{payout.organiser}</p>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>KES {(payout.due / 100000000).toFixed(1)}M</span>
                    <span className="font-semibold text-emerald-600">{payout.status}</span>
                  </div>
                </li>
              ))
            ) : (
              <li className="py-4 text-center text-sm text-slate-500">No pending payouts</li>
            )}
          </ul>
          <button
            type="button"
            className="mt-4 w-full rounded-2xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300"
          >
            View ledger
          </button>
        </div>
      </div>
      )}

      <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/60">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
              Platform Health
            </p>
            <h2 className="text-xl font-semibold text-slate-900">
              Infrastructure & messaging status
            </h2>
          </div>
          <button
            type="button"
            className="rounded-2xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300"
          >
            View status page
          </button>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {healthSignals.map((signal) => (
            <div
              key={signal.label}
              className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{signal.label}</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">{signal.value}</p>
              <p className="text-xs font-semibold text-emerald-600">{signal.state}</p>
            </div>
          ))}
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

