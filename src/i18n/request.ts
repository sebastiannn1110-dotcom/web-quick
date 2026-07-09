import { getRequestConfig } from "next-intl/server";
import { defaultLocale, locales, type Locale } from "@/lib/constants";

function resolveLocale(locale?: string): Locale {
  return locales.includes(locale as Locale) ? (locale as Locale) : defaultLocale;
}

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = resolveLocale(await requestLocale);

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
