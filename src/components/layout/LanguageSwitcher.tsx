"use client";

import Link from "next/link";
import { Globe2 } from "lucide-react";
import { usePathname } from "next/navigation";
import { localeNames, locales, type Locale } from "@/lib/constants";

function switchLocalePath(pathname: string, targetLocale: Locale) {
  const parts = pathname.split("/").filter(Boolean);

  if (locales.includes(parts[0] as Locale)) {
    parts[0] = targetLocale;
  } else {
    parts.unshift(targetLocale);
  }

  return `/${parts.join("/")}`;
}

export function LanguageSwitcher({
  currentLocale,
  label,
  compact = false,
}: {
  currentLocale: Locale;
  label: string;
  compact?: boolean;
}) {
  const pathname = usePathname();

  return (
    <div className="relative">
      <details className="group">
        <summary className="focus-ring flex cursor-pointer list-none items-center gap-2 rounded-md border border-white/15 bg-white/8 px-3 py-2 text-sm font-semibold text-white transition hover:border-orange-400 hover:text-orange-100">
          <Globe2 aria-hidden="true" className="h-4 w-4" />
          <span>{compact ? currentLocale.toUpperCase() : label}</span>
        </summary>
        <div className="absolute right-0 z-50 mt-2 w-44 overflow-hidden rounded-md border border-slate-200 bg-white shadow-xl shadow-slate-950/12">
          {locales.map((locale) => (
            <Link
              key={locale}
              href={switchLocalePath(pathname, locale)}
              className={`block px-4 py-3 text-sm transition hover:bg-cyan-50 ${
                locale === currentLocale
                  ? "font-semibold text-orange-700"
                  : "text-slate-700"
              }`}
              hrefLang={locale}
            >
              {localeNames[locale]}
            </Link>
          ))}
        </div>
      </details>
    </div>
  );
}
