# TODO

Status values: `TODO`, `IN PROGRESS`, `BLOCKED`, `DONE` (move to `tasks/DONE.md` when done).

---

## PAT-001 Patient Registration

Status: IN PROGRESS — code complete, blocked on a live Supabase project to verify end-to-end.

Objective: Allow clinic staff to register a new patient with minimal typing.

Acceptance Criteria:

- [x] capture patient face photo
- [x] capture Thai ID card photo
- [x] OCR abstraction implemented (`ManualEntryOcrProvider` stub wired; a real provider is a drop-in in `lib/ocr`)
- [x] input phone number
- [x] patient data preview / edit step
- [x] duplicate patient detection (citizen ID → phone → name+birthdate, with the
      "พบคนไข้ที่อาจเป็นคนเดียวกัน" dialog) — implemented, not yet run against a live DB
- [x] HN generated automatically (server-side `generate_hn()` function)
- [x] privacy acknowledgement recorded
- [ ] end-to-end save verified against a real Supabase project (needs `.env.local` credentials — see
      [docs/AI_HANDOFF.md](../docs/AI_HANDOFF.md))

## PAT-002 Patient Search + Patient Profile

Status: IN PROGRESS — code complete, blocked on the same live-DB verification as PAT-001.

Objective: Find a patient quickly and see their profile on one screen.

Acceptance Criteria:

- [x] search by name / HN / phone (`/patients`)
- [x] patient profile shows photo, name, HN, age, phone, allergies, chronic conditions (`/patients/[id]`)
- [x] `+ บันทึกการรักษาวันนี้` primary action
- [x] treatment history timeline on the same page
- [ ] verified against a live Supabase project

## VISIT-001 Treatment History

Status: IN PROGRESS — code complete, blocked on the same live-DB verification.

Objective: Record a treatment visit without ever overwriting past visits.

Acceptance Criteria:

- [x] create visit form (chief complaint, diagnosis, notes) — `AddVisitDialog`
- [x] visits are append-only, shown newest-first
- [x] audit log entry on every visit create (DB trigger, `visits_audit`)
- [ ] verified against a live Supabase project

## APPT-001 Appointments

Status: IN PROGRESS — basic version implemented; status-change UI still missing.

Objective: Schedule and track appointments per patient.

Acceptance Criteria:

- [x] create appointment tied to a patient (`/appointments/new`)
- [x] appointment list (`/appointments`)
- [ ] UI to transition status (scheduled → completed/cancelled/no_show) — `updateAppointmentStatus` action
      exists but nothing in the UI calls it yet
- [ ] verified against a live Supabase project

## SEC-001 Security Review + UX Polish

Status: TODO

Objective: Final pass once Phases 1-5 are functionally complete and running against a real project.

Acceptance Criteria:

- [ ] RLS policy audit against `docs/SECURITY.md` checklist, run with a real project (`supabase db push` +
      manual policy tests)
- [ ] confirm no service-role key reachable from client bundle (spot-check `npm run build` output)
- [ ] confirm ID card views are audited (manually view an ID card, check `audit_logs`)
- [ ] accessibility / large-text / iPad pass with an actual older-adult test user if possible

## INFRA-001 Connect a real Supabase project

Status: TODO — blocking everything above from being verified end-to-end.

Objective: Get the app running against a real backend so Phase 2+ can actually be tested.

Acceptance Criteria:

- [ ] create a Supabase project
- [ ] `npx supabase link --project-ref <ref>` and `npx supabase db push` to apply `supabase/migrations/`
- [ ] fill in `.env.local` from `.env.example`
- [ ] create the first staff account (becomes admin automatically) and confirm login works
- [ ] walk the full patient registration flow on an iPad
