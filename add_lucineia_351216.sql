-- Cadastrar expert na tabela experts
-- Execute este script no Supabase SQL Editor

INSERT INTO experts (matricula, login, name, active)
VALUES ('351216', '351216', 'LUCINEIA BENEDITO DE SOUZA RIBEIRO', TRUE)
ON CONFLICT (matricula) DO UPDATE
    SET active = TRUE,
        name   = 'LUCINEIA BENEDITO DE SOUZA RIBEIRO';
