-- SQL migration to add comprehensive member details fields

-- 1. Alter members table to add new columns
alter table public.members
  add column if not exists dob date,
  add column if not exists marital_status text check (marital_status in ('Single', 'Married', 'Widowed', 'Divorced')),
  add column if not exists certificate_url text;

-- 2. Configure storage buckets for profile pictures and member documents
insert into storage.buckets (id, name, public)
values 
  ('profile-pictures', 'profile-pictures', true),
  ('member-documents', 'member-documents', true)
on conflict (id) do nothing;

-- 3. Drop existing policies to prevent conflict and re-create them cleanly
do $$
begin
  drop policy if exists "Allow public read access to profile pictures" on storage.objects;
  drop policy if exists "Allow public read access to member documents" on storage.objects;
  drop policy if exists "Allow authenticated users to insert profile pictures" on storage.objects;
  drop policy if exists "Allow authenticated users to update profile pictures" on storage.objects;
  drop policy if exists "Allow authenticated users to delete profile pictures" on storage.objects;
  drop policy if exists "Allow authenticated users to insert member documents" on storage.objects;
  drop policy if exists "Allow authenticated users to update member documents" on storage.objects;
  drop policy if exists "Allow authenticated users to delete member documents" on storage.objects;
end $$;

-- 4. Create storage RLS policies
create policy "Allow public read access to profile pictures"
  on storage.objects for select
  using (bucket_id = 'profile-pictures');

create policy "Allow public read access to member documents"
  on storage.objects for select
  using (bucket_id = 'member-documents');

create policy "Allow authenticated users to insert profile pictures"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'profile-pictures');

create policy "Allow authenticated users to update profile pictures"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'profile-pictures')
  with check (bucket_id = 'profile-pictures');

create policy "Allow authenticated users to delete profile pictures"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'profile-pictures');

create policy "Allow authenticated users to insert member documents"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'member-documents');

create policy "Allow authenticated users to update member documents"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'member-documents')
  with check (bucket_id = 'member-documents');

create policy "Allow authenticated users to delete member documents"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'member-documents');
