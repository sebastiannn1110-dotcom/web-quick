"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createCheckedAdminClient } from "./access";

const optionalNumber = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? Number(value) : null))
  .pipe(z.number().finite().nonnegative().nullable());

const productSchema = z.object({
  sku: z.string().trim().min(2).max(120),
  mpn: z.string().trim().min(2).max(160),
  slug: z.string().trim().min(2).max(180),
  title: z.string().trim().min(2).max(240),
  short_description: z.string().trim().max(500).optional(),
  description: z.string().trim().max(4000).optional(),
  manufacturer_name: z.string().trim().max(180).optional(),
  status: z.enum(["draft", "published", "archived"]),
  visibility: z.enum(["public", "authenticated"]),
  currency: z.string().trim().min(3).max(3),
  price: optionalNumber,
  price_visibility: z.enum(["public", "authenticated", "quote_only"]),
  stock_quantity: optionalNumber,
  stock_status: z.enum(["in_stock", "limited", "out_of_stock", "quote"]),
  minimum_order_quantity: optionalNumber,
});

function formValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function productPayload(formData: FormData) {
  const parsed = productSchema.parse({
    sku: formValue(formData, "sku"),
    mpn: formValue(formData, "mpn"),
    slug: formValue(formData, "slug"),
    title: formValue(formData, "title"),
    short_description: formValue(formData, "short_description"),
    description: formValue(formData, "description"),
    manufacturer_name: formValue(formData, "manufacturer_name"),
    status: formValue(formData, "status") || "draft",
    visibility: formValue(formData, "visibility") || "public",
    currency: formValue(formData, "currency") || "USD",
    price: formValue(formData, "price"),
    price_visibility: formValue(formData, "price_visibility") || "quote_only",
    stock_quantity: formValue(formData, "stock_quantity"),
    stock_status: formValue(formData, "stock_status") || "quote",
    minimum_order_quantity: formValue(formData, "minimum_order_quantity") || "1",
  });

  return {
    ...parsed,
    stock_quantity: parsed.stock_quantity === null ? null : Math.trunc(parsed.stock_quantity),
    minimum_order_quantity:
      parsed.minimum_order_quantity === null
        ? 1
        : Math.max(1, Math.trunc(parsed.minimum_order_quantity)),
    published_at: parsed.status === "published" ? new Date().toISOString() : null,
  };
}

export async function createProductAction(formData: FormData) {
  const locale = formValue(formData, "locale") || "en";
  const { supabase } = await createCheckedAdminClient();

  if (!supabase) {
    redirect(`/${locale}/admin/products?error=protected`);
  }

  const { error } = await supabase.from("products").insert(productPayload(formData));

  if (error) {
    redirect(`/${locale}/admin/products/new?error=save_failed`);
  }

  revalidatePath(`/${locale}/catalog`);
  redirect(`/${locale}/admin/products`);
}

export async function updateProductAction(formData: FormData) {
  const id = formValue(formData, "id");
  const locale = formValue(formData, "locale") || "en";
  const { supabase } = await createCheckedAdminClient();

  if (!supabase || !id) {
    redirect(`/${locale}/admin/products?error=protected`);
  }

  const { error } = await supabase
    .from("products")
    .update(productPayload(formData))
    .eq("id", id);

  if (error) {
    redirect(`/${locale}/admin/products/${id}?error=save_failed`);
  }

  revalidatePath(`/${locale}/catalog`);
  redirect(`/${locale}/admin/products`);
}

export async function setProductStatusAction(formData: FormData) {
  const id = formValue(formData, "id");
  const locale = formValue(formData, "locale") || "en";
  const status = formValue(formData, "status");
  const { supabase } = await createCheckedAdminClient();

  if (!supabase || !id || !["draft", "published", "archived"].includes(status)) {
    redirect(`/${locale}/admin/products?error=protected`);
  }

  const { error } = await supabase
    .from("products")
    .update({
      status,
      published_at: status === "published" ? new Date().toISOString() : null,
    })
    .eq("id", id);

  if (error) {
    redirect(`/${locale}/admin/products?error=save_failed`);
  }

  revalidatePath(`/${locale}/catalog`);
  redirect(`/${locale}/admin/products`);
}
