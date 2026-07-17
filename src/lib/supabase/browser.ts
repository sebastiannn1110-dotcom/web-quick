"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getSupabasePublicConfig } from "./config";

export function createBrowserSupabaseClient() {
  const config = getSupabasePublicConfig();

  if (!config.url || !config.publicKey || !config.isConfigured) {
    throw new Error("Supabase public key is missing or invalid");
  }

  return createBrowserClient(config.url, config.publicKey);
}
