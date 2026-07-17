"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getSupabasePublicConfig } from "./config";

export function createBrowserSupabaseClient() {
  const config = getSupabasePublicConfig();

  if (!config.url || !config.anonKey) {
    throw new Error("Supabase public environment variables are not configured.");
  }

  return createBrowserClient(config.url, config.anonKey);
}

