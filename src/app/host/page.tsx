import Link from "next/link";
import { HostApplicationForm } from "@/components/host/host-application-form";

const reasons = [
  {
    title: "MPesa + global payments",
    detail:
      "Express, Paybill, Till, Airtel Money, cards, pay-on-arrival escrow, instalments, NET-30 invoices.",
  },
  {
    title: "Seat maps & advanced ticketing",
    detail:
      "Seat holds, GA + VIP tiers, bundles, add-ons, tips, resale guardrails, waitlist automations.",
  },
  {
    title: "Marketing + analytics copilot",
    detail:
      "Promo codes, affiliates, SMS/email/push journeys, attribution, cohort reports, AI pricing assistant.",
  },
  {
    title: "Offline-ready operations",
    detail:
      "Scanner apps with offline manifests, duplicate detection, RFID, incident logging, staff shifts.",
  },
];

const checklist = [
  "Dedicated onboarding & KYC review",
  "Co-branded launch campaign templates",
  "Revenue share + payout schedules tailored to you",
  "White-label theming, custom domains, embed widgets",
  "On-site training for staff scanners and finance",
];

export const metadata = {
  title: "Host on Tixhub",
  description:
    "Bring your events, festivals, conferences, and venues to Tixhub’s Kenya-first ticketing OS with MPesa-ready rails.",
};

export default function HostPage() {
  return (
    <div className="bg-white text-slate-900">
      <section className="border-b border-slate-100 bg-gradient-to-b from-white to-slate-50">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-8 py-16 lg:grid-cols-[1fr,0.7fr]">
          <div className="space-y-6">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
              Host on Tixhub
            </p>
            <h1 className="text-4xl font-semibold">
              Ticket Kenyan events with MPesa-first rails, offline ops, and
              premium attendee journeys.
            </h1>
            <p className="text-lg text-slate-600">
              Whether you run festivals, conferences, wellness retreats, or
              venues, Tixhub gives you commerce, operations, and intelligence in
              one stack. Share a few details below and we'll curate your launch
              plan.
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              {reasons.map((reason) => (
                <div
                  key={reason.title}
                  className="rounded-2xl border border-slate-100 bg-white p-4 shadow-lg shadow-slate-200/60"
                >
                  <h3 className="text-sm font-semibold">{reason.title}</h3>
                  <p className="text-sm text-slate-600">{reason.detail}</p>
                </div>
              ))}
            </div>
          </div>
          <HostApplicationForm />
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-8 py-16">
        <div className="grid gap-10 lg:grid-cols-[1fr,0.7fr]">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">
              Launch playbook + white-glove onboarding
            </h2>
            <p className="text-slate-600">
              We bring the GTM blueprint: templates, integrations, and on-ground
              support.
            </p>
            <ul className="space-y-2 text-sm text-slate-600">
              {checklist.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-3 text-xs text-slate-600">
              <span className="rounded-full border border-slate-200 px-3 py-1">
                KRA-ready payouts
              </span>
              <span className="rounded-full border border-slate-200 px-3 py-1">
                Transport + insurance partners
              </span>
              <span className="rounded-full border border-slate-200 px-3 py-1">
                Sponsor marketplace
              </span>
            </div>
          </div>
          <div className="rounded-3xl border border-slate-100 bg-slate-50 p-6">
            <h3 className="text-lg font-semibold">Need help right now?</h3>
            <p className="text-sm text-slate-600">
              Email{" "}
              <Link
                className="text-slate-900 underline"
                href="mailto:organisers@tixhub.app"
              >
                organisers@tixhub.app
              </Link>{" "}
              or call +254 700 000 000. We can share case studies (concerts,
              conferences, wellness retreats) and connect you with existing
              organisers for references.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}


