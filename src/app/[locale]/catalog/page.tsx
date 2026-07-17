import type { Metadata } from "next";
import { CatalogFilters } from "@/components/catalog/CatalogFilters";
import { ProductCard } from "@/components/catalog/ProductCard";
import { StatusPanel } from "@/components/catalog/StatusPanel";
import { PageHero } from "@/components/sections/PageHero";
import { locales, type Locale } from "@/lib/constants";
import { getCatalogFacets, searchCatalogProducts } from "@/lib/catalog/search";
import { getDictionary, isLocale } from "@/lib/dictionary";
import { createPageMetadata } from "@/lib/seo";

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function value(params: Record<string, string | string[] | undefined>, key: string) {
  const item = params[key];
  return Array.isArray(item) ? item[0] : item;
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : "en";

  return createPageMetadata({
    locale,
    path: "/catalog",
    title: "Quicksol Global Catalog",
    description:
      "Search published electronic components by MPN, SKU, brand, category and availability.",
  });
}

export default async function CatalogPage({ params, searchParams }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = (isLocale(rawLocale) ? rawLocale : "en") as Locale;
  const dict = getDictionary(locale);
  const queryParams = await searchParams;
  const page = Number(value(queryParams, "page") || "1");
  const filters = {
    locale,
    query: value(queryParams, "q"),
    brand: value(queryParams, "brand"),
    category: value(queryParams, "category"),
    availability: value(queryParams, "availability"),
    condition: value(queryParams, "condition"),
    sort: value(queryParams, "sort"),
    page: Number.isFinite(page) ? page : 1,
  };
  const [result, facets] = await Promise.all([
    searchCatalogProducts(filters),
    getCatalogFacets(),
  ]);

  return (
    <>
      <PageHero
        eyebrow={dict.common.nav.brands}
        title="Catalog of electronic components"
        body="Search public Quicksol inventory and request quotes for exact or related components. Private prices remain hidden until authentication and authorization are active."
        locale={locale}
        primaryLabel={dict.common.cta.submitRfq}
        secondaryLabel={dict.common.cta.contact}
      />
      <section className="section-y bg-slate-50">
        <div className="container-page space-y-8">
          <CatalogFilters
            query={filters.query}
            brand={filters.brand}
            category={filters.category}
            availability={filters.availability}
            condition={filters.condition}
            sort={filters.sort}
            brands={facets.brands}
            categories={facets.categories}
          />

          {!result.configured ? (
            <StatusPanel
              title="Supabase catalog is not configured"
              body="Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Render to read published products. No demo products are shown in production."
            />
          ) : result.error ? (
            <StatusPanel
              tone="error"
              title="Catalog could not be loaded"
              body={result.error}
            />
          ) : result.products.length ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {result.products.map((product) => (
                <ProductCard key={product.id} product={product} locale={locale} />
              ))}
            </div>
          ) : (
            <StatusPanel
              title="No published products match this search"
              body="Try clearing filters or submit an RFQ for the exact manufacturer part number."
            />
          )}
        </div>
      </section>
    </>
  );
}

