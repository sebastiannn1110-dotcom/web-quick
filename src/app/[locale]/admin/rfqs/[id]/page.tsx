import { notFound } from "next/navigation";
import { AdminRecordDetails } from "@/components/admin/AdminRecordDetails";
import { AdminStatus } from "@/components/admin/AdminStatus";
import { AdminTable } from "@/components/admin/AdminTable";
import { createCheckedAdminClient } from "@/lib/admin/access";

type PageProps = { params: Promise<{ locale: string; id: string }> };

export default async function AdminRfqDetailPage({ params }: PageProps) {
  const { locale, id } = await params;
  const { supabase, access } = await createCheckedAdminClient();
  const blocked = <AdminStatus locale={locale} configured={access.configured} allowed={access.allowed} />;

  if (blocked) return blocked;

  const [{ data: rfq }, { data: items }] = await Promise.all([
    supabase!.from("rfq_requests").select("*").eq("id", id).maybeSingle(),
    supabase!.from("rfq_items").select("*").eq("rfq_id", id).order("created_at", { ascending: true }),
  ]);

  if (!rfq) notFound();

  return (
    <AdminRecordDetails
      title={`RFQ ${rfq.company_name || rfq.id}`}
      record={rfq}
      extra={
        <div className="space-y-3">
          <h2 className="text-2xl font-semibold text-slate-950">Requested products</h2>
          <AdminTable
            columns={["requested_mpn", "quantity", "target_price", "required_date", "notes"]}
            rows={items || []}
          />
        </div>
      }
    />
  );
}
