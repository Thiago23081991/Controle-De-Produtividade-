-- Cadastrar experts BKO na tabela experts
-- Execute este script no Supabase SQL Editor

INSERT INTO experts (matricula, login, name, active, is_bko_expert)
VALUES
    ('340021', '340021', 'DOUGLAS FALCAO CAVALCANTE',        TRUE, TRUE),
    ('339944', '339944', 'RODRIGO FERREIRA DE VASCONCELOS',  TRUE, TRUE),
    ('374454', '374454', 'GIOVANNA AIORFE DIAS',             TRUE, TRUE),
    ('255921', '255921', 'KAWANY MATHIOLA SOUTO RIBEIRO',    TRUE, TRUE),
    ('372143', '372143', 'SOFIA LAURA VIALE BRANDAO',        TRUE, TRUE),
    ('372438', '372438', 'THAIS APARECIDA SOUZA DOS SANTOS', TRUE, TRUE),
    ('372436', '372436', 'ESTER ALVES FERREIRA',             TRUE, TRUE)
ON CONFLICT (matricula) DO UPDATE
    SET is_bko_expert = TRUE,
        active        = TRUE;

-- JOAO PEDRO MARTINS CARVALHO (321773) já é ADMIN — não precisa ser inserido.
-- Se já existir na tabela experts, apenas ativa a flag BKO:
UPDATE experts SET is_bko_expert = TRUE WHERE matricula = '321773';
