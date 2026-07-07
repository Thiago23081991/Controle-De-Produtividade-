-- Adiciona a coluna registrado_por na tabela casos_br01
-- Execute este SQL no Supabase > SQL Editor

ALTER TABLE casos_br01
ADD COLUMN IF NOT EXISTS registrado_por TEXT DEFAULT '';
