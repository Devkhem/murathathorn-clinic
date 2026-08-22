"use client";

import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "./types";
import { getSupabaseAnonKey, getSupabaseUrl } from "./env";

/**
 * Browser Supabase client. Scoped by RLS via the anon key + the signed-in user's
 * session — never grants more access than the RLS policies in
 * supabase/migrations allow.
 */
export function createClient() {
  return createBrowserClient<Database>(getSupabaseUrl(), getSupabaseAnonKey());
}
