import { serviceMatrix } from "@/data/system";

export function ServiceMatrix() {
  return (
    <section id="services" className="mx-auto w-full max-w-7xl px-8 py-16">
      <div className="mb-8 flex flex-col gap-3">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
          2. Services
        </p>
        <h2 className="text-3xl font-semibold text-slate-900">
          Decompose by responsibility: auth, catalog, ticketing, payments,
          resale, ops, comms, analytics.
        </h2>
        <p className="max-w-3xl text-slate-600">
          Each service owns its schema and publishes events for downstream
          consumers. Endpoints mirror the API section for quick reference.
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        {serviceMatrix.map((service) => (
          <article
            key={service.name}
            className="rounded-3xl border border-slate-100 bg-white p-6 shadow-lg shadow-slate-200/60"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  Service
                </p>
                <h3 className="text-lg font-semibold text-slate-900">
                  {service.name}
                </h3>
              </div>
            </div>
            <p className="mt-2 text-sm text-slate-600">{service.focus}</p>
            <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-xs text-slate-600">
              <p className="mb-2 font-semibold uppercase tracking-[0.3em] text-slate-500">
                Endpoints
              </p>
              <ul className="space-y-1">
                {service.endpoints.map((endpoint) => (
                  <li key={endpoint}>{endpoint}</li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}


