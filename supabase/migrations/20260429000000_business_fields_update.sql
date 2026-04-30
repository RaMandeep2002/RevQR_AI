alter table public.businesses
  add column if not exists google_business_url text,
  add column if not exists location text;

update public.businesses
set
  google_business_url = coalesce(google_business_url, ''),
  location = coalesce(location, coalesce(address, ''))
where google_business_url is null or location is null;

alter table public.businesses
  alter column google_business_url set not null,
  alter column location set not null;

alter table public.businesses
  drop column if exists address;
