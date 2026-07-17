import { ArrowRight, MessageSquareText, Search } from "lucide-react";
import { ButtonLink } from "@/components/ui/ButtonLink";
import type { Locale } from "@/lib/constants";
import { localizedPath, type Dictionary } from "@/lib/dictionary";
import { AnimatedWrapper } from "@/components/ui/AnimatedWrapper";

export function HeroSection({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  return (
    <section className="relative overflow-hidden bg-[#071314] text-white">
      <div className="absolute inset-0">
        <video
          className="h-full w-full object-cover object-center"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/videos/quicksol-home-hero-poster.webp"
          aria-label={dict.home.hero.imageAlt}
        >
          <source src="/videos/quicksol-home-hero.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#071314_0%,rgba(7,19,20,0.9)_36%,rgba(6,47,51,0.34)_100%)]" />
        <div className="absolute inset-0 bg-slate-950/20" />
        <div className="absolute inset-x-0 bottom-0 h-1 bg-orange-600" />
      </div>
      <div className="container-page relative min-h-[calc(100vh-80px)] py-16 md:min-h-[720px] md:py-24">
        <div className="flex h-full max-w-3xl flex-col justify-center">
          <AnimatedWrapper>
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-orange-300">
              {dict.home.hero.eyebrow}
            </p>
            <h1 className="max-w-3xl text-5xl font-semibold tracking-normal md:text-7xl">
              {dict.home.hero.title}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200 md:text-xl">
              {dict.home.hero.body}
            </p>
          </AnimatedWrapper>

          <AnimatedWrapper delay={0.08}>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <ButtonLink
                href={localizedPath(locale, "/rfq")}
                icon={<ArrowRight aria-hidden="true" className="h-4 w-4" />}
              >
                {dict.common.cta.rfq}
              </ButtonLink>
              <ButtonLink
                href={localizedPath(locale, "/services")}
                variant="dark"
                icon={<Search aria-hidden="true" className="h-4 w-4" />}
              >
                {dict.common.cta.services}
              </ButtonLink>
              <ButtonLink
                href={localizedPath(locale, "/contact")}
                variant="dark"
                icon={
                  <MessageSquareText aria-hidden="true" className="h-4 w-4" />
                }
              >
                {dict.common.cta.contact}
              </ButtonLink>
            </div>
          </AnimatedWrapper>
        </div>
      </div>
    </section>
  );
}
