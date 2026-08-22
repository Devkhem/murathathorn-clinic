-- Clinic Mae: private storage buckets for patient photos and ID cards.
-- Both buckets are private. All reads happen through server-issued signed URLs.

insert into storage.buckets (id, name, public)
values ('patient-photos', 'patient-photos', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('patient-id-cards', 'patient-id-cards', false)
on conflict (id) do nothing;

-- Only active staff/admin may read or write objects in these buckets. There is no
-- public policy at all, so an unauthenticated request is always denied.

drop policy if exists "active staff can read patient photos" on storage.objects;
create policy "active staff can read patient photos"
  on storage.objects for select
  using (bucket_id = 'patient-photos' and public.is_active_staff());

drop policy if exists "active staff can upload patient photos" on storage.objects;
create policy "active staff can upload patient photos"
  on storage.objects for insert
  with check (bucket_id = 'patient-photos' and public.is_active_staff());

drop policy if exists "active staff can read id cards" on storage.objects;
create policy "active staff can read id cards"
  on storage.objects for select
  using (bucket_id = 'patient-id-cards' and public.is_active_staff());

drop policy if exists "active staff can upload id cards" on storage.objects;
create policy "active staff can upload id cards"
  on storage.objects for insert
  with check (bucket_id = 'patient-id-cards' and public.is_active_staff());

-- Deliberately no update/delete policy for either bucket via the client. Replacing a
-- photo happens by uploading a new object and updating the patient row's path; the
-- old object is cleaned up by an admin-only server action if ever needed.
