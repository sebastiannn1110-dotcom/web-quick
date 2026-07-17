import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

const BOOTSTRAP_TOKEN_HASH =
  "9eadd5f7f8e9b11c72aa1f90faec09e25c728e85166595262deaca8f032817f4";

function isAuthorized(request: Request) {
  const token = request.headers.get("x-bootstrap-token") || "";
  const hash = createHash("sha256").update(token).digest("hex");

  return timingSafeEqual(
    Buffer.from(hash, "hex"),
    Buffer.from(BOOTSTRAP_TOKEN_HASH, "hex"),
  );
}

function bootstrapEmails() {
  return (process.env.ADMIN_BOOTSTRAP_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

function safeError(error: unknown) {
  if (!error || typeof error !== "object") {
    return "Unknown error";
  }

  const maybeError = error as { message?: string; code?: string; status?: number };

  return {
    code: maybeError.code || null,
    status: maybeError.status || null,
    message: maybeError.message || "Unknown error",
  };
}

async function findAuthUserByEmail(
  supabase: NonNullable<ReturnType<typeof createAdminSupabaseClient>>,
  email: string,
) {
  for (let page = 1; page <= 20; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 1000,
    });

    if (error) {
      throw error;
    }

    const user = data.users.find(
      (candidate) => candidate.email?.toLowerCase() === email,
    );

    if (user) {
      return user;
    }

    if (data.users.length < 1000) {
      return null;
    }
  }

  return null;
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as
    | { email?: string; password?: string }
    | null;
  const email = body?.email?.trim().toLowerCase();
  const password = body?.password || "";
  const allowedEmails = bootstrapEmails();

  if (!email || !password || password.length < 8) {
    return NextResponse.json(
      { ok: false, error: "Invalid payload" },
      { status: 400 },
    );
  }

  if (!allowedEmails.includes(email)) {
    return NextResponse.json(
      { ok: false, error: "Email is not in ADMIN_BOOTSTRAP_EMAILS" },
      { status: 403 },
    );
  }

  const supabase = createAdminSupabaseClient();

  if (!supabase) {
    return NextResponse.json(
      { ok: false, error: "Supabase admin client is not configured" },
      { status: 500 },
    );
  }

  try {
    let created = false;
    let user = await findAuthUserByEmail(supabase, email);

    if (!user) {
      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: "Sebastian Admin",
          role: "super_admin",
        },
      });

      if (error) {
        throw error;
      }

      user = data.user;
      created = true;
    } else {
      const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
        password,
        email_confirm: true,
        user_metadata: {
          ...(user.user_metadata || {}),
          full_name: user.user_metadata?.full_name || "Sebastian Admin",
          role: "super_admin",
        },
      });

      if (error) {
        throw error;
      }

      user = data.user;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .upsert(
        {
          id: user.id,
          email,
          full_name: "Sebastian Admin",
          role: "super_admin",
          status: "active",
        },
        { onConflict: "id" },
      )
      .select("id,email,role,status")
      .single();

    if (profileError) {
      throw profileError;
    }

    await supabase.from("admin_audit_logs").insert({
      actor_id: user.id,
      action: created ? "admin_user_created" : "admin_user_updated",
      entity_type: "profiles",
      entity_id: user.id,
      metadata: { role: "super_admin", reason: "operator_bootstrap" },
    });

    return NextResponse.json({
      ok: true,
      created,
      email: user.email,
      emailConfirmed: Boolean(user.email_confirmed_at),
      profile,
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: safeError(error) },
      { status: 500 },
    );
  }
}
