import { organizerBonusHighlights } from "@/data/organizer";

export function OrganizerBonusFeatures() {
  return (
    <section className="bg-slate-900 py-16 text-white">
      <div className="mx-auto w-full max-w-7xl px-6 md:px-10 lg:px-16">
        <div className="flex flex-col gap-4 pb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-cyan-300">
            Bonus stack
          </p>
          <h2 className="text-3xl font-semibold leading-tight">
            Differentiators missing in every Kenyan ticketing portal today.
          </h2>
          <p className="text-base text-white/70">
            Ship premium experiences—dynamic seating, NFT passes, GPS staff,
            artist split automation, insurance upsells, and a smarter fraud
            guardian.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {organizerBonusHighlights.map((highlight) => (
            <article
              key={highlight.title}
              className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/50"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200">
                Feature
              </p>
              <h3 className="mt-2 text-xl font-semibold">{highlight.title}</h3>
              <p className="mt-3 text-sm text-white/80">{highlight.detail}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

