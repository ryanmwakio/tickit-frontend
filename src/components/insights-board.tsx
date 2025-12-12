import { insightCards, faqItems } from "@/data/content";
import { LineChart, MessageCircleQuestion } from "lucide-react";

export function InsightsBoard() {
  return (
    <section
      id="intelligence"
      className="mx-auto w-full max-w-7xl px-8 py-20 text-slate-900 lg:py-24"
    >
      <div className="mb-10 flex flex-col gap-4">
        <p className="text-xs uppercase tracking-[0.4em] text-emerald-500">
          Intelligence cloud
        </p>
        <h2 className="text-3xl font-semibold md:text-4xl">
          Live dashboards, AI assistants, and FAQ clarity for investors, ops,
          and compliance.
        </h2>
        <p className="max-w-3xl text-slate-600">
          Data flows pillar from features.txt is visible here – conversion,
          resale, sentiment, fraud, and knowledge base ready for backend
          wiring.
        </p>
      </div>
      <div className="grid gap-8 lg:grid-cols-[2fr,1fr]">
        <div className="space-y-4">
          {insightCards.map((card) => (
            <article
              key={card.label}
              className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200/60"
            >
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
                  {card.label}
                </p>
                <span className="text-xs text-emerald-500">{card.change}</span>
              </div>
              <p className="text-3xl font-semibold">{card.metric}</p>
              <p className="mt-2 text-sm text-slate-600">{card.detail}</p>
              <div className="mt-4 h-14 rounded-2xl bg-gradient-to-r from-emerald-200 via-sky-200 to-purple-200" />
            </article>
          ))}
        </div>
        <div className="space-y-4 rounded-3xl border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200/60">
          <div className="mb-4 flex items-center gap-3">
            <LineChart className="size-5 text-sky-500" />
            <p className="text-lg font-semibold">FAQs from teams</p>
          </div>
          {faqItems.map((faq) => (
            <details
              key={faq.question}
              className="group rounded-2xl border border-slate-100 bg-slate-50 p-4"
            >
              <summary className="flex cursor-pointer items-center justify-between text-sm font-semibold">
                {faq.question}
                <MessageCircleQuestion className="size-4 text-slate-400 transition group-open:text-slate-900" />
              </summary>
              <p className="mt-2 text-sm text-slate-600">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}


