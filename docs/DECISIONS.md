# Murathathorn Clinic — Decisions Log

Append-only log of architecture/product decisions. Newest entries at the top. When ChatGPT and previous
documentation conflict, the newest approved decision here wins — update the relevant doc to match.

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
