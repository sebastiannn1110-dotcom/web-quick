import { afterEach, describe, expect, it, vi } from "vitest";
import { getSupabasePublicConfig } from "./config";

describe("getSupabasePublicConfig", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("accepts a publishable key", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://project.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_real");

    expect(getSupabasePublicConfig()).toMatchObject({
      url: "https://project.supabase.co",
      publicKey: "sb_publishable_real",
      isConfigured: true,
      error: null,
    });
  });

  it("rejects placeholder values", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example-project.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_example");

    expect(getSupabasePublicConfig()).toMatchObject({
      isConfigured: false,
      error: "Supabase public key is missing or invalid",
    });
  });
});
