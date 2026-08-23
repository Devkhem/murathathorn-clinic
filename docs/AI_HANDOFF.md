# AI Handoff

Last updated: 2026-08-23, by Claude Code.

This file is written so another agent (ChatGPT, or a fresh Claude Code session) can pick up the project without
the prior conversation. Read this, then [tasks/TODO.md](../tasks/TODO.md), before changing anything.

## Completed

Bootstrapped Murathathorn Clinic, connected it to a live Supabase project, verified login + core navigation
against real data, and restyled the UI (real color branding + tasteful Magic UI motion). Not yet deployed to a
public URL — still local-only (`npm run dev` on this machine).

Concretely, on top of the initial scaffold (Next.js + TypeScript + Tailwind + shadcn/ui, the full collaboration
doc set, `lib/supabase` / `lib/permissions` / `lib/audit` / `lib/ocr`, the auth/patients/visits/appointments
features — see `docs/DECISIONS.md` for the full original bootstrap entry):

- **Live Supabase project connected.** Project ref `krvnrujesubfpjxxeqmt`. All 7 migrations applied via the SQL
  Editor (not `supabase db push` — no Docker/CLI auth available in this environment, so the combined SQL was
  pasted and run manually). `.env.local` has real credentials (git-ignored, not in the repo).
- **First staff account created and verified working**: `dodedonat@gmail.com`, role `admin` (first-user trigger
  confirmed correct). Password was set directly via the Supabase Admin API
  (`PUT /auth/v1/admin/users/{id}`) rather than the email-invite flow — the invite email either didn't arrive or
  wasn't found by the user, so admin-API password-set was the fallback. This account belongs to the actual
  end-user (the requester's mother), so it intentionally has a simple password by request — the "walk through
  it now" trade-off between security and an older-adult user actually being able to log in.
- **End-to-end smoke-tested with Playwright** (`chromium`, driven headlessly — see below) against the live
  dev server + live Supabase project: login succeeds, dashboard loads, `/patients` and `/appointments` both
  render real (empty) query results with zero console errors. This is real evidence the whole chain — proxy →
  server actions → Supabase client → RLS-scoped query → render — works, not just that it compiles.
- **UI restyle.** Replaced the default shadcn grayscale theme with a warm herbal-green + gold palette (fits a
  Thai traditional-medicine clinic) in `src/app/globals.css`. Added Magic UI (magicui.design) components —
  `ShineBorder`, `AnimatedGradientText`, `BorderBeam`, `NumberTicker`, `Confetti` — under `src/components/ui/`,
  applied deliberately only to low-frequency/decorative moments (login card, the single primary home-page
  action card, and a new post-save success screen in the registration wizard) and kept out of the actual
  data-entry steps, per the "ease of use, minimal distraction" product philosophy.
- **New: registration success screen**
  (`src/features/patients/components/registration-steps/success-step.tsx`) — after `createPatient` succeeds,
  the wizard now shows a confetti + animated-gradient HN reveal instead of an immediate redirect, then a
  "ไปหน้าคนไข้" button. This is the "clear confirmation" the product spec calls for.
- **New: invite/magic-link auth handler** — the app previously had no route to handle Supabase email links at
  all (`/auth` was reserved in the proxy's public-path list but nothing lived there). Added:
  - `src/app/auth/confirm/route.ts` — verifies `token_hash`/`type` from Supabase email links, establishes a
    session, redirects to `next` (defaults to `/auth/set-password`).
  - `src/app/auth/set-password/page.tsx` + `setPasswordAction` in
    `src/features/auth/actions/auth-actions.ts` — lets a freshly-invited user (who has a session but no
    password yet) set one. Needed because the login page only supports email+password.
- **Logout now requires confirmation** (`src/features/auth/components/logout-button.tsx`) — a dialog, not an
  instant sign-out — specifically because the end-user's session is meant to persist indefinitely on her
  device, so an accidental tap on the button shouldn't force a password re-entry she may not remember.

## Files Changed

Beyond the initial bootstrap commit:

```text
.env.local                                          # real Supabase credentials — git-ignored, not committed
docs/AI_HANDOFF.md, docs/DECISIONS.md, tasks/TODO.md # this update
src/app/globals.css                                  # herbal-green/gold theme tokens
src/app/login/page.tsx                               # ShineBorder + AnimatedGradientText
src/app/(dashboard)/page.tsx                          # BorderBeam on the primary quick-action card
src/app/(dashboard)/appointments/page.tsx             # Button render={<Link/>} nativeButton={false} fix
src/app/auth/confirm/route.ts                         # NEW — email link handler
src/app/auth/set-password/page.tsx                    # NEW
src/components/ui/{border-beam,shine-border,animated-gradient-text,number-ticker,confetti}.tsx  # NEW (Magic UI)
src/features/auth/actions/auth-actions.ts             # + setPasswordAction
src/features/auth/components/set-password-form.tsx    # NEW
src/features/auth/components/logout-button.tsx        # rewritten — confirmation dialog
src/features/patients/components/patient-search.tsx   # Button render={<Link/>} nativeButton={false} fix
src/features/patients/components/patient-registration-wizard.tsx  # success screen instead of immediate redirect
src/features/patients/components/registration-steps/success-step.tsx  # NEW
```

## Database Changes

None beyond the original 7 migrations (see `docs/DATABASE.md`). They are now **applied and verified** against
the live project `krvnrujesubfpjxxeqmt` — confirmed via `GET /rest/v1/{table}` returning 200 for all 5 tables
and the two storage buckets both showing `"public":false`.

## Current Status

- `npm run typecheck`, `npm run lint`, and `npm run build` all pass cleanly.
- **A live Supabase project is connected and working.** `.env.local` exists locally with real credentials
  (not in git). Login, session persistence, and read-paths for patients/appointments are confirmed working
  end-to-end against it.
- **Patient registration has not been walked end-to-end with real camera-captured photos** — the wizard's
  first step (face photo capture) was screenshotted and renders correctly, but no session has actually
  completed all 4 steps + OCR + duplicate-check + save with the live DB. That's the next real gap.
- **The app is local-only.** It runs via `npm run dev` on the developer's machine; there is no public URL yet.
  The end-user (a family member, on her own device/network) cannot reach it. Deployment was requested and is
  the immediate next step — see "Next Recommended Task".

## Tests

Still no automated test suite. Verification this session: `tsc --noEmit`, `eslint`, `next build`, and a
Playwright script (`chromium`, headless) driving login → dashboard → `/patients` → `/appointments`, screenshotting
each and asserting zero console errors. That script was ad-hoc (run from a scratch npm project outside the
repo, not committed) — worth turning into a real `run` project-skill or a checked-in smoke test if this pattern
gets used again.

## Known Issues

- Patient registration flow's full happy path (photo → photo → OCR → phone → review → save → HN) has NOT been
  completed with a real save yet — verified through photo capture + OCR (both steps, on production, zero
  console errors) but not through phone/review/save. **A real production bug was found and fixed along the
  way**: `src/lib/supabase/env.ts` read `NEXT_PUBLIC_*` vars via a dynamic `process.env[name]` lookup, which
  Next.js cannot statically inline into the browser bundle — every client-side Supabase call (photo upload
  during registration, patient/appointment search) threw `Missing required environment variable
  NEXT_PUBLIC_SUPABASE_URL` in the browser, even though the var was correctly set everywhere. Fixed by using a
  literal `process.env.NEXT_PUBLIC_SUPABASE_URL` access per var; verified by grepping the real URL into the
  built client chunk and replaying the flow with zero errors, then redeployed. See `docs/DECISIONS.md`.
- Appointments: `updateAppointmentStatus` (mark completed/cancelled/no-show) still has no UI hookup.
- No staff sign-up UI — new staff accounts currently require either the Supabase dashboard or an admin-API
  call like the one used to create the first account.
- Supabase's built-in invite email either didn't arrive or wasn't found for the first account — unresolved
  whether that's a deliverability issue (spam/rate-limit on the free email service) or user error. If a second
  staff account is ever invited by email, watch for the same problem; the `/auth/confirm` +
  `/auth/set-password` pages exist now regardless and should work once an email does arrive.
- **Not deployed.** Only reachable via `localhost:3000` (or the same-WiFi LAN IP) on the developer's machine.

## Gotchas for the Next Agent

- **This shadcn install uses the Base UI registry, not Radix.** Polymorphic composition is
  `render={<Element />}`, not `asChild`. When rendering a non-button element (e.g. `next/link`'s `<Link>`)
  through `<Button render={<Link .../>}>`, also pass `nativeButton={false}` — otherwise Base UI logs a console
  warning (rendering a non-`<button>` while `nativeButton` defaults `true`). Two spots already had this bug and
  were fixed this session; grep for `render={<Link` before adding a new one.
- **Magic UI components are vendored, not an npm package** — pulled in via
  `npx shadcn add https://magicui.design/r/<component>.json`, they land in `src/components/ui/` like normal
  shadcn components and can be edited freely. `magic-card.tsx` was pulled once and deleted — it depends on
  `next-themes`' `useTheme()` which this project never wired up (no light/dark toggle exists), and its
  mount-detection `useEffect` also tripped the `react-hooks/set-state-in-effect` lint rule. Don't reintroduce it
  without first adding a `ThemeProvider`.
- Everything else from the original handoff still applies: `src/proxy.ts` (not `middleware.ts`, Next 16
  renamed it), `src/lib/supabase/types.ts` is hand-written to satisfy postgrest-js's `GenericSchema` shape, and
  OCR is still the `ManualEntryOcrProvider` no-op stub.

## Next Recommended Task

1. **Deploy to a public URL** (requested by the user mid-session) — push this repo to GitHub, connect it to
   Vercel, set the same three env vars there (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
   `SUPABASE_SERVICE_ROLE_KEY`), and update the Supabase project's Auth "Site URL"/redirect allowlist to the
   production domain (currently whatever `next dev`'s default is, likely `localhost:3000`).
2. Once deployed, walk the **full patient registration flow** on the actual target device (iPad) against the
   production URL — that closes out `PAT-001` for real.
3. Then `PAT-002`/`VISIT-001`/`APPT-001`'s remaining "verified against a live project" checkboxes.
