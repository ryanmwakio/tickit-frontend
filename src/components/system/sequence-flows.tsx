import { sequenceFlows } from "@/data/system";

export function SequenceFlows() {
  return (
    <section id="flows" className="mx-auto w-full max-w-7xl px-8 py-16">
      <div className="mb-8 flex flex-col gap-3">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
          6. Sequence flows
        </p>
        <h2 className="text-3xl font-semibold text-slate-900">
          Checkout, check-in, and resale flows with key control points.
        </h2>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {sequenceFlows.map((flow) => (
          <article
            key={flow.title}
            className="rounded-3xl border border-slate-100 bg-white p-6 shadow-lg shadow-slate-200/60"
          >
            <h3 className="text-lg font-semibold text-slate-900">
              {flow.title}
            </h3>
            <ol className="mt-3 list-decimal space-y-2 pl-4 text-sm text-slate-600">
              {flow.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </article>
        ))}
      </div>
    </section>
  );
}


