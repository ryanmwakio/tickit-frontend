import { Shield, Zap } from "lucide-react";
import { opsPlaybooks } from "@/data/content";

export function OpsMatrix() {
  return (
    <section
      id="ops"
      className="mx-auto w-full max-w-7xl px-8 py-20 text-slate-900 lg:py-24"
    >
      <div className="mb-10 flex flex-col gap-4">
        <p className="text-xs uppercase tracking-[0.4em] text-rose-500">
          Operations desk
        </p>
        <h2 className="text-3xl font-semibold md:text-4xl">
          Resale, safety, finance, and marketing playbooks baked into the UI so
          frontline teams act fast without backend toggles.
        </h2>
        <p className="max-w-3xl text-slate-600">
          Each card summarises workflows we surfaced from features.txt – from
          secondary marketplaces to compliance. The components are ready to wire
          to APIs later.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {opsPlaybooks.map((playbook) => (
          <article
            key={playbook.title}
            className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200/60"
          >
            <div className="mb-4 flex items-center gap-3">
              <span className="rounded-full border border-emerald-100 bg-emerald-50 p-2">
                <Shield className="size-4 text-emerald-500" />
              </span>
              <p className="text-lg font-semibold">{playbook.title}</p>
            </div>
            <p className="text-sm text-slate-600">{playbook.detail}</p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              {playbook.indicators.map((indicator) => (
                <span
                  key={indicator}
                  className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1 text-slate-600"
                >
                  <Zap className="size-3 text-amber-500" />
                  {indicator}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}


