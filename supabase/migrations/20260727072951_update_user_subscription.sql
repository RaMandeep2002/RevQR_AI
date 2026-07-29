-- 20260430000000_subscription_tiers.sql

-- Add subscription fields to users table
alter table public.users 
  add column if not exists subscription_tier text default 'free' check (subscription_tier in ('free', 'pro', 'enterprise')),
  add column if not exists subscription_status text default 'active' check (subscription_status in ('active', 'inactive', 'past_due', 'canceled')),
  add column if not exists subscription_id text,
  add column if not exists subscription_start_date timestamptz,
  add column if not exists subscription_end_date timestamptz,
  add column if not exists business_count integer default 0,
  add column if not exists razorpay_customer_id text,
  add column if not exists razorpay_subscription_id text;

-- Create subscription plans table
create table if not exists public.subscription_plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  tier text not null unique check (tier in ('free', 'pro', 'enterprise')),
  price_monthly integer not null, -- in paise (e.g., 49900 for ₹499)
  price_yearly integer not null, -- in paise
  business_limit integer not null,
  features jsonb not null default '{}',
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Insert default plans
insert into public.subscription_plans (name, tier, price_monthly, price_yearly, business_limit, features)
values 
  ('Free', 'free', 0, 0, 2, '{"features": ["2 businesses", "Basic QR codes", "Email support"]}'::jsonb),
  ('Pro', 'pro', 49900, 499000, 10, '{"features": ["10 businesses", "Custom QR codes", "Priority support", "Analytics", "Review management"]}'::jsonb),
  ('Enterprise', 'enterprise', 199900, 1999000, 50, '{"features": ["50 businesses", "Advanced QR codes", "24/7 support", "Advanced analytics", "API access", "Team management"]}'::jsonb);

-- Create subscription transactions table for tracking payments
create table if not exists public.subscription_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  razorpay_payment_id text not null,
  razorpay_order_id text,
  razorpay_signature text,
  subscription_tier text not null,
  amount integer not null, -- in paise
  currency text default 'INR',
  status text not null check (status in ('created', 'attempted', 'paid', 'failed')),
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.subscription_plans enable row level security;
alter table public.subscription_transactions enable row level security;

-- Subscription plans are viewable by everyone
create policy "Subscription plans are viewable by everyone"
on public.subscription_plans
for select
using (true);

-- Users can view their own transactions
create policy "Users can view own transactions"
on public.subscription_transactions
for select
using (auth.uid() = user_id);

-- Users can insert their own transactions
create policy "Users can insert own transactions"
on public.subscription_transactions
for insert
with check (auth.uid() = user_id);

-- Update business_count trigger
create or replace function public.update_business_count()
returns trigger as $$
begin
  if tg_op = 'INSERT' then
    update public.users
    set business_count = business_count + 1
    where id = new.owner_id;
  elsif tg_op = 'DELETE' then
    update public.users
    set business_count = business_count - 1
    where id = old.owner_id;
  end if;
  return null;
end;
$$ language plpgsql security definer;

-- Create trigger for business count
drop trigger if exists update_business_count_trigger on public.businesses;
create trigger update_business_count_trigger
after insert or delete on public.businesses
for each row
execute function public.update_business_count();

-- Function to check business limit before insert
create or replace function public.check_business_limit()
returns trigger as $$
declare
  user_tier text;
  user_limit integer;
  user_count integer;
begin
  -- Get user's tier and count
  select subscription_tier, business_count into user_tier, user_count
  from public.users
  where id = new.owner_id;
  
  -- Determine limit based on tier
  if user_tier = 'pro' then
    user_limit := 10;
  elsif user_tier = 'enterprise' then
    user_limit := 50;
  else
    user_limit := 2;
  end if;
  
  -- Check if limit is reached
  if user_count >= user_limit then
    raise exception 'Business limit reached. Current: %, Limit: %', user_count, user_limit;
  end if;
  
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger for business limit check
drop trigger if exists check_business_limit_trigger on public.businesses;
create trigger check_business_limit_trigger
before insert on public.businesses
for each row
execute function public.check_business_limit();

-- Function to get user's subscription details
create or replace function public.get_user_subscription(user_id uuid)
returns table(
  tier text,
  status text,
  business_count integer,
  business_limit integer,
  subscription_end_date timestamptz,
  features jsonb
) as $$
declare
  user_tier text;
  user_status text;
  user_count integer;
  user_end_date timestamptz;
  plan_features jsonb;
  plan_limit integer;
begin
  -- Get user details
  select subscription_tier, subscription_status, business_count, subscription_end_date
  into user_tier, user_status, user_count, user_end_date
  from public.users
  where id = user_id;
  
  -- Get plan details
  select features, business_limit
  into plan_features, plan_limit
  from public.subscription_plans
  where tier = user_tier and is_active = true;
  
  return query select 
    user_tier as tier,
    user_status as status,
    user_count as business_count,
    plan_limit as business_limit,
    user_end_date as subscription_end_date,
    plan_features as features;
end;
$$ language plpgsql security definer;