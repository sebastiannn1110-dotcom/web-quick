import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BrandExplorer } from "@/components/sections/BrandExplorer";
import { CTASection } from "@/components/sections/CTASection";
import { DetailCardGrid, SimpleCardGrid } from "@/components/sections/Cards";
import { GlobalMap } from "@/components/sections/GlobalMap";
import { MarketInsightsExplorer } from "@/components/sections/MarketInsightsExplorer";
import { PageHero } from "@/components/sections/PageHero";
import { QualityTimeline } from "@/components/sections/QualityTimeline";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { locales, type Locale } from "@/lib/constants";
import { getDictionary, isLocale } from "@/lib/dictionary";
import { createPageMetadata } from "@/lib/seo";

type PageProps = {
  params: Promise<{ locale: string; slug: string[] }>;
};

type PageKey =
  | "about"
  | "services"
  | "market"
  | "brands"
  | "quality"
  | "valueAdded"
  | "global"
  | "partners"
  | "careers"
  | "portal";

const routeMap: Record<string, PageKey | "terms" | "privacy" | "cookies"> = {
  about: "about",
  services: "services",
  "market-insights": "market",
  brands: "brands",
  quality: "quality",
  "value-added-services": "valueAdded",
  "global-presence": "global",
  partners: "partners",
  careers: "careers",
  "legal/terms": "terms",
  "legal/privacy": "privacy",
  "legal/cookies": "cookies",
};

const metaKeyMap = {
  market: "market",
  valueAdded: "valueAdded",
  global: "global",
  terms: "terms",
  privacy: "privacy",
  cookies: "cookies",
} as const;

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    Object.keys(routeMap).map((slug) => ({
      locale,
      slug: slug.split("/"),
    })),
  );
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : "en";
  const dict = getDictionary(locale);
  const route = slug.join("/");
  const page = routeMap[route];

  if (!page) {
    return {};
  }

  const metaKey =
    page in metaKeyMap ? metaKeyMap[page as keyof typeof metaKeyMap] : page;
  const meta = dict.meta[metaKey as keyof typeof dict.meta];

  return createPageMetadata({
    locale,
    path: `/${route}`,
    title: meta.title,
    description: meta.description,
  });
}

function renderLegal(page: "terms" | "privacy" | "cookies", locale: Locale) {
  const dict = getDictionary(locale);
  const legal = dict.pages.legal[page];

  return (
    <>
      <PageHero
        eyebrow={dict.common.footer.groups.legal}
        title={dict.meta[page].title}
        body={dict.meta[page].description}
        locale={locale}
      />
      <section className="section-y bg-white">
        <div className="container-page max-w-4xl space-y-5">
          {legal.sections.map((section) => (
            <article key={section.title} className="rounded-md border border-slate-200 p-6">
              <h2 className="text-2xl font-semibold text-slate-950">
                {section.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                {section.body}
              </p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

export default async function ContentPage({ params }: PageProps) {
  const { locale: rawLocale, slug } = await params;
  const locale = (isLocale(rawLocale) ? rawLocale : "en") as Locale;
  const dict = getDictionary(locale);
  const route = slug.join("/");
  const page = routeMap[route];

  if (!page) {
    notFound();
  }

  if (page === "terms" || page === "privacy" || page === "cookies") {
    return renderLegal(page, locale);
  }

  const content = dict.pages[page];
  const navKey =
    page === "market"
      ? "insights"
      : page === "global"
        ? "global"
        : page === "valueAdded"
          ? "valueAdded"
          : page;

  return (
    <>
      <PageHero
        eyebrow={dict.common.nav[navKey]}
        title={content.hero.title}
        body={content.hero.body}
        locale={locale}
        primaryLabel={page === "portal" ? dict.common.nav.portal : undefined}
        secondaryLabel={dict.common.nav.contact}
      />
      <section className="section-y bg-slate-50">
        <div className="container-page space-y-10">
          {page === "market" ? (
            <MarketInsightsExplorer
              categories={dict.pages.market.categories}
              articles={dict.pages.market.articles}
              searchLabel={dict.pages.market.searchLabel}
              filterLabel={dict.pages.market.filterLabel}
              demoLabel="Insight"
              emptyTitle={dict.common.empty.insightsTitle}
              emptyBody={dict.common.empty.insightsBody}
            />
          ) : page === "brands" ? (
            <BrandExplorer
              categories={dict.pages.brands.categories}
              searchLabel={dict.pages.brands.searchLabel}
              letterLabel={dict.pages.brands.letterLabel}
              cta={dict.pages.brands.cta}
            />
          ) : page === "global" ? (
            <GlobalMap
              regions={dict.pages.global.regions}
              locations={dict.pages.global.locations}
              notice={dict.pages.global.notice}
              contactLabel={dict.common.labels.region}
            />
          ) : page === "quality" ? (
            <>
              <QualityTimeline items={dict.pages.quality.process} />
              <SimpleCardGrid items={dict.pages.quality.certifications} />
            </>
          ) : "items" in content ? (
            <DetailCardGrid items={content.items} labels={dict.common.labels} />
          ) : "sections" in content ? (
            <div className="grid gap-5 md:grid-cols-2">
              {content.sections.map((section) => (
                <article key={section.title} className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="text-2xl font-semibold text-slate-950">
                    {section.title}
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {section.body}
                  </p>
                </article>
              ))}
            </div>
          ) : "principles" in content ? (
            <SimpleCardGrid
              items={content.principles.map((item) => ({
                title: item,
              }))}
            />
          ) : "features" in content ? (
            <>
              <SimpleCardGrid
                items={content.features.map((item) => ({
                  title: item,
                }))}
              />
              <SectionHeader title={content.notice} />
            </>
          ) : null}
        </div>
      </section>
      <CTASection
        title={dict.home.finalCta.title}
        body={dict.home.finalCta.body}
        locale={locale}
        primary={dict.common.cta.submitRfq}
        secondary={dict.common.cta.globalTeam}
      />
    </>
  );
}
