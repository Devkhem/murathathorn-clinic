/**
 * Central place that reads Supabase env vars, so a missing var fails loudly and in
 * one place instead of as a cryptic runtime error deep in a client call.
 */

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable ${name}. Copy .env.example to .env.local and fill in your Supabase project's values.`
    );
  }
  return value;
}

export function getSupabaseUrl(): string {
  return requireEnv("NEXT_PUBLIC_SUPABASE_URL");
}

export function getSupabaseAnonKey(): string {
  return requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

/** Server-only. Never call this from a "use client" file. */
export function getSupabaseServiceRoleKey(): string {
  if (typeof window !== "undefined") {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY must never be read in browser code.");
  }
  return requireEnv("SUPABASE_SERVICE_ROLE_KEY");
}
