-- ============================================================
-- SCRIPT: REMOVER EXPERTS - CRISLANE LIMA, EMANUELLE COBO, THAIS DA
-- Data: 2026-07-08
-- ============================================================

-- PASSO 1: Verificar os nomes exatos antes de deletar
SELECT id, name, supervisor, active
FROM experts
WHERE name ILIKE '%CRISLANE%'
   OR name ILIKE '%EMANUELLE%COBO%'
   OR name ILIKE '%THAIS%DA%';

-- ============================================================
-- PASSO 2: Deletar registros de produtividade DIÁRIA
-- ============================================================
DELETE FROM productivity_records
WHERE expert_name ILIKE '%CRISLANE%'
   OR expert_name ILIKE '%EMANUELLE%COBO%'
   OR expert_name ILIKE '%THAIS%DA%';

-- ============================================================
-- PASSO 3: Deletar registros de produtividade MENSAL
-- ============================================================
DELETE FROM monthly_productivity
WHERE expert_name ILIKE '%CRISLANE%'
   OR expert_name ILIKE '%EMANUELLE%COBO%'
   OR expert_name ILIKE '%THAIS%DA%';

-- ============================================================
-- PASSO 4: Deletar os experts da tabela experts
-- ============================================================
DELETE FROM experts
WHERE name ILIKE '%CRISLANE%'
   OR name ILIKE '%EMANUELLE%COBO%'
   OR name ILIKE '%THAIS%DA%';

-- ============================================================
-- VERIFICAÇÃO FINAL — Resultado esperado: 0 linhas
-- ============================================================
SELECT * FROM experts
WHERE name ILIKE '%CRISLANE%'
   OR name ILIKE '%EMANUELLE%COBO%'
   OR name ILIKE '%THAIS%DA%';
