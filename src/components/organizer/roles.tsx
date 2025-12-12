import { organizerRoles } from "@/data/organizer";

export function OrganizerRoleGrid({
  variant = "page",
}: {
  variant?: "page" | "embed";
}) {
  const containerClasses =
    variant === "embed"
      ? "bg-transparent py-0"
      : "bg-white py-16 text-slate-900";

  return (
    <section className={`${containerClasses} text-slate-900`}>
      <div className="mx-auto w-full max-w-7xl px-6 md:px-10 lg:px-16">
        <div className="flex flex-col gap-4 pb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">
            Teams served
          </p>
          <h2 className="text-3xl font-semibold leading-tight">
            Every organiser seat, from owner to gate staff, runs in one portal.
          </h2>
          <p className="text-base text-slate-500">
            Role-based controls match Kenya&apos;s real promoter stacks—agency
            temps, venue partners, finance reviewers, and on-site scanners.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {organizerRoles.map((role) => (
            <article
              key={role.title}
              className="rounded-3xl border border-slate-100 bg-slate-50/70 p-6 shadow-sm shadow-slate-200/50"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-400">
                    {role.badge}
                  </p>
                  <h3 className="text-xl font-semibold text-slate-900">
                    {role.title}
                  </h3>
                </div>
              </div>
              <p className="mt-3 text-sm text-slate-600">{role.description}</p>
              <ul className="mt-4 space-y-3 text-sm text-slate-600">
                {role.responsibilities.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 rounded-2xl bg-white/80 p-3 shadow-inner shadow-slate-200/40"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-1 size-2 rounded-full bg-slate-900"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

