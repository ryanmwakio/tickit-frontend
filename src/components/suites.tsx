import Image from "next/image";
import { ArrowUpRight, BadgeCheck } from "lucide-react";
import { suiteHighlights } from "@/data/content";

export function Suites() {
  return (
    <section id="suites" className="mx-auto w-full max-w-7xl px-8 py-20 text-slate-900 lg:py-24">
      <div className="mb-12 flex flex-col gap-4">
        <p className="text-xs uppercase tracking-[0.4em] text-sky-500">
          Shared design system
        </p>
        <h2 className="text-3xl font-semibold md:text-4xl">
          One design language across attendee web, organiser workspace, staff
          scanners, native apps, and partner consoles.
        </h2>
        <p className="max-w-3xl text-slate-600">
          Components are Radix-first, themeable, and mobile responsive out of
          the box. Each suite bundles the must-have and exclusive capabilities
          from the requirements doc.
        </p>
      </div>
      <div className="grid gap-8 md:grid-cols-2">
        {suiteHighlights.map((suite) => (
          <article
            key={suite.id}
            className="flex flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-2xl shadow-slate-200/80"
          >
            <div className="relative h-64 w-full">
              <Image
                src={suite.image}
                alt={suite.title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/80 px-4 py-1 text-xs uppercase tracking-[0.3em] text-slate-800">
                <BadgeCheck className="size-4 text-emerald-400" />
                {suite.badge}
              </div>
            </div>
            <div className="flex flex-1 flex-col gap-6 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
                    {suite.title}
                  </p>
                  <p className="text-xl font-semibold text-slate-900">
                    {suite.description}
                  </p>
                </div>
                <button className="rounded-full border border-slate-200 p-2 text-slate-600 transition hover:border-slate-400">
                  <ArrowUpRight className="size-4" />
                </button>
              </div>
              <div className="flex gap-4 text-sm text-slate-500">
                {suite.stats.map((stat) => (
                  <div key={stat.label} className="flex flex-col">
                    <span className="text-xs uppercase tracking-[0.3em] text-slate-400">
                      {stat.label}
                    </span>
                    <span className="text-xl font-semibold text-slate-900">
                      {stat.value}
                    </span>
                  </div>
                ))}
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {suite.modules.map((module) => (
                  <div
                    key={module.title}
                    className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
                  >
                    <p className="text-sm font-semibold text-slate-900">
                      {module.title}
                    </p>
                    <ul className="mt-2 space-y-1 text-sm text-slate-600">
                      {module.items.map((item) => (
                        <li key={item}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}


