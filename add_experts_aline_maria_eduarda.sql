-- Inserir novas experts na tabela experts
-- Execute este SQL no Supabase > SQL Editor

INSERT INTO experts (matricula, login, name, active)
VALUES
    ('284389', '213605', 'ALINE ISBRANA DOS SANTOS', true),
    ('382374', '213692', 'MARIA EDUARDA DOS SANTOS', true)
ON CONFLICT (matricula) DO UPDATE
    SET login  = EXCLUDED.login,
        name   = EXCLUDED.name,
        active = true;
