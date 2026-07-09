import Link from "next/link";
import { footerGroups, localeNames, locales, type Locale } from "@/lib/constants";
import { localizedPath, type Dictionary } from "@/lib/dictionary";
import { Logo } from "./Logo";

export function Footer({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-[#071314] text-white">
      <div className="container-page grid gap-10 py-12 lg:grid-cols-[1.2fr_2fr]">
        <div>
          <Logo href={localizedPath(locale, "/")} label={dict.common.brand} />
          <p className="mt-5 max-w-md text-sm leading-7 text-stone-300">
            {dict.common.footer.description}
          </p>
          <p className="mt-4 text-xs leading-6 text-stone-400">
            {dict.common.footer.noSocial}
          </p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {footerGroups.map((group) => (
            <div key={group.key}>
              <h2 className="text-sm font-semibold text-white">
                {dict.common.footer.groups[group.key]}
              </h2>
              <ul className="mt-4 space-y-3">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={localizedPath(locale, link.href)}
                      className="focus-ring rounded-sm text-sm text-stone-300 hover:text-orange-300"
                    >
                      {dict.common.nav[link.key]}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-4 py-6 text-sm text-stone-400 md:flex-row md:items-center md:justify-between">
          <p>
            © {year} Quicksol Global. {dict.common.footer.copyright}
          </p>
          <div className="flex flex-wrap gap-3">
            {locales.map((item) => (
              <Link
                key={item}
                href={localizedPath(item, "/")}
                hrefLang={item}
                className={`focus-ring rounded-sm hover:text-orange-300 ${
                  item === locale ? "font-semibold text-orange-300" : ""
                }`}
              >
                {localeNames[item]}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
