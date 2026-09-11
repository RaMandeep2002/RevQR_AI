create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  razorpay_customer_id text,
  razorpay_subscription_id text,
  status text not null default 'free', 
  plan text not null default 'free',   
  current_end timestamptz,
  created_at timestamptz default now()
);

alter table subscriptions enable row level security;

create policy "Users can view their own subscription"
  on subscriptions for select
  using (auth.uid() = user_id);