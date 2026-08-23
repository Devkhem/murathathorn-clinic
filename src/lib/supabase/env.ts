/**
 * Central place that reads Supabase env vars, so a missing var fails loudly and in
 * one place instead of as a cryptic runtime error deep in a client call.
 *
 * IMPORTANT: the two NEXT_PUBLIC_* getters below must reference
 * `process.env.NEXT_PUBLIC_...` as a literal property access, not a dynamic
 * `process.env[name]` lookup. Next.js only inlines NEXT_PUBLIC_ vars into the
 * browser bundle when it can statically find that exact literal at build time —
 * a dynamic lookup silently resolves to undefined in the browser even though the
 * var is set, which is exactly the bug this comment is here to prevent
 * reintroducing. See https://nextjs.org/docs/app/guides/environment-variables.
 */

function fail(name: string): never {
  throw new Error(
    `Missing required environment variable ${name}. Copy .env.example to .env.local and fill in your Supabase project's values.`
  );
}

export function getSupabaseUrl(): string {
  const value = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!value) fail("NEXT_PUBLIC_SUPABASE_URL");
  return value;
}

export function getSupabaseAnonKey(): string {
  const value = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!value) fail("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  return value;
}

/** Server-only. Never call this from a "use client" file. */
export function getSupabaseServiceRoleKey(): string {
  if (typeof window !== "undefined") {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY must never be read in browser code.");
  }
  const value = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!value) fail("SUPABASE_SERVICE_ROLE_KEY");
  return value;
}
