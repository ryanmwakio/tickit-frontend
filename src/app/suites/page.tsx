"use client";

import { CTA } from "@/components/cta";
import { Suites } from "@/components/suites";
import { AdminProtectedPage } from "@/components/auth/admin-protected-page";

export default function SuitesPage() {
  return (
    <AdminProtectedPage>
      <div className="bg-white text-slate-900">
        <section className="border-b border-slate-100 bg-gradient-to-b from-white to-slate-50">
          <div className="mx-auto w-full max-w-7xl px-8 py-16">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
              Suites
            </p>
            <h1 className="mt-4 text-4xl font-semibold">
              Design system shared across all surfaces: attendee, organiser, ops,
              intelligence.
            </h1>
            <p className="mt-3 max-w-3xl text-lg text-slate-600">
              Every module is built from Radix + Tailwind primitives ready for web
              and mobile. Browse the four suites exported from the blueprint.
            </p>
          </div>
        </section>
        <Suites />
        <CTA />
      </div>
    </AdminProtectedPage>
  );
}


