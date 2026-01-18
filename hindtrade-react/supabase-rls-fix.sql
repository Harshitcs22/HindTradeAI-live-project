-- ============================================
-- HindTradeAI - MINIMAL RLS FIX FOR CA DASHBOARD
-- Run this in Supabase SQL Editor
-- Safe to run multiple times (idempotent)
-- ============================================

-- ============================================
-- PHASE 1: SCHEMA INTROSPECTION (READ-ONLY)
-- ============================================

-- A) Check verification_requests columns
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'verification_requests' 
ORDER BY ordinal_position;

-- B) Check current RLS policies on verification_requests
SELECT policyname, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'verification_requests';

-- C) Check user_profiles table exists and has role column
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_profiles';

-- ============================================
-- PHASE 2: ENSURE user_profiles EXISTS
-- ============================================

CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID UNIQUE,
    email VARCHAR(255),
    full_name VARCHAR(255),
    company_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'exporter',
    credits INTEGER DEFAULT 100,
    trust_score INTEGER DEFAULT 50,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- User can read own profile
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
CREATE POLICY "Users can read own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

-- User can insert own profile
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User can update own profile
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- PHASE 3: FIX - ADD ADMIN SELECT POLICY
-- ============================================

-- Enable RLS on verification_requests (if not already)
ALTER TABLE verification_requests ENABLE ROW LEVEL SECURITY;

-- DROP existing admin policy if it exists (idempotent)
DROP POLICY IF EXISTS "Admin can read all verification requests" ON verification_requests;

-- CREATE the canonical admin SELECT policy
CREATE POLICY "Admin can read all verification requests" ON verification_requests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.user_id = auth.uid()
            AND user_profiles.role IN ('admin', 'ca')
        )
    );

-- DROP existing admin update policy if it exists
DROP POLICY IF EXISTS "Admin can update verification requests" ON verification_requests;

-- CREATE admin UPDATE policy (for approve/reject)
CREATE POLICY "Admin can update verification requests" ON verification_requests
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.user_id = auth.uid()
            AND user_profiles.role IN ('admin', 'ca')
        )
    );

-- ============================================
-- PHASE 4: FIX EXPORTERS ADMIN POLICIES
-- ============================================

-- Enable RLS on exporters
ALTER TABLE exporters ENABLE ROW LEVEL SECURITY;

-- Admin can read all exporters (required for join query)
DROP POLICY IF EXISTS "Admin can read all exporters" ON exporters;
CREATE POLICY "Admin can read all exporters" ON exporters
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.user_id = auth.uid()
            AND user_profiles.role IN ('admin', 'ca')
        )
    );

-- Admin can update exporters (for verification status)
DROP POLICY IF EXISTS "Admin can update all exporters" ON exporters;
CREATE POLICY "Admin can update all exporters" ON exporters
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.user_id = auth.uid()
            AND user_profiles.role IN ('admin', 'ca')
        )
    );

-- ============================================
-- PHASE 5: FIX TRADE_CARDS ADMIN POLICIES
-- ============================================

-- Enable RLS on trade_cards
ALTER TABLE trade_cards ENABLE ROW LEVEL SECURITY;

-- Admin can insert trade cards
DROP POLICY IF EXISTS "Admin can insert trade cards" ON trade_cards;
CREATE POLICY "Admin can insert trade cards" ON trade_cards
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.user_id = auth.uid()
            AND user_profiles.role IN ('admin', 'ca')
        )
    );

-- Public can read active trade cards
DROP POLICY IF EXISTS "Anyone can read active trade cards" ON trade_cards;
CREATE POLICY "Anyone can read active trade cards" ON trade_cards
    FOR SELECT USING (is_active = true);

-- ============================================
-- PHASE 6: MAKE CURRENT USER ADMIN
-- ============================================

-- Function to make current logged-in user an admin
CREATE OR REPLACE FUNCTION make_current_user_admin()
RETURNS TEXT AS $$
DECLARE
    current_user_id UUID;
    result_text TEXT;
BEGIN
    current_user_id := auth.uid();
    
    IF current_user_id IS NULL THEN
        RETURN 'ERROR: No authenticated user. Log in first, then run this.';
    END IF;
    
    -- Upsert the user profile with admin role
    INSERT INTO user_profiles (user_id, role, credits, trust_score, status)
    VALUES (current_user_id, 'admin', 1000, 100, 'active')
    ON CONFLICT (user_id) 
    DO UPDATE SET role = 'admin', updated_at = NOW();
    
    result_text := 'SUCCESS: User ' || current_user_id::text || ' is now admin';
    RETURN result_text;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- PHASE 7: VERIFICATION QUERIES
-- ============================================

-- Check pending verification requests exist
SELECT 'Pending requests count:' as check, count(*) as value 
FROM verification_requests WHERE status = 'pending';

-- Check all RLS policies on verification_requests
SELECT 'RLS Policies on verification_requests:' as info;
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'verification_requests';

-- ============================================
-- NEXT STEP: RUN THIS IN SUPABASE SQL EDITOR
-- ============================================
-- After running this migration:
-- 1. Make sure you're logged in to the app
-- 2. Run: SELECT make_current_user_admin();
-- 3. Refresh the CA Dashboard

SELECT '
===========================================
MIGRATION COMPLETE

NEXT STEPS:
1. Log in to HindTradeAI in browser
2. Run in SQL Editor: SELECT make_current_user_admin();
3. Refresh /admin page
4. Check browser console for debug logs
===========================================
' as instructions;
