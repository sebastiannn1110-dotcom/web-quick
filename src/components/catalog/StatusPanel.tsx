import { AlertTriangle, Database, LockKeyhole } from "lucide-react";

const icons = {
  setup: Database,
  error: AlertTriangle,
  protected: LockKeyhole,
};

export function StatusPanel({
  title,
  body,
  tone = "setup",
}: {
  title: string;
  body: string;
  tone?: keyof typeof icons;
}) {
  const Icon = icons[tone];

  return (
    <div className="rounded-md border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-cyan-50 text-cyan-800">
        <Icon aria-hidden="true" className="h-6 w-6" />
      </div>
      <h2 className="mt-4 text-2xl font-semibold text-slate-950">{title}</h2>
      <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-600">
        {body}
      </p>
    </div>
  );
}

