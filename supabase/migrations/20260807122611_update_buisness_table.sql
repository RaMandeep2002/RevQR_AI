alter table public.businesses
    add column if not exists languages text[] default array['en', 'hi'] not null;

create index if not exists idx_businesses_languages on public.businesses using gin (languages);

alter table  public.businesses
      add constraint check_languages_not_empty 
  check (array_length(languages, 1) > 0);