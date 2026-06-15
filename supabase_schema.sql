-- Run this entire file in your Supabase SQL Editor

-- Members table
create table if not exists public.members (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade unique not null,
  full_name text not null,
  aadhaar_number text not null,
  address text not null,
  age integer not null,
  phone text not null,
  role text not null default 'member' check (role in ('member', 'admin')),
  family_members jsonb default '[]'::jsonb,
  declaration_signed boolean default false,
  declaration_signed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Dues table
create table if not exists public.dues (
  id uuid default gen_random_uuid() primary key,
  member_id uuid references public.members(id) on delete cascade not null,
  title text not null,
  amount numeric(10,2) not null,
  is_paid boolean default false,
  due_date date not null,
  paid_at timestamptz,
  created_at timestamptz default now()
);

-- Indexes
create index if not exists members_user_id_idx on public.members(user_id);
create index if not exists dues_member_id_idx on public.dues(member_id);

-- Row Level Security
alter table public.members enable row level security;
alter table public.dues enable row level security;

-- Helper function to check if current user is admin without causing RLS recursion
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.members
    where user_id = auth.uid() and role = 'admin'
  );
end;
$$ language plpgsql security definer;

-- Drop old policies to avoid "already exists" errors when updating
drop policy if exists "Members can view own record" on public.members;
drop policy if exists "Members can insert own record" on public.members;
drop policy if exists "Members can update own record" on public.members;
drop policy if exists "Admins can view all members" on public.members;
drop policy if exists "Admins can update all members" on public.members;
drop policy if exists "Admins can delete members" on public.members;
drop policy if exists "Members can view own dues" on public.dues;
drop policy if exists "Admins can manage all dues" on public.dues;

-- Members RLS policies
create policy "Members can view own record"
  on public.members for select
  using (auth.uid() = user_id);

create policy "Members can insert own record"
  on public.members for insert
  with check (auth.uid() = user_id);

create policy "Members can update own record"
  on public.members for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Admins can view all members"
  on public.members for select
  using (public.is_admin());

create policy "Admins can update all members"
  on public.members for update
  using (public.is_admin());

create policy "Admins can delete members"
  on public.members for delete
  using (public.is_admin());

-- Dues RLS policies
create policy "Members can view own dues"
  on public.dues for select
  using (
    exists (
      select 1 from public.members
      where id = dues.member_id and user_id = auth.uid()
    )
  );

create policy "Admins can manage all dues"
  on public.dues for all
  using (public.is_admin());

-- Updated_at trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger members_updated_at
  before update on public.members
  for each row execute function public.handle_updated_at();
