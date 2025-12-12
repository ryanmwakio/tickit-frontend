import { CTA } from "@/components/cta";
import { EventShowcase } from "@/components/event-showcase";
import { FeatureTabs } from "@/components/feature-tabs";
import { FeaturedEventsRail } from "@/components/featured-events-rail";
import { Hero } from "@/components/hero";
import { InsightsBoard } from "@/components/insights-board";
import { JourneyRail } from "@/components/journey-rail";
import { OpsMatrix } from "@/components/ops-matrix";
import { Suites } from "@/components/suites";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-slate-900 overflow-x-hidden">
      <main className="overflow-x-hidden">
        <div className="relative border-y border-slate-100 bg-white overflow-x-hidden">
          <FeaturedEventsRail />
          <Hero />
        </div>
        <div className="bg-white">
          <EventShowcase />
          <FeatureTabs />
          <Suites />
          <JourneyRail />
          <OpsMatrix />
          <InsightsBoard />
        </div>
        <CTA />
      </main>
      <footer className="border-t border-slate-200 bg-white/70 px-6 py-10 text-center text-sm text-slate-500">
        Built with Next.js 14, Radix UI, Tailwind CSS 4.0, and Unsplash imagery.
        Backend hooks for MPesa, NestJS, and analytics can attach to the
        prepared surfaces above.
      </footer>
    </div>
  );
}
