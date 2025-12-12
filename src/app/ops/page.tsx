"use client";

import { CTA } from "@/components/cta";
import { OpsMatrix } from "@/components/ops-matrix";
import { AdminProtectedPage } from "@/components/auth/admin-protected-page";

export default function OpsPage() {
  return (
    <AdminProtectedPage>
      <div className="bg-white text-slate-900">
        <section className="border-b border-slate-100 bg-gradient-to-b from-white to-slate-50">
          <div className="mx-auto w-full max-w-7xl px-8 py-16">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
              Ops desk
            </p>
            <h1 className="mt-4 text-4xl font-semibold">
              Operational playbooks for resale, venue safety, marketing, and
              finance.
            </h1>
            <p className="mt-3 max-w-3xl text-lg text-slate-600">
              Give ops, safety, and finance teams actionable cards with indicators
              so they can act fast without backend toggles.
            </p>
          </div>
        </section>
        <OpsMatrix />
        <CTA />
      </div>
    </AdminProtectedPage>
  );
}


