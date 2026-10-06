alter table public.businesses
  add column if not exists total_generations integer not null default 0,
  add column if not exists successful_generations integer not null default 0;

create or replace function increment_generation_stats(
  p_business_id uuid,
  p_is_successful boolean
)
returns void
language sql
as $$
  update public.businesses
  set 
    total_generations = total_generations + 1,
    successful_generations = successful_generations + (case when p_is_successful then 1 else 0 end)
  where id = p_business_id;
$$;
