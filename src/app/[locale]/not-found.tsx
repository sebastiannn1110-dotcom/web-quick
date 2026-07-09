import Link from "next/link";
import { defaultLocale } from "@/lib/constants";
import { getDictionary, localizedPath } from "@/lib/dictionary";

export default function NotFound() {
  const dict = getDictionary(defaultLocale);

  return (
    <section className="section-y bg-slate-50">
      <div className="container-page text-center">
        <h1 className="text-5xl font-semibold text-slate-950">
          {dict.notFound.title}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg leading-8 text-slate-600">
          {dict.notFound.body}
        </p>
        <Link
          href={localizedPath(defaultLocale, "/")}
          className="focus-ring mt-8 inline-flex rounded-md bg-slate-950 px-5 py-3 font-semibold text-white"
        >
          {dict.notFound.action}
        </Link>
      </div>
    </section>
  );
}
