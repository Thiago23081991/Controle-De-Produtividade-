-- ============================================================
-- SCRIPT DE MIGRAÇÃO: Adicionar Motivo e Submotivo
-- Data: 2026-06-12
-- Execute este script no SQL Editor do Supabase para atualizar a tabela
-- ============================================================

ALTER TABLE erros_ressarcimento 
ADD COLUMN IF NOT EXISTS motivo TEXT,
ADD COLUMN IF NOT EXISTS submotivo TEXT;

-- Verificação das colunas atualizadas
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'erros_ressarcimento'
ORDER BY ordinal_position;
