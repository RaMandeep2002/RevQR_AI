-- Drop the existing table and recreate it
DROP TABLE IF EXISTS subscriptions CASCADE;

-- Enhanced subscriptions table
create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  razorpay_customer_id text,
  razorpay_subscription_id text unique,
  razorpay_payment_id text,
  plan_id text not null,
  plan_name text not null,
  status text not null default 'pending',
  amount integer,
  currency text default 'INR',
  interval text,
  features jsonb,
  current_usage jsonb default '{"scansUsed": 0, "lastResetDate": null}'::jsonb,
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Add indexes
create index idx_subscriptions_user_id on subscriptions(user_id);
create index idx_subscriptions_status on subscriptions(status);
create index idx_subscriptions_razorpay_subscription_id on subscriptions(razorpay_subscription_id);

-- Enable RLS
alter table subscriptions enable row level security;

-- Policies
create policy "Users can view their own subscription"
  on subscriptions for select
  using (auth.uid() = user_id);

create policy "Users can update their own subscription"
  on subscriptions for update
  using (auth.uid() = user_id);

-- Function to automatically update updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_subscriptions_updated_at
  before update on subscriptions
  for each row
  execute function update_updated_at_column();