-- SQL migration to add rejection reasoning to dues

-- 1. Add rejection_reason column
alter table public.dues
  add column if not exists rejection_reason text;

-- 2. Update the check constraint for status to allow 'rejected'
alter table public.dues
  drop constraint if exists dues_status_check;

alter table public.dues
  add constraint dues_status_check check (status in ('pending', 'submitted', 'paid', 'rejected'));
