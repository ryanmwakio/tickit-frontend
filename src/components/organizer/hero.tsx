import Link from "next/link";

export function OrganizerHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="absolute inset-0 opacity-30">
        <div className="grid h-full w-full grid-cols-12 gap-4">
          {Array.from({ length: 36 }).map((_, index) => (
            <div
              key={index}
              className="border border-white/5"
              aria-hidden="true"
            />
          ))}
        </div>
      </div>
      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 py-16 md:px-10 lg:px-16">
        <div className="space-y-6 max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.5em] text-cyan-300">
            Organizer Portal
          </p>
          <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
            Merchant-grade HQ for Kenyan event owners, promoters, finance, ops,
            and scanners.
          </h1>
          <p className="text-lg text-white/80">
            Replace spreadsheets and WhatsApp approvals with a studio built for
            MPesa realities, on-site chaos, and multi-team collaboration. Every
            workflow here is tuned for Ticketsasa, Mtickets, Madfun, OneKitty,
            Ticketyetu, Tokea—and everything they still lack.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 text-sm font-semibold uppercase tracking-[0.3em]">
          <Link
            href="/host"
            className="rounded-full bg-white px-6 py-3 text-slate-900 shadow-lg shadow-white/30 transition hover:bg-white/90"
          >
            Launch an event
          </Link>
          <Link
            href="/intelligence"
            className="rounded-full border border-white/40 px-6 py-3 text-white transition hover:border-white"
          >
            View analytics cloud
          </Link>
        </div>
        <div className="grid gap-4 text-sm text-white/70 md:grid-cols-3">
          {[
            {
              label: "MPesa-first orchestration",
              detail: "STK, Paybill, Till, bank, card, cash desk, escrow.",
            },
            {
              label: "Offline-ready ops",
              detail: "Scanners, payouts, refunds, and device health offline.",
            },
            {
              label: "Multi-role guardrails",
              detail:
                "Owners, finance, marketers, staff, promoters, support & ops.",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-inner shadow-black/40"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-200">
                {item.label}
              </p>
              <p className="mt-2 text-base text-white/80">{item.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

