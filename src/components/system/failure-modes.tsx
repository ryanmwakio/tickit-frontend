import { failureModes } from "@/data/system";

export function FailureModesSection() {
  return (
    <section id="failure-modes" className="mx-auto w-full max-w-7xl px-8 py-16">
      <div className="mb-8 flex flex-col gap-3">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
          9. Failure modes
        </p>
        <h2 className="text-3xl font-semibold text-slate-900">
          Known risks with mitigation strategies baked into the design.
        </h2>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {failureModes.map((mode) => (
          <article
            key={mode.title}
            className="rounded-3xl border border-slate-100 bg-white p-6 shadow-lg shadow-slate-200/60"
          >
            <h3 className="text-lg font-semibold text-slate-900">
              {mode.title}
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              {mode.mitigations.map((mitigation) => (
                <li key={mitigation}>• {mitigation}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}


