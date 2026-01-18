-- ============================================
-- HindTradeAI - COMPLETE MIGRATION FILE
-- Run this in Supabase SQL Editor (in order)
-- Safe to run multiple times (idempotent)
-- ============================================

-- ============================================
-- PHASE 1: USER_PROFILES TABLE (CRITICAL)
-- ============================================

CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    email VARCHAR(255),
    full_name VARCHAR(255),
    company_name VARCHAR(255),
    phone VARCHAR(20),
    city VARCHAR(100),
    state VARCHAR(100),
    location VARCHAR(255),
    initials VARCHAR(5),
    role VARCHAR(50) DEFAULT 'exporter' CHECK (role IN ('exporter', 'admin', 'ca', 'cha', 'trader', 'buyer')),
    status VARCHAR(20) DEFAULT 'active',
    credits INTEGER DEFAULT 100,
    trust_score INTEGER DEFAULT 50,
    net_worth DECIMAL(15,2) DEFAULT 0,
    shipments_completed INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (safe cleanup)
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Public profiles are viewable" ON user_profiles;

-- User profile policies
CREATE POLICY "Users can read own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- PHASE 2: EXPORTERS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS exporters (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    company_name VARCHAR(255) NOT NULL,
    company_type VARCHAR(100),
    gst_number VARCHAR(20),
    iec_code VARCHAR(20),
    pan_number VARCHAR(15),
    business_address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    country VARCHAR(100) DEFAULT 'India',
    export_products TEXT,
    annual_turnover VARCHAR(50),
    years_in_business INTEGER,
    website VARCHAR(255),
    verified BOOLEAN DEFAULT false,
    verification_status VARCHAR(20) DEFAULT 'pending',
    trust_score INTEGER DEFAULT 50,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns if they don't exist
DO $$ BEGIN
    ALTER TABLE exporters ADD COLUMN IF NOT EXISTS country VARCHAR(100) DEFAULT 'India';
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE exporters ADD COLUMN IF NOT EXISTS verification_status VARCHAR(20) DEFAULT 'pending';
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Enable RLS on exporters
ALTER TABLE exporters ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies (safe)
DROP POLICY IF EXISTS "Users can read own exporter profile" ON exporters;
DROP POLICY IF EXISTS "Users can insert own exporter profile" ON exporters;
DROP POLICY IF EXISTS "Users can update own exporter profile" ON exporters;
DROP POLICY IF EXISTS "Admin can read all exporters" ON exporters;
DROP POLICY IF EXISTS "Admin can update all exporters" ON exporters;

CREATE POLICY "Users can read own exporter profile" ON exporters
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own exporter profile" ON exporters
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own exporter profile" ON exporters
    FOR UPDATE USING (auth.uid() = user_id);

-- Admin can read all exporters
CREATE POLICY "Admin can read all exporters" ON exporters
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.user_id = auth.uid() 
            AND user_profiles.role IN ('admin', 'ca')
        )
    );

-- Admin can update all exporters (for verification)
CREATE POLICY "Admin can update all exporters" ON exporters
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.user_id = auth.uid() 
            AND user_profiles.role IN ('admin', 'ca')
        )
    );

-- ============================================
-- PHASE 3: VERIFICATION_REQUESTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS verification_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    exporter_id UUID REFERENCES exporters(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_notes TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID
);

-- Enable RLS
ALTER TABLE verification_requests ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies
DROP POLICY IF EXISTS "Users can read own verification requests" ON verification_requests;
DROP POLICY IF EXISTS "Users can create verification requests" ON verification_requests;
DROP POLICY IF EXISTS "Admin can read all verification requests" ON verification_requests;
DROP POLICY IF EXISTS "Admin can update verification requests" ON verification_requests;

CREATE POLICY "Users can read own verification requests" ON verification_requests
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create verification requests" ON verification_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admin/CA can read all verification requests
CREATE POLICY "Admin can read all verification requests" ON verification_requests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.user_id = auth.uid() 
            AND user_profiles.role IN ('admin', 'ca')
        )
    );

-- Admin/CA can update verification requests
CREATE POLICY "Admin can update verification requests" ON verification_requests
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.user_id = auth.uid() 
            AND user_profiles.role IN ('admin', 'ca')
        )
    );

-- ============================================
-- PHASE 4: TRADE_CARDS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS trade_cards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    exporter_id UUID REFERENCES exporters(id) ON DELETE CASCADE UNIQUE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    card_id VARCHAR(30) NOT NULL UNIQUE,
    company_name VARCHAR(255) NOT NULL,
    trust_score INTEGER DEFAULT 80,
    verified BOOLEAN DEFAULT true,
    qr_code_url TEXT,
    public_url TEXT,
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    issued_by UUID,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true
);

-- Add missing columns
DO $$ BEGIN
    ALTER TABLE trade_cards ADD COLUMN IF NOT EXISTS public_url TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE trade_cards ADD COLUMN IF NOT EXISTS issued_by UUID;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Enable RLS
ALTER TABLE trade_cards ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies
DROP POLICY IF EXISTS "Users can read own trade card" ON trade_cards;
DROP POLICY IF EXISTS "Public can read active trade cards" ON trade_cards;
DROP POLICY IF EXISTS "Admin can insert trade cards" ON trade_cards;
DROP POLICY IF EXISTS "Anyone can read active trade cards" ON trade_cards;

-- Users can read their own trade cards
CREATE POLICY "Users can read own trade card" ON trade_cards
    FOR SELECT USING (auth.uid() = user_id);

-- PUBLIC access for trade cards (no auth required)
CREATE POLICY "Anyone can read active trade cards" ON trade_cards
    FOR SELECT USING (is_active = true);

-- Admin can insert trade cards
CREATE POLICY "Admin can insert trade cards" ON trade_cards
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.user_id = auth.uid() 
            AND user_profiles.role IN ('admin', 'ca')
        )
    );

-- ============================================
-- PHASE 5: PROVIDERS TABLE (CAs)
-- ============================================

CREATE TABLE IF NOT EXISTS providers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    firm_name VARCHAR(255),
    registration_number VARCHAR(50),
    provider_type VARCHAR(50) DEFAULT 'ca' CHECK (provider_type IN ('ca', 'cha')),
    expertise TEXT[],
    years_experience INTEGER,
    exports_certified VARCHAR(100),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    location VARCHAR(255),
    is_verified BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;

-- Drop and recreate
DROP POLICY IF EXISTS "Authenticated users can read providers" ON providers;
DROP POLICY IF EXISTS "Anyone can read providers" ON providers;

-- Anyone authenticated can read providers
CREATE POLICY "Anyone can read providers" ON providers
    FOR SELECT TO authenticated USING (true);

-- ============================================
-- PHASE 6: SEED DATA
-- ============================================

-- Insert providers if not exists
INSERT INTO providers (name, firm_name, registration_number, provider_type, expertise, years_experience, exports_certified, contact_email, contact_phone, location)
VALUES 
    ('CA Rahul Mehta', 'Mehta & Associates', 'A45782', 'ca', ARRAY['Export Specialist', 'FMCG', 'Agriculture'], 10, '₹150 Cr+', 'rahul@mehtaca.com', '+91 98765 43210', 'Mumbai, Maharashtra'),
    ('CA Priya Sharma', 'Sharma & Co.', 'B67234', 'ca', ARRAY['Export Specialist', 'Textiles', 'Handicrafts'], 8, '₹200 Cr+', 'priya@sharmaco.com', '+91 87654 32109', 'Delhi, NCR'),
    ('CA Amit Khurana', 'Khurana Group', 'C89012', 'ca', ARRAY['Export Specialist', 'Electronics', 'Machinery'], 12, '₹300 Cr+', 'amit@khuranagroup.com', '+91 76543 21098', 'Bangalore, Karnataka')
ON CONFLICT DO NOTHING;

-- ============================================
-- PHASE 7: INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_exporters_user_id ON exporters(user_id);
CREATE INDEX IF NOT EXISTS idx_exporters_verified ON exporters(verified);
CREATE INDEX IF NOT EXISTS idx_verification_requests_status ON verification_requests(status);
CREATE INDEX IF NOT EXISTS idx_verification_requests_user_id ON verification_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_trade_cards_card_id ON trade_cards(card_id);
CREATE INDEX IF NOT EXISTS idx_trade_cards_user_id ON trade_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_providers_type ON providers(provider_type);

-- ============================================
-- PHASE 8: ADMIN SETUP FUNCTION
-- ============================================

-- Function to make a user an admin (run with user's UUID)
CREATE OR REPLACE FUNCTION make_user_admin(target_user_id UUID)
RETURNS TEXT AS $$
BEGIN
    -- Insert or update the user_profile to have admin role
    INSERT INTO user_profiles (user_id, role, email, full_name, credits, trust_score, status)
    VALUES (target_user_id, 'admin', 'admin@hindtrade.ai', 'HindTrade Admin', 1000, 100, 'active')
    ON CONFLICT (user_id) 
    DO UPDATE SET role = 'admin', updated_at = NOW();
    
    RETURN 'User ' || target_user_id || ' is now an admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- PHASE 9: AUTO-CREATE ADMIN FROM CURRENT USER
-- ============================================

-- Create a function that can be called to make the currently logged-in user an admin
CREATE OR REPLACE FUNCTION make_current_user_admin()
RETURNS TEXT AS $$
DECLARE
    current_user_id UUID;
BEGIN
    current_user_id := auth.uid();
    
    IF current_user_id IS NULL THEN
        RETURN 'No authenticated user found. Please log in first.';
    END IF;
    
    -- Insert or update
    INSERT INTO user_profiles (user_id, role, credits, trust_score, status)
    VALUES (current_user_id, 'admin', 1000, 100, 'active')
    ON CONFLICT (user_id) 
    DO UPDATE SET role = 'admin', updated_at = NOW();
    
    RETURN 'Current user is now an admin: ' || current_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- VERIFICATION COMPLETE
-- ============================================

SELECT 'Migration complete! Run: SELECT make_current_user_admin(); to set yourself as admin.' as message;
