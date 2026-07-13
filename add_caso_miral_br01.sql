-- Adiciona coluna caso_miral na tabela casos_br01
-- Execute este script no SQL Editor do Supabase

ALTER TABLE casos_br01
ADD COLUMN IF NOT EXISTS caso_miral BOOLEAN DEFAULT NULL;

-- Comentário descritivo
COMMENT ON COLUMN casos_br01.caso_miral IS 'Indica se o caso BR01 é da MIRAL (true = Sim, false = Não, null = Não informado)';
