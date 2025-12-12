"use client";

import * as ScrollArea from "@radix-ui/react-scroll-area";
import { journeys } from "@/data/content";

export function JourneyRail() {
  return (
    <section
      id="journeys"
      className="mx-auto w-full max-w-7xl px-8 py-20 text-slate-900 lg:py-24"
    >
      <div className="mb-10 flex flex-col gap-4">
        <p className="text-xs uppercase tracking-[0.4em] text-amber-500">
          Customer journeys
        </p>
        <h2 className="text-3xl font-semibold md:text-4xl">
          Every persona path from features.txt rendered as tangible flows so
          product, ops, and engineering stay aligned.
        </h2>
        <p className="max-w-3xl text-slate-600">
          Scroll through attendee, organiser, ops, and finance tracks. Each card
          highlights the tactical screens and guardrails that must exist in the
          frontend before backend integration.
        </p>
      </div>
      <ScrollArea.Root className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-xl shadow-slate-200/50">
        <ScrollArea.Viewport className="w-full">
          <div className="flex gap-6 px-6 py-8">
            {journeys.map((journey) => (
              <article
                key={journey.persona}
                className="min-w-[280px] flex-1 rounded-2xl border border-slate-100 bg-slate-50 p-5"
              >
                <div className="mb-4 flex items-center justify-between text-xs uppercase tracking-[0.3em] text-slate-400">
                  <span>{journey.persona}</span>
                  <span>{journey.signal}</span>
                </div>
                <p className="text-lg font-semibold">{journey.focus}</p>
                <div className="mt-4 space-y-4 text-sm text-slate-600">
                  {journey.steps.map((step) => (
                    <div
                      key={step.title}
                      className="rounded-xl border border-white bg-white p-3"
                    >
                      <p className="text-sm font-semibold text-slate-900">
                        {step.title}
                      </p>
                      <p>{step.detail}</p>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar
          orientation="horizontal"
          className="flex h-2 touch-none select-none bg-slate-100"
        >
          <ScrollArea.Thumb className="relative flex-1 rounded-full bg-slate-400/70" />
        </ScrollArea.Scrollbar>
      </ScrollArea.Root>
    </section>
  );
}


