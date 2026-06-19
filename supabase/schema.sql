-- BOVINOVISION AI: Esquema SQL Completo para o Supabase
-- Copie e cole este código diretamente no Painel de SQL ('SQL Editor') do seu projeto no Supabase.

-- Ativa a extensão de UUIDs caso precise usar
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabela de Perfis de Usuário (Veterinários)
CREATE TABLE IF NOT EXISTS public.user_profiles (
    uid TEXT PRIMARY KEY, -- Identificador único do usuário logado
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

-- 2. Tabela de Registros de Avaliação de Bovinos (Pesos e Scores)
CREATE TABLE IF NOT EXISTS public.cattle_records (
    id TEXT PRIMARY KEY,
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

-- 3. Índices de Desempenho e Velocidade de Consulta
CREATE INDEX IF NOT EXISTS idx_cattle_records_user_id ON public.cattle_records(user_id);
CREATE INDEX IF NOT EXISTS idx_cattle_records_lot ON public.cattle_records(lot);
CREATE INDEX IF NOT EXISTS idx_cattle_records_score ON public.cattle_records(score);

-- 4. Função e Gatilho para Atualizar Automático o Campo updated_at
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

-- 5. Ativer o RLS (Segurança de Linhas) nas Tabelas
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cattle_records ENABLE ROW LEVEL SECURITY;

-- Políticas de Permissão Segura (Políticas RLS)
CREATE POLICY "Qualquer um pode persistir/atualizar perfil" 
    ON public.user_profiles FOR ALL 
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Qualquer um pode gerenciar seus registros de bovino" 
    ON public.cattle_records FOR ALL 
    USING (true)
    WITH CHECK (true);
