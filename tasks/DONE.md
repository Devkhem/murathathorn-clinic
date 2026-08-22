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
