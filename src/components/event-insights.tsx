"use client";

import {
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  MapPin,
  Lightbulb,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

interface InsightCard {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  stats: {
    label: string;
    value: string;
  }[];
  tips: string[];
}

const insights: InsightCard[] = [
  {
    id: "audience-growth",
    title: "Building Your Event Audience",
    description:
      "Proven strategies to grow your attendee base and create lasting community connections.",
    icon: Users,
    stats: [
      { label: "Average Growth", value: "+45%" },
      { label: "Repeat Attendees", value: "67%" },
    ],
    tips: [
      "Start marketing 6-8 weeks before your event",
      "Use social proof and testimonials from past events",
      "Partner with local influencers and communities",
      "Create early-bird pricing to drive urgency",
    ],
  },
  {
    id: "revenue-optimization",
    title: "Revenue Optimization",
    description:
      "Smart pricing strategies and revenue streams to maximize your event's financial success.",
    icon: DollarSign,
    stats: [
      { label: "Revenue Increase", value: "+32%" },
      { label: "Profit Margin", value: "28%" },
    ],
    tips: [
      "Implement tiered pricing with VIP options",
      "Offer group discounts to increase volume",
      "Create sponsorship packages for local businesses",
      "Use MPesa for instant, secure payments",
    ],
  },
  {
    id: "timing-trends",
    title: "Optimal Event Timing",
    description:
      "Data-driven insights on when to schedule events for maximum attendance in Kenya.",
    icon: Calendar,
    stats: [
      { label: "Best Day", value: "Saturday" },
      { label: "Peak Time", value: "2-6 PM" },
    ],
    tips: [
      "Avoid major holidays and exam periods",
      "Friday evenings work best for corporate events",
      "Weekend events get 40% higher attendance",
      "Consider weather patterns and seasons",
    ],
  },
  {
    id: "venue-selection",
    title: "Strategic Venue Selection",
    description:
      "How to choose the perfect venue that enhances your event experience and accessibility.",
    icon: MapPin,
    stats: [
      { label: "Accessibility Impact", value: "+23%" },
      { label: "Venue Satisfaction", value: "89%" },
    ],
    tips: [
      "Prioritize venues with parking and matatu access",
      "Ensure accessibility for people with disabilities",
      "Consider acoustic quality for music events",
      "Factor in catering facilities and restrictions",
    ],
  },
];

const quickTips = [
  "Always have a backup plan for outdoor events during rainy season",
  "MPesa integration reduces payment friction by 60%",
  "Live streaming can extend your event reach by 3x",
  "Post-event surveys improve future event satisfaction by 25%",
  "Local food vendors add authentic Kenyan flavor to any event",
  "Mobile-first design is crucial - 78% of Kenyans book via mobile",
];

export function EventInsights() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20 text-slate-900">
      {/* Header */}
      <div className="mb-12 text-center">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-500 mb-4">
          Industry Knowledge
        </p>
        <h2 className="text-3xl md:text-4xl font-semibold mb-4">
          Event Success Insights
        </h2>
        <p className="max-w-3xl mx-auto text-slate-600 leading-relaxed">
          Learn from the data and experiences of successful event organizers
          across Kenya. These insights are based on real event performance and
          industry best practices.
        </p>
      </div>

      {/* Insights Grid */}
      <div className="grid gap-8 md:grid-cols-2 mb-16">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className="tix-card p-6 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-start gap-4 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
                <insight.icon className="h-6 w-6 text-slate-700" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  {insight.title}
                </h3>
                <p className="text-slate-600 text-sm">{insight.description}</p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {insight.stats.map((stat, index) => (
                <div
                  key={index}
                  className="text-center p-3 rounded-lg bg-slate-50"
                >
                  <div className="text-2xl font-semibold text-slate-900 mb-1">
                    {stat.value}
                  </div>
                  <div className="text-xs text-slate-600">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Tips */}
            <div className="space-y-3">
              {insight.tips.map((tip, index) => (
                <div key={index} className="flex items-start gap-3 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span className="text-slate-600">{tip}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Tips Section */}
      <div className="rounded-2xl bg-slate-50 p-8 mb-12">
        <div className="flex items-center gap-3 mb-6">
          <Lightbulb className="h-6 w-6 text-amber-500" />
          <h3 className="text-xl font-semibold text-slate-900">
            Quick Tips from the Community
          </h3>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {quickTips.map((tip, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-4 bg-white rounded-lg"
            >
              <TrendingUp className="h-4 w-4 text-slate-500 mt-1 shrink-0" />
              <span className="text-sm text-slate-700">{tip}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center">
        <div className="inline-flex flex-col items-center gap-4 p-8 rounded-2xl border border-slate-200 bg-white">
          <h3 className="text-lg font-semibold text-slate-900">
            Ready to Create Your Next Event?
          </h3>
          <p className="text-slate-600 text-sm max-w-md">
            Use these insights to plan, promote, and execute successful events
            that your audience will love.
          </p>
          <button className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3 font-medium text-white transition-colors hover:bg-slate-700">
            Start Planning
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
