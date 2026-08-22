import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import type { Database } from "./types";
import { getSupabaseServiceRoleKey, getSupabaseUrl } from "./env";

/**
 * Elevated-privilege client that bypasses RLS entirely. Server-only (the
 * `server-only` import makes bundling this into a client component a build error).
 *
 * Use only for the handful of operations that must run with elevated privilege by
 * design and are already permission-checked in application code first, e.g.:
 *  - issuing a signed URL for a private storage object (after an auth + audit check)
 *  - admin-only staff management
 *
 * Do NOT use this as a shortcut around writing an RLS policy. If a normal
 * authenticated request should be able to do something, add a policy instead.
 */
export function createServiceRoleClient() {
  return createSupabaseClient<Database>(getSupabaseUrl(), getSupabaseServiceRoleKey(), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
