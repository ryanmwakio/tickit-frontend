import Link from "next/link";
import { notFound } from "next/navigation";
import {
  allFeatureCategories,
  getFeatureCategoryBySlug,
} from "@/data/features";

type FeatureDetailProps = {
  params: { slug: string };
};

export function generateStaticParams() {
  return allFeatureCategories.map((category) => ({ slug: category.slug }));
}

export function generateMetadata({ params }: FeatureDetailProps) {
  const category = getFeatureCategoryBySlug(params.slug);
  if (!category) {
    return { title: "Feature not found | Tixhub" };
  }
  return {
    title: `${category.title} | Tixhub features`,
    description: category.summary,
  };
}

export default function FeatureDetailPage({ params }: FeatureDetailProps) {
  const category = getFeatureCategoryBySlug(params.slug);
  if (!category) {
    notFound();
  }

  return (
    <div className="bg-white">
      <section className="border-b border-slate-100 bg-gradient-to-b from-white to-slate-50">
        <div className="mx-auto w-full max-w-7xl px-8 py-16">
          <Link
            href="/features"
            className="text-sm text-slate-500 transition hover:text-slate-900"
          >
            ← All features
          </Link>
          <p className="mt-6 text-xs uppercase tracking-[0.4em] text-slate-500">
            {category.range} • {category.type === "core" ? "Core" : "Exclusive"}
          </p>
          <h1 className="mt-4 text-4xl font-semibold text-slate-900">
            {category.title}
          </h1>
          <p className="mt-3 max-w-3xl text-lg text-slate-600">
            {category.summary}
          </p>
        </div>
      </section>
      <section className="mx-auto w-full max-w-7xl px-8 py-16">
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200/70">
          <h2 className="text-xl font-semibold text-slate-900">
            {category.features.length} capabilities
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {category.features.map((feature) => (
              <div
                key={feature}
                className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-700"
              >
                {feature}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}


