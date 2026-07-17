import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/ButtonLink";
import type { Locale } from "@/lib/constants";
import { localizedPath } from "@/lib/dictionary";

export function PageHero({
  eyebrow,
  title,
  body,
  locale,
  primaryLabel,
  secondaryLabel,
}: {
  eyebrow: string;
  title: string;
  body: string;
  locale: Locale;
  primaryLabel?: string;
  secondaryLabel?: string;
}) {
  return (
    <section className="border-b border-slate-200 bg-white">
      <div className="container-page py-10 md:py-16">
        <div className="max-w-4xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-orange-700">
            {eyebrow}
          </p>
          <h1 className="text-3xl font-semibold text-slate-950 md:text-5xl">
            {title}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-slate-700 md:text-lg">
            {body}
          </p>
          {primaryLabel || secondaryLabel ? (
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {primaryLabel ? (
                <ButtonLink
                  href={localizedPath(locale, "/rfq")}
                  icon={<ArrowRight aria-hidden="true" className="h-4 w-4" />}
                >
                  {primaryLabel}
                </ButtonLink>
              ) : null}
              {secondaryLabel ? (
                <ButtonLink
                  href={localizedPath(locale, "/contact")}
                  variant="dark"
                >
                  {secondaryLabel}
                </ButtonLink>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
