-- Adicionar coluna motivo na tabela erros_n1
-- Execute este SQL no Supabase > SQL Editor

ALTER TABLE erros_n1
ADD COLUMN IF NOT EXISTS motivo TEXT;
