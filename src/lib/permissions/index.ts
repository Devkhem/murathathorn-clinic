import { cache } from "react";

import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/supabase/types";

export class UnauthorizedError extends Error {
  constructor(message = "คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

/**
 * Loads the current user's profile. Throws UnauthorizedError if there's no
 * signed-in user or their profile is deactivated. This is a UX/early-exit
 * convenience — RLS is the actual enforcement boundary.
 *
 * Wrapped in React's `cache()` so the underlying auth.getUser() + profiles
 * query only actually run once per request, no matter how many times it's
 * called during that request's render — every page calls this independently
 * (defense in depth, so no page silently trusts an unchecked caller), and
 * without caching that meant the same layout + page combo re-did a full
 * Supabase Auth round trip + DB query 2-3x per navigation, which is exactly
 * the kind of stacked latency that made the app feel slow to navigate.
 */
export const requireActiveStaff = cache(async (): Promise<Profile> => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new UnauthorizedError("กรุณาเข้าสู่ระบบ");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error || !profile || !profile.is_active) {
    throw new UnauthorizedError();
  }

  return profile;
});

export async function requireActiveAdmin(): Promise<Profile> {
  const profile = await requireActiveStaff();
  if (profile.role !== "admin") {
    throw new UnauthorizedError("ต้องเป็นผู้ดูแลระบบเท่านั้น");
  }
  return profile;
}
