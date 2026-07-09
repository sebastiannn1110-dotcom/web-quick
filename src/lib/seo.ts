import type { Metadata } from "next";
import {
  defaultLocale,
  locales,
  publicPages,
  siteBaseUrl,
  type Locale,
} from "./constants";
import type { Dictionary } from "./dictionary";

export function alternateLanguages(path = "") {
  return Object.fromEntries(
    locales.map((locale) => [
      locale,
      `${siteBaseUrl}/${locale}${path === "/" ? "" : path}`,
    ]),
  );
}

export function createPageMetadata({
  locale,
  path,
  title,
  description,
}: {
  locale: Locale;
  path?: string;
  title: string;
  description: string;
}): Metadata {
  const normalizedPath = path && path !== "/" ? path : "";
  const url = `${siteBaseUrl}/${locale}${normalizedPath}`;

  return {
    metadataBase: new URL(siteBaseUrl),
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        ...alternateLanguages(normalizedPath),
        "x-default": `${siteBaseUrl}/${defaultLocale}${normalizedPath}`,
      },
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "Quicksol Global",
      type: "website",
      locale,
      images: [
        {
          url: "/images/quicksol-global-supply-network.png",
          width: 1536,
          height: 1024,
          alt: "Quicksol Global electronic components supply chain network",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/images/quicksol-global-supply-network.png"],
    },
  };
}

export function organizationSchema(dict: Dictionary, locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Quicksol Global",
    url: `${siteBaseUrl}/${locale}`,
    description: dict.schema.organizationDescription,
    logo: `${siteBaseUrl}/images/quicksol-global-supply-network.png`,
    areaServed: ["Asia Pacific", "Americas", "Europe"],
    knowsAbout: [
      "Electronic component sourcing",
      "Shortage management",
      "Global procurement",
      "Quality inspection",
      "Supply chain support",
    ],
  };
}

export function breadcrumbSchema({
  locale,
  items,
}: {
  locale: Locale;
  items: Array<{ name: string; path: string }>;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${siteBaseUrl}/${locale}${item.path === "/" ? "" : item.path}`,
    })),
  };
}

export function sitemapEntries() {
  const now = new Date();
  return locales.flatMap((locale) =>
    publicPages.map((path) => ({
      url: `${siteBaseUrl}/${locale}${path}`,
      lastModified: now,
      alternates: {
        languages: alternateLanguages(path),
      },
    })),
  );
}
