"use client";

import { ProtectedRoute } from "@/components/auth/protected-route";

const toggles = [
  { label: "Enable two-factor authentication", description: "Require OTP for organiser logins and payouts." },
  { label: "Lock resale outside Kenya", description: "Only allow resale when buyer geo is within Kenya." },
  { label: "Auto-pause events on incident", description: "Ops incidents pause check-in + notify staff." },
];

export default function SettingsPage() {
  return (
    <ProtectedRoute>
    <div className="bg-white text-slate-900">
      <section className="border-b border-slate-100 bg-gradient-to-b from-white to-slate-50">
        <div className="mx-auto w-full max-w-7xl px-8 py-16">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Workspace settings</p>
          <h1 className="mt-4 text-4xl font-semibold">System controls & governance</h1>
          <p className="mt-3 max-w-3xl text-lg text-slate-600">
            Manage security, payout preferences, partner integrations, and automation guardrails for your organisation.
          </p>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-8 px-8 py-16 lg:grid-cols-[1fr,0.75fr]">
        <div className="space-y-6 rounded-3xl border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200/60">
          <h2 className="text-lg font-semibold">Security & automation</h2>
          <p className="text-sm text-slate-600">
            These toggles mirror the ops & security section of the blueprint. Everything is ready to wire into backend policies.
          </p>
          <div className="space-y-4">
            {toggles.map((item) => (
              <label key={item.label} className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <input type="checkbox" className="mt-1 size-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900" defaultChecked />
                <span>
                  <span className="block text-sm font-semibold text-slate-900">{item.label}</span>
                  <span className="text-sm text-slate-600">{item.description}</span>
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-6 rounded-3xl border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200/60">
          <h2 className="text-lg font-semibold">Integrations & payouts</h2>
          <div className="space-y-3 text-sm text-slate-600">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="font-semibold text-slate-900">Payments & MPesa</p>
              <p>Express, Paybill, Till, Airtel Money, cards, escrow. Contact <strong>payouts@tickit.app</strong> to adjust schedules.</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="font-semibold text-slate-900">Partner APIs</p>
              <p>Connect transport, insurance, or marketing APIs. Provide callback URLs and secrets inside the upcoming integrations console.</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="font-semibold text-slate-900">Audit log</p>
              <p>Track who changed payouts, incident states, or marketing budgets. Exports arrive weekly via email.</p>
            </div>
          </div>
          <button className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-400">
            Request advanced controls
          </button>
        </div>
      </section>
    </div>
    </ProtectedRoute>
  );
}
