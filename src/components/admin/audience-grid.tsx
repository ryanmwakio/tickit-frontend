import { adminAudiences } from "@/data/admin";

export function AdminAudienceGrid() {
  return (
    <section className="border-b border-slate-100 bg-white">
      <div className="mx-auto w-full max-w-6xl px-6 py-16 md:px-10 lg:px-16">
        <div className="mb-10 max-w-3xl space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
            Who It Serves
          </p>
          <h2 className="text-3xl font-semibold text-slate-900">
            Purpose-built workspaces for every team.
          </h2>
          <p className="text-slate-600">
            Each audience gets dedicated dashboards, permissions, and execution
            tools while sharing a single source of truth across the platform.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {adminAudiences.map((audience) => (
            <div
              key={audience.title}
              className="flex flex-col gap-4 rounded-3xl border border-slate-100 bg-slate-50/60 p-6 shadow-sm shadow-slate-100"
            >
              <div>
                <p className="text-sm font-semibold uppercase tracking-widest text-slate-500">
                  {audience.title}
                </p>
                <p className="mt-2 text-base text-slate-700">
                  {audience.description}
                </p>
              </div>
              <ul className="list-disc space-y-2 pl-5 text-sm text-slate-600">
                {audience.responsibilities.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

