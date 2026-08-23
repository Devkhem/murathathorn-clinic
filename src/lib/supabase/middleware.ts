import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import type { Database } from "./types";
import { getSupabaseAnonKey, getSupabaseUrl } from "./env";

const PUBLIC_PATHS = ["/login", "/auth"];

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

/**
 * Redirects unauthenticated users away from protected pages. This is a UX
 * convenience, not the real security boundary — RLS is, and every page's data
 * functions independently call requireActiveStaff() (a full, server-revalidated
 * auth.getUser() + active-profile check) before touching any data. Called from
 * middleware.ts/proxy.ts.
 *
 * Deliberately uses getSession() here instead of getUser(): getSession() reads
 * the session from the request cookie locally (refreshing it over the network
 * only when the token is actually near expiry), while getUser() always makes a
 * network round trip to revalidate against Supabase's Auth server. Doing that
 * extra round trip on literally every navigation — on top of the one
 * requireActiveStaff() already does downstream — was adding ~150-300ms to every
 * click for a check whose only job here is "redirect if obviously logged out."
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const { pathname } = request.nextUrl;

  let user = null;
  try {
    const supabase = createServerClient<Database>(getSupabaseUrl(), getSupabaseAnonKey(), {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    });

    const {
      data: { session },
    } = await supabase.auth.getSession();
    user = session?.user ?? null;
  } catch (error) {
    // Missing env vars or an unreachable Supabase project — degrade to
    // "unauthenticated" (redirect to /login) instead of a hard 500, so a
    // misconfigured deployment fails as a clear login screen, not a crash.
    console.error("Failed to resolve Supabase session in proxy", error);
  }

  if (!user && !isPublicPath(pathname)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (user && pathname === "/login") {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/";
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}
