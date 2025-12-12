import { highLevelGoals } from "@/data/system";

export function SystemHero() {
  return (
    <section className="border-b border-slate-200 bg-gradient-to-b from-white to-slate-50">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-8 py-20">
        <div className="space-y-6">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
            System design
          </p>
          <h1 className="text-4xl font-semibold text-slate-900 md:text-5xl">
            Multi-tenant, Kenya-first ticketing architecture spanning web, mobile,
            offline ops, MPesa flows, resale, and analytics.
          </h1>
          <p className="max-w-3xl text-lg text-slate-600">
            This view mirrors the architecture brief: microservices, payments,
            data models, APIs, workflows, security, and roadmap. Everything is
            production-minded so backend teams can plug in directly.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {highLevelGoals.map((goal) => (
            <div
              key={goal.title}
              className="rounded-3xl border border-slate-100 bg-white p-5 shadow-lg shadow-slate-200/60"
            >
              <h3 className="text-sm font-semibold text-slate-900">
                {goal.title}
              </h3>
              <p className="mt-2 text-sm text-slate-600">{goal.description}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                {goal.stats.map((stat) => (
                  <span
                    key={stat}
                    className="rounded-full border border-slate-200 px-3 py-1"
                  >
                    {stat}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


