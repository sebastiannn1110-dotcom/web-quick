import { ProductForm } from "@/components/admin/ProductForm";
import { AdminStatus } from "@/components/admin/AdminStatus";
import { createCheckedAdminClient } from "@/lib/admin/access";

type PageProps = { params: Promise<{ locale: string }> };

export default async function NewProductPage({ params }: PageProps) {
  const { locale } = await params;
  const { access } = await createCheckedAdminClient();
  const blocked = <AdminStatus locale={locale} configured={access.configured} allowed={access.allowed} />;

  if (blocked) return blocked;

  return (
    <section className="section-y bg-slate-50">
      <div className="container-page max-w-4xl space-y-6">
        <h1 className="text-3xl font-semibold text-slate-950">New product</h1>
        <ProductForm locale={locale} />
      </div>
    </section>
  );
}
