import { FeatureShell } from "@/components/dashboard/FeatureShell";
import { StatusPanel } from "@/components/catalog/StatusPanel";
import { createServerSupabaseClient, getCurrentUser } from "@/lib/supabase/server";

export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

async function getAdminAccess(userId?: string) {
  if (!userId) {
    return { allowed: false, configured: true };
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { allowed: false, configured: false };
  }

  const { data } = await supabase
    .from("profiles")
    .select("role,status")
    .eq("id", userId)
    .maybeSingle();

  return {
    allowed:
      data?.status === "active" &&
      (data.role === "admin" || data.role === "super_admin"),
    configured: true,
  };
}

export default async function AdminPage() {
  const { user, configured } = await getCurrentUser();
  const access = configured
    ? await getAdminAccess(user?.id)
    : { allowed: false, configured: false };

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
            "Products",
            "Bulk import",
            "Categories",
            "Brands",
            "RFQs",
            "Orders",
            "Users",
            "LinkedIn",
            "Audit logs",
          ].map((item) => (
            <div key={item} className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-950">{item}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Server-protected module. Mutations must use RLS-safe server
                actions and audit logs.
              </p>
            </div>
          ))}
        </div>
      )}
    </FeatureShell>
  );
}
