import { AdminStatus } from "@/components/admin/AdminStatus";
import { AdminTable } from "@/components/admin/AdminTable";
import { createCheckedAdminClient } from "@/lib/admin/access";

type PageProps = { params: Promise<{ locale: string }> };

export default async function AdminRfqsPage({ params }: PageProps) {
  const { locale } = await params;
  const { supabase, access } = await createCheckedAdminClient();
  const blocked = <AdminStatus locale={locale} configured={access.configured} allowed={access.allowed} />;

  if (blocked) return blocked;

  const columns = ["created_at", "company_name", "contact_name", "email", "country", "status", "notification_status"];
  const { data } = await supabase!.from("rfq_requests").select(["id", ...columns].join(",")).order("created_at", { ascending: false }).limit(100);

  return (
    <section className="section-y bg-slate-50">
      <div className="container-page space-y-6">
        <h1 className="text-3xl font-semibold text-slate-950">RFQs</h1>
        <AdminTable columns={columns} rows={data || []} locale={locale} rowHrefBase="/admin/rfqs" />
      </div>
    </section>
  );
}
