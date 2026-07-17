import { ForgotPasswordForm } from "@/components/auth/AuthForms";
import { PageHero } from "@/components/sections/PageHero";
import type { Locale } from "@/lib/constants";
import { isLocale } from "@/lib/dictionary";

type PageProps = { params: Promise<{ locale: string }> };

export default async function ForgotPasswordPage({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = (isLocale(rawLocale) ? rawLocale : "en") as Locale;

  return (
    <>
      <PageHero
        eyebrow="Quicksol Portal"
        title={locale === "es" ? "Recuperar contraseña" : "Reset password"}
        body={locale === "es" ? "Recibe un enlace seguro para actualizar tu contraseña." : "Receive a secure link to update your password."}
        locale={locale}
      />
      <section className="section-y bg-slate-50">
        <div className="container-page max-w-xl">
          <ForgotPasswordForm locale={locale} />
        </div>
      </section>
    </>
  );
}
