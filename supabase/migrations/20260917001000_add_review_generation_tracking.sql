alter table public.reviews
  add column if not exists generation_count integer not null default 0,
  add column if not exists is_successful boolean not null default false;
