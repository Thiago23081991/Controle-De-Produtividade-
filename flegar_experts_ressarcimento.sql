-- ============================================================
-- SCRIPT: ATIVAR E CADASTRAR EXPERTS DA EQUIPE RESSARCIMENTO
-- Data: 2026-06-11
-- ============================================================

-- PASSO 1: Reativar e atualizar supervisor de todos os experts existentes
UPDATE experts SET active = TRUE, supervisor = 'RESSARCIMENTO'
WHERE name ILIKE '%DOUGLAS%FALCAO%CAVALCANTE%'
   OR name ILIKE '%RODRIGO%FERREIRA%DE%VASCONCELOS%'
   OR name ILIKE '%ROBERTA%NICOLETTI%PORTELA%'
   OR name ILIKE '%SABRINA%DA%SILVA%'
   OR name ILIKE '%CAIO%FELIPE%DA%SILVA%'
   OR name ILIKE '%TATIANE%APARECIDA%DE%ARAUJO%JACINTO%'
   OR name ILIKE '%JOAO%PEDRO%MARTINS%CARVALHO%'
   OR name ILIKE '%EDUARDA%TACIANA%DA%SILVA%AVELINO%'
   OR name ILIKE '%EDUARDO%NASCIMENTO%E%SILVA%'
   OR name ILIKE '%KETLYN%DAIANE%DA%SILVA%FREIRE%'
   OR name ILIKE '%LUCINEIA%BENEDITO%DE%SOUZA%RIBEIRO%'
   OR name ILIKE '%INGRYD%OLIVEIRA%MENDES%DE%BRITO%'
   OR name ILIKE '%CRISLANE%LIMA%DE%SOUZA%'
   OR name ILIKE '%LUIZ%FERNANDO%DE%SOUZA%DA%SILVA%'
   OR name ILIKE '%EMANUELLE%COBO%SALLES%';

-- PASSO 2: Inserir novos experts (e Vinicius Lopes Lins) caso não existam
-- (Usamos INSERT ... ON CONFLICT para evitar erros se já existirem)

-- GIOVANNA AIORFE DIAS
INSERT INTO experts (matricula, login, name, supervisor, active)
VALUES ('900001', '913601', 'GIOVANNA AIORFE DIAS', 'RESSARCIMENTO', TRUE)
ON CONFLICT (matricula) DO UPDATE SET active = TRUE, supervisor = 'RESSARCIMENTO';

-- KAWANY MATHIOLA SOUTO RIBEIRO
INSERT INTO experts (matricula, login, name, supervisor, active)
VALUES ('900002', '913602', 'KAWANY MATHIOLA SOUTO RIBEIRO', 'RESSARCIMENTO', TRUE)
ON CONFLICT (matricula) DO UPDATE SET active = TRUE, supervisor = 'RESSARCIMENTO';

-- SOFIA LAURA VIALE BRANDAO
INSERT INTO experts (matricula, login, name, supervisor, active)
VALUES ('900003', '913603', 'SOFIA LAURA VIALE BRANDAO', 'RESSARCIMENTO', TRUE)
ON CONFLICT (matricula) DO UPDATE SET active = TRUE, supervisor = 'RESSARCIMENTO';

-- VINICIUS LOPES LINS
-- Tenta inserir com matrícula temporária caso não tenha sido atualizado no passo 1
INSERT INTO experts (matricula, login, name, supervisor, active)
SELECT '900004', '913604', 'VINICIUS LOPES LINS', 'RESSARCIMENTO', TRUE
WHERE NOT EXISTS (SELECT 1 FROM experts WHERE name ILIKE '%VINICIUS%LOPES%');

-- Reativa o Vinicius caso ele já existisse com outra matrícula
UPDATE experts SET active = TRUE, supervisor = 'RESSARCIMENTO'
WHERE name ILIKE '%VINICIUS%LOPES%';

-- ============================================================
-- VERIFICAÇÃO FINAL: Deve retornar os 19 experts ativos
-- ============================================================
SELECT matricula, login, name, supervisor, active
FROM experts
WHERE supervisor = 'RESSARCIMENTO' AND active = TRUE
ORDER BY name;
