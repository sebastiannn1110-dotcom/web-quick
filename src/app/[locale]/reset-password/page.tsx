import { ResetPasswordForm } from "@/components/auth/AuthForms";
import { PageHero } from "@/components/sections/PageHero";
import type { Locale } from "@/lib/constants";
import { isLocale } from "@/lib/dictionary";

type PageProps = { params: Promise<{ locale: string }> };

export default async function ResetPasswordPage({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = (isLocale(rawLocale) ? rawLocale : "en") as Locale;

  return (
    <>
      <PageHero
        eyebrow="Quicksol Portal"
        title={locale === "es" ? "Actualizar contraseña" : "Update password"}
        body={locale === "es" ? "Define una nueva contraseña para tu cuenta." : "Set a new password for your account."}
        locale={locale}
      />
      <section className="section-y bg-slate-50">
        <div className="container-page max-w-xl">
          <ResetPasswordForm locale={locale} />
        </div>
      </section>
    </>
  );
}
