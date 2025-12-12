import { storageStack } from "@/data/system";

export function StorageStack() {
  return (
    <section id="storage" className="mx-auto w-full max-w-7xl px-8 py-16">
      <div className="mb-8 flex flex-col gap-3">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
          3. Data & Infra
        </p>
        <h2 className="text-3xl font-semibold text-slate-900">
          Postgres for source of truth, Redis for speed, Kafka for async, Elastic
          for search, and S3 + data lake for analytics.
        </h2>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {storageStack.map((item) => (
          <article
            key={item.title}
            className="rounded-3xl border border-slate-100 bg-white p-6 shadow-lg shadow-slate-200/60"
          >
            <h3 className="text-lg font-semibold text-slate-900">
              {item.title}
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              {item.details.map((detail) => (
                <li key={detail}>• {detail}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}


