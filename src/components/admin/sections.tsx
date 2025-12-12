import type { AdminSection } from "@/data/admin";

const statusTokens = [
  { label: "Live", classes: "bg-emerald-100 text-emerald-800" },
  { label: "Beta", classes: "bg-amber-100 text-amber-800" },
  { label: "Guarded", classes: "bg-sky-100 text-sky-800" },
  { label: "Ops", classes: "bg-slate-200 text-slate-900" },
];

const actionLabels = ["Configure", "View logs", "Automate", "Open workspace"];

function deriveDescription(
  item: string,
  groupTitle: string,
  sectionTitle: string,
) {
  return `${item} inside ${groupTitle} for ${sectionTitle}.`;
}

type FeatureCardProps = {
  item: string;
  groupTitle: string;
  sectionTitle: string;
  index: number;
};

function FeatureCard({ item, groupTitle, sectionTitle, index }: FeatureCardProps) {
  const status = statusTokens[index % statusTokens.length];
  const progress = ((item.length + groupTitle.length + index * 13) % 60) + 30;
  const action = actionLabels[index % actionLabels.length];

  return (
    <div className="flex flex-col rounded-3xl border border-slate-100 bg-white p-4 shadow-sm shadow-slate-100">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-900">{item}</p>
          <p className="mt-1 text-sm text-slate-500">
            {deriveDescription(item, groupTitle, sectionTitle)}
          </p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${status.classes}`}>
          {status.label}
        </span>
      </div>
      <div className="mt-4 space-y-3">
        <div>
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Coverage</span>
            <span>{progress}%</span>
          </div>
          <div className="mt-1 h-2 rounded-full bg-slate-100">
            <div
              className="h-2 rounded-full bg-slate-900"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="flex-1 rounded-2xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            {action}
          </button>
          <button
            type="button"
            className="rounded-2xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-500 transition hover:border-slate-300"
          >
            Docs
          </button>
        </div>
      </div>
    </div>
  );
}

export function AdminFeatureBoard({ section }: { section: AdminSection }) {
  return (
    <section className="space-y-8">
      {section.groups.map((group, groupIndex) => (
        <article
          key={`${section.id}-${group.title}`}
          className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/50 lg:p-8"
        >
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
              {section.title}
            </p>
            <h2 className="text-2xl font-semibold text-slate-900">
              {group.title}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Operational workspace for {group.title.toLowerCase()}.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {group.items.map((item, itemIndex) => (
              <FeatureCard
                key={item}
                item={item}
                groupTitle={group.title}
                sectionTitle={section.title}
                index={groupIndex + itemIndex}
              />
            ))}
          </div>
        </article>
      ))}
    </section>
  );
}

