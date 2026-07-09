import { defineRouting } from "next-intl/routing";
import { defaultLocale, locales } from "@/lib/constants";

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: "always",
  localeDetection: true,
});
