-- Adicionar flag is_n1_expert na tabela experts
-- Execute este SQL no Supabase > SQL Editor

ALTER TABLE experts
ADD COLUMN IF NOT EXISTS is_n1_expert BOOLEAN DEFAULT FALSE;

-- Marcar os experts com acesso ao Erros N1
UPDATE experts SET is_n1_expert = TRUE WHERE name = 'SABRINA DA SILVA';
UPDATE experts SET is_n1_expert = TRUE WHERE name = 'CAIO FELIPE DA SILVA';
UPDATE experts SET is_n1_expert = TRUE WHERE name = 'TATIANE APARECIDA DE ARAUJO JACINTO';
UPDATE experts SET is_n1_expert = TRUE WHERE name = 'EDUARDA TACIANA DA SILVA AVELINO FERREIRA';
UPDATE experts SET is_n1_expert = TRUE WHERE name = 'EDUARDO NASCIMENTO E SILVA';
UPDATE experts SET is_n1_expert = TRUE WHERE name = 'KETLYN DAIANE DA SILVA FREIRE';
UPDATE experts SET is_n1_expert = TRUE WHERE name = 'PATRICIA RABELO DA SILVA SABARA';
UPDATE experts SET is_n1_expert = TRUE WHERE name = 'DANIEL BASS DOS SANTOS';
UPDATE experts SET is_n1_expert = TRUE WHERE name = 'DIENE KELY ARCELINO DE LIMA';
UPDATE experts SET is_n1_expert = TRUE WHERE name = 'JOÃO MARCOS DA SILVA CASTRO';
UPDATE experts SET is_n1_expert = TRUE WHERE name = 'KARINA JESUS VIEIRA';
UPDATE experts SET is_n1_expert = TRUE WHERE name = 'EDENILZA MIRANDA SANTANA';
UPDATE experts SET is_n1_expert = TRUE WHERE name = 'LUCINEIA BENEDITO DE SOUZA RIBEIRO';
UPDATE experts SET is_n1_expert = TRUE WHERE name = 'VINICIUS LOPES LINS';
UPDATE experts SET is_n1_expert = TRUE WHERE name = 'INGRYD OLIVEIRA MENDES DE BRITO';
UPDATE experts SET is_n1_expert = TRUE WHERE name = 'CRISLANE LIMA DE SOUZA';
UPDATE experts SET is_n1_expert = TRUE WHERE name = 'LUIZ FERNANDO DE SOUZA DA SILVA';
UPDATE experts SET is_n1_expert = TRUE WHERE name = 'WENNY BIANCA DOS SANTOS FARIA';
UPDATE experts SET is_n1_expert = TRUE WHERE name = 'CARINE PEREIRA DOS SANTOS REIS';
