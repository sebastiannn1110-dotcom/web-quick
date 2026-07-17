import { ContactForm } from "@/components/forms/ContactForm";
import { PageHero } from "@/components/sections/PageHero";
import { type Locale } from "@/lib/constants";
import { getDictionary, isLocale } from "@/lib/dictionary";

type PageProps = { params: Promise<{ locale: string }> };

export default async function RFQPage({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = (isLocale(rawLocale) ? rawLocale : "en") as Locale;
  const dict = getDictionary(locale);

  return (
    <>
      <PageHero
        eyebrow={dict.common.nav.rfq}
        title={dict.meta.rfq.title}
        body={dict.meta.rfq.description}
        locale={locale}
      />
      <section className="section-y bg-slate-50">
        <div className="container-page max-w-4xl">
          <ContactForm type="rfq" locale={locale} />
        </div>
      </section>
    </>
  );
}
