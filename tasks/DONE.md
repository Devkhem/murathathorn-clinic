# DONE

## ARCH-001 Project Architecture + Authentication + Database (Phase 1)

Status: DONE (2026-08-23)

Objective: Stand up the Next.js + Supabase project, collaboration docs, database schema, RLS, auth, and the
dashboard shell.

Acceptance Criteria:

- [x] Next.js + TypeScript + Tailwind + shadcn/ui scaffolded
- [x] Feature-based folder structure (`features/*`, `lib/*`)
- [x] Collaboration docs created (`AGENTS.md`, `CLAUDE.md`, `docs/*`, `tasks/*`)
- [x] Database schema migrations written (`patients`, `visits`, `appointments`, `profiles`, `audit_logs`)
- [x] HN generation function (server-side, sequence-backed)
- [x] RLS policies for all tables + storage buckets
- [x] Supabase auth (email/password login, middleware-protected routes)
- [x] Dashboard shell with the 4 approved primary nav items
- [x] Patient Registration flow implemented against the abstractions (needs live Supabase project to run end-to-end)

Notes: No live Supabase project was connected in this pass — `.env.local` needs real project credentials before
the app can run against a database. See `docs/AI_HANDOFF.md` for exact next steps.

---

## INFRA-001 Connect a real Supabase project

Status: DONE (2026-08-23)

Objective: Get the app running against a real backend so Phase 2+ can actually be tested.

Acceptance Criteria:

- [x] created Supabase project `krvnrujesubfpjxxeqmt`
- [x] applied `supabase/migrations/` — via the SQL Editor (pasted the 7 files as one combined script), not
      `supabase db push`, since no Docker/CLI auth was available in this environment
- [x] filled in `.env.local` from `.env.example` with real project credentials
- [x] created the first staff account and confirmed it became admin automatically (`handle_new_user()` trigger)
- [x] confirmed login works end-to-end (verified with a headless-Chromium script: login → dashboard →
      `/patients` → `/appointments`, zero console errors, real Supabase queries returning real — empty —
      results)
- [ ] walk the full patient registration flow on an iPad — not done yet, tracked separately in `tasks/TODO.md`
      under `PAT-001`

Notes: The Supabase invite-email flow (`/auth/v1/invite`) was tried first but the email either didn't arrive or
wasn't found; fell back to setting the account's password directly via the Supabase Admin API. Built the
missing `/auth/confirm` + `/auth/set-password` pages along the way since they didn't exist at all before this —
see `docs/AI_HANDOFF.md` for details.
