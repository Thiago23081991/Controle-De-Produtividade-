-- Adicionar flag is_obras_paradas_expert na tabela experts
-- Execute este SQL no Supabase > SQL Editor

ALTER TABLE experts
ADD COLUMN IF NOT EXISTS is_obras_paradas_expert BOOLEAN DEFAULT FALSE;

-- Marcar os experts com acesso à aba Obras Paradas
UPDATE experts SET is_obras_paradas_expert = TRUE WHERE matricula = '386526'; -- CAUE ANDRADE SILVA
UPDATE experts SET is_obras_paradas_expert = TRUE WHERE matricula = '391121'; -- JUSSARA APARECIDA DOS SANTOS MODESTO
UPDATE experts SET is_obras_paradas_expert = TRUE WHERE matricula = '386541'; -- PAMELA CARDOSO DO CARMO
UPDATE experts SET is_obras_paradas_expert = TRUE WHERE matricula = '396995'; -- JULIANA SOARES FREITAS
UPDATE experts SET is_obras_paradas_expert = TRUE WHERE matricula = '382372'; -- KETHELEEN ELERO DA SILVA
UPDATE experts SET is_obras_paradas_expert = TRUE WHERE matricula = '333598'; -- FERNANDA GOMES DE PAULA BARBOSA
UPDATE experts SET is_obras_paradas_expert = TRUE WHERE matricula = '391147'; -- MELISSA VICTORIA GENUINO
UPDATE experts SET is_obras_paradas_expert = TRUE WHERE matricula = '364184'; -- MARIA APARECIDA GALDINO DA SILVA
UPDATE experts SET is_obras_paradas_expert = TRUE WHERE matricula = '234392'; -- NATALY GOMES DA SILVA
UPDATE experts SET is_obras_paradas_expert = TRUE WHERE matricula = '368030'; -- NATHAN SILVA TORRES
UPDATE experts SET is_obras_paradas_expert = TRUE WHERE matricula = '392571'; -- YASMIM FERREIRA DOS SANTOS
UPDATE experts SET is_obras_paradas_expert = TRUE WHERE matricula = '368029'; -- BIANCA DE OLIVEIRA SILVA CAMPOS

-- Verificar resultado
SELECT matricula, login, name, is_obras_paradas_expert
FROM experts
WHERE is_obras_paradas_expert = TRUE
ORDER BY name;
