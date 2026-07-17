import { notFound } from "next/navigation";
import { AdminRecordDetails } from "@/components/admin/AdminRecordDetails";
import { AdminStatus } from "@/components/admin/AdminStatus";
import { AdminTable } from "@/components/admin/AdminTable";
import { createCheckedAdminClient } from "@/lib/admin/access";

type PageProps = { params: Promise<{ locale: string; id: string }> };

export default async function AdminOrderDetailPage({ params }: PageProps) {
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

  const [{ data: order }, { data: items }] = await Promise.all([
    supabase!.from("orders").select("*").eq("id", id).maybeSingle(),
    supabase!.from("order_items").select("*").eq("order_id", id).order("created_at", { ascending: true }),
  ]);

  if (!order) notFound();

  return (
    <AdminRecordDetails
      title={`Order ${order.order_number || order.id}`}
      record={order}
      extra={
        <div className="space-y-3">
          <h2 className="text-2xl font-semibold text-slate-950">Order items</h2>
          <AdminTable
            columns={["sku_snapshot", "mpn_snapshot", "title_snapshot", "quantity", "unit_price_snapshot"]}
            rows={items || []}
          />
        </div>
      }
    />
  );
}
