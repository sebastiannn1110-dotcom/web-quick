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
    <section className="dark-panel grid-lines text-white">
      <div className="container-page py-20 md:py-28">
        <div className="max-w-4xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-200">
            {eyebrow}
          </p>
          <h1 className="text-4xl font-semibold tracking-normal md:text-6xl">
            {title}
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-200">
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
