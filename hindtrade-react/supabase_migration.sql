-- =====================================================
-- HindTradeAI Database Evolution Script
-- RUN THIS IN SUPABASE SQL EDITOR
-- WARNING: Safe script - only ADDs, never DELETEs
-- =====================================================

-- ========================================
-- 1. USER_PROFILES TABLE UPDATES
-- ========================================
-- Add luxury columns if they don't exist

ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS gstin TEXT,
ADD COLUMN IF NOT EXISTS iec_code TEXT,
ADD COLUMN IF NOT EXISTS net_worth TEXT,
ADD COLUMN IF NOT EXISTS experience_years INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS shipments_completed INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS udin_number TEXT,
ADD COLUMN IF NOT EXISTS profile_complete BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS profile_views INTEGER DEFAULT 0;

-- Update trust_score default if column exists
ALTER TABLE user_profiles 
ALTER COLUMN trust_score SET DEFAULT 20;

-- CRITICAL: Enable RLS on user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own profile" ON user_profiles;
CREATE POLICY "Users manage own profile" ON user_profiles
    FOR ALL USING (auth.uid() = user_id);


-- ========================================
-- 2. EXPORTERS TABLE UPDATES
-- ========================================
-- Add luxury columns for exporter profiles

ALTER TABLE exporters 
ADD COLUMN IF NOT EXISTS net_worth TEXT,
ADD COLUMN IF NOT EXISTS experience_years INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS shipments_completed INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS udin_number TEXT,
ADD COLUMN IF NOT EXISTS ca_verified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS target_markets TEXT[],
ADD COLUMN IF NOT EXISTS certifications TEXT[];

-- CRITICAL: Enable RLS on exporters
ALTER TABLE exporters ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own exporter" ON exporters;
CREATE POLICY "Users manage own exporter" ON exporters
    FOR ALL USING (auth.uid() = user_id);

-- CRITICAL: Enable RLS on trade_cards (if exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'trade_cards') THEN
        ALTER TABLE trade_cards ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Users view own trade card" ON trade_cards;
        CREATE POLICY "Users view own trade card" ON trade_cards FOR SELECT USING (user_id = auth.uid());
    END IF;
END $$;


-- ========================================
-- 3. INVENTORY TABLE (Create if not exists)
-- ========================================

CREATE TABLE IF NOT EXISTS inventory (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    exporter_id UUID REFERENCES exporters(id) ON DELETE CASCADE,
    product_name TEXT NOT NULL,
    category TEXT,
    hsn_code TEXT,
    moq TEXT,
    capacity TEXT,
    unit TEXT DEFAULT 'units',
    description TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived')),
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for inventory
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (safe)
DROP POLICY IF EXISTS "Users can manage own inventory" ON inventory;
DROP POLICY IF EXISTS "Everyone can view active inventory" ON inventory;

-- Owner can CRUD their inventory
CREATE POLICY "Users can manage own inventory" ON inventory
    FOR ALL USING (auth.uid() = user_id);

-- Everyone can read active inventory (for marketplace)
CREATE POLICY "Everyone can view active inventory" ON inventory
    FOR SELECT USING (status = 'active');

-- ========================================
-- 4. SERVICE_REQUESTS TABLE (The Network)
-- ========================================

CREATE TABLE IF NOT EXISTS service_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    sender_exporter_id UUID REFERENCES exporters(id),
    receiver_id UUID REFERENCES auth.users(id),
    service_type TEXT NOT NULL CHECK (service_type IN ('ca_audit', 'student_site', 'cha_lead', 'demand_interest')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed', 'expired')),
    details JSONB,
    amount DECIMAL(10,2),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for service_requests
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own service requests" ON service_requests;
DROP POLICY IF EXISTS "Users can view requests sent to them" ON service_requests;

-- Sender can manage their own requests
CREATE POLICY "Users can manage own service requests" ON service_requests
    FOR ALL USING (auth.uid() = sender_id);

-- Receiver can view requests sent to them
CREATE POLICY "Users can view requests sent to them" ON service_requests
    FOR SELECT USING (auth.uid() = receiver_id);

-- ========================================
-- 5. DEMAND_SIGNALS TABLE (Buyer Demands)
-- ========================================

CREATE TABLE IF NOT EXISTS demand_signals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    buyer_type TEXT CHECK (buyer_type IN ('importer', 'distributor', 'brand', 'wholesaler')),
    region TEXT NOT NULL,
    industry TEXT NOT NULL,
    category TEXT NOT NULL,
    requirement TEXT NOT NULL,
    moq_needed TEXT,
    frequency TEXT,
    compliance_required TEXT[],
    is_verified BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'fulfilled', 'expired')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days')
);

-- RLS for demand_signals
ALTER TABLE demand_signals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Everyone can view active demand signals" ON demand_signals;

-- Everyone can view active signals
CREATE POLICY "Everyone can view active demand signals" ON demand_signals
    FOR SELECT USING (status = 'active');

-- ========================================
-- 6. SUPPLY_INTERESTS TABLE (Exporter Responses)
-- ========================================

CREATE TABLE IF NOT EXISTS supply_interests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    demand_signal_id UUID REFERENCES demand_signals(id) ON DELETE CASCADE NOT NULL,
    exporter_id UUID REFERENCES exporters(id) ON DELETE CASCADE NOT NULL,
    trade_card_id UUID REFERENCES trade_cards(id),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for supply_interests
ALTER TABLE supply_interests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Exporters can manage own supply interests" ON supply_interests;

-- Exporters can manage their own interests
CREATE POLICY "Exporters can manage own supply interests" ON supply_interests
    FOR ALL USING (
        exporter_id IN (SELECT id FROM exporters WHERE user_id = auth.uid())
    );

-- ========================================
-- 7. SEED SAMPLE DEMAND SIGNALS
-- ========================================

INSERT INTO demand_signals (buyer_type, region, industry, category, requirement, moq_needed, frequency, compliance_required, is_verified)
VALUES 
    ('importer', 'Middle East', 'Textiles', 'Yarn', 'Cotton Yarn 40s', '1-2 MT', 'Monthly', ARRAY['GST', 'IEC'], true),
    ('distributor', 'European Union', 'Textiles', 'Fabric', 'Knitted Cotton Fabric', '500-1000 Meters', 'Bi-Weekly', ARRAY['GST', 'IEC', 'ISO'], true),
    ('brand', 'North America', 'Apparel', 'Finished Goods', 'T-Shirts (Cotton Blend)', '5000-10000 Pcs', 'Quarterly', ARRAY['GST', 'IEC', 'WRAP'], true),
    ('importer', 'South Asia', 'Home Textiles', 'Bedding', 'Cotton Bed Sheets 300TC', '2000-5000 Sets', 'Monthly', ARRAY['GST', 'IEC'], false),
    ('wholesaler', 'Africa', 'Textiles', 'Yarn', 'Polyester Yarn 150D', '3-5 MT', 'Monthly', ARRAY['GST', 'IEC'], true)
ON CONFLICT DO NOTHING;

-- ========================================
-- 8. HELPFUL INDEXES
-- ========================================

CREATE INDEX IF NOT EXISTS idx_inventory_user ON inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_inventory_status ON inventory(status);
CREATE INDEX IF NOT EXISTS idx_service_requests_sender ON service_requests(sender_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_status ON service_requests(status);
CREATE INDEX IF NOT EXISTS idx_demand_signals_status ON demand_signals(status);
CREATE INDEX IF NOT EXISTS idx_supply_interests_exporter ON supply_interests(exporter_id);

-- ========================================
-- 9. AI_LOGS TABLE (Prompt Output Storage)
-- ========================================

CREATE TABLE IF NOT EXISTS ai_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    prompt_type TEXT NOT NULL CHECK (prompt_type IN ('buyer_inquiry_reply', 'proforma_invoice', 'export_readiness', 'general')),
    context JSONB,
    output TEXT,
    output_format TEXT DEFAULT 'text',
    tokens_used INTEGER,
    status TEXT DEFAULT 'success' CHECK (status IN ('success', 'error', 'pending')),
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for ai_logs
ALTER TABLE ai_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own AI logs" ON ai_logs;

-- Users can only see their own AI logs
CREATE POLICY "Users can manage own AI logs" ON ai_logs
    FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_ai_logs_user ON ai_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_logs_type ON ai_logs(prompt_type);

-- ========================================
-- 8. TRUST DOCUMENTS (Smart Trust Vault)
-- ========================================
-- Stores capability evidence: Electricity Bills, Bills of Lading, Certs

CREATE TABLE IF NOT EXISTS trust_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    doc_type TEXT CHECK (doc_type IN ('electricity_bill', 'bill_of_lading', 'machinery_invoice', 'quality_cert', 'gst_cert', 'iec_cert')),
    file_url TEXT NOT NULL,
    file_name TEXT,
    ai_summary TEXT, -- e.g., "Verified Industrial Load: 65kW"
    ai_insight TEXT, -- AI-generated insight
    is_public BOOLEAN DEFAULT TRUE,
    status TEXT DEFAULT 'verified' CHECK (status IN ('pending', 'analyzing', 'verified', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE trust_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can upload their own docs" ON trust_documents;
DROP POLICY IF EXISTS "Users can manage own docs" ON trust_documents;
DROP POLICY IF EXISTS "Public can view public docs" ON trust_documents;

-- Users can manage their own documents
CREATE POLICY "Users can manage own docs" ON trust_documents
    FOR ALL USING (auth.uid() = user_id);

-- Public can view public documents (for Trade Card display)
CREATE POLICY "Public can view public docs" ON trust_documents
    FOR SELECT USING (is_public = true);

CREATE INDEX IF NOT EXISTS idx_trust_docs_user ON trust_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_trust_docs_type ON trust_documents(doc_type);

-- ========================================
-- 9. PROFILE ENHANCEMENTS (Cover Photo & Trade Preference)
-- ========================================

ALTER TABLE exporters
ADD COLUMN IF NOT EXISTS cover_url TEXT,
ADD COLUMN IF NOT EXISTS established_year INTEGER,
ADD COLUMN IF NOT EXISTS trade_preference TEXT CHECK (trade_preference IN ('global', 'domestic', 'both')),
ADD COLUMN IF NOT EXISTS bio TEXT;

-- ========================================
-- 10. SHIPMENT LOGS (Trade History Ledger)
-- ========================================
-- Real shipment records to prove export history

CREATE TABLE IF NOT EXISTS shipment_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    exporter_id UUID REFERENCES exporters(id) ON DELETE CASCADE,
    destination_country TEXT NOT NULL,
    shipment_date DATE NOT NULL,
    goods_type TEXT,
    value_inr NUMERIC,
    proof_url TEXT, -- Bill of Lading / Invoice URL
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE shipment_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own shipments" ON shipment_logs;
CREATE POLICY "Users manage own shipments" ON shipment_logs
    FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_shipment_logs_user ON shipment_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_shipment_logs_date ON shipment_logs(shipment_date DESC);

-- ========================================
-- 11. CERTIFICATIONS TABLE (Capability Evidence)
-- ========================================
-- Store user certifications like ISO, GOTS, OEKO-TEX, etc.

CREATE TABLE IF NOT EXISTS certifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    exporter_id UUID REFERENCES exporters(id) ON DELETE CASCADE,
    cert_name TEXT NOT NULL,
    issuer TEXT,
    issue_date DATE,
    expiry_date DATE,
    cert_number TEXT,
    proof_url TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users manage own certifications
DROP POLICY IF EXISTS "Users manage own certifications" ON certifications;
CREATE POLICY "Users manage own certifications" ON certifications
    FOR ALL USING (auth.uid() = user_id);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_certifications_user ON certifications(user_id);

-- ========================================
-- DONE! Database is now RLP-ready.
-- ========================================

SELECT 'HindTradeAI Database Evolution Complete!' AS status;
