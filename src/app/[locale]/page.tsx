import type { Metadata } from "next";
import { CTASection } from "@/components/sections/CTASection";
import { GlobalMap } from "@/components/sections/GlobalMap";
import { HeroSection } from "@/components/sections/HeroSection";
import { SimpleCardGrid } from "@/components/sections/Cards";
import { ProcessFlow } from "@/components/sections/ProcessFlow";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { locales, type Locale } from "@/lib/constants";
import { getDictionary, isLocale } from "@/lib/dictionary";
import { createPageMetadata, organizationSchema } from "@/lib/seo";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : "en";
  const dict = getDictionary(locale);

  return createPageMetadata({
    locale,
    path: "/",
    title: dict.meta.home.title,
    description: dict.meta.home.description,
  });
}

export default async function HomePage({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = (isLocale(rawLocale) ? rawLocale : "en") as Locale;
  const dict = getDictionary(locale);

  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema(dict, locale)),
        }}
      />
      <HeroSection locale={locale} dict={dict} />

      <section className="border-b border-slate-200 bg-white py-8">
        <div className="container-page">
          <SimpleCardGrid items={dict.home.trust.items} />
        </div>
      </section>

      <section className="section-y bg-slate-50">
        <div className="container-page grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <SectionHeader
            eyebrow={dict.home.what.eyebrow}
            title={dict.home.what.title}
            body={dict.home.what.body}
          />
          <SimpleCardGrid items={dict.home.services.items.slice(0, 4)} />
        </div>
      </section>

      <section className="section-y bg-white">
        <div className="container-page space-y-10">
          <SectionHeader
            eyebrow={dict.home.services.eyebrow}
            title={dict.home.services.title}
            body={dict.home.services.body}
            align="center"
          />
          <SimpleCardGrid items={dict.home.services.items} />
        </div>
      </section>

      <section className="section-y bg-slate-50">
        <div className="container-page space-y-10">
          <SectionHeader
            eyebrow={dict.home.help.eyebrow}
            title={dict.home.help.title}
            align="center"
          />
          <ProcessFlow steps={dict.home.help.steps} />
        </div>
      </section>

      <section className="section-y bg-white">
        <div className="container-page grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <SectionHeader
            eyebrow={dict.home.insights.eyebrow}
            title={dict.home.insights.title}
            body={dict.home.insights.body}
          />
          <SimpleCardGrid
            items={dict.home.insights.items.map((item) => ({
              title: item.title,
              body: `${item.category}: ${item.body}`,
            }))}
          />
        </div>
      </section>

      <section className="section-y bg-slate-950 text-white">
        <div className="container-page grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-cyan-200">
              {dict.home.quality.eyebrow}
            </p>
            <h2 className="text-3xl font-semibold md:text-5xl">
              {dict.home.quality.title}
            </h2>
          </div>
          <p className="text-lg leading-8 text-slate-200">
            {dict.home.quality.body}
          </p>
        </div>
      </section>

      <section className="section-y bg-slate-50">
        <div className="container-page space-y-10">
          <SectionHeader
            eyebrow={dict.home.global.eyebrow}
            title={dict.home.global.title}
            body={dict.home.global.body}
            align="center"
          />
          <GlobalMap
            regions={dict.pages.global.regions}
            locations={dict.pages.global.locations}
            notice={dict.pages.global.notice}
            contactLabel={dict.common.labels.region}
          />
        </div>
      </section>

      <section className="section-y bg-white">
        <div className="container-page rounded-md border border-dashed border-slate-300 p-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700">
            {dict.home.partners.eyebrow}
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-slate-950">
            {dict.home.partners.title}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-slate-600">
            {dict.home.partners.body}
          </p>
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
