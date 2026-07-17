import "server-only";

import { z } from "zod";
import { searchCatalogProducts } from "@/lib/catalog/search";
import type { Locale } from "@/lib/constants";

export const searchProductsToolSchema = z.object({
  query: z.string().trim().max(200).optional(),
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
  const result = await searchCatalogProducts({
    locale,
    query: parsed.query || parsed.manufacturer,
    brand: parsed.brand,
    category: parsed.category,
    condition: parsed.condition,
    availability: parsed.availability,
  });

  return {
    configured: result.configured,
    products: result.products.slice(0, parsed.limit).map((product) => ({
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

