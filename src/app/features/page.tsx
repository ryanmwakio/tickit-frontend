import Link from "next/link";
import {
  coreFeatureCategories,
  exclusiveFeatureCategories,
} from "@/data/features";

export const metadata = {
  title: "Features | Tixhub",
  description:
    "Explore every core and exclusive capability inside the Tixhub blueprint — 200 must-haves plus 100 differentiators.",
};

function FeatureSection({
  title,
  description,
  categories,
}: {
  title: string;
  description: string;
  categories: typeof coreFeatureCategories;
}) {
  return (
    <section className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
          {title}
        </p>
        <p className="text-lg text-slate-600">{description}</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {categories.map((category) => (
          <Link
            key={category.slug}
            href={`/features/${category.slug}`}
            className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200/70 transition hover:-translate-y-1 hover:shadow-2xl"
          >
            <div className="text-xs uppercase tracking-[0.3em] text-slate-400">
              {category.range}
            </div>
            <h3 className="mt-2 text-xl font-semibold text-slate-900">
              {category.title}
            </h3>
            <p className="mt-2 text-sm text-slate-600">{category.summary}</p>
            <p className="mt-4 text-xs text-slate-500">
              {category.features.length} capabilities
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default function FeaturesPage() {
  return (
    <div className="bg-white">
      <section className="border-b border-slate-100 bg-gradient-to-b from-white to-slate-50">
        <div className="mx-auto w-full max-w-7xl px-8 py-16">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
            Blueprint
          </p>
          <h1 className="mt-4 text-4xl font-semibold text-slate-900">
            All 300 capabilities in one UI system — browse by category, then
            drill into the detail pages.
          </h1>
          <p className="mt-4 max-w-3xl text-lg text-slate-600">
            Core features (A–I) cover the 200 must-haves for launch. Exclusive
            features (J–V) differentiate Tixhub across Kenya with local-first
            commerce, AR, AI, trust, and governance.
          </p>
        </div>
      </section>
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-16 px-8 py-16">
        <FeatureSection
          title="Core platform"
          description="Everything required for a production-ready ticketing, payments, ops, and analytics stack."
          categories={coreFeatureCategories}
        />
        <FeatureSection
          title="Exclusive differentiators"
          description="Local-first, AI, and trust accelerants from the differentiator list."
          categories={exclusiveFeatureCategories}
        />
      </section>
    </div>
  );
}


