create table if not exists public.qr_customizations (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null unique references public.businesses(id) on delete cascade,
  dark_color text not null default '#111827',
  light_color text not null default '#ffffff',
  template_id text not null default 'classic',
  
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.qr_customizations enable row level security;

create policy "Owners can view own business qr customizations"
on public.qr_customizations
for select
to authenticated
using (
  exists (
    select 1
    from public.businesses b
    where b.id = qr_customizations.business_id
      and b.owner_id = auth.uid()
  )
);

create policy "Owners can upsert own business qr customizations"
on public.qr_customizations
for insert
to authenticated
with check (
  exists (
    select 1
    from public.businesses b
    where b.id = qr_customizations.business_id
      and b.owner_id = auth.uid()
  )
);

create policy "Owners can update own business qr customizations"
on public.qr_customizations
for update
to authenticated
using (
  exists (
    select 1
    from public.businesses b
    where b.id = qr_customizations.business_id
      and b.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.businesses b
    where b.id = qr_customizations.business_id
      and b.owner_id = auth.uid()
  )
);
