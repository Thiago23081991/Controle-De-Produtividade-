-- ============================================================
-- SCHEMA: Módulo de Erros — Equipe Ressarcimento
-- Data: 2026-06-11
-- Execute este script no SQL Editor do Supabase
-- ============================================================

CREATE TABLE IF NOT EXISTS erros_ressarcimento (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    numero_caso TEXT NOT NULL,
    expert_name TEXT NOT NULL,
    motivo TEXT,
    submotivo TEXT,
    descricao_erro TEXT NOT NULL,
    registrado_por TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Índices para buscas rápidas por data e expert
CREATE INDEX IF NOT EXISTS idx_erros_date   ON erros_ressarcimento(date);
CREATE INDEX IF NOT EXISTS idx_erros_expert ON erros_ressarcimento(expert_name);

-- Verificação: tabela criada com sucesso
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'erros_ressarcimento'
ORDER BY ordinal_position;
