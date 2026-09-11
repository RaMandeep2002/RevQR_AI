-- migrations/001_create_plans_table.sql

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_plans_updated_at ON plans;

-- Drop existing function if it exists (optional, but good practice)
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Create the function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing table if it exists (BE CAREFUL with this in production!)
-- DROP TABLE IF EXISTS plans;

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

-- Create the trigger
CREATE TRIGGER update_plans_updated_at
    BEFORE UPDATE ON plans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert initial data (only if table is empty)
INSERT INTO plans (
  name, razorpay_plan_id, 
  price_monthly, scan_limit,
  created_at, updated_at
)
SELECT 
  'Starter', 'plan_TJHoiqvQuAqReO',
  299, 100, 
  NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM plans WHERE name = 'Starter');

INSERT INTO plans (
  name, razorpay_plan_id, 
  price_monthly, scan_limit,
  created_at, updated_at
)
SELECT 
  'Growth', 'plan_TJHpIA86O2cSvI',
  699, 350, 
  NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM plans WHERE name = 'Growth');

INSERT INTO plans (
  name, razorpay_plan_id, 
  price_monthly, scan_limit,
  created_at, updated_at
)
SELECT 
  'Enterprise', 'plan_TJZt7LOSrnIPTU',
  1499, 1000,
  NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM plans WHERE name = 'Enterprise');

-- Add indexes (drop if they already exist)
DROP INDEX IF EXISTS idx_plans_razorpay_plan_id;
DROP INDEX IF EXISTS idx_plans_price;
DROP INDEX IF EXISTS idx_plans_scan_limit;

CREATE INDEX idx_plans_razorpay_plan_id ON plans(razorpay_plan_id);
CREATE INDEX idx_plans_price ON plans(price_monthly);
CREATE INDEX idx_plans_scan_limit ON plans(scan_limit);

-- Optional: Create a view to see the inserted data with UUIDs
DROP VIEW IF EXISTS v_plans_with_ids;
CREATE OR REPLACE VIEW v_plans_with_ids AS
SELECT id, name, razorpay_plan_id, price_monthly, scan_limit
FROM plans
ORDER BY price_monthly;