"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";

const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export function BrandExplorer({
  categories,
  searchLabel,
  letterLabel,
  cta,
}: {
  categories: string[];
  searchLabel: string;
  letterLabel: string;
  cta: string;
}) {
  const [query, setQuery] = useState("");
  const [letter, setLetter] = useState("");

  const filtered = useMemo(
    () =>
      categories.filter((item) => {
        const searchMatch = item.toLowerCase().includes(query.toLowerCase());
        const letterMatch =
          !letter || item.toLocaleUpperCase().startsWith(letter);
        return searchMatch && letterMatch;
      }),
    [categories, letter, query],
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 rounded-md border border-slate-200 bg-white p-4 shadow-sm lg:grid-cols-[1fr_auto]">
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
        <div aria-label={letterLabel} className="flex flex-wrap gap-1">
          <button
            type="button"
            onClick={() => setLetter("")}
            className={`focus-ring h-9 rounded-md px-3 text-xs font-semibold ${
              !letter ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-700"
            }`}
          >
            *
          </button>
          {letters.map((item) => (
            <button
              type="button"
              key={item}
              onClick={() => setLetter(item)}
              className={`focus-ring h-9 w-9 rounded-md text-xs font-semibold ${
                letter === item
                  ? "bg-cyan-500 text-slate-950"
                  : "bg-slate-100 text-slate-700"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {filtered.map((category) => (
          <div
            key={category}
            className="rounded-md border border-slate-200 bg-white p-5 shadow-sm transition hover:border-cyan-300"
          >
            <p className="text-lg font-semibold text-slate-950">{category}</p>
          </div>
        ))}
      </div>
      <div className="rounded-md border border-cyan-200 bg-cyan-50 p-6 text-slate-950">
        <p className="text-xl font-semibold">{cta}</p>
      </div>
    </div>
  );
}
