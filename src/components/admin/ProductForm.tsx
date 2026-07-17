import { createProductAction, updateProductAction } from "@/lib/admin/product-actions";

type ProductFormProps = {
  locale: string;
  product?: Record<string, unknown>;
  brands?: ProductOption[];
  categories?: ProductOption[];
};

type ProductOption = {
  id: string;
  name: string;
};

function value(product: Record<string, unknown> | undefined, key: string, fallback = "") {
  const item = product?.[key];
  return item === null || item === undefined ? fallback : String(item);
}

function checked(product: Record<string, unknown> | undefined, key: string) {
  return Boolean(product?.[key]);
}

function specificationsValue(product: Record<string, unknown> | undefined) {
  const specifications = product?.specifications;

  if (!specifications || typeof specifications !== "object") {
    return "{}";
  }

  return JSON.stringify(specifications, null, 2);
}

export function ProductForm({
  locale,
  product,
  brands = [],
  categories = [],
}: ProductFormProps) {
  const action = product?.id ? updateProductAction : createProductAction;

  return (
    <form action={action} className="grid gap-8 rounded-md border border-slate-200 bg-white p-6 shadow-sm">
      <input type="hidden" name="locale" value={locale} />
      {product?.id ? <input type="hidden" name="id" value={String(product.id)} /> : null}

      <fieldset className="grid gap-4">
        <legend className="text-lg font-semibold text-slate-950">Identification</legend>
        <div className="grid gap-4 md:grid-cols-2">
          {[
            ["sku", "SKU"],
            ["mpn", "MPN"],
            ["slug", "Slug"],
            ["title", "Title"],
            ["manufacturer_name", "Manufacturer"],
          ].map(([name, label]) => (
            <label key={name} className="grid gap-2 text-sm font-semibold text-slate-700">
              {label}
              <input
                required={["sku", "mpn", "slug", "title"].includes(name)}
                name={name}
                defaultValue={value(product, name)}
                className="h-11 rounded-md border border-slate-200 px-3 font-normal"
              />
            </label>
          ))}
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Brand
            <select name="brand_id" defaultValue={value(product, "brand_id")} className="h-11 rounded-md border border-slate-200 px-3 font-normal">
              <option value="">No brand</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>{brand.name}</option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Category
            <select name="category_id" defaultValue={value(product, "category_id")} className="h-11 rounded-md border border-slate-200 px-3 font-normal">
              <option value="">No category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </label>
        </div>
      </fieldset>

      <fieldset className="grid gap-4">
        <legend className="text-lg font-semibold text-slate-950">Content</legend>
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Short description
          <textarea name="short_description" defaultValue={value(product, "short_description")} rows={2} className="rounded-md border border-slate-200 px-3 py-2 font-normal" />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Description
          <textarea name="description" defaultValue={value(product, "description")} rows={5} className="rounded-md border border-slate-200 px-3 py-2 font-normal" />
        </label>
      </fieldset>

      <fieldset className="grid gap-4">
        <legend className="text-lg font-semibold text-slate-950">Media</legend>
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Product image URL
          <input
            name="primary_image_url"
            type="url"
            placeholder="https://..."
            defaultValue={value(product, "primary_image_url")}
            className="h-11 rounded-md border border-slate-200 px-3 font-normal"
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Image alt text
          <input
            name="primary_image_alt"
            defaultValue={value(product, "primary_image_alt")}
            className="h-11 rounded-md border border-slate-200 px-3 font-normal"
          />
        </label>
      </fieldset>

      <fieldset className="grid gap-4">
        <legend className="text-lg font-semibold text-slate-950">Price and availability</legend>
        <div className="grid gap-4 md:grid-cols-2">
          {[
            ["currency", "Currency", "USD", "text"],
            ["price", "Price", "", "number"],
            ["compare_at_price", "Compare at price", "", "number"],
            ["stock_quantity", "Stock quantity", "", "number"],
            ["minimum_order_quantity", "MOQ", "1", "number"],
            ["lead_time_min_days", "Lead time min days", "", "number"],
            ["lead_time_max_days", "Lead time max days", "", "number"],
          ].map(([name, label, fallback, type]) => (
            <label key={name} className="grid gap-2 text-sm font-semibold text-slate-700">
              {label}
              <input
                name={name}
                type={type}
                min={type === "number" ? "0" : undefined}
                step={type === "number" ? "1" : undefined}
                defaultValue={value(product, name, fallback)}
                className="h-11 rounded-md border border-slate-200 px-3 font-normal"
              />
            </label>
          ))}
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
            <select name="stock_status" defaultValue={value(product, "stock_status", "on_request")} className="h-11 rounded-md border border-slate-200 px-3 font-normal">
              <option value="on_request">On request</option>
              <option value="in_stock">In stock</option>
              <option value="low_stock">Low stock</option>
              <option value="out_of_stock">Out of stock</option>
              <option value="discontinued">Discontinued</option>
              <option value="limited">Limited (legacy)</option>
              <option value="quote">Quote (legacy)</option>
            </select>
          </label>
        </div>
      </fieldset>

      <fieldset className="grid gap-4">
        <legend className="text-lg font-semibold text-slate-950">Technical data</legend>
        <div className="grid gap-4 md:grid-cols-2">
          {[
            ["condition", "Condition"],
            ["packaging", "Packaging"],
            ["country_of_origin", "Country of origin"],
            ["datasheet_url", "Datasheet URL"],
          ].map(([name, label]) => (
            <label key={name} className="grid gap-2 text-sm font-semibold text-slate-700">
              {label}
              <input name={name} defaultValue={value(product, name)} className="h-11 rounded-md border border-slate-200 px-3 font-normal" />
            </label>
          ))}
        </div>
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Specifications JSON
          <textarea name="specifications" defaultValue={specificationsValue(product)} rows={7} className="font-mono rounded-md border border-slate-200 px-3 py-2 text-sm font-normal" />
        </label>
      </fieldset>

      <fieldset className="grid gap-4">
        <legend className="text-lg font-semibold text-slate-950">Publication</legend>
        <div className="grid gap-4 md:grid-cols-2">
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
        <label className="flex min-h-11 items-center gap-3 rounded-md border border-slate-200 px-3 text-sm font-semibold text-slate-700">
          <input type="checkbox" name="featured" defaultChecked={checked(product, "featured")} className="h-4 w-4" />
          Featured product
        </label>
      </div>
      </fieldset>

      <button className="min-h-11 rounded-md bg-orange-600 px-5 py-3 text-sm font-semibold text-white">
        Save product
      </button>
    </form>
  );
}
