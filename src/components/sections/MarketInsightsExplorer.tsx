"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";

export function MarketInsightsExplorer({
  categories,
  articles,
  searchLabel,
  filterLabel,
  demoLabel,
  emptyTitle,
  emptyBody,
}: {
  categories: string[];
  articles: Array<{ category: string; title: string; summary: string }>;
  searchLabel: string;
  filterLabel: string;
  demoLabel: string;
  emptyTitle: string;
  emptyBody: string;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const all = categories[0];

  const filtered = useMemo(
    () =>
      articles.filter((article) => {
        const categoryMatch = category === all || article.category === category;
        const searchMatch = `${article.title} ${article.summary} ${article.category}`
          .toLowerCase()
          .includes(query.toLowerCase());
        return categoryMatch && searchMatch;
      }),
    [all, articles, category, query],
  );

  return (
    <div className="space-y-8">
      <div className="grid gap-4 rounded-md border border-slate-200 bg-white p-4 shadow-sm lg:grid-cols-[1fr_280px]">
        <label className="relative">
          <span className="sr-only">{searchLabel}</span>
          <Search
            aria-hidden="true"
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={searchLabel}
            className="focus-ring h-12 w-full rounded-md border border-slate-200 pl-10 pr-4 text-sm"
          />
        </label>
        <label>
          <span className="sr-only">{filterLabel}</span>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="focus-ring h-12 w-full rounded-md border border-slate-200 px-4 text-sm"
          >
            {categories.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
      </div>
      {filtered.length ? (
        <div className="grid gap-5 md:grid-cols-3">
          {filtered.map((article) => (
            <article
              key={article.title}
              className="rounded-md border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <span className="rounded-md bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-800">
                  {article.category}
                </span>
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">
                  {demoLabel}
                </span>
              </div>
              <h2 className="text-xl font-semibold text-slate-950">
                {article.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                {article.summary}
              </p>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-md border border-dashed border-slate-300 bg-white p-8 text-center">
          <h2 className="text-xl font-semibold text-slate-950">
            {emptyTitle}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-600">
            {emptyBody}
          </p>
        </div>
      )}
    </div>
  );
}
