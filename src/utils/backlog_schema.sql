-- ============================================================
-- SCHEMA: Módulo de Backlog (Completo com TP e Periodo)
-- Data: 2026-06-16
-- Execute este script no SQL Editor do Supabase
-- ============================================================

-- Remover tabela antiga se necessário para recriar
-- DROP TABLE IF EXISTS backlog_records;

CREATE TABLE IF NOT EXISTS backlog_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    numero_caso TEXT NOT NULL,
    resp TEXT DEFAULT 'Geral',
    tp TEXT DEFAULT 'Geral',
    fila TEXT NOT NULL,
    status TEXT NOT NULL,
    periodo TEXT DEFAULT '0 - 30',
    sla_real INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Índices para buscas rápidas por data, fila, status, resp e tp
CREATE INDEX IF NOT EXISTS idx_backlog_date ON backlog_records(date);
CREATE INDEX IF NOT EXISTS idx_backlog_fila ON backlog_records(fila);
CREATE INDEX IF NOT EXISTS idx_backlog_status ON backlog_records(status);
CREATE INDEX IF NOT EXISTS idx_backlog_resp ON backlog_records(resp);
CREATE INDEX IF NOT EXISTS idx_backlog_tp ON backlog_records(tp);

-- Verificação: tabela criada com sucesso
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'backlog_records'
ORDER BY ordinal_position;
