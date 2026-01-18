-- ============================================
-- RLP EXTENSION: PRODUCTS TABLE
-- Additive change only. No modifications to existing tables.
-- ============================================

CREATE TABLE IF NOT EXISTS products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    exporter_id UUID REFERENCES exporters(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT,
    
    -- Enhancement Layer
    external_link TEXT,
    student_id UUID, -- Stored only, no foreign key constraint enforcement to simple users needed for this layer
    enhancement_status VARCHAR(50) DEFAULT 'none' CHECK (enhancement_status IN ('none', 'requested', 'delivered')),
    validity_date DATE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_products_exporter_id ON products(exporter_id);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- POLICIES

-- 1. Exporters can CRUD their own products
CREATE POLICY "Exporters can manage own products" ON products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM exporters 
            WHERE exporters.id = products.exporter_id 
            AND exporters.user_id = auth.uid()
        )
    );

-- 2. Public can READ products (via Trade Card)
-- Since Trade Card is public if active, we allow reading products.
-- Ideally we'd join with trade_cards, but for simplicity/performance in RLP:
CREATE POLICY "Public can read products" ON products
    FOR SELECT USING (true);

-- 3. Admin/Trust Partners can view/edit (optional, but good for management)
CREATE POLICY "Admins can manage products" ON products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.user_id = auth.uid() 
            AND user_profiles.role IN ('admin', 'ca')
        )
    );
