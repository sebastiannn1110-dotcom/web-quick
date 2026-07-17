import { RegisterForm } from "@/components/auth/AuthForms";
import { PageHero } from "@/components/sections/PageHero";
import type { Locale } from "@/lib/constants";
import { isLocale } from "@/lib/dictionary";

type PageProps = { params: Promise<{ locale: string }> };

export default async function RegisterPage({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = (isLocale(rawLocale) ? rawLocale : "en") as Locale;

  return (
    <>
      <PageHero
        eyebrow="Quicksol Portal"
        title={locale === "es" ? "Crear cuenta" : "Create account"}
        body={locale === "es" ? "Registra una cuenta de cliente. El rol inicial siempre es customer." : "Register a customer account. The initial role is always customer."}
        locale={locale}
      />
      <section className="section-y bg-slate-50">
        <div className="container-page max-w-xl">
          <RegisterForm locale={locale} />
        </div>
      </section>
    </>
  );
}
