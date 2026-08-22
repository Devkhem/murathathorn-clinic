-- Clinic Mae: audit log. Append-only; nothing in the app updates or deletes rows here.

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles (id),
  action text not null,
  entity_type text not null check (entity_type in ('patient', 'visit', 'appointment')),
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

comment on table public.audit_logs is
  'Append-only audit trail. Populated by DB triggers for writes and by server actions for sensitive reads (e.g. id_card.view).';

create index if not exists audit_logs_entity_idx on public.audit_logs (entity_type, entity_id, created_at desc);
create index if not exists audit_logs_actor_idx on public.audit_logs (actor_id, created_at desc);

-- Trigger-based audit for patient and visit writes, so the trail can't be bypassed by
-- a direct database write that skips the app's server actions.

create or replace function public.audit_patient_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.audit_logs (actor_id, action, entity_type, entity_id, metadata)
  values (
    auth.uid(),
    case
      when tg_op = 'INSERT' then 'patient.create'
      when tg_op = 'UPDATE' and new.is_deleted and not old.is_deleted then 'patient.soft_delete'
      else 'patient.update'
    end,
    'patient',
    new.id,
    jsonb_build_object('hn', new.hn)
  );
  return new;
end;
$$;

drop trigger if exists patients_audit on public.patients;
create trigger patients_audit
  after insert or update on public.patients
  for each row execute function public.audit_patient_change();

create or replace function public.audit_visit_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.audit_logs (actor_id, action, entity_type, entity_id, metadata)
  values (
    auth.uid(),
    case
      when tg_op = 'INSERT' then 'visit.create'
      when tg_op = 'UPDATE' and new.is_deleted and not old.is_deleted then 'visit.soft_delete'
      else 'visit.update'
    end,
    'visit',
    new.id,
    jsonb_build_object('patient_id', new.patient_id)
  );
  return new;
end;
$$;

drop trigger if exists visits_audit on public.visits;
create trigger visits_audit
  after insert or update on public.visits
  for each row execute function public.audit_visit_change();

create or replace function public.audit_appointment_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.audit_logs (actor_id, action, entity_type, entity_id, metadata)
  values (
    auth.uid(),
    case when tg_op = 'INSERT' then 'appointment.create' else 'appointment.update' end,
    'appointment',
    new.id,
    jsonb_build_object('patient_id', new.patient_id, 'status', new.status)
  );
  return new;
end;
$$;

drop trigger if exists appointments_audit on public.appointments;
create trigger appointments_audit
  after insert or update on public.appointments
  for each row execute function public.audit_appointment_change();
