create table if not exists public.prompt_settings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique references auth.users(id) on delete cascade,
  keywords text not null default '',
  language text not null default 'English',
  tone text not null default 'Professional',
  bill_items text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.prompt_settings enable row level security;

create policy "Owner can view own prompt settings"
on public.prompt_settings
for select
to authenticated
using (owner_id = auth.uid());

create policy "Owner can insert own prompt settings"
on public.prompt_settings
for insert
to authenticated
with check (owner_id = auth.uid());

create policy "Owner can update own prompt settings"
on public.prompt_settings
for update
to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());
