-- Clinic Mae: appointments

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients (id) on delete cascade,
  appointment_at timestamptz not null,
  reason text,
  status text not null default 'scheduled'
    check (status in ('scheduled', 'completed', 'cancelled', 'no_show')),
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.appointments is 'Patient appointments.';

create index if not exists appointments_patient_id_idx on public.appointments (patient_id, appointment_at);
create index if not exists appointments_upcoming_idx
  on public.appointments (appointment_at)
  where status = 'scheduled';

drop trigger if exists appointments_set_updated_at on public.appointments;
create trigger appointments_set_updated_at
  before update on public.appointments
  for each row execute function public.set_updated_at();
