-- ============================================================
-- SCRIPT: REMOVER EXPERTS RESSARCIMENTO
-- CAIO FELIPE, EDUARDA TACIANA, GIOVANNA AIORFE,
-- JOAO PEDRO, KAWANY MATHIOLA
-- Data: 2026-07-08
-- ============================================================

-- PASSO 1: Verificar os nomes exatos antes de deletar
SELECT id, matricula, login, name, supervisor, active
FROM experts
WHERE name ILIKE '%CAIO%FELIPE%'
   OR name ILIKE '%EDUARDA%TACIANA%'
   OR name ILIKE '%GIOVANNA%AIORFE%'
   OR name ILIKE '%JOAO%PEDRO%'
   OR name ILIKE '%KAWANY%MATHIOLA%';

-- ============================================================
-- PASSO 2: Deletar registros de produtividade DIÁRIA
-- ============================================================
DELETE FROM productivity_records
WHERE expert_name ILIKE '%CAIO%FELIPE%'
   OR expert_name ILIKE '%EDUARDA%TACIANA%'
   OR expert_name ILIKE '%GIOVANNA%AIORFE%'
   OR expert_name ILIKE '%JOAO%PEDRO%'
   OR expert_name ILIKE '%KAWANY%MATHIOLA%';

-- ============================================================
-- PASSO 3: Deletar registros de produtividade MENSAL
-- ============================================================
DELETE FROM monthly_productivity
WHERE expert_name ILIKE '%CAIO%FELIPE%'
   OR expert_name ILIKE '%EDUARDA%TACIANA%'
   OR expert_name ILIKE '%GIOVANNA%AIORFE%'
   OR expert_name ILIKE '%JOAO%PEDRO%'
   OR expert_name ILIKE '%KAWANY%MATHIOLA%';

-- ============================================================
-- PASSO 4: Deletar os experts da tabela experts
-- ============================================================
DELETE FROM experts
WHERE name ILIKE '%CAIO%FELIPE%'
   OR name ILIKE '%EDUARDA%TACIANA%'
   OR name ILIKE '%GIOVANNA%AIORFE%'
   OR name ILIKE '%JOAO%PEDRO%'
   OR name ILIKE '%KAWANY%MATHIOLA%';

-- ============================================================
-- VERIFICAÇÃO FINAL
-- ============================================================
SELECT * FROM experts
WHERE name ILIKE '%CAIO%FELIPE%'
   OR name ILIKE '%EDUARDA%TACIANA%'
   OR name ILIKE '%GIOVANNA%AIORFE%'
   OR name ILIKE '%JOAO%PEDRO%'
   OR name ILIKE '%KAWANY%MATHIOLA%';
-- Resultado esperado: 0 linhas
