-- Clinic Mae: patients table + server-side HN generation

create sequence if not exists public.patient_hn_seq start with 1 increment by 1;

create or replace function public.generate_hn()
returns text
language sql
security definer
set search_path = public
as $$
  select 'MA-' || lpad(nextval('public.patient_hn_seq')::text, 5, '0');
$$;

comment on function public.generate_hn() is
  'Generates the next patient HN (MA-00001, MA-00002, ...). Server-side only.';

create table if not exists public.patients (
  id uuid primary key default gen_random_uuid(),
  hn text not null unique default public.generate_hn(),
  first_name text not null default '',
  last_name text not null default '',
  citizen_id text,
  phone text not null default '',
  birth_date date,
  gender text not null default 'unknown' check (gender in ('male', 'female', 'other', 'unknown')),
  address text,
  allergies text,
  chronic_conditions text,
  face_photo_path text,
  id_card_photo_path text,
  privacy_ack_at timestamptz,
  is_deleted boolean not null default false,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.patients is 'Patient master records. Age is derived from birth_date, never stored.';
comment on column public.patients.hn is 'Hospital number, format MA-00001. Generated server-side via generate_hn().';

create unique index if not exists patients_citizen_id_key
  on public.patients (citizen_id)
  where citizen_id is not null and citizen_id <> '';

create index if not exists patients_phone_idx on public.patients (phone);
create index if not exists patients_name_birthdate_idx
  on public.patients (first_name, last_name, birth_date);
create index if not exists patients_not_deleted_idx
  on public.patients (created_at desc)
  where is_deleted = false;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists patients_set_updated_at on public.patients;
create trigger patients_set_updated_at
  before update on public.patients
  for each row execute function public.set_updated_at();
