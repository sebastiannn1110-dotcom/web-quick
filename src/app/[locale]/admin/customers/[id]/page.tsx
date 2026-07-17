import { notFound } from "next/navigation";
import { AdminRecordDetails } from "@/components/admin/AdminRecordDetails";
import { AdminStatus } from "@/components/admin/AdminStatus";
import { AdminTable } from "@/components/admin/AdminTable";
import { createCheckedAdminClient } from "@/lib/admin/access";

type PageProps = { params: Promise<{ locale: string; id: string }> };

export default async function AdminCustomerDetailPage({ params }: PageProps) {
  const { locale, id } = await params;
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

  const [{ data: customer }, { data: rfqs }, { data: orders }] = await Promise.all([
    supabase!.from("profiles").select("*").eq("id", id).maybeSingle(),
    supabase!.from("rfq_requests").select("id,created_at,company_name,status,currency").eq("user_id", id).order("created_at", { ascending: false }).limit(20),
    supabase!.from("orders").select("id,created_at,status,total_amount,currency").eq("user_id", id).order("created_at", { ascending: false }).limit(20),
  ]);

  if (!customer) notFound();

  return (
    <AdminRecordDetails
      title={`Customer ${customer.email || customer.id}`}
      record={customer}
      extra={
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-3">
            <h2 className="text-2xl font-semibold text-slate-950">RFQs</h2>
            <AdminTable columns={["created_at", "company_name", "status", "currency"]} rows={rfqs || []} locale={locale} rowHrefBase="/admin/rfqs" />
          </div>
          <div className="space-y-3">
            <h2 className="text-2xl font-semibold text-slate-950">Orders</h2>
            <AdminTable columns={["created_at", "status", "total_amount", "currency"]} rows={orders || []} locale={locale} rowHrefBase="/admin/orders" />
          </div>
        </div>
      }
    />
  );
}
