-- Inserir experts com acesso exclusivo ao Backoffice (Erros BKO)
-- Execute este SQL no Supabase > SQL Editor

INSERT INTO experts (matricula, login, name, active, is_bko_expert)
VALUES
    ('358255', '213662', 'ROBERTA NICOLETTI PORTELA', TRUE, TRUE),
    ('368131', '213678', 'CAIO FELIPE DA SILVA',      TRUE, TRUE)
ON CONFLICT (matricula) DO UPDATE
    SET login         = EXCLUDED.login,
        name          = EXCLUDED.name,
        active        = TRUE,
        is_bko_expert = TRUE;
