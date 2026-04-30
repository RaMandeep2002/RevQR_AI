alter table public.reviews
  add column if not exists customer_name text,
  add column if not exists customer_email text;

update public.reviews
set
  customer_name = coalesce(customer_name, 'Anonymous'),
  customer_email = coalesce(customer_email, 'unknown@example.com')
where customer_name is null or customer_email is null;

alter table public.reviews
  alter column customer_name set not null,
  alter column customer_email set not null;
