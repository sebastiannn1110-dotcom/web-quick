import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";
import { AdminStatus } from "@/components/admin/AdminStatus";
import { createCheckedAdminClient } from "@/lib/admin/access";

type PageProps = { params: Promise<{ locale: string; id: string }> };

export default async function EditProductPage({ params }: PageProps) {
  const { locale, id } = await params;
  const { supabase, access } = await createCheckedAdminClient();
  const blocked = <AdminStatus locale={locale} configured={access.configured} allowed={access.allowed} />;

  if (blocked) return blocked;

  const { data } = await supabase!.from("products").select("*").eq("id", id).maybeSingle();

  if (!data) notFound();

  return (
    <section className="section-y bg-slate-50">
      <div className="container-page max-w-4xl space-y-6">
        <h1 className="text-3xl font-semibold text-slate-950">Edit product</h1>
        <ProductForm locale={locale} product={data} />
      </div>
    </section>
  );
}
