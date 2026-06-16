-- SQL migration to add payment proofs to dues

-- 1. Add columns to dues table
alter table public.dues
  add column if not exists payment_note text,
  add column if not exists payment_proof_url text,
  add column if not exists status text default 'pending' check (status in ('pending', 'submitted', 'paid'));

-- Migrate existing rows: if is_paid is true, status is 'paid', else 'pending'
update public.dues set status = 'paid' where is_paid = true;
update public.dues set status = 'pending' where is_paid = false;

-- 2. Update RLS policies to allow members to UPDATE their own dues
-- Wait, we drop if exists to be safe
do $$
begin
  drop policy if exists "Members can update own dues" on public.dues;
end $$;

create policy "Members can update own dues"
  on public.dues for update
  using (
    exists (
      select 1 from public.members
      where id = dues.member_id and user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.members
      where id = dues.member_id and user_id = auth.uid()
    )
  );

-- 3. Trigger to auto-sync is_paid and paid_at based on status
create or replace function public.handle_due_status_update()
returns trigger as $$
begin
  if new.status = 'paid' then
    new.is_paid = true;
    if old.status != 'paid' then
      new.paid_at = now();
    end if;
  else
    new.is_paid = false;
    new.paid_at = null;
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists dues_status_sync on public.dues;

create trigger dues_status_sync
  before insert or update on public.dues
  for each row execute function public.handle_due_status_update();
