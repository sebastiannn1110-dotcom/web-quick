import { Search } from "lucide-react";

export function CatalogFilters({
  query,
  brand,
  category,
  availability,
  condition,
  sort,
  brands,
  categories,
}: {
  query?: string;
  brand?: string;
  category?: string;
  availability?: string;
  condition?: string;
  sort?: string;
  brands: Array<{ slug: string; name: string }>;
  categories: Array<{ slug: string; name: string }>;
}) {
  return (
    <form className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid gap-3 lg:grid-cols-[1.4fr_repeat(5,1fr)_auto]">
        <label className="relative">
          <span className="sr-only">Search catalog</span>
          <Search
            aria-hidden="true"
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          />
          <input
            name="q"
            defaultValue={query}
            placeholder="Search MPN, SKU, manufacturer"
            className="focus-ring h-12 w-full rounded-md border border-slate-200 pl-10 pr-4 text-sm"
          />
        </label>
        <select
          name="brand"
          defaultValue={brand || ""}
          className="focus-ring h-12 rounded-md border border-slate-200 px-3 text-sm"
          aria-label="Brand"
        >
          <option value="">All brands</option>
          {brands.map((item) => (
            <option key={item.slug} value={item.slug}>
              {item.name}
            </option>
          ))}
        </select>
        <select
          name="category"
          defaultValue={category || ""}
          className="focus-ring h-12 rounded-md border border-slate-200 px-3 text-sm"
          aria-label="Category"
        >
          <option value="">All categories</option>
          {categories.map((item) => (
            <option key={item.slug} value={item.slug}>
              {item.name}
            </option>
          ))}
        </select>
        <select
          name="availability"
          defaultValue={availability || ""}
          className="focus-ring h-12 rounded-md border border-slate-200 px-3 text-sm"
          aria-label="Availability"
        >
          <option value="">Any stock</option>
          <option value="in_stock">In stock</option>
          <option value="limited">Limited</option>
          <option value="quote">Quote</option>
        </select>
        <select
          name="condition"
          defaultValue={condition || ""}
          className="focus-ring h-12 rounded-md border border-slate-200 px-3 text-sm"
          aria-label="Condition"
        >
          <option value="">Any condition</option>
          <option value="new">New</option>
          <option value="refurbished">Refurbished</option>
          <option value="surplus">Surplus</option>
        </select>
        <select
          name="sort"
          defaultValue={sort || "relevance"}
          className="focus-ring h-12 rounded-md border border-slate-200 px-3 text-sm"
          aria-label="Sort"
        >
          <option value="relevance">Relevance</option>
          <option value="alpha">Alphabetical</option>
          <option value="price">Price</option>
        </select>
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
          <button
            type="submit"
            className="focus-ring min-h-12 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white"
          >
            Search
          </button>
          <a
            href="?"
            className="focus-ring flex min-h-12 items-center justify-center rounded-md border border-slate-200 px-4 text-sm font-semibold text-slate-700"
          >
            Clear
          </a>
        </div>
      </div>
    </form>
  );
}

