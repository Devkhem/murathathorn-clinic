# Clinic Mae — Product Specification

Status: Living document. Update this file whenever product behavior changes; log the change in [DECISIONS.md](DECISIONS.md).

## What Clinic Mae Is

A very simple clinic management app for a small clinic, built for an **older adult, non-technical user**. It is not
hospital software. It should feel like a consumer app: big buttons, big Thai text, few screens, almost no typing.

## Design Philosophy

- Ease of use over feature density.
- Large buttons, large readable Thai text.
- Minimal navigation, maximum 4 primary menu items.
- One screen = one task.
- Avoid technical/medical jargon in the UI.
- Avoid deep menus (2 taps to anything important).
- Avoid unnecessary typing — auto-populate from OCR/lookups whenever possible.
- Always show a clear confirmation after a save.
- Always provide a clear, obvious Back button.
- Design for iPad first, then desktop, then mobile.

## Primary Navigation (do not add items without approval)

1. หน้าหลัก (Home)
2. คนไข้ (Patients)
3. บันทึกการรักษา (Treatment Records)
4. นัดหมาย (Appointments)

## Core Flows

### Patient Registration

Target flow (must not grow more steps without approval):

```
เพิ่มคนไข้ → ถ่ายรูปหน้า → ถ่ายบัตรประชาชน → OCR → ใส่เบอร์โทร → ตรวจข้อมูล → บันทึก
```

Staff provides only:

1. Patient face photo
2. Thai national ID card photo
3. Phone number
4. Privacy Notice acknowledgement

System auto-extracts via OCR (see [lib/ocr](../src/lib/ocr)):

- first name, last name
- citizen ID
- birth date
- gender
- address

Age is **computed on read** from birth date. Age is never stored.

### HN (Hospital Number) Generation

- Format: `MA-00001`, `MA-00002`, ...
- Generated **server-side only**, via a Postgres sequence + function (`generate_hn()`), never client-side.
- Must be globally unique. Staff never type an HN.

### Duplicate Detection

Runs before a new patient is created. Checks, in order:

1. Citizen ID match
2. Phone number match
3. First name + last name + birth date match

If a possible match is found, show:

> พบคนไข้ที่อาจเป็นคนเดียวกัน

with two actions:

- `เปิดข้อมูลคนไข้เดิม` — open the existing record
- `ยืนยันสร้างคนไข้ใหม่` — explicitly confirm creating a new, separate patient

The system must never silently create a duplicate.

### Patient Profile

Single simple page. Shows:

- face photo
- full name
- HN
- age (computed)
- phone
- allergies
- chronic conditions

Primary action button: `+ บันทึกการรักษาวันนี้` (add today's treatment record).

Below that: a treatment history timeline (read-only list, newest first).

No multi-screen clinical navigation — everything a staff member needs is on this one page plus the "add visit" modal/screen.

### Medical Records (Visits)

- Every treatment interaction creates a **new** visit record. Existing visits are never overwritten.
- Visits are never hard-deleted from the normal UI. Any correction is a new record or an audited soft-delete.
- All changes to clinical data must be auditable (see [SECURITY.md](SECURITY.md)).

### Appointments

- Simple list + create/edit. Status: scheduled / completed / cancelled / no-show.
- Tied to a patient (HN) and a date/time.

## Explicitly Out of Scope (do not build without explicit request)

- Inventory management
- Billing / payments
- AI medical diagnosis
- Complex analytics / reporting
- Pharmacy management
- Laboratory integration

## Roadmap / Phases

See [tasks/TODO.md](../tasks/TODO.md) for live status.

1. Project architecture + Authentication + Database
2. Patient Registration
3. Patient Search + Patient Profile
4. Treatment History
5. Appointments
6. Security Review + UX Polish
