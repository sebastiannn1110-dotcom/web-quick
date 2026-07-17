import Link from "next/link";
import { FeatureShell } from "@/components/dashboard/FeatureShell";
import { StatusPanel } from "@/components/catalog/StatusPanel";
import { getAdminAccess } from "@/lib/admin/access";
import type { Locale } from "@/lib/constants";
import { localizedPath } from "@/lib/dictionary";

export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

type PageProps = { params: Promise<{ locale: string }> };

export default async function AdminPage({ params }: PageProps) {
  const { locale } = await params;
  const access = await getAdminAccess();

  return (
    <FeatureShell
      title="Admin workspace"
      body="Manage products, categories, brands, prices, inventory, media, RFQs, orders, LinkedIn content and audit logs."
    >
      {!access.configured ? (
        <StatusPanel
          title="Supabase is not configured"
          body="Admin modules require Supabase Auth, profiles and RLS policies before any administrative query is executed."
        />
      ) : !access.allowed ? (
        <StatusPanel
          tone="protected"
          title="Admin access required"
          body="Access is validated on the server from the profiles table. Client-provided roles are ignored."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[
            ["Products", "/admin/products"],
            ["Categories", "/admin/categories"],
            ["Brands", "/admin/brands"],
            ["RFQs", "/admin/rfqs"],
            ["Contacts", "/admin/contacts"],
            ["Orders", "/admin/orders"],
            ["Customers", "/admin/customers"],
            ["Media", "/admin/media"],
            ["Settings", "/admin/settings"],
          ].map(([item, href]) => (
            <Link key={item} href={localizedPath(locale as Locale, href)} className="rounded-md border border-slate-200 bg-white p-6 shadow-sm transition hover:border-orange-300">
              <h2 className="text-xl font-semibold text-slate-950">{item}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Server-protected module. Mutations must use RLS-safe server
                actions and audit logs.
              </p>
            </Link>
          ))}
        </div>
      )}
    </FeatureShell>
  );
}
