-- Inserir / Reativar experts N1 no Supabase
-- Execute no Supabase > SQL Editor

INSERT INTO experts (matricula, login, name, active, is_n1_expert) VALUES
    ('360691', '213664', 'TATIANE APARECIDA DE ARAUJO JACINTO', TRUE, TRUE),
    ('349577', '213654', 'KETLYN DAIANE DA SILVA FREIRE',         TRUE, TRUE),
    ('330636', '213646', 'CRISLANE LIMA DE SOUZA',                TRUE, TRUE),
    ('333601', '213651', 'LUIZ FERNANDO DE SOUZA DA SILVA',       TRUE, TRUE)
ON CONFLICT (matricula) DO UPDATE
    SET login        = EXCLUDED.login,
        name         = EXCLUDED.name,
        active       = TRUE,
        is_n1_expert = TRUE;
