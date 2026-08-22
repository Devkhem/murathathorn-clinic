# Clinic Mae — Decisions Log

Append-only log of architecture/product decisions. Newest entries at the top. When ChatGPT and previous
documentation conflict, the newest approved decision here wins — update the relevant doc to match.

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
