import "server-only";

import { z } from "zod";
import { searchCatalogProducts } from "@/lib/catalog/search";
import type { Locale } from "@/lib/constants";

export const searchProductsToolSchema = z.object({
  query: z.string().trim().max(200).optional(),
  sku: z.string().trim().max(120).optional(),
  mpn: z.string().trim().max(160).optional(),
  brand: z.string().trim().max(120).optional(),
  category: z.string().trim().max(120).optional(),
  manufacturer: z.string().trim().max(120).optional(),
  condition: z.string().trim().max(80).optional(),
  availability: z.string().trim().max(80).optional(),
  min_price: z.number().nonnegative().optional(),
  max_price: z.number().nonnegative().optional(),
  limit: z.number().int().positive().max(12).default(5),
});

export async function searchProductsForAssistant(
  input: unknown,
  locale: Locale,
) {
  const parsed = searchProductsToolSchema.parse(input);
  const referenceQuery = parsed.sku || parsed.mpn || parsed.query || parsed.manufacturer;
  const normalizedSku = parsed.sku ? normalizeComparableReference(parsed.sku) : null;
  const normalizedMpn = parsed.mpn ? normalizeComparableReference(parsed.mpn) : null;
  const normalizedQuery = parsed.query ? normalizeComparableReference(parsed.query) : null;
  const result = await searchCatalogProducts({
    locale,
    query: referenceQuery,
    brand: parsed.brand,
    category: parsed.category,
    condition: parsed.condition,
    availability: parsed.availability,
  });
  const sortedProducts = [...result.products].sort((a, b) => {
    const score = (product: (typeof result.products)[number]) => {
      const sku = normalizeComparableReference(product.sku);
      const mpn = normalizeComparableReference(product.mpn);

      if (normalizedSku && sku === normalizedSku) return 0;
      if (normalizedMpn && mpn === normalizedMpn) return 1;
      if (normalizedQuery && (sku === normalizedQuery || mpn === normalizedQuery)) return 2;
      if (normalizedQuery && (sku.includes(normalizedQuery) || mpn.includes(normalizedQuery))) return 3;
      return 4;
    };

    return score(a) - score(b);
  });

  return {
    configured: result.configured,
    products: sortedProducts.slice(0, parsed.limit).map((product) => ({
      id: product.id,
      title: product.title,
      sku: product.sku,
      mpn: product.mpn,
      brand: product.brand_name,
      url: `/${locale}/products/${product.slug}`,
      stock_status: product.stock_status,
      price_visible: product.price_visibility === "public",
      price:
        product.price_visibility === "public" ? product.price : undefined,
      currency:
        product.price_visibility === "public" ? product.currency : undefined,
      reason: "Published catalog record matched the server-side search.",
    })),
  };
}

function normalizeComparableReference(value: string) {
  return value
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}
