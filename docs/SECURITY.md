# Clinic Mae — Security

Patient data (identity, ID card images, health information) is sensitive. Treat it accordingly.

## Principles

- **Row Level Security everywhere.** Every table with clinical or personal data has RLS enabled; no table is
  readable/writable by default. Access is granted only to authenticated, `is_active` staff via explicit policies.
- **Private storage only.** No storage bucket holding patient photos or ID cards is public. All access to files
  is via short-lived **signed URLs**, generated server-side, never permanent public URLs.
- **Audit sensitive reads, not just writes.** Viewing a Thai ID card image is itself a sensitive action and must
  write an `audit_logs` row (`action = 'id_card.view'`) before the signed URL is returned.
- **Secrets never reach the browser.** `SUPABASE_SERVICE_ROLE_KEY` and any other secret is used only in server
  actions / route handlers / server components, and only referenced via `process.env` on the server. Only
  `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are exposed client-side, and both are meant to be
  public (RLS is what protects the data, not key secrecy).
- **Server-side enforcement, not just UI enforcement.** HN generation, duplicate detection, and permission checks
  must hold even if someone calls the API directly. RLS policies are the real boundary; UI checks are just UX.

## Roles

- `staff` — default role for clinic staff. Can create/read patients, visits, appointments. Cannot deactivate
  other staff.
- `admin` — everything `staff` can do, plus managing staff accounts (`profiles.role`, `profiles.is_active`).

Roles live in `profiles.role` and are checked in RLS policies via a `security definer` helper
(`is_staff()` / `is_admin()`) — see `lib/permissions`.

## Environment Variables

| variable                         | exposure      | used for                                      |
|-----------------------------------|---------------|-------------------------------------------------|
| `NEXT_PUBLIC_SUPABASE_URL`        | public        | Supabase project URL                             |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`   | public        | browser client, RLS-scoped                       |
| `SUPABASE_SERVICE_ROLE_KEY`       | server only   | server actions that must bypass RLS deliberately (e.g. HN generation, signed URL issuance) — never imported by any file under `"use client"` |

`.env.local` is git-ignored. `.env.example` documents the required shape without real values.

## ID Card Handling

- Stored in the private `patient-id-cards` bucket, one object per patient.
- No component ever requests a public URL for this bucket.
- Every read goes through a server action that: (1) checks the caller is an authenticated, active staff member,
  (2) writes an `audit_logs` row, (3) returns a signed URL with a short TTL (default 5 minutes).
- OCR extraction happens through the abstraction in `lib/ocr`, which receives the image server-side; the raw
  image is never sent to a third-party OCR provider from the browser.

## Verification Checklist (run before declaring a security-relevant change complete)

- [ ] RLS enabled on every new table (`alter table ... enable row level security`)
- [ ] Explicit policy for each of select/insert/update/delete that's actually needed — no blanket `using (true)`
- [ ] No service-role key imported into client code
- [ ] Storage bucket defaults to private; access via signed URL only
- [ ] Sensitive reads (ID card view) are audited
- [ ] `npm run lint` / `tsc --noEmit` pass
