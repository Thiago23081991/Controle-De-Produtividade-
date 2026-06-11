-- ============================================================
-- SCRIPT: REMOVER EXPERTS - CAUE ANDRADE, LUCINEIA BENEDITO, VINICIUS LOPES
-- Data: 2026-06-11
-- ============================================================

-- PASSO 1: Verificar os nomes exatos antes de deletar
SELECT id, matricula, login, name, supervisor, active
FROM experts
WHERE name ILIKE '%CAUE%ANDRADE%'
   OR name ILIKE '%LUCINEIA%BENEDITO%'
   OR name ILIKE '%VINICIUS%LOPES%';

-- ============================================================
-- PASSO 2: Deletar registros de produtividade DIÁRIA
-- ============================================================
DELETE FROM productivity_records
WHERE expert_name ILIKE '%CAUE%ANDRADE%'
   OR expert_name ILIKE '%LUCINEIA%BENEDITO%'
   OR expert_name ILIKE '%VINICIUS%LOPES%';

-- ============================================================
-- PASSO 3: Deletar registros de produtividade MENSAL
-- ============================================================
DELETE FROM monthly_productivity
WHERE expert_name ILIKE '%CAUE%ANDRADE%'
   OR expert_name ILIKE '%LUCINEIA%BENEDITO%'
   OR expert_name ILIKE '%VINICIUS%LOPES%';

-- ============================================================
-- PASSO 4: Deletar os experts da tabela experts
-- ============================================================
DELETE FROM experts
WHERE name ILIKE '%CAUE%ANDRADE%'
   OR name ILIKE '%LUCINEIA%BENEDITO%'
   OR name ILIKE '%VINICIUS%LOPES%';

-- ============================================================
-- VERIFICAÇÃO FINAL
-- ============================================================
SELECT * FROM experts
WHERE name ILIKE '%CAUE%ANDRADE%'
   OR name ILIKE '%LUCINEIA%BENEDITO%'
   OR name ILIKE '%VINICIUS%LOPES%';
-- Resultado esperado: 0 linhas
