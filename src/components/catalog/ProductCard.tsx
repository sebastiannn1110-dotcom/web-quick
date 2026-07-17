import Image from "next/image";
import { BarChart3, Heart, ShoppingCart } from "lucide-react";
import type { Locale } from "@/lib/constants";
import { localizedPath } from "@/lib/dictionary";
import type { CatalogProduct } from "@/lib/catalog/types";
import { ButtonLink } from "@/components/ui/ButtonLink";

function priceLabel(product: CatalogProduct) {
  if (product.price_visibility === "quote_only" || product.price == null) {
    return "Request quote";
  }

  if (product.price_visibility === "authenticated") {
    return "Sign in for price";
  }

  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: product.currency || "USD",
  }).format(product.price);
}

export function ProductCard({
  product,
  locale,
}: {
  product: CatalogProduct;
  locale: Locale;
}) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
      <div className="relative aspect-[4/3] bg-slate-100">
        {product.primary_image_url ? (
          <Image
            src={product.primary_image_url}
            alt={product.primary_image_alt || product.title}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center px-6 text-center text-sm font-semibold text-slate-500">
            Product media pending
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-700">
              {product.brand_name || product.manufacturer_name || "Quicksol"}
            </p>
            <h2 className="mt-2 text-lg font-semibold text-slate-950">
              {product.title}
            </h2>
          </div>
          {product.featured ? (
            <span className="rounded-md bg-orange-50 px-2 py-1 text-xs font-semibold text-orange-700">
              Featured
            </span>
          ) : null}
        </div>
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
          {product.short_description || "Technical details available on request."}
        </p>
        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-slate-500">MPN</dt>
            <dd className="font-semibold text-slate-950">{product.mpn}</dd>
          </div>
          <div>
            <dt className="text-slate-500">SKU</dt>
            <dd className="font-semibold text-slate-950">{product.sku}</dd>
          </div>
          <div>
            <dt className="text-slate-500">MOQ</dt>
            <dd className="font-semibold text-slate-950">
              {product.minimum_order_quantity || "RFQ"}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Stock</dt>
            <dd className="font-semibold text-slate-950">
              {product.stock_status || "Verify"}
            </dd>
          </div>
        </dl>
        <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <p className="font-semibold text-slate-950">{priceLabel(product)}</p>
          <div className="flex gap-2">
            <button
              type="button"
              className="focus-ring flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 text-slate-700"
              aria-label="Save favorite"
            >
              <Heart aria-hidden="true" className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="focus-ring flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 text-slate-700"
              aria-label="Compare product"
            >
              <BarChart3 aria-hidden="true" className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <ButtonLink
            href={localizedPath(locale, `/products/${product.slug}`)}
            variant="secondary"
          >
            View
          </ButtonLink>
          <ButtonLink
            href={localizedPath(locale, `/cart?product=${product.slug}`)}
            icon={<ShoppingCart aria-hidden="true" className="h-4 w-4" />}
          >
            Add
          </ButtonLink>
        </div>
      </div>
    </article>
  );
}

