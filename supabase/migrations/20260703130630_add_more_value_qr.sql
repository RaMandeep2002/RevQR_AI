-- Update the table with new columns
alter table public.qr_customizations 
add column if not exists salt_value text not null default 'v1';

alter table public.qr_customizations 
add column if not exists logo_data_url text default '';

alter table public.qr_customizations 
add column if not exists logo_size_percent integer default 22;

alter table public.qr_customizations 
add column if not exists logo_shape text default 'rounded';

alter table public.qr_customizations 
add column if not exists dot_style text default 'dots';

-- Add dark mode color columns
alter table public.qr_customizations 
add column if not exists dark_color_dark_mode text default '#111827';

alter table public.qr_customizations 
add column if not exists light_color_dark_mode text default '#ffffff';

-- Add template dark mode colors
alter table public.qr_customizations 
add column if not exists template_dark_dark_mode text default '#111827';

alter table public.qr_customizations 
add column if not exists template_light_dark_mode text default '#ffffff';

-- Add template_id_dark_mode for dark mode template selection
alter table public.qr_customizations 
add column if not exists template_id_dark_mode text default 'classic';

-- Create updated_at trigger if not exists
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists handle_updated_at on public.qr_customizations;
create trigger handle_updated_at
before update on public.qr_customizations
for each row
execute function public.handle_updated_at();