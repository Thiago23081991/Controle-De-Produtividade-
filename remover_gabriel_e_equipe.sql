-- ============================================================
-- SCRIPT: REMOVER HIERARQUIA DO SUPERVISOR GABRIEL MORALES RODRIGUES
-- Data: 2026-06-11
-- ATENÇÃO: Esta operação é IRREVERSÍVEL. Faça backup antes!
-- ============================================================

-- 1. Nomes dos experts da equipe do Gabriel (para referência)
-- - DOUGLAS FALCAO CAVALCANTE
-- - FABIO DA SILVA FERREIRA
-- - RODRIGO FERREIRA DE VASCONCELOS
-- - THAIS APARECIDA SOUZA DOS SANTOS
-- - ANNA BEATRIZ FERREIRA MENDES
-- - ESTER ALVES FERREIRA
-- - LUCAS ALBERTO ESPINDULA SANTOS
-- - LUIZ GABRIEL DE FREITAS TEMOTEO
-- - VALERIA SILVA LEITE
-- - EMANUELLE COBO SALLES
-- - LUCINEIA BENEDITO DE SOUZA RIBEIRO
-- + GABRIEL MORALES RODRIGUES (o próprio supervisor)

-- ============================================================
-- PASSO 1: Deletar registros de produtividade DIÁRIA da equipe
-- ============================================================
DELETE FROM productivity_records
WHERE expert_name IN (
    'DOUGLAS FALCAO CAVALCANTE',
    'FABIO DA SILVA FERREIRA',
    'RODRIGO FERREIRA DE VASCONCELOS',
    'THAIS APARECIDA SOUZA DOS SANTOS',
    'ANNA BEATRIZ FERREIRA MENDES',
    'ESTER ALVES FERREIRA',
    'LUCAS ALBERTO ESPINDULA SANTOS',
    'LUIZ GABRIEL DE FREITAS TEMOTEO',
    'VALERIA SILVA LEITE',
    'EMANUELLE COBO SALLES',
    'LUCINEIA BENEDITO DE SOUZA RIBEIRO',
    'GABRIEL MORALES RODRIGUES'
);

-- ============================================================
-- PASSO 2: Deletar registros de produtividade MENSAL da equipe
-- (caso a tabela monthly_productivity exista)
-- ============================================================
DELETE FROM monthly_productivity
WHERE expert_name IN (
    'DOUGLAS FALCAO CAVALCANTE',
    'FABIO DA SILVA FERREIRA',
    'RODRIGO FERREIRA DE VASCONCELOS',
    'THAIS APARECIDA SOUZA DOS SANTOS',
    'ANNA BEATRIZ FERREIRA MENDES',
    'ESTER ALVES FERREIRA',
    'LUCAS ALBERTO ESPINDULA SANTOS',
    'LUIZ GABRIEL DE FREITAS TEMOTEO',
    'VALERIA SILVA LEITE',
    'EMANUELLE COBO SALLES',
    'LUCINEIA BENEDITO DE SOUZA RIBEIRO',
    'GABRIEL MORALES RODRIGUES'
);

-- ============================================================
-- PASSO 3: Deletar os experts da tabela experts
-- ============================================================
DELETE FROM experts
WHERE supervisor = 'GABRIEL MORALES RODRIGUES'
   OR name = 'GABRIEL MORALES RODRIGUES';

-- ============================================================
-- VERIFICAÇÃO: Confirmar que não sobrou nada
-- ============================================================
SELECT * FROM experts WHERE supervisor = 'GABRIEL MORALES RODRIGUES' OR name = 'GABRIEL MORALES RODRIGUES';
-- Resultado esperado: 0 linhas
