-- migrations/001_create_plans_table.sql

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the plans table with UUID as primary key
CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  razorpay_plan_id TEXT,
  
  price_monthly INTEGER NOT NULL,  
  scan_limit INTEGER NOT NULL,     -- number of scans per month (e.g., 100, 350, 1000)
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_plans_updated_at
    BEFORE UPDATE ON plans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert initial data (IDs will be auto-generated)
INSERT INTO plans (
  name, razorpay_plan_id, 
  price_monthly, scan_limit,
  created_at, updated_at
)
VALUES 
  (
    'Starter', 'plan_TJHoiqvQuAqReO',
    299, 100, 
    NOW(), NOW()
  ),
  
  (
    'Growth', 'plan_TJHpIA86O2cSvI',
    699, 350, 
    NOW(), NOW()
  ),
  
  (
    'Enterprise', 'plan_TJZt7LOSrnIPTU',
    1499, 1000,
    NOW(), NOW()
  );

-- Add indexes for faster lookups
CREATE INDEX idx_plans_razorpay_plan_id ON plans(razorpay_plan_id);
CREATE INDEX idx_plans_price ON plans(price_monthly);
CREATE INDEX idx_plans_scan_limit ON plans(scan_limit);

-- Optional: Create a view to see the inserted data with UUIDs
CREATE OR REPLACE VIEW v_plans_with_ids AS
SELECT id, name, razorpay_plan_id, price_monthly, scan_limit
FROM plans
ORDER BY price_monthly;