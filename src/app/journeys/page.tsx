"use client";

import { CTA } from "@/components/cta";
import { JourneyRail } from "@/components/journey-rail";
import { AdminProtectedPage } from "@/components/auth/admin-protected-page";

export default function JourneysPage() {
  return (
    <AdminProtectedPage>
      <div className="bg-white text-slate-900">
        <section className="border-b border-slate-100 bg-gradient-to-b from-white to-slate-50">
          <div className="mx-auto w-full max-w-7xl px-8 py-16">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
              Journeys
            </p>
            <h1 className="mt-4 text-4xl font-semibold">
              Persona-specific flows covering checkout, launch, command, and
              reporting.
            </h1>
            <p className="mt-3 max-w-3xl text-lg text-slate-600">
              These rails translate the requirements document into concrete UX
              stories your team can hand to design or engineering.
            </p>
          </div>
        </section>
        <JourneyRail />
        <CTA />
      </div>
    </AdminProtectedPage>
  );
}


