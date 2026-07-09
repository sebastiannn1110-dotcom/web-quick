import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/ButtonLink";
import type { Locale } from "@/lib/constants";
import { localizedPath } from "@/lib/dictionary";

export function CTASection({
  title,
  body,
  locale,
  primary,
  secondary,
}: {
  title: string;
  body: string;
  locale: Locale;
  primary: string;
  secondary: string;
}) {
  return (
    <section className="section-y bg-slate-950 text-white">
      <div className="container-page flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <div className="max-w-3xl">
          <h2 className="text-3xl font-semibold md:text-5xl">{title}</h2>
          <p className="mt-4 text-lg leading-8 text-slate-200">{body}</p>
        </div>
        <div className="flex shrink-0 flex-col gap-3 sm:flex-row md:flex-col lg:flex-row">
          <ButtonLink
            href={localizedPath(locale, "/rfq")}
            icon={<ArrowRight aria-hidden="true" className="h-4 w-4" />}
          >
            {primary}
          </ButtonLink>
          <ButtonLink href={localizedPath(locale, "/contact")} variant="dark">
            {secondary}
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
