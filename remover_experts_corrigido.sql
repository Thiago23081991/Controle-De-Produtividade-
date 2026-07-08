-- ============================================================
-- SCRIPT CORRIGIDO: REMOVER EXPERTS USANDO IDs REAIS
-- Data: 2026-07-08
-- ============================================================

-- PASSO 1: Ver TODOS os experts que precisam ser removidos
-- (para pegar os IDs de Kawany, Roberta e Rodrigo também)
SELECT id, name, supervisor
FROM experts
WHERE name ILIKE '%CAIO%FELIPE%'
   OR name ILIKE '%EDUARDA%TACIANA%'
   OR name ILIKE '%GIOVANNA%AIORFE%'
   OR name ILIKE '%JOAO%PEDRO%'
   OR name ILIKE '%KAWANY%'
   OR name ILIKE '%ROBERTA%NICOLETTI%'
   OR name ILIKE '%RODRIGO%FERREIRA%';

-- ============================================================
-- PASSO 2: Deletar produtividade DIÁRIA pelos nomes completos
-- ============================================================
DELETE FROM productivity_records
WHERE expert_name IN (
    'CAIO FELIPE DA SILVA',
    'EDUARDA TACIANA DA SILVA AVELINO FERREIRA',
    'JOAO PEDRO MARTINS CARVALHO',
    'GIOVANNA AIORFE DIAS'
)
OR expert_name ILIKE '%KAWANY%'
OR expert_name ILIKE '%ROBERTA%NICOLETTI%'
OR expert_name ILIKE '%RODRIGO%FERREIRA%';

-- ============================================================
-- PASSO 3: Deletar produtividade MENSAL pelos nomes completos
-- ============================================================
DELETE FROM monthly_productivity
WHERE expert_name IN (
    'CAIO FELIPE DA SILVA',
    'EDUARDA TACIANA DA SILVA AVELINO FERREIRA',
    'JOAO PEDRO MARTINS CARVALHO',
    'GIOVANNA AIORFE DIAS'
)
OR expert_name ILIKE '%KAWANY%'
OR expert_name ILIKE '%ROBERTA%NICOLETTI%'
OR expert_name ILIKE '%RODRIGO%FERREIRA%';

-- ============================================================
-- PASSO 4: Deletar os experts pelos IDs reais
-- ============================================================
DELETE FROM experts
WHERE id IN (
    '40d52ee2-49f5-466d-9104-f05f1a529197', -- CAIO FELIPE DA SILVA
    'da0b28f2-7bb2-428d-9331-a5d54e172bc0', -- EDUARDA TACIANA DA SILVA AVELINO FERREIRA
    '17c7fb49-3d00-4146-8219-a2bff2f8f093', -- JOAO PEDRO MARTINS CARVALHO
    '41bb8e17-6da2-4050-baf7-3f9953c6b85d'  -- GIOVANNA AIORFE DIAS
)
OR name ILIKE '%KAWANY%'
OR name ILIKE '%ROBERTA%NICOLETTI%'
OR name ILIKE '%RODRIGO%FERREIRA%';

-- ============================================================
-- VERIFICAÇÃO FINAL — Resultado esperado: 0 linhas
-- ============================================================
SELECT id, name FROM experts
WHERE name ILIKE '%CAIO%FELIPE%'
   OR name ILIKE '%EDUARDA%TACIANA%'
   OR name ILIKE '%GIOVANNA%AIORFE%'
   OR name ILIKE '%JOAO%PEDRO%MARTINS%'
   OR name ILIKE '%KAWANY%'
   OR name ILIKE '%ROBERTA%NICOLETTI%'
   OR name ILIKE '%RODRIGO%FERREIRA%';
