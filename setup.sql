-- HindTrade AI - Supabase Database Setup
-- Run this in your Supabase SQL Editor to ensure all required fields exist

-- ============================================
-- 1. ENSURE USER_PROFILES TABLE HAS ALL FIELDS
-- ============================================

-- Add any missing columns to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS credits INTEGER DEFAULT 100,
ADD COLUMN IF NOT EXISTS trust_score INTEGER DEFAULT 50,
ADD COLUMN IF NOT EXISTS initials VARCHAR(2),
ADD COLUMN IF NOT EXISTS shipments_completed INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS net_worth BIGINT DEFAULT 0,
ADD COLUMN IF NOT EXISTS ca_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS ca_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS ca_udin VARCHAR(100),
ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'trader',
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';

-- ============================================
-- 2. CREATE INDEXES FOR BETTER PERFORMANCE
-- ============================================

-- Index on id for faster profile lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_id ON user_profiles(id);

-- Index on email for faster email lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);

-- Index on trade_opportunities status for filtering
CREATE INDEX IF NOT EXISTS idx_trade_opportunities_status ON trade_opportunities(status);

-- Index on inventory user_id for faster user inventory queries
CREATE INDEX IF NOT EXISTS idx_inventory_user_id ON inventory(user_id);

-- Index on agents status
CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(status) WHERE status IS NOT NULL;

-- Index on experts category for CA/CHA filtering
CREATE INDEX IF NOT EXISTS idx_experts_category ON experts(category) WHERE category IS NOT NULL;

-- ============================================
-- 3. ENABLE ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE trade_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE experts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own profile
CREATE POLICY IF NOT EXISTS "Users can read own profile" 
ON user_profiles FOR SELECT 
USING (auth.uid() = id);

-- Policy: Users can insert their own profile
CREATE POLICY IF NOT EXISTS "Users can insert own profile" 
ON user_profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY IF NOT EXISTS "Users can update own profile" 
ON user_profiles FOR UPDATE 
USING (auth.uid() = id);

-- Policy: Authenticated users can read all opportunities
CREATE POLICY IF NOT EXISTS "Authenticated users can read opportunities" 
ON trade_opportunities FOR SELECT 
TO authenticated 
USING (true);

-- Policy: Users can read their own inventory
CREATE POLICY IF NOT EXISTS "Users can read own inventory" 
ON inventory FOR SELECT 
USING (auth.uid() = user_id);

-- Policy: Users can insert their own inventory
CREATE POLICY IF NOT EXISTS "Users can insert own inventory" 
ON inventory FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own inventory
CREATE POLICY IF NOT EXISTS "Users can update own inventory" 
ON inventory FOR UPDATE 
USING (auth.uid() = user_id);

-- Policy: Authenticated users can read agents
CREATE POLICY IF NOT EXISTS "Authenticated users can read agents" 
ON agents FOR SELECT 
TO authenticated 
USING (true);

-- Policy: Authenticated users can read experts
CREATE POLICY IF NOT EXISTS "Authenticated users can read experts" 
ON experts FOR SELECT 
TO authenticated 
USING (true);

-- ============================================
-- 4. CREATE TRIGGER FOR AUTO PROFILE CREATION
-- ============================================

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (
    id,
    email,
    full_name,
    company_name,
    location,
    city,
    state,
    phone,
    business_category,
    role,
    initials,
    credits,
    trust_score,
    status,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'company_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'location', ''),
    COALESCE(NEW.raw_user_meta_data->>'city', ''),
    COALESCE(NEW.raw_user_meta_data->>'state', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'business_category', 'other'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'trader'),
    SUBSTRING(COALESCE(NEW.raw_user_meta_data->>'full_name', 'HT'), 1, 2),
    100,
    50,
    'active',
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function after user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 5. ENABLE REALTIME FOR TABLES
-- ============================================

-- Enable realtime on user_profiles
ALTER PUBLICATION supabase_realtime ADD TABLE user_profiles;

-- Enable realtime on trade_opportunities
ALTER PUBLICATION supabase_realtime ADD TABLE trade_opportunities;

-- Enable realtime on inventory
ALTER PUBLICATION supabase_realtime ADD TABLE inventory;

-- ============================================
-- 6. HELPER FUNCTIONS
-- ============================================

-- Function to generate initials from name
CREATE OR REPLACE FUNCTION public.generate_initials(name TEXT)
RETURNS VARCHAR(2) AS $$
DECLARE
  words TEXT[];
  initials TEXT := '';
  cleaned_name TEXT;
BEGIN
  IF name IS NULL OR trim(name) = '' THEN
    RETURN 'HT';
  END IF;
  
  cleaned_name := trim(name);
  words := string_to_array(cleaned_name, ' ');
  
  -- Handle single word
  IF array_length(words, 1) = 1 THEN
    IF length(words[1]) = 0 THEN
      RETURN 'HT';
    ELSIF length(words[1]) = 1 THEN
      RETURN UPPER(words[1] || 'T');
    ELSE
      RETURN UPPER(SUBSTRING(words[1], 1, 2));
    END IF;
  END IF;
  
  -- Handle multiple words
  IF length(words[1]) > 0 AND length(words[2]) > 0 THEN
    RETURN UPPER(SUBSTRING(words[1], 1, 1) || SUBSTRING(words[2], 1, 1));
  ELSIF length(words[1]) > 1 THEN
    RETURN UPPER(SUBSTRING(words[1], 1, 2));
  ELSE
    RETURN 'HT';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Update existing profiles with initials if missing
UPDATE user_profiles 
SET initials = generate_initials(COALESCE(full_name, company_name, email))
WHERE initials IS NULL OR initials = '';

-- ============================================
-- SETUP COMPLETE
-- ============================================

-- Verify setup
SELECT 
  'User Profiles' as table_name, 
  COUNT(*) as record_count 
FROM user_profiles
UNION ALL
SELECT 
  'Trade Opportunities' as table_name, 
  COUNT(*) as record_count 
FROM trade_opportunities
UNION ALL
SELECT 
  'Inventory' as table_name, 
  COUNT(*) as record_count 
FROM inventory
UNION ALL
SELECT 
  'Agents' as table_name, 
  COUNT(*) as record_count 
FROM agents
UNION ALL
SELECT 
  'Experts' as table_name, 
  COUNT(*) as record_count 
FROM experts;
