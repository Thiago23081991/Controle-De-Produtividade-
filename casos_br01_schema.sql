-- Script para criar a tabela casos_br01 no Supabase
-- Execute este SQL no painel do Supabase > SQL Editor

CREATE TABLE IF NOT EXISTS casos_br01 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    numero_caso TEXT NOT NULL,
    testou_em_br0y TEXT DEFAULT '',
    produtos JSONB DEFAULT '[]',
    saved_at DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Índice para busca por data
CREATE INDEX IF NOT EXISTS idx_casos_br01_saved_at ON casos_br01(saved_at);

-- Índice para busca por número do caso
CREATE INDEX IF NOT EXISTS idx_casos_br01_numero_caso ON casos_br01(numero_caso);

-- (Opcional) Habilitar acesso público se não estiver usando Auth
-- CREATE POLICY "Enable all access" ON casos_br01 FOR ALL USING (true) WITH CHECK (true);
