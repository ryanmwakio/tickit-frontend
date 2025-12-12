import { architectureLayers } from "@/data/system";

export function ArchitectureSection() {
  return (
    <section id="architecture" className="mx-auto w-full max-w-7xl px-8 py-16">
      <div className="mb-8 flex flex-col gap-3">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
          1. Architecture
        </p>
        <h2 className="text-3xl font-semibold text-slate-900">
          Layered microservices with an event-driven backbone and shared infra
          controls.
        </h2>
        <p className="max-w-3xl text-slate-600">
          Start modular monolith, split per service, route async workloads through
          Kafka/Rabbit, and keep observability + security consistent.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {architectureLayers.map((layer) => (
          <article
            key={layer.layer}
            className="rounded-3xl border border-slate-100 bg-white p-6 shadow-lg shadow-slate-200/60"
          >
            <h3 className="text-lg font-semibold text-slate-900">
              {layer.layer}
            </h3>
            <p className="mt-2 text-sm text-slate-600">{layer.description}</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              {layer.bullets.map((bullet) => (
                <li key={bullet}>• {bullet}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}


