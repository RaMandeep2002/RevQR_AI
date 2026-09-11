-- Add columns to businesses table
alter table public.businesses
    add column if not exists tone text not null default 'Professional',
    add column if not exists keywords text not null default '';
