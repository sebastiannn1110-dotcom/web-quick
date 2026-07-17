import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";
import { AdminStatus } from "@/components/admin/AdminStatus";
import { createCheckedAdminClient } from "@/lib/admin/access";

type PageProps = { params: Promise<{ locale: string; id: string }> };

export default async function EditProductPage({ params }: PageProps) {
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

  const [{ data }, { data: brands }, { data: categories }] = await Promise.all([
    supabase!.from("products").select("*").eq("id", id).maybeSingle(),
    supabase!.from("brands").select("id,name").order("name", { ascending: true }),
    supabase!.from("categories").select("id,name").order("sort_order", { ascending: true }),
  ]);

  if (!data) notFound();

  return (
    <section className="section-y bg-slate-50">
      <div className="container-page max-w-4xl space-y-6">
        <h1 className="text-3xl font-semibold text-slate-950">Edit product</h1>
        <ProductForm locale={locale} product={data} brands={brands || []} categories={categories || []} />
      </div>
    </section>
  );
}
