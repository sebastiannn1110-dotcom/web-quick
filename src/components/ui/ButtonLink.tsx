import Link from "next/link";
import type { ReactNode } from "react";

const variants = {
  primary:
    "bg-orange-600 text-white shadow-lg shadow-orange-950/25 hover:bg-orange-500",
  secondary:
    "border border-stone-300 bg-white text-stone-950 hover:border-orange-500 hover:text-orange-700",
  dark: "border border-white/20 bg-white/10 text-white hover:bg-white/18",
} as const;

export function ButtonLink({
  href,
  children,
  variant = "primary",
  icon,
}: {
  href: string;
  children: ReactNode;
  variant?: keyof typeof variants;
  icon?: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-md px-5 py-3 text-sm font-semibold transition duration-200 ${variants[variant]}`}
    >
      {icon}
      <span>{children}</span>
    </Link>
  );
}
