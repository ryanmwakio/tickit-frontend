import { dataModel } from "@/data/system";

export function DataModelSection() {
  return (
    <section id="data-model" className="mx-auto w-full max-w-7xl px-8 py-16">
      <div className="mb-8 flex flex-col gap-3">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
          4. Data model
        </p>
        <h2 className="text-3xl font-semibold text-slate-900">
          Core ER entities from users to tickets, orders, payments, audit logs.
        </h2>
      </div>
      <div className="overflow-hidden rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/60">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-[0.3em] text-slate-500">
            <tr>
              <th className="px-4 py-3">Entity</th>
              <th className="px-4 py-3">Fields</th>
              <th className="px-4 py-3">Notes</th>
            </tr>
          </thead>
          <tbody>
            {dataModel.map((entity, idx) => (
              <tr
                key={entity.entity}
                className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/60"}
              >
                <td className="px-4 py-3 font-semibold text-slate-900">
                  {entity.entity}
                </td>
                <td className="px-4 py-3 text-slate-600">{entity.fields}</td>
                <td className="px-4 py-3 text-slate-500">{entity.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}


