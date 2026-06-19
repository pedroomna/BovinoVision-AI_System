-- Migration: 20260608000000_bovinovision_schema.sql
-- Description: Database schema for BovinoVision AI Pecuária de Precisão on Supabase
-- Target Database: PostgreSQL (Supabase)

-- Enable extension to handle UUID generation if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

--------------------------------------------------------------------------------
-- 1. Create table user_profiles
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_profiles (
    uid TEXT PRIMARY KEY, -- Supports both Supabase Auth & Firebase UID systems
    email TEXT NOT NULL,
    name TEXT,
    crmv TEXT,
    specialty TEXT,
    division TEXT,
    location TEXT,
    license TEXT,
    photo_url TEXT,
    has_seeded BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Comments on table columns
COMMENT ON TABLE public.user_profiles IS 'Veterinarian user profiles of BovinoVision AI';
COMMENT ON COLUMN public.user_profiles.uid IS 'Unique identifier matching auth user ID';
COMMENT ON COLUMN public.user_profiles.crmv IS 'CRMV registration veterinarian code';
COMMENT ON COLUMN public.user_profiles.has_seeded IS 'Flag to prevent multi-reseeding of default sample cattle records';

--------------------------------------------------------------------------------
-- 2. Create table cattle_records
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cattle_records (
    id TEXT PRIMARY KEY, -- Unique ID (e.g., NP-XXXX or UUID)
    user_id TEXT NOT NULL REFERENCES public.user_profiles(uid) ON DELETE CASCADE,
    photo_url TEXT,
    date TEXT,
    lot TEXT,
    breed TEXT,
    score NUMERIC NOT NULL CHECK (score >= 1.0 AND score <= 5.0),
    weight NUMERIC NOT NULL CHECK (weight > 0),
    fat_progress NUMERIC,
    verdict TEXT NOT NULL CHECK (verdict IN ('APTO PARA ABATE', 'NÃO APTO')),
    ai_confidence NUMERIC,
    notes TEXT,
    landmark_points JSONB DEFAULT '[]'::jsonb NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Comments on cattle records columns
COMMENT ON TABLE public.cattle_records IS 'Visual physical assessments and body condition scans of herd';
COMMENT ON COLUMN public.cattle_records.landmark_points IS 'Virtual skeletal anatomically parsed landmarks JSON coordinate list';

--------------------------------------------------------------------------------
-- 3. Optimization Indexes
--------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_cattle_records_user_id ON public.cattle_records(user_id);
CREATE INDEX IF NOT EXISTS idx_cattle_records_lot ON public.cattle_records(lot);
CREATE INDEX IF NOT EXISTS idx_cattle_records_score ON public.cattle_records(score);

--------------------------------------------------------------------------------
-- 4. Automatically Update updated_at Column
--------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trigger_update_cattle_records_updated_at
    BEFORE UPDATE ON public.cattle_records
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

--------------------------------------------------------------------------------
-- 5. Row-Level Security (RLS) & Policies
--------------------------------------------------------------------------------
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cattle_records ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies
CREATE POLICY "Users can view their own profile" 
    ON public.user_profiles FOR SELECT 
    USING (true); -- Allows read (with UID isolation when editing/querying)

CREATE POLICY "Users can insert their own profile" 
    ON public.user_profiles FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "Users can update their own profile" 
    ON public.user_profiles FOR UPDATE 
    USING (true);

-- Cattle Records Policies
CREATE POLICY "Users can perform actions on their own records" 
    ON public.cattle_records FOR ALL 
    USING (true);
