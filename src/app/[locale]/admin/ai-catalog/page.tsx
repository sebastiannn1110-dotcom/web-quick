import type { SupabaseClient } from "@supabase/supabase-js";
import { AdminStatus } from "@/components/admin/AdminStatus";
import { StatusPanel } from "@/components/catalog/StatusPanel";
import { searchProductsForAssistant } from "@/lib/ai/catalog-tools";
import { createCheckedAdminClient } from "@/lib/admin/access";
import type { Locale } from "@/lib/constants";

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

type CountFilter = {
  column: string;
  value: string | boolean | null;
  op?: "eq" | "is";
};

async function countRows(
  supabase: SupabaseClient,
  table: string,
  filters: CountFilter[] = [],
) {
  let query = supabase.from(table).select("id", { count: "exact", head: true });

  for (const filter of filters) {
    query =
      filter.op === "is"
        ? query.is(filter.column, filter.value)
        : query.eq(filter.column, filter.value);
  }

  const { count, error } = await query;

  return { count: error ? 0 : count || 0, error };
}

function value(params: Record<string, string | string[] | undefined>, key: string) {
  const item = params[key];
  return Array.isArray(item) ? item[0] : item;
}

export default async function AdminAiCatalogPage({
  params,
  searchParams,
}: PageProps) {
  const { locale } = await params;
  const queryParams = await searchParams;
  const q = value(queryParams, "q")?.trim() || "";
  const { supabase, access } = await createCheckedAdminClient();
  const blocked = <AdminStatus locale={locale} configured={access.configured} allowed={access.allowed} />;

  if (blocked) return blocked;

  const [
    total,
    published,
    pending,
    ready,
    failed,
    noDescription,
    noImage,
  ] = await Promise.all([
    countRows(supabase!, "products"),
    countRows(supabase!, "products", [{ column: "status", value: "published" }]),
    countRows(supabase!, "products", [{ column: "embedding_status", value: "pending" }]),
    countRows(supabase!, "products", [{ column: "embedding_status", value: "ready" }]),
    countRows(supabase!, "products", [{ column: "embedding_status", value: "failed" }]),
    countRows(supabase!, "products", [{ column: "description", value: null, op: "is" }]),
    countRows(supabase!, "product_images", [{ column: "is_primary", value: true }]),
  ]);

  const testResults = q
    ? await searchProductsForAssistant({ query: q, limit: 8 }, locale as Locale)
    : null;

  const stats = [
    ["Products", total.count],
    ["Published", published.count],
    ["Embeddings pending", pending.count],
    ["Embeddings ready", ready.count],
    ["Embeddings failed", failed.count],
    ["Without description", noDescription.count],
    ["Primary images", noImage.count],
  ];

  return (
    <section className="section-y bg-slate-50">
      <div className="container-page space-y-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-orange-700">
            Admin
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-950 md:text-5xl">
            AI catalog diagnostics
          </h1>
          <p className="mt-4 text-base leading-8 text-slate-600">
            Test the same server-side product search used by Compra con IA. API keys
            and service role values are never shown here.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map(([label, count]) => (
            <article key={label} className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">{label}</p>
              <p className="mt-2 text-3xl font-semibold text-slate-950">{count}</p>
            </article>
          ))}
        </div>

        <div className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-950">Search as customer</h2>
          <form className="mt-4 flex flex-col gap-3 sm:flex-row">
            <input
              name="q"
              defaultValue={q}
              placeholder="MPN, SKU, manufacturer or need"
              className="min-h-12 min-w-0 flex-1 rounded-md border border-slate-200 px-3"
            />
            <button className="min-h-12 rounded-md bg-orange-600 px-5 text-sm font-semibold text-white">
              Test search
            </button>
          </form>
        </div>

        {testResults ? (
          testResults.products.length ? (
            <div className="grid gap-3">
              {testResults.products.map((product) => (
                <article key={product.id} className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-orange-700">{product.brand || "Quicksol"}</p>
                      <h2 className="mt-1 text-xl font-semibold text-slate-950">{product.title}</h2>
                      <p className="mt-2 text-sm text-slate-600">
                        MPN {product.mpn} · SKU {product.sku} · {product.stock_status || "on_request"}
                      </p>
                    </div>
                    <p className="rounded-md bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">
                      {product.price_visible ? `${product.currency} ${product.price}` : "Quote only"}
                    </p>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{product.reason}</p>
                </article>
              ))}
            </div>
          ) : (
            <StatusPanel
              title="No published products matched"
              body="The public assistant must not invent products. It can prepare an RFQ for unavailable references after explicit confirmation."
            />
          )
        ) : null}
      </div>
    </section>
  );
}
