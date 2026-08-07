-- Ativar flag BKO para Emanuelle Cobo Salles
-- Execute este script no Supabase SQL Editor

UPDATE experts
SET is_bko_expert = TRUE
WHERE matricula = '377504';
