import { notFound } from "next/navigation";
import { AdminRecordDetails } from "@/components/admin/AdminRecordDetails";
import { AdminStatus } from "@/components/admin/AdminStatus";
import { createCheckedAdminClient } from "@/lib/admin/access";

type PageProps = { params: Promise<{ locale: string; id: string }> };

export default async function AdminContactDetailPage({ params }: PageProps) {
  const { locale, id } = await params;
  const { supabase, access } = await createCheckedAdminClient();
  const blocked = <AdminStatus locale={locale} configured={access.configured} allowed={access.allowed} />;

  if (blocked) return blocked;

  const { data } = await supabase!
    .from("contact_requests")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!data) notFound();

  return <AdminRecordDetails title={`Contact ${data.name || data.id}`} record={data} />;
}
