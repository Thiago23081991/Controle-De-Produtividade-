-- ============================================================
-- SCRIPT: REMOVER EXPERTS DESLIGADOS
-- Data: 2026-06-11
-- Experts: CRISLANE LIMA, EDUARDO NASCIMENTO, INGRYD OLIVEIRA,
--          KETLYN DAIANE, LUIZ FERNANDO, ROBERTA NICOLETTI,
--          SABRINA DA SILVA, TATIANE APARECIDA
-- ============================================================

-- PASSO 1: Verificar os nomes exatos antes de deletar
SELECT id, matricula, login, name, supervisor, active
FROM experts
WHERE name ILIKE '%CRISLANE%LIMA%'
   OR name ILIKE '%EDUARDO%NASCIMENTO%'
   OR name ILIKE '%INGRYD%OLIVEIRA%'
   OR name ILIKE '%KETLYN%DAIANE%'
   OR name ILIKE '%LUIZ%FERNANDO%'
   OR name ILIKE '%ROBERTA%NICOLETTI%'
   OR name ILIKE '%SABRINA%'
   OR name ILIKE '%TATIANE%APARECIDA%';

-- ============================================================
-- PASSO 2: Deletar registros de produtividade DIÁRIA
-- ============================================================
DELETE FROM productivity_records
WHERE expert_name ILIKE '%CRISLANE%LIMA%'
   OR expert_name ILIKE '%EDUARDO%NASCIMENTO%'
   OR expert_name ILIKE '%INGRYD%OLIVEIRA%'
   OR expert_name ILIKE '%KETLYN%DAIANE%'
   OR expert_name ILIKE '%LUIZ%FERNANDO%'
   OR expert_name ILIKE '%ROBERTA%NICOLETTI%'
   OR expert_name ILIKE '%SABRINA%'
   OR expert_name ILIKE '%TATIANE%APARECIDA%';

-- ============================================================
-- PASSO 3: Deletar registros de produtividade MENSAL
-- ============================================================
DELETE FROM monthly_productivity
WHERE expert_name ILIKE '%CRISLANE%LIMA%'
   OR expert_name ILIKE '%EDUARDO%NASCIMENTO%'
   OR expert_name ILIKE '%INGRYD%OLIVEIRA%'
   OR expert_name ILIKE '%KETLYN%DAIANE%'
   OR expert_name ILIKE '%LUIZ%FERNANDO%'
   OR expert_name ILIKE '%ROBERTA%NICOLETTI%'
   OR expert_name ILIKE '%SABRINA%'
   OR expert_name ILIKE '%TATIANE%APARECIDA%';

-- ============================================================
-- PASSO 4: Deletar os experts da tabela experts
-- ============================================================
DELETE FROM experts
WHERE name ILIKE '%CRISLANE%LIMA%'
   OR name ILIKE '%EDUARDO%NASCIMENTO%'
   OR name ILIKE '%INGRYD%OLIVEIRA%'
   OR name ILIKE '%KETLYN%DAIANE%'
   OR name ILIKE '%LUIZ%FERNANDO%'
   OR name ILIKE '%ROBERTA%NICOLETTI%'
   OR name ILIKE '%SABRINA%'
   OR name ILIKE '%TATIANE%APARECIDA%';

-- ============================================================
-- VERIFICAÇÃO FINAL: deve retornar 0 linhas
-- ============================================================
SELECT * FROM experts
WHERE name ILIKE '%CRISLANE%LIMA%'
   OR name ILIKE '%EDUARDO%NASCIMENTO%'
   OR name ILIKE '%INGRYD%OLIVEIRA%'
   OR name ILIKE '%KETLYN%DAIANE%'
   OR name ILIKE '%LUIZ%FERNANDO%'
   OR name ILIKE '%ROBERTA%NICOLETTI%'
   OR name ILIKE '%SABRINA%'
   OR name ILIKE '%TATIANE%APARECIDA%';
