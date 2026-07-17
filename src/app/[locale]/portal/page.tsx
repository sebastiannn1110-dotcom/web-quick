import { FeatureShell } from "@/components/dashboard/FeatureShell";
import { StatusPanel } from "@/components/catalog/StatusPanel";
import { getCurrentUser } from "@/lib/supabase/server";

export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function PortalPage() {
  const { user, configured } = await getCurrentUser();

  return (
    <FeatureShell
      title="Customer portal"
      body="Customers will manage profile, company data, favorites, cart, RFQs, orders and AI conversations from this server-protected area."
    >
      {!configured ? (
        <StatusPanel
          title="Supabase Auth is not configured"
          body="Configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to enable registration, login and protected portal data."
        />
      ) : user ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {["Profile", "Favorites", "Cart", "RFQs", "Orders"].map((item) => (
            <div key={item} className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-950">{item}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Server-authenticated module ready for Supabase data.
              </p>
            </div>
          ))}
        </div>
      ) : (
        <StatusPanel
          tone="protected"
          title="Sign in required"
          body="A valid Supabase session is required before customer records are queried."
        />
      )}
    </FeatureShell>
  );
}
