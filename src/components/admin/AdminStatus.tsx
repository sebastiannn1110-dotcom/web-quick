import Link from "next/link";
import { StatusPanel } from "@/components/catalog/StatusPanel";
import type { Locale } from "@/lib/constants";
import { localizedPath } from "@/lib/dictionary";

export function AdminStatus({
  locale,
  configured,
  allowed,
}: {
  locale: string;
  configured: boolean;
  allowed: boolean;
}) {
  if (!configured) {
    return (
      <StatusPanel
        title="Supabase is not configured"
        body="Admin modules require Supabase Auth, profiles and server-side credentials."
      />
    );
  }

  if (!allowed) {
    return (
      <div className="grid gap-4">
        <StatusPanel
          tone="protected"
          title="Admin access required"
          body="Access is validated on the server from the profiles table."
        />
        <Link
          href={localizedPath(locale as Locale, "/login")}
          className="w-fit rounded-md bg-orange-600 px-4 py-3 text-sm font-semibold text-white"
        >
          Login
        </Link>
      </div>
    );
  }

  return null;
}
