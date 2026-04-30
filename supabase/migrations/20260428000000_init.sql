create extension if not exists "pgcrypto";

create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  category text not null,
  google_business_url text not null,
  location text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  customer_name text not null,
  customer_email text not null,
  stars integer not null check (stars between 1 and 5),
  review_text text not null,
  created_at timestamptz not null default now()
);

alter table public.businesses enable row level security;
alter table public.reviews enable row level security;

create policy "Businesses are viewable by everyone"
on public.businesses
for select
using (true);

create policy "Owner can insert business"
on public.businesses
for insert
to authenticated
with check (owner_id = auth.uid());

create policy "Owner can update own business"
on public.businesses
for update
to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

create policy "Reviews are viewable by everyone"
on public.reviews
for select
using (true);

create policy "Anyone can insert reviews"
on public.reviews
for insert
to anon, authenticated
with check (true);

create or replace view public.business_review_stats as
select
  b.id as business_id,
  b.name as business_name,
  count(r.id)::int as review_count,
  coalesce(avg(r.stars), 0)::numeric(10,2) as average_rating
from public.businesses b
left join public.reviews r on r.business_id = b.id
group by b.id, b.name;
