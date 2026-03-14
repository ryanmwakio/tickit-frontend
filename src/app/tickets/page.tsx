const ticketPackages = [
  {
    name: "General Experience",
    price: "KES 2,400",
    gradient: "from-white to-slate-50",
    border: "border-slate-200",
    perks: [
      "Digital + Apple Wallet ticket",
      "1 complimentary drink credit",
      "Fast-lane QR scan with offline fallback",
      "SMS + email reminders",
    ],
    tag: "Most popular",
  },
  {
    name: "VIP Sky Deck",
    price: "KES 7,800",
    gradient: "from-amber-50 via-white to-white",
    border: "border-amber-200",
    perks: [
      "Printed acrylic ticket + NFC wristband",
      "Reserved seating & VIP service",
      "MPesa escrow for resale transfers",
      "Front-of-house welcome cocktail + merch",
    ],
    tag: "Premium",
  },
  {
    name: "Founder Platinum",
    price: "KES 14,500",
    gradient: "from-slate-900 via-slate-800 to-slate-900",
    border: "border-slate-700",
    perks: [
      "Metallic ticket with laser-etched QR",
      "Private lounge & curated tasting menu",
      "On-demand shuttle + security briefings",
      "White-glove resale service w/ insurance",
    ],
    tag: "Collector",
    dark: true,
  },
];

export const metadata = {
  title: "Sample Tickets | Tickit",
  description:
    "Premium ticket concepts showing how GA, VIP, and Platinum tiers translate to the Tickit design system.",
};

export default function TicketsPage() {
  return (
    <div className="bg-white text-slate-900">
      <section className="border-b border-slate-100 bg-gradient-to-b from-white to-slate-50">
        <div className="mx-auto w-full max-w-7xl px-8 py-16">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
            Sample tickets
          </p>
          <h1 className="mt-4 text-4xl font-semibold">
            Premium ticket designs for every package tier.
          </h1>
          <p className="mt-3 max-w-3xl text-lg text-slate-600">
            Use these concepts during sponsor pitches, organiser walkthroughs,
            or investor demos. They map directly to Tickit’s ticketing
            primitives—QR/NFC, resale guardrails, and MPesa-ready flows.
          </p>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-6 px-8 py-16 lg:grid-cols-3">
        {ticketPackages.map((pkg) => (
          <article
            key={pkg.name}
            className={`relative flex min-h-[360px] flex-col rounded-[32px] border ${pkg.border} bg-gradient-to-br ${pkg.gradient} p-6 shadow-[0_20px_70px_rgba(15,23,42,0.12)]`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-xs uppercase tracking-[0.3em] ${pkg.dark ? "text-slate-200" : "text-slate-500"}`}
                >
                  {pkg.tag}
                </p>
                <h2
                  className={`mt-2 text-2xl font-semibold ${pkg.dark ? "text-white" : "text-slate-900"}`}
                >
                  {pkg.name}
                </h2>
              </div>
              <div
                className={`rounded-full border ${pkg.dark ? "border-white/30" : "border-slate-200"} px-3 py-1 text-xs ${pkg.dark ? "text-white" : "text-slate-600"}`}
              >
                NFC + QR
              </div>
            </div>
            <div
              className={`mt-6 rounded-2xl border ${pkg.dark ? "border-white/20 bg-white/5" : "border-slate-100 bg-white"} p-4`}
            >
              <div
                className={`text-sm uppercase tracking-[0.3em] ${pkg.dark ? "text-white/70" : "text-slate-500"}`}
              >
                Price
              </div>
              <p
                className={`mt-1 text-3xl font-semibold ${pkg.dark ? "text-white" : "text-slate-900"}`}
              >
                {pkg.price}
              </p>
              <p
                className={`text-xs ${pkg.dark ? "text-white/70" : "text-slate-500"}`}
              >
                Includes taxes & platform fees handled via MPesa.
              </p>
            </div>
            <ul className="mt-6 space-y-3 text-sm">
              {pkg.perks.map((perk) => (
                <li
                  key={perk}
                  className={`flex items-start gap-2 ${pkg.dark ? "text-white/85" : "text-slate-700"}`}
                >
                  <span
                    className={`mt-1 size-1.5 rounded-full ${pkg.dark ? "bg-emerald-300" : "bg-emerald-500"}`}
                  />
                  <span>{perk}</span>
                </li>
              ))}
            </ul>
            <div className="mt-auto pt-6 text-xs uppercase tracking-[0.3em] text-slate-400">
              Ticket ID · TIX-{pkg.name.substring(0, 3).toUpperCase()}-2045
            </div>
          </article>
        ))}
      </section>

      <section className="mx-auto w-full max-w-7xl px-8 pb-20">
        <div className="mb-8 flex flex-col gap-3">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
            Physical tickets
          </p>
          <h2 className="text-2xl font-semibold">
            Sample print-ready layouts for event day.
          </h2>
          <p className="max-w-3xl text-sm text-slate-600">
            Each ticket mirrors the packages above. Use them for box office
            mockups, merch drops, or sponsor previews.
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="relative overflow-hidden rounded-[36px] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.12)]">
            <div className="flex flex-col gap-4 lg:flex-row">
              <div className="flex-1 space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-xs uppercase tracking-[0.4em] text-slate-500">
                  GA · 00234
                </div>
                <p className="text-3xl font-semibold text-slate-900">
                  Sunset Sessions
                </p>
                <p className="text-sm text-slate-600">
                  Fri 12 Dec · 7:00 PM · Alchemist, Nairobi
                </p>
                <p className="text-2xl font-semibold text-slate-900">
                  KES 2,400
                </p>
                <div className="text-xs text-slate-500">
                  Seat: GA-128 • MPesa Txn Ref: TIX-99821
                </div>
              </div>
              <div className="flex flex-col items-center justify-between rounded-3xl border border-dashed border-slate-300 px-4 py-6 text-center">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                    Scan
                  </p>
                  <div className="mt-2 h-24 w-24 rounded bg-[radial-gradient(circle,_#0f172a_1px,_transparent_1px)] bg-[length:6px_6px]" />
                </div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400">
                  NFC wristband linked
                </p>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[36px] border border-amber-200 bg-gradient-to-r from-amber-50 via-white to-white p-6 shadow-[0_20px_60px_rgba(190,135,0,0.2)]">
            <div className="absolute inset-y-6 left-1/2 w-px bg-gradient-to-b from-transparent via-amber-200 to-transparent" />
            <div className="flex flex-col gap-4 lg:flex-row">
              <div className="flex-1 space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/70 px-3 py-1 text-xs uppercase tracking-[0.4em] text-amber-600">
                  VIP · 00008
                </div>
                <p className="text-3xl font-semibold text-amber-900">
                  Founder Platinum
                </p>
                <p className="text-sm text-amber-700">
                  Sat 14 Dec · 8:00 PM · Sky Deck, Nairobi
                </p>
                <p className="text-2xl font-semibold text-amber-900">
                  KES 14,500
                </p>
                <ul className="text-sm text-amber-800">
                  <li>• Lounge access • VIP service</li>
                  <li>• Shuttle + insurance bundle</li>
                  <li>• Signed holographic laminate</li>
                </ul>
              </div>
              <div className="flex flex-col items-center justify-between rounded-3xl border border-dashed border-amber-300 px-4 py-6 text-center">
                <div className="rounded-full border border-amber-200 bg-white/70 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-amber-800">
                  NFC + QR
                </div>
                <div className="mt-4 h-24 w-24 rounded bg-[radial-gradient(circle,_rgba(251,191,36,0.9)_1px,_transparent_1px)] bg-[length:6px_6px]" />
                <p className="text-[10px] uppercase tracking-[0.3em] text-amber-700">
                  Escort to suite
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
