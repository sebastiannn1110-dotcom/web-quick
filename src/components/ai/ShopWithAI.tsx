"use client";

import Link from "next/link";
import { Send, ShoppingCart, Sparkles, X } from "lucide-react";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("common.cta");
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

  const buttonLabel = t("shopWithAi");

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
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="focus-ring ai-shop-button fixed bottom-[calc(12px+env(safe-area-inset-bottom))] right-3 z-[80] inline-flex min-h-[52px] max-w-[calc(100vw-24px)] items-center gap-3 rounded-full border border-slate-200 bg-white py-2 pl-2 pr-4 text-sm font-semibold text-slate-950 shadow-[0_18px_45px_rgba(15,23,42,0.18)] transition duration-200 hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-[0_24px_54px_rgba(15,23,42,0.24)] sm:bottom-6 sm:right-6 sm:min-h-14 sm:pr-5 sm:text-base"
          aria-label={buttonLabel}
        >
          <span className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-600 text-white shadow-lg shadow-orange-900/20 sm:h-11 sm:w-11">
            <ShoppingCart aria-hidden="true" className="h-5 w-5" />
            <Sparkles
              aria-hidden="true"
              className="ai-shop-sparkle absolute -right-1 -top-1 h-4 w-4 text-orange-200"
            />
            <Sparkles
              aria-hidden="true"
              className="ai-shop-sparkle ai-shop-sparkle-delayed absolute -bottom-1 -left-1 h-3.5 w-3.5 text-orange-100"
            />
          </span>
          <span className="whitespace-nowrap">{buttonLabel}</span>
        </button>
      ) : null}
      {open ? (
        <div className="fixed inset-0 z-50 flex items-end bg-slate-950/30 p-3 pb-[calc(12px+env(safe-area-inset-bottom))] backdrop-blur-sm md:justify-end md:p-6">
          <div className="ml-auto flex h-[min(86vh,680px)] w-full max-w-md flex-col rounded-md bg-white shadow-2xl md:h-[calc(100vh-48px)]">
            <div className="flex items-center justify-between border-b border-slate-200 p-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-orange-700">Quicksol AI</p>
                <h2 className="text-lg font-semibold text-slate-950">{buttonLabel}</h2>
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
