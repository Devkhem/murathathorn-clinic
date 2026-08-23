# Murathathorn Clinic (มุรทาธรคลินิกแพทย์แผนไทย)

A very simple clinic management app, built for an older adult, non-technical clinic staff user. Next.js (App
Router) + TypeScript + Tailwind + shadcn/ui + Supabase.

Start here, not with this file:

- [AGENTS.md](AGENTS.md) — how AI agents (Claude Code, ChatGPT) should work on this repo
- [docs/PRODUCT_SPEC.md](docs/PRODUCT_SPEC.md) — what the product does
- [docs/DATABASE.md](docs/DATABASE.md) — schema
- [docs/SECURITY.md](docs/SECURITY.md) — RLS / storage / secrets rules
- [docs/AI_HANDOFF.md](docs/AI_HANDOFF.md) — current state of the project
- [tasks/TODO.md](tasks/TODO.md) — what's next

## Local setup

```bash
npm install
cp .env.example .env.local   # fill in your Supabase project's URL + anon key + service role key
npx supabase link --project-ref <your-project-ref>
npx supabase db push          # applies supabase/migrations/*.sql
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You'll land on `/login` — the first account ever created
becomes an admin automatically (see `supabase/migrations/20240101000001_profiles.sql`); create it via the
Supabase dashboard's Authentication > Users, or wire up a sign-up page later.

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm run lint` — ESLint
- `npm run typecheck` — `tsc --noEmit`
