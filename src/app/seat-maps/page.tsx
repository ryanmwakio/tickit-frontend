import type { Metadata } from "next";
import { Map, Ruler, Sparkles } from "lucide-react";
import { SeatMapCanvas } from "@/components/seat-map-canvas";
import { events } from "@/data/events";

export const metadata: Metadata = {
  title: "Seat maps | Tickit",
  description:
    "Mix SVG blueprints and 3D layouts to blueprint premium seating, capacity guardrails, and hospitality pods inside Tickit.",
};

const referenceEvent = events.find((event) => Boolean(event.seatMap)) ?? events[0];
const referenceSections = referenceEvent?.seatMap?.sections ?? [];

const designPresets = [
  {
    title: "360° Arena Bowl",
    detail: "Center stage with wrap-around pods, floor GA, and mezzanine sky decks.",
    metrics: ["8 VIP pods", "1,200 GA seats", "Dual ingress lanes"],
  },
  {
    title: "Theatre & Corporate",
    detail: "Numbered rows tiered for conferences, plenaries, and premium lounges.",
    metrics: ["Assigned seating", "Breakout lounges", "Sponsor suites"],
  },
  {
    title: "Festival Village",
    detail: "Multiple stages stitched together with shuttle gates and food courts.",
    metrics: ["Geo-fenced zones", "Shuttle docks", "Dynamic capacity"],
  },
];

function SvgSeatMapBlueprint() {
  return (
    <svg viewBox="0 0 640 380" className="h-full w-full" role="img" aria-label="SVG Seat Map">
      <defs>
        <linearGradient id="gaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e2e8f0" />
          <stop offset="100%" stopColor="#cbd5f5" />
        </linearGradient>
        <linearGradient id="vipGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#fb923c" />
        </linearGradient>
        <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0ea5e9" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="640" height="380" rx="32" fill="#fff" />
      <ellipse cx="320" cy="210" rx="250" ry="120" fill="url(#gaGradient)" opacity="0.7" />
      <ellipse cx="320" cy="210" rx="190" ry="90" fill="url(#skyGradient)" opacity="0.6" />
      <ellipse cx="320" cy="210" rx="120" ry="55" fill="white" stroke="#94a3b8" strokeWidth="2" />
      <rect
        x="240"
        y="150"
        width="160"
        height="40"
        rx="12"
        fill="#0f172a"
        opacity="0.95"
      />
      <text x="320" y="175" textAnchor="middle" fill="#e2e8f0" fontSize="14" fontWeight="bold">
        STAGE
      </text>
      {[...Array(8)].map((_, index) => {
        const angle = (index / 8) * Math.PI * 2;
        const cx = 320 + Math.cos(angle) * 140;
        const cy = 210 + Math.sin(angle) * 70;
        return (
          <circle
            key={`vip-${index}`}
            cx={cx}
            cy={cy}
            r="20"
            fill="url(#vipGradient)"
            opacity="0.9"
          />
        );
      })}
      <path
        d="M320 80 Q 420 120 470 210 Q 420 300 320 340"
        fill="none"
        stroke="#0ea5e9"
        strokeWidth="4"
        strokeDasharray="8 6"
        opacity="0.6"
      />
      <path
        d="M320 80 Q 220 120 170 210 Q 220 300 320 340"
        fill="none"
        stroke="#0ea5e9"
        strokeWidth="4"
        strokeDasharray="8 6"
        opacity="0.6"
      />
      <text x="120" y="120" fill="#475569" fontSize="12" fontWeight="600">
        Sky deck
      </text>
      <text x="520" y="120" fill="#475569" fontSize="12" fontWeight="600">
        VIP pods
      </text>
      <text x="320" y="340" textAnchor="middle" fill="#475569" fontSize="12" fontWeight="600">
        GA floor
      </text>
    </svg>
  );
}

export default function SeatMapsPage() {
  return (
    <div className="bg-white text-slate-900">
      <section className="border-b border-slate-100 bg-linear-to-b from-white to-slate-50">
        <div className="mx-auto grid w-full max-w-7xl gap-12 px-8 py-16 lg:grid-cols-[1.2fr,0.8fr]">
          <div className="space-y-6">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Designer</p>
            <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
              Blueprint flexible seat maps with precision SVGs and 3D context overlays.
            </h1>
            <p className="max-w-3xl text-lg text-slate-600">
              Map GA bowls, VIP pods, sponsor lounges, ADA aisles, and dynamic pricing fences
              inside one workspace. Export SVG for marketing, sync to operations, and preview in
              3D before gates open.
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { label: "Layouts live", value: "48 presets" },
                { label: "Seat accuracy", value: "±2 seats" },
                { label: "Sync latency", value: "< 5s" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm shadow-slate-200/60"
                >
                  <p className="text-2xl font-semibold">{stat.value}</p>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{stat.label}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3 text-sm text-slate-600">
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5">
                <Sparkles className="size-4 text-amber-500" />
                Smart capacity guardrails
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5">
                <Map className="size-4 text-indigo-500" />
                Geo-tagged gates
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5">
                <Ruler className="size-4 text-emerald-500" />
                CAD-friendly exports
              </span>
            </div>
          </div>
          <div className="rounded-3xl border border-slate-100 bg-white/70 p-6 shadow-[0_25px_80px_rgba(15,23,42,0.08)]">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-400">3D preview</p>
            <div className="mt-4 overflow-hidden rounded-3xl border border-slate-100 bg-white">
              <SeatMapCanvas />
            </div>
            <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-600">
              <span className="rounded-full border border-slate-200 px-3 py-1">
                VIP pods glowing orange
              </span>
              <span className="rounded-full border border-slate-200 px-3 py-1">
                GA seats in cyan
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-8 py-16">
        <div className="grid gap-10 lg:grid-cols-[1.3fr,0.7fr]">
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-lg shadow-slate-200/70">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-slate-400">SVG blueprint</p>
                <p className="text-base text-slate-600">
                  Drag-ready layers for marketing decks, sponsor approvals, and ops manuals.
                </p>
              </div>
            </div>
            <div className="mt-6 h-[420px] w-full overflow-hidden rounded-3xl border border-slate-100 bg-slate-50">
              <SvgSeatMapBlueprint />
            </div>
          </div>
          <div className="space-y-4">
            {referenceSections.map((section) => (
              <div
                key={section.name}
                className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm shadow-slate-200/60"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{section.name}</p>
                    <p className="text-sm text-slate-500">{section.price}</p>
                  </div>
                  <span className="text-xs text-slate-500">{section.availability}</span>
                </div>
                <ul className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
                  {section.perks.map((perk) => (
                    <li
                      key={perk}
                      className="rounded-full border border-slate-200 px-3 py-1"
                    >
                      {perk}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-slate-100 bg-slate-50/60">
        <div className="mx-auto w-full max-w-7xl px-8 py-16">
          <div className="mb-8 space-y-3">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Seat kits</p>
            <h2 className="text-3xl font-semibold">
              Presets for arenas, festivals, hospitality suites, and enterprise summits.
            </h2>
            <p className="text-slate-600">
              Switch between SVG blueprint and 3D block view instantly. Each kit inherits pricing
              guardrails, waitlist automation, and ADA best practices.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {designPresets.map((preset) => (
              <div
                key={preset.title}
                className="rounded-3xl border border-slate-100 bg-white p-5 shadow-lg shadow-slate-200/60"
              >
                <p className="text-sm font-semibold text-slate-900">{preset.title}</p>
                <p className="mt-2 text-sm text-slate-600">{preset.detail}</p>
                <ul className="mt-4 space-y-2 text-xs text-slate-600">
                  {preset.metrics.map((metric) => (
                    <li key={metric} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-900" />
                      {metric}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

