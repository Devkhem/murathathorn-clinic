-- Clinic Mae: staff profiles
-- One row per staff member, 1:1 with auth.users. Created automatically on signup.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  role text not null default 'staff' check (role in ('admin', 'staff')),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

comment on table public.profiles is 'Clinic staff accounts, 1:1 with auth.users.';

-- Helper functions used throughout RLS policies (security definer so they can read
-- profiles without recursing into the profiles RLS policy itself).

create or replace function public.is_active_staff()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and is_active = true
  );
$$;

create or replace function public.is_active_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and is_active = true and role = 'admin'
  );
$$;

comment on function public.is_active_staff() is 'True if the current auth user is an active staff/admin profile.';
comment on function public.is_active_admin() is 'True if the current auth user is an active admin profile.';

-- Auto-create a profile row whenever a new auth user is created.
-- The first user ever created becomes admin; everyone after starts as staff and
-- must be promoted by an admin.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  first_user boolean;
begin
  select not exists (select 1 from public.profiles) into first_user;

  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    case when first_user then 'admin' else 'staff' end
  );

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
