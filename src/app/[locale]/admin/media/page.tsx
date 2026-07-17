import { AdminStatus } from "@/components/admin/AdminStatus";
import { StatusPanel } from "@/components/catalog/StatusPanel";
import { createCheckedAdminClient } from "@/lib/admin/access";

type PageProps = { params: Promise<{ locale: string }> };

export default async function AdminMediaPage({ params }: PageProps) {
  const { locale } = await params;
  const { access } = await createCheckedAdminClient();
  const blocked = <AdminStatus locale={locale} configured={access.configured} allowed={access.allowed} />;

  if (blocked) return blocked;

  return (
    <section className="section-y bg-slate-50">
      <div className="container-page space-y-6">
        <h1 className="text-3xl font-semibold text-slate-950">Media</h1>
        <StatusPanel title="Media uploads require storage policy wiring" body="Use this protected area after Supabase Storage buckets and file validation policies are provisioned." />
      </div>
    </section>
  );
}
