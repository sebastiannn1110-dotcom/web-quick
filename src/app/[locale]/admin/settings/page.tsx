import { AdminStatus } from "@/components/admin/AdminStatus";
import { StatusPanel } from "@/components/catalog/StatusPanel";
import { createCheckedAdminClient } from "@/lib/admin/access";

type PageProps = { params: Promise<{ locale: string }> };

export default async function AdminSettingsPage({ params }: PageProps) {
  const { locale } = await params;
  const { access } = await createCheckedAdminClient();
  const blocked = <AdminStatus locale={locale} configured={access.configured} allowed={access.allowed} />;

  if (blocked) return blocked;

  return (
    <section className="section-y bg-slate-50">
      <div className="container-page space-y-6">
        <h1 className="text-3xl font-semibold text-slate-950">Settings</h1>
        <StatusPanel title="Operational settings are server-managed" body="Secrets remain in Render or server environment variables. They are never shown in this UI." />
      </div>
    </section>
  );
}
