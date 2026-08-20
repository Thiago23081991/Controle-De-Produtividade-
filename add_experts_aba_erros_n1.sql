-- ============================================================
-- SCRIPT: AUTORIZAR EXPERTS COM ACESSO À ABA ERROS N1
-- Data: 2026-08-17
-- ============================================================
-- Garante que todos os 11 experts estejam cadastrados, ativos
-- e com a flag is_n1_expert = TRUE.
-- Execute este script no Supabase > SQL Editor
-- ============================================================

-- PASSO 1: Garantir que a coluna is_n1_expert existe
ALTER TABLE experts
ADD COLUMN IF NOT EXISTS is_n1_expert BOOLEAN DEFAULT FALSE;

-- ============================================================
-- PASSO 2: Inserir / Reativar os experts e marcar is_n1_expert
-- ============================================================
INSERT INTO experts (matricula, login, name, active, is_n1_expert) VALUES
    ('335425', '213609', 'SABRINA DA SILVA',                              TRUE, TRUE),
    ('368131', '213678', 'CAIO FELIPE DA SILVA',                          TRUE, TRUE),
    ('360691', '213664', 'TATIANE APARECIDA DE ARAUJO JACINTO',           TRUE, TRUE),
    ('315013', '213622', 'EDUARDA TACIANA DA SILVA AVELINO FERREIRA',     TRUE, TRUE),
    ('363744', '213669', 'EDUARDO NASCIMENTO E SILVA',                    TRUE, TRUE),
    ('349577', '213654', 'KETLYN DAIANE DA SILVA FREIRE',                 TRUE, TRUE),
    ('351216', '213656', 'LUCINEIA BENEDITO DE SOUZA RIBEIRO',            TRUE, TRUE),
    ('382432', '213696', 'VINICIUS LOPES LINS',                           TRUE, TRUE),
    ('315015', '213619', 'INGRYD OLIVEIRA MENDES DE BRITO',               TRUE, TRUE),
    ('330636', '213646', 'CRISLANE LIMA DE SOUZA',                        TRUE, TRUE),
    ('333601', '213651', 'LUIZ FERNANDO DE SOUZA DA SILVA',               TRUE, TRUE)
ON CONFLICT (matricula) DO UPDATE
    SET login         = EXCLUDED.login,
        name          = EXCLUDED.name,
        active        = TRUE,
        is_n1_expert  = TRUE;

-- ============================================================
-- VERIFICAÇÃO: Confirmar experts com acesso à Aba Erros N1
-- ============================================================
SELECT matricula, login, name, active, is_n1_expert
FROM experts
WHERE matricula IN (
    '335425', '368131', '360691', '315013', '363744',
    '349577', '351216', '382432', '315015', '330636', '333601'
)
ORDER BY name;
-- Resultado esperado: 11 experts com active = TRUE e is_n1_expert = TRUE
