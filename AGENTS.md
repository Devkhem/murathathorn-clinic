<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Murathathorn Clinic — Agent Instructions

Murathathorn Clinic is a clinic management app built for a small clinic run by an **older adult, non-technical user**.
It is developed collaboratively:

- **ChatGPT** — Product Architect / System Designer / Reviewer
- **Claude Code** — Main Developer / Implementation Agent
- **This Git repository** — single source of truth
- **Supabase** — backend, database, auth, storage

## The Repository Is the Source of Truth

Do not treat chat history as authoritative. All decisions, requirements, architecture, and handoffs live here:

- [docs/PRODUCT_SPEC.md](docs/PRODUCT_SPEC.md) — what the product does and why
- [docs/DATABASE.md](docs/DATABASE.md) — schema, indexed against `supabase/migrations/`
- [docs/SECURITY.md](docs/SECURITY.md) — RLS, storage, secrets, audit rules
- [docs/DECISIONS.md](docs/DECISIONS.md) — append-only architecture decision log (newest first)
- [docs/AI_HANDOFF.md](docs/AI_HANDOFF.md) — current state, for an agent with no prior context
- [tasks/TODO.md](tasks/TODO.md) / [tasks/DONE.md](tasks/DONE.md) — task tracking

**Before starting any work:** check `git status` and recent commits, then read the five files above. Another AI
agent may have modified this repo since your last session — do not assume you're the only one working on it, and
do not rewrite a working module just because you'd have built it differently. Review before replacing.

If instructions from chat conflict with what's in this repo, prefer the repo. If two docs conflict with each
other, `docs/DECISIONS.md` (newest entry) wins — and then fix the stale doc.

## Product Philosophy (non-negotiable)

Ease of use over feature density, always:

- large buttons, large readable Thai text
- minimal navigation — exactly 4 primary menu items (`หน้าหลัก`, `คนไข้`, `บันทึกการรักษา`, `นัดหมาย`) — do not add
  more without explicit approval
- one screen, one task
- no technical/medical jargon in the UI
- no deep menus
- minimize typing — auto-populate via OCR/lookups whenever possible
- clear confirmations after every save
- clear, obvious Back buttons
- design for iPad first, then desktop, then mobile

Full detail: [docs/PRODUCT_SPEC.md](docs/PRODUCT_SPEC.md).

## Tech Stack

Next.js (App Router) + TypeScript + Tailwind CSS + shadcn/ui + Supabase (Postgres/Auth/Storage). UI language is
Thai; code and developer docs are English.

## Code Structure

Feature-based, not layer-based:

```text
src/features/patients/      # patient registration, search, profile
src/features/visits/        # treatment records
src/features/appointments/  # appointments
src/features/auth/          # login, session
src/lib/supabase/           # browser/server/service-role Supabase clients
src/lib/permissions/        # role checks (staff/admin)
src/lib/audit/              # audit log helpers
src/lib/ocr/                # OCR provider abstraction
```

Keep business logic out of UI components — put it in `actions/` (server actions) or `lib/` inside each feature.
Avoid giant components.

## Security Rules (non-negotiable)

See [docs/SECURITY.md](docs/SECURITY.md) in full. In short:

- RLS on every table holding patient data — no exceptions.
- Storage buckets for patient photos and ID cards are private; access only via short-lived signed URLs.
- Viewing a Thai ID card image is an audited action.
- `SUPABASE_SERVICE_ROLE_KEY` is server-only, never imported by client code.
- HN is generated server-side only; users never type an HN.

## Git Workflow

- Small, understandable commits with descriptive messages, e.g. `feat: add patient registration flow`,
  `fix: prevent duplicate patient creation`, `security: add patient storage RLS`.
- Check `git status` and `git log` before editing — don't overwrite unrelated in-flight work.
- Do not implement inventory, billing, AI diagnosis, complex analytics, pharmacy, or lab integration unless
  explicitly requested — see "Out of Scope" in `docs/PRODUCT_SPEC.md`.

## Handoff Protocol

At the end of every meaningful implementation task, update `docs/AI_HANDOFF.md` with: Completed, Files Changed,
Database Changes, Current Status, Tests, Known Issues, Next Recommended Task. This is what lets ChatGPT (or a
fresh agent) pick up the project without the full conversation history.

## Verification Loop

Before declaring anything complete:

1. `npm run lint`
2. `npx tsc --noEmit`
3. Tests, where they exist
4. Verify migrations apply cleanly (`npx supabase db push` / local `npx supabase start` + `npx supabase db reset`)
5. Verify RLS against `docs/SECURITY.md`'s checklist
6. Walk the actual user flow, don't just read the code
7. Fix errors before declaring completion — don't say a feature is "done" if the core flow doesn't work
