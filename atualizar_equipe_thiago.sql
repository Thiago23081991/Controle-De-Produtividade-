-- ============================================================
-- SCRIPT: ATUALIZAR EQUIPE DO SUPERVISOR THIAGO DA SILVA NASCIMENTO
-- Data: 2026-06-11
-- ============================================================

-- ============================================================
-- PASSO 1: Desativar experts que saíram da equipe do Thiago
-- (foram removidos da lista, mas seus dados de produtividade são preservados)
-- ============================================================
UPDATE experts SET active = FALSE
WHERE matricula IN (
    '368131', -- CAIO FELIPE DA SILVA
    '358255', -- ROBERTA NICOLETTI PORTELA
    '321773', -- JOAO PEDRO MARTINS CARVALHO
    '360691', -- TATIANE APARECIDA DE ARAUJO JACINTO
    '315013', -- EDUARDA TACIANA DA SILVA AVELINO FERREIRA
    '363744', -- EDUARDO NASCIMENTO E SILVA
    '335425', -- SABRINA DA SILVA
    '349577', -- KETLYN DAIANE DA SILVA FREIRE
    '330636', -- CRISLANE LIMA DE SOUZA
    '333601', -- LUIZ FERNANDO DE SOUZA DA SILVA
    '317094', -- WENNY BIANCA DOS SANTOS FARIA
    '315015'  -- INGRYD OLIVEIRA MENDES DE BRITO
);

-- ============================================================
-- PASSO 2: Inserir/Atualizar os experts da nova lista do Thiago
-- ============================================================
INSERT INTO experts (matricula, login, name, supervisor, active) VALUES
('308652', '213716', 'LUIZ GABRIEL DE FREITAS TEMOTEO', 'THIAGO DA SILVA NASCIMENTO', TRUE),
('300031', '213745', 'VALERIA SILVA LEITE',             'THIAGO DA SILVA NASCIMENTO', TRUE),
('243176', '213776', 'HELEN NARA SALES DE SOUZA',       'THIAGO DA SILVA NASCIMENTO', TRUE),
('284336', '213629', 'DANIEL BASS DOS SANTOS',          'THIAGO DA SILVA NASCIMENTO', TRUE),
('306700', '213693', 'DIENE KELY ARCELINO DE LIMA',     'THIAGO DA SILVA NASCIMENTO', TRUE),
('298615', '213748', 'JOÃO MARCOS DA SILVA CASTRO',     'THIAGO DA SILVA NASCIMENTO', TRUE),
('284397', '213633', 'KARINA JESUS VIEIRA',             'THIAGO DA SILVA NASCIMENTO', TRUE),
('304244', '213710', 'EDENILZA MIRANDA SANTANA',        'THIAGO DA SILVA NASCIMENTO', TRUE),
('284396', '213632', 'CARINE PEREIRA DOS SANTOS REIS',  'THIAGO DA SILVA NASCIMENTO', TRUE),
('284419', '213634', 'BIANCA MACEDO LOPES DA SILVA',   'THIAGO DA SILVA NASCIMENTO', TRUE),
('295565', '213786', 'FERNANDA RODRIGUES DA SILVA',     'THIAGO DA SILVA NASCIMENTO', TRUE),
('284389', '213605', 'ALINE ISBRANA DOS SANTOS',        'THIAGO DA SILVA NASCIMENTO', TRUE),
('344343', '213686', 'THAIS DA SILVA RODRIGUES',        'THIAGO DA SILVA NASCIMENTO', TRUE)
ON CONFLICT (matricula) DO UPDATE SET
    name       = EXCLUDED.name,
    login      = EXCLUDED.login,
    supervisor = EXCLUDED.supervisor,
    active     = TRUE;

-- ============================================================
-- VERIFICAÇÃO: Confirmar equipe ativa do Thiago
-- ============================================================
SELECT matricula, login, name, active
FROM experts
WHERE supervisor = 'THIAGO DA SILVA NASCIMENTO'
ORDER BY name;
-- Resultado esperado: 13 experts ativos
