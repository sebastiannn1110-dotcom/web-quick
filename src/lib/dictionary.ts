import de from "@/messages/de.json";
import en from "@/messages/en.json";
import es from "@/messages/es.json";
import fr from "@/messages/fr.json";
import ja from "@/messages/ja.json";
import ko from "@/messages/ko.json";
import zh from "@/messages/zh.json";
import { defaultLocale, locales, type Locale } from "./constants";

const dictionaries = { en, es, zh, fr, de, ja, ko } as const;

export type Dictionary = typeof en;

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function getDictionary(locale: string): Dictionary {
  return dictionaries[isLocale(locale) ? locale : defaultLocale];
}

export function localizedPath(locale: Locale, href: string) {
  const normalized = href === "/" ? "" : href;
  return `/${locale}${normalized}`;
}
