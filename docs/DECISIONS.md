# Murathathorn Clinic — Decisions Log

Append-only log of architecture/product decisions. Newest entries at the top. When ChatGPT and previous
documentation conflict, the newest approved decision here wins — update the relevant doc to match.

---

## Decision

Fixed `src/lib/supabase/env.ts` to read each `NEXT_PUBLIC_*` env var via a literal `process.env.NEXT_PUBLIC_X`
property access instead of a shared dynamic `requireEnv(name)` helper that did `process.env[name]`.

## Reason

The user reported "Missing required environment variable NEXT_PUBLIC_SUPABASE_URL" from the live production
site. Reproduced with a headless-Chromium script driving the actual registration flow: the error fired the
moment a client component called the browser Supabase client (photo upload), even though the var was
unquestionably set (confirmed present in `.env.local` and in Vercel's production env store, confirmed baked
into the client bundle after the fix). Root cause: Next.js's client-bundle env-var inlining only works when its
compiler can statically match the exact literal `process.env.NEXT_PUBLIC_FOO` at build time — a dynamic
`process.env[name]` lookup can't be pattern-matched, so it silently resolved to `undefined` in the browser
while working fine on the server (where `process.env` is the real Node object). A one-helper-fits-all
abstraction was the wrong shape for this: server-only vars (`SUPABASE_SERVICE_ROLE_KEY`) can use a dynamic
lookup safely; `NEXT_PUBLIC_*` vars can't.

## Impact

`src/lib/supabase/env.ts` only. No call sites changed (`getSupabaseUrl()` / `getSupabaseAnonKey()` /
`getSupabaseServiceRoleKey()` keep the same signatures). Verified by grepping the real Supabase URL string into
the built `.next/static/chunks/*.js` output, then replaying login → photo capture → ID card capture against
both local dev and the live production deployment with zero console errors. Redeployed to production
immediately since this broke a live, user-facing flow.

## Date

2026-08-24

---

## Decision

Wired up a real OCR provider for the Thai ID card step: `ClaudeOcrProvider` (`src/lib/ocr/claude-ocr-provider.ts`),
using Claude's vision input + structured outputs (`client.messages.parse` with a Zod schema, model
`claude-opus-5`), selected automatically via `getOcrProvider()` when `ANTHROPIC_API_KEY` is set. Uses the same
Anthropic API key that runs this Claude Code session, at the user's explicit choice (offered a separate
dedicated key as the alternative).

## Reason

The previous `ManualEntryOcrProvider` was always a placeholder — no OCR provider had actually been chosen yet.
The user asked why ID card reading wasn't working and confirmed they wanted real OCR. Claude's vision API was
chosen over a dedicated Thai-ID-OCR vendor (e.g. iApp) because it needed no new account/sign-up (an Anthropic
key already existed in this environment), handles the พ.ศ.→ค.ศ. (Buddhist→Gregorian) year conversion and mixed
Thai/Latin text in the prompt rather than needing vendor-specific post-processing, and self-reports a confidence
score the UI already had a slot for.

## Impact

`src/lib/ocr/claude-ocr-provider.ts` (new), `src/lib/ocr/index.ts` (provider selection),
`.env.example`/`.env.local`/Vercel production env (`ANTHROPIC_API_KEY`). Cost note: every ID card photo now
costs one Opus-tier vision API call — worth revisiting if per-registration cost matters at scale (a cheaper
model is a one-line change in `claude-ocr-provider.ts`, traded against extraction accuracy).

## Date

2026-08-24

---

## Decision

Restyled the UI: replaced the default shadcn grayscale theme with a warm herbal-green + gold palette, and added
a handful of Magic UI (magicui.design) motion components (`ShineBorder`, `AnimatedGradientText`, `BorderBeam`,
`NumberTicker`, `Confetti`), applied only to low-frequency/decorative moments — the login card, the single
primary quick-action card on the home page, and a new post-save success screen in the patient registration
wizard. Deliberately kept out of the actual data-entry steps of the registration wizard and every other
transactional form.

## Reason

The user asked for a nicer-looking UI and specifically mentioned Magic UI. The product philosophy
(`docs/PRODUCT_SPEC.md`) prioritizes calm, low-distraction screens for an older-adult primary user, so motion
was scoped to places where a moment of delight doesn't compete with a task in progress — most importantly, a
clear "it worked" moment right after saving a new patient (confetti + HN reveal), which also directly serves
the existing "provide clear confirmations" requirement rather than fighting it.

## Impact

`src/app/globals.css` (theme tokens), `src/components/ui/*` (5 new vendored Magic UI files), `src/app/login/page.tsx`,
`src/app/(dashboard)/page.tsx`, and a new `success-step.tsx` in the registration wizard. See
`docs/AI_HANDOFF.md` for the full file list and the Base UI `nativeButton` gotcha this surfaced.

## Date

2026-08-23

---

## Decision

Renamed the project from the placeholder "Clinic Mae" / "คลินิกแม่" to the real clinic name,
**Murathathorn Clinic (มุรทาธรคลินิกแพทย์แผนไทย)**. This covers the project/folder name, `package.json`
(`murathathorn-clinic`), the `supabase/config.toml` local project id, all documentation, and the on-screen Thai
brand name (login page, dashboard header, page metadata).

## Reason

"Clinic Mae" was a placeholder name carried over from the initial collaboration brief, not the actual clinic's
name. The clinic operator provided the real name and asked for a full rename, including the folder/package, not
just the on-screen text.

## Impact

The project directory moved from `~/Documents/clinic-mae` to `~/Documents/murathathorn-clinic` — any saved
paths, terminal `cd` history, or editor workspaces pointing at the old location need to be updated. No Supabase
project was connected yet at rename time, so there is no remote project name to reconcile.

## Date

2026-08-23

---

## Decision

Accepted the shadcn CLI's current default component registry, which is **Base UI** (`@base-ui/react`), not
Radix UI. Polymorphic composition uses Base UI's `render={<Element />}` prop, not Radix's `asChild` + child
element pattern.

## Reason

Ran `npx shadcn@latest init -d` without overriding `-b`; as of the shadcn CLI version installed
(mid-2026), Base UI is the default base library. Re-running init with `-b radix` would have opted back into
Radix, but there was no product reason to fight the tool's current default.

## Impact

Every generated file under `src/components/ui/` and any future `shadcn add` output uses Base UI conventions.
See "Gotchas for the Next Agent" in `docs/AI_HANDOFF.md` for the concrete API difference.

## Date

2026-08-23

---

## Decision

Bootstrap the project: Next.js (App Router) + TypeScript + Tailwind CSS + shadcn/ui, Supabase (Postgres, Auth,
Storage), feature-based folder structure, and the full collaboration doc set required by `CLAUDE.md`.

## Reason

This is the tech stack and structure mandated by the project brief, chosen so the codebase stays simple enough
for a solo non-technical stakeholder's clinic while still being production-quality and auditable by another AI
agent (ChatGPT) without needing full chat history.

## Impact

Establishes `AGENTS.md`, `CLAUDE.md`, `docs/`, `tasks/`, `supabase/migrations/`, and the `src/features/*` /
`src/lib/*` layout. All future work builds on this scaffold.

## Date

2026-08-23
