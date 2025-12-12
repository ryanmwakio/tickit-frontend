const metricCards = [
  {
    label: "Total events live",
    value: "248",
    trend: "+8 since yesterday",
  },
  {
    label: "Tickets scanned today",
    value: "32,418",
    trend: "85% of forecast",
  },
  {
    label: "Revenue month to date",
    value: "KES 184M",
    trend: "+12% MoM",
  },
  {
    label: "Refund queue",
    value: "37 pending",
    trend: "12 high priority",
  },
];

const refundQueue = [
  {
    id: "RF-9123",
    event: "Savannah Jazz Weekend",
    amount: "KES 8,200",
    status: "Awaiting finance",
  },
  {
    id: "RF-9124",
    event: "Campus Culture Fest",
    amount: "KES 2,600",
    status: "Verification",
  },
  {
    id: "RF-9125",
    event: "Naivasha Drift Show",
    amount: "KES 14,900",
    status: "MPESA retry",
  },
];

const organiserPayouts = [
  {
    organiser: "Flamingo Live",
    due: "KES 24.1M",
    status: "Settling",
  },
  {
    organiser: "Soundwave Africa",
    due: "KES 12.4M",
    status: "Pending KYC",
  },
  {
    organiser: "Club Orbit",
    due: "KES 3.2M",
    status: "Ready",
  },
];

const healthSignals = [
  {
    label: "API latency",
    value: "142ms",
    state: "Healthy",
  },
  {
    label: "MPESA callbacks",
    value: "99.4% success",
    state: "Stable",
  },
  {
    label: "Email/SMS queue",
    value: "1,240 pending",
    state: "Normal",
  },
];

export function AdminDashboardPanels() {
  return (
    <section className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metricCards.map((card) => (
          <div
            key={card.label}
            className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
              {card.label}
            </p>
            <p className="mt-3 text-2xl font-semibold text-slate-900">
              {card.value}
            </p>
            <p className="text-sm text-emerald-600">{card.trend}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/60 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                Refund Queue
              </p>
              <h2 className="text-xl font-semibold text-slate-900">
                Live refund operations
              </h2>
            </div>
            <button
              type="button"
              className="rounded-2xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300"
            >
              Open queue
            </button>
          </div>
          <div className="mt-5 divide-y divide-slate-100">
            {refundQueue.map((ticket) => (
              <div key={ticket.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{ticket.event}</p>
                  <p className="text-xs text-slate-500">{ticket.id}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-900">{ticket.amount}</p>
                  <p className="text-xs text-amber-600">{ticket.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/60">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
            Organiser Wallet
          </p>
          <h2 className="text-xl font-semibold text-slate-900">
            Upcoming payouts
          </h2>
          <ul className="mt-5 space-y-4">
            {organiserPayouts.map((payout) => (
              <li key={payout.organiser} className="rounded-2xl border border-slate-100 p-3">
                <p className="text-sm font-semibold text-slate-900">{payout.organiser}</p>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{payout.due}</span>
                  <span className="font-semibold text-emerald-600">{payout.status}</span>
                </div>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="mt-4 w-full rounded-2xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300"
          >
            View ledger
          </button>
        </div>
      </div>

      <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/60">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
              Platform Health
            </p>
            <h2 className="text-xl font-semibold text-slate-900">
              Infrastructure & messaging status
            </h2>
          </div>
          <button
            type="button"
            className="rounded-2xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300"
          >
            View status page
          </button>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {healthSignals.map((signal) => (
            <div
              key={signal.label}
              className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{signal.label}</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">{signal.value}</p>
              <p className="text-xs font-semibold text-emerald-600">{signal.state}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

