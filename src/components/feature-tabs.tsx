"use client";

import * as Tabs from "@radix-ui/react-tabs";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { featurePillars } from "@/data/content";

export function FeatureTabs() {
  return (
    <section
      id="platform"
      className="mx-auto w-full max-w-7xl px-8 py-20 text-slate-900 lg:py-24"
    >
      <div className="mb-10 flex flex-col gap-4">
        <p className="text-xs uppercase tracking-[0.4em] text-emerald-500">
          Platform layers
        </p>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 className="max-w-3xl text-3xl font-semibold md:text-4xl">
            Every core capability from features.txt is mapped into four platform
            layers – identity, creation, commerce, and operations.
          </h2>
          <button className="flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-700 transition hover:border-slate-400">
            See architecture memo
            <ArrowUpRight className="size-4" />
          </button>
        </div>
      </div>

      <Tabs.Root
        defaultValue={featurePillars[0].id}
        className="rounded-3xl border border-slate-100 bg-white p-1 shadow-xl shadow-slate-200/70"
      >
        <Tabs.List className="flex flex-wrap gap-2 p-2">
          {featurePillars.map((pillar) => (
            <Tabs.Trigger
              key={pillar.id}
              value={pillar.id}
              className="flex flex-1 items-center gap-2 rounded-2xl border border-transparent px-4 py-3 text-left text-sm text-slate-500 data-[state=active]:border-slate-200 data-[state=active]:bg-slate-50 data-[state=active]:text-slate-900 md:flex-none"
            >
              <Sparkles className="size-4 text-emerald-400" />
              {pillar.title}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        {featurePillars.map((pillar) => (
          <Tabs.Content
            key={pillar.id}
            value={pillar.id}
            className="rounded-3xl border border-slate-100 bg-white p-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-6">
              <div>
                <p className="text-sm uppercase tracking-[0.4em] text-slate-400">
                  {pillar.title}
                </p>
                <p className="max-w-3xl text-lg text-slate-600">
                  {pillar.description}
                </p>
              </div>
              <div className="flex gap-3">
                {pillar.metrics.map((metric) => (
                  <span
                    key={metric}
                    className="rounded-full border border-slate-200 px-4 py-1 text-xs text-slate-600"
                  >
                    {metric}
                  </span>
                ))}
              </div>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {pillar.features.map((feature) => (
                <article
                  key={feature}
                  className="rounded-2xl border border-slate-100 bg-slate-50/60 p-5 text-sm text-slate-600"
                >
                  {feature}
                </article>
              ))}
            </div>
          </Tabs.Content>
        ))}
      </Tabs.Root>
    </section>
  );
}


