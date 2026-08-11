-- Criar tabela erros_n1 no Supabase
-- Execute este SQL no Supabase > SQL Editor

CREATE TABLE IF NOT EXISTS erros_n1 (
    id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date         TEXT NOT NULL,
    numero_caso  TEXT NOT NULL,
    expert_name  TEXT NOT NULL,
    registrado_por TEXT,
    created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_erros_n1_date ON erros_n1 (date);
CREATE INDEX IF NOT EXISTS idx_erros_n1_expert ON erros_n1 (expert_name);

-- RLS (Row Level Security) — habilitar e liberar para usuários autenticados
ALTER TABLE erros_n1 ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for authenticated" ON erros_n1
    FOR ALL USING (true) WITH CHECK (true);
