-- 1. Adicionar coluna is_bko_expert na tabela experts
ALTER TABLE experts
ADD COLUMN IF NOT EXISTS is_bko_expert BOOLEAN DEFAULT FALSE;

-- 2. Marcar os experts com acesso ao Erros BKO
UPDATE experts SET is_bko_expert = TRUE WHERE name = 'DOUGLAS FALCAO CAVALCANTE';
UPDATE experts SET is_bko_expert = TRUE WHERE name = 'JOAO PEDRO MARTINS CARVALHO';
UPDATE experts SET is_bko_expert = TRUE WHERE name = 'RODRIGO FERREIRA DE VASCONCELOS';
UPDATE experts SET is_bko_expert = TRUE WHERE name = 'GIOVANNA AIORFE DIAS';
UPDATE experts SET is_bko_expert = TRUE WHERE name = 'KAWANY MATHIOLA SOUTO RIBEIRO';
UPDATE experts SET is_bko_expert = TRUE WHERE name = 'SOFIA LAURA VIALE BRANDAO';
UPDATE experts SET is_bko_expert = TRUE WHERE name = 'THAIS APARECIDA SOUZA DOS SANTOS';
UPDATE experts SET is_bko_expert = TRUE WHERE name = 'ESTER ALVES FERREIRA';
