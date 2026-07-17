import type { ReactNode } from "react";

function formatValue(value: unknown): ReactNode {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  if (typeof value === "object") {
    return (
      <pre className="max-h-72 overflow-auto whitespace-pre-wrap rounded-md bg-slate-950 p-4 text-xs leading-6 text-slate-100">
        {JSON.stringify(value, null, 2)}
      </pre>
    );
  }

  return String(value);
}

export function AdminRecordDetails({
  title,
  record,
  extra,
}: {
  title: string;
  record: Record<string, unknown>;
  extra?: ReactNode;
}) {
  return (
    <section className="section-y bg-slate-50">
      <div className="container-page max-w-5xl space-y-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-orange-700">
            Admin
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-950 md:text-4xl">
            {title}
          </h1>
        </div>
        <dl className="grid gap-4 rounded-md border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-2">
          {Object.entries(record).map(([key, value]) => (
            <div key={key} className="min-w-0">
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {key.replace(/_/g, " ")}
              </dt>
              <dd className="mt-2 break-words text-sm leading-7 text-slate-800">
                {formatValue(value)}
              </dd>
            </div>
          ))}
        </dl>
        {extra}
      </div>
    </section>
  );
}
