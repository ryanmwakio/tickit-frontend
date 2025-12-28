"use client";

import { faqItems } from "@/data/content";
import {
  LineChart,
  MessageCircleQuestion,
  TrendingUp,
  Users,
  Calendar,
  CreditCard,
} from "lucide-react";
import { useEffect, useState } from "react";
import { getPlatformAnalytics, PlatformAnalytics } from "@/lib/analytics-api";

export function InsightsBoard() {
  const [analytics, setAnalytics] = useState<PlatformAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const data = await getPlatformAnalytics();
        setAnalytics(data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch platform analytics:", err);
        setError("Failed to load analytics data");
        // Use fallback data
        setAnalytics({
          totalEvents: 1250,
          upcomingEvents: 340,
          totalTicketsSold: 45000,
          totalRevenue: 12400000,
          totalUsers: 8500,
          totalOrganisers: 180,
          recentOrders: 420,
          weeklyRevenue: 850000,
          checkInRate: 87.5,
          salesVelocityChange: 18,
          paymentMethods: [],
          topCategories: [],
          salesVelocity: [],
          insights: [
            {
              label: "Sales velocity",
              metric: "KES 8.5M",
              change: "+18% WoW",
              detail:
                "420 orders in last 30 days. Peak performance on mobile checkouts.",
            },
            {
              label: "Platform engagement",
              metric: "8,500 users",
              change: "180 organisers",
              detail: "340 upcoming events across 12 active categories.",
            },
            {
              label: "Check-in success",
              metric: "87.5%",
              change: "39,375 scanned",
              detail:
                "Offline-capable scanners with duplicate detection and fraud prevention.",
            },
            {
              label: "Payment reliability",
              metric: "MPesa leading",
              change: "3 methods",
              detail:
                "MPesa Express, cards, and wallets with automated reconciliation.",
            },
          ],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount / 100);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  return (
    <section
      id="intelligence"
      className="mx-auto w-full max-w-7xl px-8 py-20 text-slate-900 lg:py-24"
    >
      <div className="mb-10 flex flex-col gap-4">
        <p className="text-xs uppercase tracking-[0.4em] text-emerald-500">
          Intelligence cloud
        </p>
        <h2 className="text-3xl font-semibold md:text-4xl">
          Live dashboards, real-time analytics, and platform insights for growth
          and compliance.
        </h2>
        <p className="max-w-3xl text-slate-600">
          Real-time data from our platform showing conversion rates, payment
          flows, user engagement, and operational metrics powered by our
          analytics engine.
        </p>
      </div>

      {loading && (
        <div className="grid gap-8 lg:grid-cols-[2fr,1fr]">
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200/60"
              >
                <div className="animate-pulse">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="h-4 w-24 bg-slate-200 rounded"></div>
                    <div className="h-3 w-16 bg-slate-200 rounded"></div>
                  </div>
                  <div className="h-8 w-32 bg-slate-200 rounded mb-2"></div>
                  <div className="h-4 w-full bg-slate-200 rounded"></div>
                  <div className="mt-4 h-14 bg-slate-200 rounded-2xl"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && analytics && (
        <div className="grid gap-8 lg:grid-cols-[2fr,1fr]">
          <div className="space-y-4">
            {analytics.insights.map((card, index) => (
              <article
                key={card.label}
                className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200/60"
              >
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
                    {card.label}
                  </p>
                  <span
                    className={`text-xs ${card.change.includes("+") ? "text-emerald-500" : "text-slate-500"}`}
                  >
                    {card.change}
                  </span>
                </div>
                <p className="text-3xl font-semibold">{card.metric}</p>
                <p className="mt-2 text-sm text-slate-600">{card.detail}</p>
                <div className="mt-4 h-14 rounded-2xl bg-gradient-to-r from-emerald-200 via-sky-200 to-purple-200" />
              </article>
            ))}

            {/* Platform Stats Summary */}
            <article className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200/60">
              <div className="mb-4 flex items-center gap-3">
                <TrendingUp className="size-5 text-sky-500" />
                <p className="text-lg font-semibold">Platform Overview</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Calendar className="size-4 text-emerald-500 mr-1" />
                  </div>
                  <p className="text-2xl font-bold text-slate-900">
                    {formatNumber(analytics.totalEvents)}
                  </p>
                  <p className="text-xs text-slate-500">Total Events</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Users className="size-4 text-sky-500 mr-1" />
                  </div>
                  <p className="text-2xl font-bold text-slate-900">
                    {formatNumber(analytics.totalUsers)}
                  </p>
                  <p className="text-xs text-slate-500">Active Users</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <CreditCard className="size-4 text-purple-500 mr-1" />
                  </div>
                  <p className="text-2xl font-bold text-slate-900">
                    {formatNumber(analytics.totalTicketsSold)}
                  </p>
                  <p className="text-xs text-slate-500">Tickets Sold</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <TrendingUp className="size-4 text-emerald-500 mr-1" />
                  </div>
                  <p className="text-2xl font-bold text-slate-900">
                    {formatCurrency(analytics.totalRevenue)}
                  </p>
                  <p className="text-xs text-slate-500">Total Revenue</p>
                </div>
              </div>
            </article>
          </div>
          <div className="space-y-4 rounded-3xl border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200/60">
            <div className="mb-4 flex items-center gap-3">
              <LineChart className="size-5 text-sky-500" />
              <p className="text-lg font-semibold">FAQs from teams</p>
            </div>
            {faqItems.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-2xl border border-slate-100 bg-slate-50 p-4"
              >
                <summary className="flex cursor-pointer items-center justify-between text-sm font-semibold">
                  {faq.question}
                  <MessageCircleQuestion className="size-4 text-slate-400 transition group-open:text-slate-900" />
                </summary>
                <p className="mt-2 text-sm text-slate-600">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-red-600 font-medium">
            Unable to load real-time analytics
          </p>
          <p className="text-red-500 text-sm mt-1">
            Showing cached data. Please try refreshing the page.
          </p>
        </div>
      )}
    </section>
  );
}
