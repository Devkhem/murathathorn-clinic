-- Clinic Mae: visits (treatment records). Append-only from the app's perspective.

create table if not exists public.visits (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients (id) on delete cascade,
  visit_date timestamptz not null default now(),
  chief_complaint text,
  diagnosis text,
  treatment_notes text,
  is_deleted boolean not null default false,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.visits is
  'One row per treatment interaction. Never overwritten; corrections are new rows or an audited soft-delete.';

create index if not exists visits_patient_id_idx
  on public.visits (patient_id, visit_date desc)
  where is_deleted = false;

drop trigger if exists visits_set_updated_at on public.visits;
create trigger visits_set_updated_at
  before update on public.visits
  for each row execute function public.set_updated_at();
