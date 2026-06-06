alter table public.qr_customizations
  add column if not exists logo_data_url text,
  add column if not exists logo_size_percent integer not null default 22,
  add column if not exists logo_shape text not null default 'rounded';
