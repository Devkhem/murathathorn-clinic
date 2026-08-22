-- Clinic Mae: Row Level Security. Every table with clinical/personal data is locked
-- down by default; access is granted only to authenticated, active staff.

alter table public.profiles enable row level security;
alter table public.patients enable row level security;
alter table public.visits enable row level security;
alter table public.appointments enable row level security;
alter table public.audit_logs enable row level security;

-- profiles ------------------------------------------------------------------
-- Staff can read all profiles (needed to show "created by" etc). Everyone can update
-- their own row (e.g. full_name); admins can update anyone's. Changing role/is_active
-- is further locked down by a trigger below so a non-admin can't self-promote even
-- though the RLS policy allows updating their own row.

drop policy if exists "active staff can read profiles" on public.profiles;
create policy "active staff can read profiles"
  on public.profiles for select
  using (public.is_active_staff());

drop policy if exists "users can update own profile" on public.profiles;
create policy "users can update own profile"
  on public.profiles for update
  using (auth.uid() = id or public.is_active_admin())
  with check (auth.uid() = id or public.is_active_admin());

-- Belt-and-braces: only an active admin may change role or is_active, even on their
-- own row. Prevents a non-admin from using the policy above to self-promote.
create or replace function public.protect_profile_privilege_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (new.role is distinct from old.role or new.is_active is distinct from old.is_active)
     and not public.is_active_admin() then
    raise exception 'only an admin can change role or is_active';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_protect_privilege_columns on public.profiles;
create trigger profiles_protect_privilege_columns
  before update on public.profiles
  for each row execute function public.protect_profile_privilege_columns();

-- patients --------------------------------------------------------------------

drop policy if exists "active staff can read patients" on public.patients;
create policy "active staff can read patients"
  on public.patients for select
  using (public.is_active_staff());

drop policy if exists "active staff can create patients" on public.patients;
create policy "active staff can create patients"
  on public.patients for insert
  with check (public.is_active_staff());

drop policy if exists "active staff can update patients" on public.patients;
create policy "active staff can update patients"
  on public.patients for update
  using (public.is_active_staff())
  with check (public.is_active_staff());

-- No delete policy: patients are never hard-deleted from the app (soft delete via
-- is_deleted, which goes through the update policy above).

-- visits ------------------------------------------------------------------------

drop policy if exists "active staff can read visits" on public.visits;
create policy "active staff can read visits"
  on public.visits for select
  using (public.is_active_staff());

drop policy if exists "active staff can create visits" on public.visits;
create policy "active staff can create visits"
  on public.visits for insert
  with check (public.is_active_staff());

drop policy if exists "active staff can soft delete visits" on public.visits;
create policy "active staff can soft delete visits"
  on public.visits for update
  using (public.is_active_staff())
  with check (public.is_active_staff());

-- appointments --------------------------------------------------------------------

drop policy if exists "active staff can read appointments" on public.appointments;
create policy "active staff can read appointments"
  on public.appointments for select
  using (public.is_active_staff());

drop policy if exists "active staff can create appointments" on public.appointments;
create policy "active staff can create appointments"
  on public.appointments for insert
  with check (public.is_active_staff());

drop policy if exists "active staff can update appointments" on public.appointments;
create policy "active staff can update appointments"
  on public.appointments for update
  using (public.is_active_staff())
  with check (public.is_active_staff());

-- audit_logs ----------------------------------------------------------------------
-- Append-only from the client's point of view: staff can insert (for the
-- server-action-driven sensitive-read audit) and read, nobody can update/delete.

drop policy if exists "active staff can read audit logs" on public.audit_logs;
create policy "active staff can read audit logs"
  on public.audit_logs for select
  using (public.is_active_staff());

drop policy if exists "active staff can write audit logs" on public.audit_logs;
create policy "active staff can write audit logs"
  on public.audit_logs for insert
  with check (public.is_active_staff());
