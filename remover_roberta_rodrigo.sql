-- ============================================================
-- SCRIPT: REMOVER EXPERTS - ROBERTA NICOLETTI, RODRIGO FERREIRA
-- Data: 2026-07-08
-- ============================================================

-- PASSO 1: Verificar os nomes exatos antes de deletar
SELECT id, matricula, login, name, supervisor, active
FROM experts
WHERE name ILIKE '%ROBERTA%NICOLETTI%'
   OR name ILIKE '%RODRIGO%FERREIRA%';

-- ============================================================
-- PASSO 2: Deletar registros de produtividade DIÁRIA
-- ============================================================
DELETE FROM productivity_records
WHERE expert_name ILIKE '%ROBERTA%NICOLETTI%'
   OR expert_name ILIKE '%RODRIGO%FERREIRA%';

-- ============================================================
-- PASSO 3: Deletar registros de produtividade MENSAL
-- ============================================================
DELETE FROM monthly_productivity
WHERE expert_name ILIKE '%ROBERTA%NICOLETTI%'
   OR expert_name ILIKE '%RODRIGO%FERREIRA%';

-- ============================================================
-- PASSO 4: Deletar os experts da tabela experts
-- ============================================================
DELETE FROM experts
WHERE name ILIKE '%ROBERTA%NICOLETTI%'
   OR name ILIKE '%RODRIGO%FERREIRA%';

-- ============================================================
-- VERIFICAÇÃO FINAL
-- ============================================================
SELECT * FROM experts
WHERE name ILIKE '%ROBERTA%NICOLETTI%'
   OR name ILIKE '%RODRIGO%FERREIRA%';
-- Resultado esperado: 0 linhas
