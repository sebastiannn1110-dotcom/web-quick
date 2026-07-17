export function getSupabasePublicConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publicKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const isValidUrl = Boolean(url?.startsWith("https://"));
  const isPlaceholder =
    !publicKey ||
    publicKey.includes("example") ||
    publicKey.includes("your-") ||
    publicKey.includes("placeholder");

  return {
    url,
    publicKey,
    anonKey: publicKey,
    isConfigured: Boolean(isValidUrl && publicKey && !isPlaceholder),
    error: !isValidUrl || isPlaceholder
      ? "Supabase public key is missing or invalid"
      : null,
  };
}
