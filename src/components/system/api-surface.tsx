import { apiSurface } from "@/data/system";

export function ApiSurfaceSection() {
  return (
    <section id="api" className="mx-auto w-full max-w-7xl px-8 py-16">
      <div className="mb-8 flex flex-col gap-3">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
          5. API Surface
        </p>
        <h2 className="text-3xl font-semibold text-slate-900">
          REST contract grouped by domain; all endpoints expect JWT + optional
          idempotency keys.
        </h2>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {apiSurface.map((group) => (
          <article
            key={group.group}
            className="rounded-3xl border border-slate-100 bg-white p-6 shadow-lg shadow-slate-200/60"
          >
            <h3 className="text-lg font-semibold text-slate-900">
              {group.group}
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              {group.endpoints.map((endpoint) => (
                <li key={endpoint}>• {endpoint}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}


