-- Cadastrar expert na tabela experts
-- Execute este script no Supabase SQL Editor

INSERT INTO experts (matricula, login, name, active)
VALUES ('377504', '377504', 'EMANUELLE COBO SALLES', TRUE)
ON CONFLICT (matricula) DO UPDATE
    SET active = TRUE,
        name   = 'EMANUELLE COBO SALLES';
