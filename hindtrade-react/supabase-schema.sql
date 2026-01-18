-- ============================================
-- HindTradeAI MVP - Supabase Schema
-- RUN: supabase-migration.sql (the main file)
-- This file is kept for reference only
-- ============================================

-- NOTE: Use supabase-migration.sql for deployment
-- It contains all tables, policies, and admin setup

-- Quick reference of tables:
-- 1. user_profiles (roles, credits, trust_score)
-- 2. exporters (company data, verification status)
-- 3. verification_requests (approval workflow)
-- 4. trade_cards (issued credentials)
-- 5. providers (CA/CHA directory)

-- To make yourself admin after migration:
-- SELECT make_current_user_admin();
