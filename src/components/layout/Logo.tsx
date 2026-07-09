import Link from "next/link";
import Image from "next/image";

export function Logo({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="focus-ring inline-flex items-center rounded-md"
      aria-label={label}
    >
      <Image
        src="/logos/quicksol-logo.svg"
        alt="Quiksol"
        width={188}
        height={47}
        priority
        className="h-auto w-[150px] sm:w-[188px]"
      />
    </Link>
  );
}
