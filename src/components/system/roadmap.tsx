import { roadmap } from "@/data/system";

export function RoadmapSection() {
  return (
    <section id="roadmap" className="mx-auto w-full max-w-7xl px-8 py-16">
      <div className="mb-8 flex flex-col gap-3">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
          8. Roadmap
        </p>
        <h2 className="text-3xl font-semibold text-slate-900">
          Phase-based delivery from MVP to differentiators.
        </h2>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {roadmap.map((phase) => (
          <article
            key={phase.phase}
            className="rounded-3xl border border-slate-100 bg-white p-6 shadow-lg shadow-slate-200/60"
          >
            <h3 className="text-lg font-semibold text-slate-900">
              {phase.phase}
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              {phase.focus.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}


