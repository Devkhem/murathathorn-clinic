# AI Handoff

Last updated: 2026-08-23, by Claude Code.

This file is written so another agent (ChatGPT, or a fresh Claude Code session) can pick up the project without
the prior conversation. Read this, then [tasks/TODO.md](../tasks/TODO.md), before changing anything.

## Completed

Bootstrapped Murathathorn Clinic from nothing: Next.js + TypeScript + Tailwind + shadcn/ui app, the full collaboration
doc set, the Supabase schema/RLS/storage design, Supabase auth wiring, the 4-item dashboard shell, and a working
(code-complete, not yet live-DB-verified) Patient Registration flow plus first passes at Patient Search/Profile,
Treatment History, and Appointments.

Concretely:

- Scaffolded with `create-next-app` (App Router, TypeScript, Tailwind v4, `src/` dir) + `shadcn` (Base UI
  registry, not Radix — see "Gotchas" below).
- Wrote `AGENTS.md`, `CLAUDE.md`, `docs/PRODUCT_SPEC.md`, `docs/DATABASE.md`, `docs/SECURITY.md`,
  `docs/DECISIONS.md`, `docs/AI_HANDOFF.md` (this file), `tasks/TODO.md`, `tasks/DONE.md`.
- Wrote 7 SQL migrations under `supabase/migrations/` covering `profiles`, `patients` (+ `generate_hn()`),
  `visits`, `appointments`, private storage buckets, `audit_logs` (+ write-triggers), and RLS policies for all
  of the above.
- Built `lib/supabase` (browser/server/service-role clients + env helper + proxy session refresh),
  `lib/permissions` (`requireActiveStaff`/`requireActiveAdmin`), `lib/audit` (`recordAuditEvent`), `lib/ocr`
  (provider abstraction + a `ManualEntryOcrProvider` fallback so the flow works with zero OCR vendor configured).
- Built the auth feature (`features/auth`): login page, sign-in/sign-out server actions.
- Built the patients feature (`features/patients`): camera-capture control, the full registration wizard
  (face photo → ID card photo → OCR → phone → review/edit → save, with the duplicate-detection dialog), patient
  search, patient profile, and a reusable `PatientPicker`.
- Built a minimal visits feature (`features/visits`) and appointments feature (`features/appointments`) so the
  patient profile's `+ บันทึกการรักษาวันนี้` button and the `นัดหมาย` nav tab aren't dead ends.
- Root layout uses Noto Sans Thai at an 18px base size; the 4-item bottom/rail nav
  (`src/components/main-nav.tsx`) matches `docs/PRODUCT_SPEC.md` exactly.

## Files Changed

Everything — this was the initial commit. Look at the repo tree rather than a diff; key paths:

```text
AGENTS.md, CLAUDE.md, README.md, .env.example
docs/                          # PRODUCT_SPEC, DATABASE, SECURITY, DECISIONS, AI_HANDOFF
tasks/                         # TODO, DONE
supabase/migrations/*.sql      # 7 files, numbered 20240101000001-7
src/proxy.ts                   # session refresh + route protection (Next 16 renamed middleware -> proxy)
src/app/layout.tsx             # Thai font, Toaster
src/app/login/page.tsx
src/app/(dashboard)/layout.tsx # 4-item nav shell, requires an active staff profile
src/app/(dashboard)/page.tsx   # หน้าหลัก
src/app/(dashboard)/patients/{page,new/page,[id]/page}.tsx
src/app/(dashboard)/visits/page.tsx
src/app/(dashboard)/appointments/{page,new/page}.tsx
src/lib/{supabase,permissions,audit,ocr,date}/
src/features/{auth,patients,visits,appointments}/
```

## Database Changes

All new — see [docs/DATABASE.md](DATABASE.md) for the full schema writeup. Migrations are written but **not
yet applied to any real Postgres instance** (no Docker available in the environment this was built in, so
`supabase start` couldn't be used to smoke-test them locally either). They're standard, mostly boring DDL, but
treat them as unverified until `npx supabase db push` has been run against a real project and `npx supabase db
reset` (or equivalent) has been used to confirm they apply cleanly from empty.

## Current Status

- `npm run typecheck`, `npm run lint`, and `npm run build` all pass cleanly.
- The app boots and serves `/login` (200) and correctly redirects `/` → `/login` (307) when unauthenticated —
  verified with `next build && next start` against a machine with **no** Supabase credentials configured, to
  confirm the proxy degrades gracefully instead of crashing (see `src/lib/supabase/middleware.ts`).
- **No live Supabase project is connected.** Nothing has been tested against a real database: login,
  registration, duplicate detection, HN generation, visits, appointments — all of it is implemented against the
  `lib/supabase` abstractions and should work once `.env.local` has real credentials, but "should" is doing a
  lot of work in that sentence. This is the single biggest thing the next session should do.

## Tests

No automated test suite exists yet (none was requested; nothing beyond `PRODUCT_SPEC.md`'s Phase 1-2 scope was
attempted). Verification so far is: `tsc --noEmit`, `eslint`, `next build`, and one manual `next start` smoke
test of the unauthenticated redirect path. The actual patient registration / duplicate detection / visit /
appointment flows have **not** been exercised against a real backend.

## Known Issues

- No live Supabase project — see "Current Status". This blocks every acceptance criterion in
  `tasks/TODO.md` that says "verified against a live Supabase project."
- Appointments: `updateAppointmentStatus` (mark completed/cancelled/no-show) exists as a server action but has
  no UI hookup yet — appointments can be created and listed but not transitioned.
- No staff sign-up UI. The first-ever `auth.users` row becomes admin automatically
  (`handle_new_user()` in `20240101000001_profiles.sql`); until there's a sign-up page, creating that first
  account has to happen via the Supabase dashboard (Authentication → Users → Add user), then logging in here.
- `.env.local` doesn't exist in this repo (by design — it's git-ignored). Nothing will actually connect to a
  database until it's created from `.env.example`.

## Gotchas for the Next Agent

- **This shadcn install uses the Base UI registry, not Radix.** `components/ui/button.tsx`,
  `dialog.tsx`, etc. import from `@base-ui/react/*`. The polymorphic-render API is `render={<Link ... />}`, not
  Radix's `asChild` + child element. Grep the codebase for `render={` for working examples
  (`src/features/patients/components/patient-search.tsx`,
  `src/features/visits/components/add-visit-dialog.tsx`) before assuming Radix conventions apply.
- **Next.js 16 renamed `middleware.ts` to `proxy.ts`** (function renamed `middleware` → `proxy` too). This repo
  already uses the new convention (`src/proxy.ts`). Read `AGENTS.md`'s embedded Next.js agent-rules block and
  `node_modules/next/dist/docs/` before assuming anything else about Next.js APIs has stayed the same —
  React 19.2 / Next 16 diverge from older training data in several places.
- `src/lib/supabase/types.ts` is **hand-written**, not generated. It's shaped to satisfy
  `@supabase/postgrest-js`'s `GenericSchema` constraint (every table needs `Relationships: []`, the schema needs
  `Views`/`Functions`) — if you regenerate with `npx supabase gen types typescript`, the output already matches
  this shape; just re-add the convenience type aliases (`Profile`, `Patient`, `Visit`, `Appointment`,
  `AuditLog`) at the bottom.
- OCR is currently a no-op stub (`ManualEntryOcrProvider`) — the registration flow works, staff just type
  everything by hand at the review step. Wiring a real Thai ID OCR provider only requires implementing
  `OcrProvider` (`lib/ocr/types.ts`) and returning it from `getOcrProvider()` (`lib/ocr/index.ts`).

## Next Recommended Task

**INFRA-001** in `tasks/TODO.md`: connect a real Supabase project (`supabase link` + `supabase db push`, fill
in `.env.local`), create the first staff account, and walk the full patient registration flow end-to-end —
ideally on an actual iPad, since that's the target device. Everything else in `tasks/TODO.md` is blocked on
this in practice, even though it's marked "code complete."
