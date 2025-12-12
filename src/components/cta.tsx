import { ArrowRight, Download } from "lucide-react";

export function CTA() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-20 text-slate-900">
      <div className="rounded-[40px] border border-slate-100 bg-gradient-to-r from-indigo-100 via-sky-100 to-emerald-100 p-10 text-center shadow-2xl shadow-slate-200/60">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
          Next up
        </p>
        <h3 className="mt-4 text-3xl font-semibold">
          Launch investor-ready decks, organiser playbooks, and UI tokens.
        </h3>
        <p className="mx-auto mt-3 max-w-2xl text-slate-600">
          Download the asset kit or share this system brief with partners. When
          engineering is ready, wire APIs into the prepared surfaces for
          payments, check-in, resale, and intelligence.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button className="flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3 font-semibold text-white shadow-lg shadow-slate-400/50">
            Download UI kit
            <Download className="size-4" />
          </button>
          <button className="flex items-center gap-2 rounded-full border border-slate-300 px-6 py-3 text-slate-700">
            Share system memo
            <ArrowRight className="size-4" />
          </button>
        </div>
      </div>
    </section>
  );
}

