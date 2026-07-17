import Link from "next/link";
import { AdminStatus } from "@/components/admin/AdminStatus";
import { setProductStatusAction } from "@/lib/admin/product-actions";
import { createCheckedAdminClient } from "@/lib/admin/access";
import type { Locale } from "@/lib/constants";
import { localizedPath } from "@/lib/dictionary";

type PageProps = { params: Promise<{ locale: string }> };

export default async function AdminProductsPage({ params }: PageProps) {
  const { locale } = await params;
  const { supabase, access } = await createCheckedAdminClient();
  const blocked = <AdminStatus locale={locale} configured={access.configured} allowed={access.allowed} />;

  if (blocked) return blocked;

  const { data } = await supabase!
    .from("products")
    .select("id,sku,mpn,title,status,visibility,price,stock_status,updated_at")
    .order("updated_at", { ascending: false })
    .limit(100);

  return (
    <section className="section-y bg-slate-50">
      <div className="container-page space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-orange-700">Admin</p>
            <h1 className="text-3xl font-semibold text-slate-950">Products</h1>
          </div>
          <Link href={localizedPath(locale as Locale, "/admin/products/new")} className="rounded-md bg-orange-600 px-4 py-3 text-sm font-semibold text-white">
            New product
          </Link>
        </div>
        <div className="overflow-x-auto rounded-md border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                {["SKU", "MPN", "Title", "Status", "Stock", "Actions"].map((item) => (
                  <th key={item} className="px-4 py-3 font-semibold">{item}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(data || []).map((product) => (
                <tr key={product.id}>
                  <td className="px-4 py-3">{product.sku}</td>
                  <td className="px-4 py-3">{product.mpn}</td>
                  <td className="px-4 py-3">{product.title}</td>
                  <td className="px-4 py-3">{product.status}</td>
                  <td className="px-4 py-3">{product.stock_status}</td>
                  <td className="flex flex-wrap gap-2 px-4 py-3">
                    <Link href={localizedPath(locale as Locale, `/admin/products/${product.id}`)} className="rounded-md border border-slate-200 px-3 py-2 font-semibold">Edit</Link>
                    {["published", "archived"].map((status) => (
                      <form key={status} action={setProductStatusAction}>
                        <input type="hidden" name="locale" value={locale} />
                        <input type="hidden" name="id" value={product.id} />
                        <input type="hidden" name="status" value={status} />
                        <button className="rounded-md border border-slate-200 px-3 py-2 font-semibold capitalize">{status}</button>
                      </form>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
