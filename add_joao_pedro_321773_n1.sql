-- ============================================================
-- SCRIPT: INCLUIR JOAO PEDRO MARTINS CARVALHO NA ABA ERROS N1
-- Data: 2026-08-17
-- ============================================================
-- Execute este script no Supabase > SQL Editor
-- ============================================================

INSERT INTO experts (matricula, login, name, active, is_n1_expert)
VALUES ('321773', '213612', 'JOAO PEDRO MARTINS CARVALHO', TRUE, TRUE)
ON CONFLICT (matricula) DO UPDATE
    SET login        = EXCLUDED.login,
        name         = EXCLUDED.name,
        active       = TRUE,
        is_n1_expert = TRUE;

-- VERIFICAÇÃO
SELECT matricula, login, name, active, is_n1_expert
FROM experts
WHERE matricula = '321773';
