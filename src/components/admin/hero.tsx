import { adminSections } from "@/data/admin";
import Link from "next/link";

const dashboardSection = adminSections.find(
  (section) => section.id === "dashboard",
);

export function AdminHero() {
  const dashboardGroups = dashboardSection?.groups ?? [];
  return (
    <section
      id="dashboard"
      className="rounded-[32px] border border-slate-200 bg-slate-900 px-6 py-10 text-white shadow-xl shadow-slate-900/30 md:px-10 lg:px-12"
    >
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        <div className="flex-1 space-y-5">
          <p className="text-xs uppercase tracking-[0.4em] text-cyan-300">
            Global Dashboard
          </p>
          <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
            Full-stack observability for platform ops, organisers, and finance.
          </h1>
          <p className="text-lg text-white/80">
            Log in and land directly on a live control room: totals, velocity,
            fraud flags, infrastructure health, refund queues, and organiser
            payouts, all refresh-ready for field teams and HQ.
          </p>
          <div className="flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
            <span className="rounded-full border border-white/30 px-4 py-2">
              Super Admin
            </span>
            <span className="rounded-full border border-white/30 px-4 py-2">
              Organizer
            </span>
            <span className="rounded-full border border-white/30 px-4 py-2">
              Finance
            </span>
            <span className="rounded-full border border-white/30 px-4 py-2">
              Support
            </span>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/host"
              className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-inner shadow-white/40 transition hover:bg-white/90"
            >
              Invite organiser
            </Link>
            <Link
              href="/system"
              className="rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white transition hover:border-white"
            >
              Review architecture
            </Link>
          </div>
        </div>
        <div className="flex-1 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-inner shadow-slate-900/40">
          <div className="space-y-6">
            {dashboardGroups.map((group) => (
              <div key={group.title}>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200">
                  {group.title}
                </p>
                <ul className="mt-3 space-y-2 text-sm text-white/80">
                  {group.items.map((item) => (
                    <li key={item} className="leading-relaxed">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

