"use client";

import { CTA } from "@/components/cta";
import { InsightsBoard } from "@/components/insights-board";
import { AdminProtectedPage } from "@/components/auth/admin-protected-page";

export default function IntelligencePage() {
  return (
    <AdminProtectedPage>
      <div className="bg-white text-slate-900">
        <section className="border-b border-slate-100 bg-gradient-to-b from-white to-slate-50">
          <div className="mx-auto w-full max-w-7xl px-8 py-16">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
              Intelligence
            </p>
            <h1 className="mt-4 text-4xl font-semibold">
              Sales velocity, funnels, resale health, and FAQ clarity in one
              intelligence cloud.
            </h1>
            <p className="mt-3 max-w-3xl text-lg text-slate-600">
              These insights map to the analytics/reporting, AI, and FAQ sections
              from the requirements doc and are ready for data hookups.
            </p>
          </div>
        </section>
        <InsightsBoard />
        <CTA />
      </div>
    </AdminProtectedPage>
  );
}


