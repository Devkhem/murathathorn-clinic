import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import type { Database } from "./types";
import { getSupabaseAnonKey, getSupabaseUrl } from "./env";

/**
 * Server Supabase client for use in Server Components, Server Actions, and Route
 * Handlers. Still scoped by RLS via the caller's session cookie — this is NOT an
 * elevated-privilege client. Use `createServiceRoleClient` for that, sparingly.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component where cookies can't be set — safe to
          // ignore as long as middleware.ts is refreshing the session.
        }
      },
    },
  });
}
