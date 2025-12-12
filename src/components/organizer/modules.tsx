import type { OrganizerModule } from "@/data/organizer";

export function OrganizerModuleDetail({ module }: { module: OrganizerModule }) {
  return (
    <section className="bg-white py-10 text-slate-900">
      <div className="mx-auto w-full max-w-7xl space-y-8 rounded-[32px] border border-slate-200 bg-slate-50/80 p-6 shadow-lg shadow-slate-200/60 lg:p-10">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3">
            {module.badge ? (
              <span className="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                {module.badge}
              </span>
            ) : null}
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
              Module
            </p>
          </div>
          <h3 className="text-3xl font-semibold text-slate-900">
            {module.title}
          </h3>
          <p className="text-base text-slate-600">{module.description}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {module.groups.map((group) => (
            <div
              key={`${module.id}-${group.title}`}
              className="rounded-3xl border border-white/50 bg-white p-5 shadow-sm shadow-slate-200/70"
            >
              <div className="flex items-center justify-between gap-3 pb-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                    {group.badge ?? "Workspace"}
                  </p>
                  <h4 className="text-lg font-semibold text-slate-900">
                    {group.title}
                  </h4>
                </div>
              </div>
              <ul className="space-y-3 text-sm text-slate-600">
                {group.items.map((item) => (
                  <li
                    key={item}
                    className="rounded-2xl border border-slate-100 bg-slate-50/60 p-3"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

