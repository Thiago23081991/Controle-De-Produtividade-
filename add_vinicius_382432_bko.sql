-- Cadastrar expert BKO VINICIUS LOPES LINS (382432) na tabela experts
-- Execute este script no Supabase SQL Editor

INSERT INTO experts (matricula, login, name, active, is_bko_expert)
VALUES
    ('382432', '382432', 'VINICIUS LOPES LINS', TRUE, TRUE)
ON CONFLICT (matricula) DO UPDATE
    SET is_bko_expert = TRUE,
        active        = TRUE;
