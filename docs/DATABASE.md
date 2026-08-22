# Clinic Mae — Database

Status: Living document. Source of truth for schema is `supabase/migrations/`; this file explains and indexes it.
Any schema change must ship as a new migration file **and** an update to this document.

## Conventions

- All tables use `uuid` primary keys (`gen_random_uuid()`).
- All tables have `created_at timestamptz not null default now()`.
- Mutable clinical tables (`patients`, `visits`, `appointments`) have `updated_at` maintained by a trigger.
- Soft delete only: clinical tables use `is_deleted boolean not null default false` — normal UI queries filter
  `is_deleted = false`. Nothing in the app hard-deletes clinical data.
- Every insert/update that matters to a clinical record is written by a Postgres trigger into `audit_logs`
  (server-enforced, not just app-level), so the audit trail can't be bypassed by a direct DB write.

## Tables

### `profiles`

One row per staff member (1:1 with `auth.users`). Created by trigger when a user signs up (see
`20240101000001_profiles.sql`).

| column      | type        | notes                                   |
|-------------|-------------|------------------------------------------|
| id          | uuid PK     | = `auth.users.id`                        |
| full_name   | text        |                                           |
| role        | text        | `'admin' \| 'staff'`, default `'staff'`  |
| is_active   | boolean     | default `true`; deactivated staff lose access |
| created_at  | timestamptz |                                           |

### `patients`

| column                 | type        | notes                                              |
|------------------------|-------------|-----------------------------------------------------|
| id                     | uuid PK     |                                                       |
| hn                     | text UNIQUE | `MA-00001` format, generated server-side via `generate_hn()` |
| first_name             | text        |                                                       |
| last_name              | text        |                                                       |
| citizen_id             | text        | nullable, Thai 13-digit ID, unique when present      |
| phone                  | text        |                                                       |
| birth_date             | date        | age is derived, never stored                         |
| gender                 | text        | `'male' \| 'female' \| 'other' \| 'unknown'`         |
| address                | text        | nullable, from OCR                                   |
| allergies              | text        | nullable, free text                                  |
| chronic_conditions     | text        | nullable, free text                                  |
| face_photo_path        | text        | private storage path in `patient-photos` bucket      |
| id_card_photo_path     | text        | private storage path in `patient-id-cards` bucket    |
| privacy_ack_at         | timestamptz | when the privacy notice was acknowledged             |
| is_deleted             | boolean     | default `false`                                      |
| created_by             | uuid        | FK -> `profiles.id`                                  |
| created_at / updated_at| timestamptz |                                                       |

Indexes: unique on `hn`; unique partial on `citizen_id where citizen_id is not null`; btree on `phone`;
btree on `(first_name, last_name, birth_date)` for duplicate detection.

### `patient_hn_seq` (sequence) + `generate_hn()`

A Postgres sequence backs HN generation. `generate_hn()` is a `security definer` function that does
`nextval('patient_hn_seq')` and formats it as `MA-%05d`. Called from a server action / DB default — never
computed in the browser, so it can't collide or be spoofed.

### `visits`

One row per treatment interaction. Never updated after creation except by the audit-generating soft-delete path.

| column           | type        | notes                          |
|-------------------|-------------|---------------------------------|
| id                | uuid PK     |                                  |
| patient_id        | uuid        | FK -> `patients.id`             |
| visit_date        | timestamptz | default `now()`                 |
| chief_complaint   | text        | nullable                        |
| diagnosis         | text        | nullable                        |
| treatment_notes   | text        | nullable                        |
| is_deleted        | boolean     | default `false`                 |
| created_by        | uuid        | FK -> `profiles.id`             |
| created_at / updated_at | timestamptz |                            |

### `appointments`

| column            | type        | notes                                             |
|--------------------|-------------|-----------------------------------------------------|
| id                 | uuid PK     |                                                       |
| patient_id         | uuid        | FK -> `patients.id`                                  |
| appointment_at     | timestamptz |                                                       |
| reason             | text        | nullable                                             |
| status             | text        | `'scheduled' \| 'completed' \| 'cancelled' \| 'no_show'`, default `'scheduled'` |
| created_by         | uuid        | FK -> `profiles.id`                                  |
| created_at / updated_at | timestamptz |                                                  |

### `audit_logs`

Append-only. Never updated or deleted from the app.

| column      | type        | notes                                                     |
|-------------|-------------|--------------------------------------------------------------|
| id          | uuid PK     |                                                                |
| actor_id    | uuid        | FK -> `profiles.id`, nullable for system-generated events     |
| action      | text        | e.g. `'patient.create'`, `'id_card.view'`, `'visit.create'`  |
| entity_type | text        | `'patient' \| 'visit' \| 'appointment'`                      |
| entity_id   | uuid        |                                                                |
| metadata    | jsonb       | free-form context (e.g. which fields changed)                |
| created_at  | timestamptz |                                                                |

Populated both by DB triggers (writes) and explicit server-action calls (sensitive reads, e.g. viewing an ID
card photo — see [SECURITY.md](SECURITY.md)).

## Storage Buckets

Created in `20240101000005_storage.sql`.

| bucket             | public | notes                                              |
|---------------------|--------|------------------------------------------------------|
| `patient-photos`    | false  | face photos, served via short-lived signed URLs      |
| `patient-id-cards`  | false  | Thai ID card photos, stricter RLS, viewing is audited |

## Migrations

Run with the Supabase CLI (`npx supabase db push` against a linked project, or `npx supabase start` for local dev).
Files live in `supabase/migrations/`, numbered chronologically:

1. `20240101000001_profiles.sql` — profiles table + auto-create trigger on signup
2. `20240101000002_patients.sql` — patients table, `patient_hn_seq`, `generate_hn()`
3. `20240101000003_visits.sql` — visits table
4. `20240101000004_appointments.sql` — appointments table
5. `20240101000005_storage.sql` — storage buckets + storage RLS
6. `20240101000006_audit_logs.sql` — audit_logs table + triggers
7. `20240101000007_rls_policies.sql` — RLS enablement + policies for all tables above
