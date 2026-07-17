import { AdminStatus } from "@/components/admin/AdminStatus";
import { AdminTable } from "@/components/admin/AdminTable";
import { createCheckedAdminClient } from "@/lib/admin/access";

type PageProps = { params: Promise<{ locale: string }> };

export default async function AdminBrandsPage({ params }: PageProps) {
  const { locale } = await params;
  const { supabase, access } = await createCheckedAdminClient();
  if (!access.configured || !access.allowed) {
    return (
      <AdminStatus
        locale={locale}
        configured={access.configured}
        allowed={access.allowed}
      />
    );
  }

  const columns = ["slug", "name", "status", "website_url", "updated_at"];
  const { data } = await supabase!.from("brands").select(columns.join(",")).order("name", { ascending: true }).limit(100);

  return (
    <section className="section-y bg-slate-50">
      <div className="container-page space-y-6">
        <h1 className="text-3xl font-semibold text-slate-950">Brands</h1>
        <AdminTable columns={columns} rows={data || []} />
      </div>
    </section>
  );
}
