"use client";

import Link from "next/link";
import { Bot, Send, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { Locale } from "@/lib/constants";
import { localizedPath } from "@/lib/dictionary";

type AssistantResult = {
  id: string;
  title: string;
  mpn: string;
  slug: string;
  brand_name?: string | null;
};

type AssistantResponse = {
  ok: boolean;
  message?: string;
  results?: { products?: AssistantResult[] };
};

export function ShopWithAI({ locale }: { locale: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [answer, setAnswer] = useState("");
  const [results, setResults] = useState<AssistantResult[]>([]);
  const [loading, setLoading] = useState(false);

  const enabled =
    pathname === `/${locale}` ||
    pathname === `/${locale}/catalog` ||
    pathname.startsWith(`/${locale}/products/`);

  if (!enabled) return null;

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!message.trim()) return;
    setLoading(true);

    const response = await fetch("/api/ai/catalog", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ locale, message }),
    }).catch(() => null);
    const payload = (await response?.json().catch(() => null)) as AssistantResponse | null;

    if (payload?.ok) {
      setAnswer(payload.message || "Catalog search completed.");
      setResults(payload.results?.products || []);
    } else {
      setAnswer("The assistant is temporarily unavailable. Send an RFQ for urgent needs.");
      setResults([]);
    }
    setLoading(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="focus-ring fixed bottom-5 right-5 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-orange-600 text-white shadow-xl shadow-orange-900/20 transition hover:bg-orange-500"
        aria-label="Shop with AI"
      >
        <Bot aria-hidden="true" />
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 bg-slate-950/30 p-4 backdrop-blur-sm md:flex md:items-end md:justify-end">
          <div className="ml-auto flex h-full max-h-[680px] w-full max-w-md flex-col rounded-md bg-white shadow-2xl md:h-[calc(100vh-48px)]">
            <div className="flex items-center justify-between border-b border-slate-200 p-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-orange-700">Quicksol AI</p>
                <h2 className="text-lg font-semibold text-slate-950">Shop with AI</h2>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="focus-ring rounded-md p-2 text-slate-600" aria-label="Close AI assistant">
                <X aria-hidden="true" />
              </button>
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto p-4">
              <p className="rounded-md bg-slate-50 p-3 text-sm leading-6 text-slate-700">
                Ask for an MPN, category, stock need, quantity, or sourcing constraint.
              </p>
              {answer ? (
                <div className="rounded-md border border-slate-200 p-3 text-sm leading-6 text-slate-700">
                  {answer}
                </div>
              ) : null}
              {results.length ? (
                <div className="grid gap-2">
                  {results.map((product) => (
                    <Link key={product.id} href={localizedPath(locale as Locale, `/products/${product.slug}`)} className="rounded-md border border-slate-200 p-3 text-sm hover:border-orange-300">
                      <span className="block font-semibold text-slate-950">{product.title}</span>
                      <span className="text-slate-600">{product.brand_name || "Quicksol"} · {product.mpn}</span>
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
            <form onSubmit={submit} className="flex gap-2 border-t border-slate-200 p-4">
              <input
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                className="min-w-0 flex-1 rounded-md border border-slate-200 px-3 text-sm"
                placeholder="Search MPN, brand, quantity..."
              />
              <button disabled={loading} className="focus-ring inline-flex h-11 w-11 items-center justify-center rounded-md bg-orange-600 text-white disabled:opacity-60" aria-label="Send">
                <Send aria-hidden="true" size={18} />
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
