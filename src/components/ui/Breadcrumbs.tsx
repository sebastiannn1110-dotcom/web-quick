import Link from "next/link";

export function Breadcrumbs({
  items,
}: {
  items: Array<{ label: string; href: string }>;
}) {
  return (
    <nav aria-label="Breadcrumb" className="container-page py-5 text-sm">
      <ol className="flex flex-wrap items-center gap-2 text-slate-500">
        {items.map((item, index) => (
          <li key={item.href} className="flex items-center gap-2">
            {index > 0 ? <span aria-hidden="true">/</span> : null}
            <Link
              href={item.href}
              className="focus-ring rounded-sm hover:text-cyan-700"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}
