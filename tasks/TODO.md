# TODO

Status values: `TODO`, `IN PROGRESS`, `BLOCKED`, `DONE` (move to `tasks/DONE.md` when done).

---

## INFRA-002 Deploy to a public URL

Status: IN PROGRESS

Objective: Get the app reachable from a real device on a real network (not just `localhost` on the developer's
machine), so the actual end-user can use it.

Acceptance Criteria:

- [ ] push the repo to GitHub
- [ ] connect to Vercel, set `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` /
      `SUPABASE_SERVICE_ROLE_KEY` as env vars there
- [ ] update Supabase project's Auth "Site URL" / redirect allowlist to the production domain
- [ ] confirm login + dashboard load on the production URL

## PAT-001 Patient Registration

Status: IN PROGRESS — connected to a live Supabase project; full happy path not yet walked end-to-end.

Objective: Allow clinic staff to register a new patient with minimal typing.

Acceptance Criteria:

- [x] capture patient face photo
- [x] capture Thai ID card photo
- [x] OCR abstraction implemented (`ManualEntryOcrProvider` stub wired; a real provider is a drop-in in `lib/ocr`)
- [x] input phone number
- [x] patient data preview / edit step
- [x] duplicate patient detection (citizen ID → phone → name+birthdate, with the
      "พบคนไข้ที่อาจเป็นคนเดียวกัน" dialog)
- [x] HN generated automatically (server-side `generate_hn()` function)
- [x] privacy acknowledgement recorded
- [x] a clear post-save confirmation screen (HN reveal + confetti, `success-step.tsx`)
- [ ] the full 4-step flow (photo → photo → OCR → phone → review → save) walked start-to-finish against the
      live DB with a real photo upload — only step 1's render has been verified so far

## PAT-002 Patient Search + Patient Profile

Status: IN PROGRESS — search verified against live DB (empty-state render confirmed); profile page untested
(no patients exist yet).

Objective: Find a patient quickly and see their profile on one screen.

Acceptance Criteria:

- [x] search by name / HN / phone (`/patients`) — verified rendering against live Supabase
- [x] patient profile shows photo, name, HN, age, phone, allergies, chronic conditions (`/patients/[id]`)
- [x] `+ บันทึกการรักษาวันนี้` primary action
- [x] treatment history timeline on the same page
- [ ] profile page verified with an actual patient record (blocked on PAT-001's remaining item)

## VISIT-001 Treatment History

Status: IN PROGRESS — code complete, blocked on having a real patient to attach a visit to.

Objective: Record a treatment visit without ever overwriting past visits.

Acceptance Criteria:

- [x] create visit form (chief complaint, diagnosis, notes) — `AddVisitDialog`
- [x] visits are append-only, shown newest-first
- [x] audit log entry on every visit create (DB trigger, `visits_audit`)
- [ ] verified against a live Supabase project with a real visit created

## APPT-001 Appointments

Status: IN PROGRESS — list view verified against live DB (empty-state render confirmed); create flow untested.

Objective: Schedule and track appointments per patient.

Acceptance Criteria:

- [x] create appointment tied to a patient (`/appointments/new`)
- [x] appointment list (`/appointments`) — verified rendering against live Supabase
- [ ] UI to transition status (scheduled → completed/cancelled/no_show) — `updateAppointmentStatus` action
      exists but nothing in the UI calls it yet
- [ ] create flow verified end-to-end (needs a real patient to attach to, same blocker as VISIT-001)

## SEC-001 Security Review + UX Polish

Status: IN PROGRESS

Objective: Final pass once Phases 1-5 are functionally complete and running against a real project.

Acceptance Criteria:

- [ ] RLS policy audit against `docs/SECURITY.md` checklist — schema is live, policies applied, but not
      manually adversarially tested (e.g. confirm an unauthenticated request is actually denied)
- [ ] confirm no service-role key reachable from client bundle (spot-check `npm run build` output)
- [ ] confirm ID card views are audited (manually view an ID card, check `audit_logs`)
- [ ] accessibility / large-text / iPad pass with an actual older-adult test user if possible
- [x] logout requires explicit confirmation (prevents an accidental tap from force-logging-out the primary,
      non-technical end-user)

## AUTH-001 Staff sign-up / invite flow

Status: TODO

Objective: A real way to onboard additional staff accounts without a developer running Admin API calls by hand.

Acceptance Criteria:

- [ ] resolve why the Supabase invite email didn't arrive/wasn't found for the first account (deliverability
      vs. user error — see `docs/AI_HANDOFF.md` Known Issues)
- [ ] an admin-only "add staff" screen in the app (currently `/auth/confirm` + `/auth/set-password` exist and
      handle the email-link side, but nothing in the UI triggers an invite)

---

## Done (see tasks/DONE.md for the full write-up)

- ~~INFRA-001 Connect a real Supabase project~~ — done: project `krvnrujesubfpjxxeqmt` connected, all 7
  migrations applied, first admin account created and login verified end-to-end.
