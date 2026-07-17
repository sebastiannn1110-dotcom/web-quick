import Link from "next/link";
import { AdminStatus } from "@/components/admin/AdminStatus";
import { setProductStatusAction } from "@/lib/admin/product-actions";
import { createCheckedAdminClient } from "@/lib/admin/access";
import type { Locale } from "@/lib/constants";
import { localizedPath } from "@/lib/dictionary";

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function value(params: Record<string, string | string[] | undefined>, key: string) {
  const item = params[key];
  return Array.isArray(item) ? item[0] : item;
}

export default async function AdminProductsPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const queryParams = await searchParams;
  const q = value(queryParams, "q")?.trim() || "";
  const safeQ = q.replace(/[%,]/g, "");
  const status = value(queryParams, "status")?.trim() || "";
  const { supabase, access } = await createCheckedAdminClient();
  const blocked = <AdminStatus locale={locale} configured={access.configured} allowed={access.allowed} />;

  if (blocked) return blocked;

  let query = supabase!
    .from("products")
    .select("id,sku,mpn,title,status,visibility,price,stock_status,embedding_status,updated_at");

  if (safeQ) {
    query = query.or(`sku.ilike.%${safeQ}%,mpn.ilike.%${safeQ}%,title.ilike.%${safeQ}%,manufacturer_name.ilike.%${safeQ}%`);
  }

  if (["draft", "published", "archived"].includes(status)) {
    query = query.eq("status", status);
  }

  const { data } = await query.order("updated_at", { ascending: false }).limit(100);

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
        <form className="grid gap-3 rounded-md border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_220px_auto]">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search SKU, MPN, title or manufacturer"
            className="min-h-11 rounded-md border border-slate-200 px-3 text-sm"
          />
          <select name="status" defaultValue={status} className="min-h-11 rounded-md border border-slate-200 px-3 text-sm">
            <option value="">All statuses</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
          <button className="rounded-md bg-slate-950 px-4 py-3 text-sm font-semibold text-white">
            Filter
          </button>
        </form>
        <div className="overflow-x-auto rounded-md border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                {["SKU", "MPN", "Title", "Status", "Stock", "AI", "Updated", "Actions"].map((item) => (
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
                  <td className="px-4 py-3">{product.embedding_status || "pending"}</td>
                  <td className="px-4 py-3">{product.updated_at ? new Date(product.updated_at).toLocaleDateString("en-US") : "-"}</td>
                  <td className="flex flex-wrap gap-2 px-4 py-3">
                    <Link href={localizedPath(locale as Locale, `/admin/products/${product.id}`)} className="rounded-md border border-slate-200 px-3 py-2 font-semibold">Edit</Link>
                    {["draft", "published", "archived"].map((nextStatus) => (
                      <form key={nextStatus} action={setProductStatusAction}>
                        <input type="hidden" name="locale" value={locale} />
                        <input type="hidden" name="id" value={product.id} />
                        <input type="hidden" name="status" value={nextStatus} />
                        <button className="rounded-md border border-slate-200 px-3 py-2 font-semibold capitalize">{nextStatus}</button>
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
