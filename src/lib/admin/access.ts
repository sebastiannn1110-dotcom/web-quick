import "server-only";

import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient, getCurrentUser } from "@/lib/supabase/server";

export async function getAdminAccess() {
  const { user, configured } = await getCurrentUser();

  if (!configured) {
    return { allowed: false, configured: false, user: null };
  }

  if (!user) {
    return { allowed: false, configured: true, user: null };
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { allowed: false, configured: false, user: null };
  }

  const { data } = await supabase
    .from("profiles")
    .select("role,status")
    .eq("id", user.id)
    .maybeSingle();

  return {
    allowed:
      data?.status === "active" &&
      (data.role === "admin" || data.role === "super_admin"),
    configured: true,
    user,
  };
}

export async function createCheckedAdminClient() {
  const access = await getAdminAccess();

  if (!access.allowed) {
    return { supabase: null, access };
  }

  return { supabase: createAdminSupabaseClient(), access };
}
