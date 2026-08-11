-- Liberar acesso à aba Erros BKO para Roberta e Caio
-- Execute este SQL no Supabase > SQL Editor

UPDATE experts SET is_bko_expert = TRUE WHERE matricula = '358255'; -- ROBERTA NICOLETTI PORTELA
UPDATE experts SET is_bko_expert = TRUE WHERE matricula = '368131'; -- CAIO FELIPE DA SILVA
