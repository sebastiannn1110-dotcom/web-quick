import { createProductAction, updateProductAction } from "@/lib/admin/product-actions";

type ProductFormProps = {
  locale: string;
  product?: Record<string, unknown>;
};

function value(product: Record<string, unknown> | undefined, key: string, fallback = "") {
  const item = product?.[key];
  return item === null || item === undefined ? fallback : String(item);
}

export function ProductForm({ locale, product }: ProductFormProps) {
  const action = product?.id ? updateProductAction : createProductAction;

  return (
    <form action={action} className="grid gap-4 rounded-md border border-slate-200 bg-white p-6 shadow-sm">
      <input type="hidden" name="locale" value={locale} />
      {product?.id ? <input type="hidden" name="id" value={String(product.id)} /> : null}
      <div className="grid gap-4 md:grid-cols-2">
        {[
          ["sku", "SKU"],
          ["mpn", "MPN"],
          ["slug", "Slug"],
          ["title", "Title"],
          ["manufacturer_name", "Manufacturer"],
          ["currency", "Currency"],
          ["price", "Price"],
          ["stock_quantity", "Stock quantity"],
          ["minimum_order_quantity", "MOQ"],
        ].map(([name, label]) => (
          <label key={name} className="grid gap-2 text-sm font-semibold text-slate-700">
            {label}
            <input
              required={["sku", "mpn", "slug", "title"].includes(name)}
              name={name}
              defaultValue={value(product, name, name === "currency" ? "USD" : name === "minimum_order_quantity" ? "1" : "")}
              className="h-11 rounded-md border border-slate-200 px-3 font-normal"
            />
          </label>
        ))}
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Status
          <select name="status" defaultValue={value(product, "status", "draft")} className="h-11 rounded-md border border-slate-200 px-3 font-normal">
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Visibility
          <select name="visibility" defaultValue={value(product, "visibility", "public")} className="h-11 rounded-md border border-slate-200 px-3 font-normal">
            <option value="public">Public</option>
            <option value="authenticated">Authenticated</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Price visibility
          <select name="price_visibility" defaultValue={value(product, "price_visibility", "quote_only")} className="h-11 rounded-md border border-slate-200 px-3 font-normal">
            <option value="quote_only">Quote only</option>
            <option value="public">Public</option>
            <option value="authenticated">Authenticated</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Stock status
          <select name="stock_status" defaultValue={value(product, "stock_status", "quote")} className="h-11 rounded-md border border-slate-200 px-3 font-normal">
            <option value="quote">Quote</option>
            <option value="in_stock">In stock</option>
            <option value="limited">Limited</option>
            <option value="out_of_stock">Out of stock</option>
          </select>
        </label>
      </div>
      <label className="grid gap-2 text-sm font-semibold text-slate-700">
        Short description
        <textarea name="short_description" defaultValue={value(product, "short_description")} rows={2} className="rounded-md border border-slate-200 px-3 py-2 font-normal" />
      </label>
      <label className="grid gap-2 text-sm font-semibold text-slate-700">
        Description
        <textarea name="description" defaultValue={value(product, "description")} rows={5} className="rounded-md border border-slate-200 px-3 py-2 font-normal" />
      </label>
      <button className="min-h-11 rounded-md bg-orange-600 px-5 py-3 text-sm font-semibold text-white">
        Save product
      </button>
    </form>
  );
}
