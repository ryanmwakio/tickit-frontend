import { securityChecklist } from "@/data/system";

export function SecuritySection() {
  return (
    <section id="security" className="mx-auto w-full max-w-7xl px-8 py-16">
      <div className="mb-8 flex flex-col gap-3">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
          7. Security & compliance
        </p>
        <h2 className="text-3xl font-semibold text-slate-900">
          Guardrails for PCI, DPA, fraud, and disaster recovery.
        </h2>
      </div>
      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200/60">
        <ul className="space-y-3 text-sm text-slate-600">
          {securityChecklist.map((item) => (
            <li key={item}>• {item}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}


