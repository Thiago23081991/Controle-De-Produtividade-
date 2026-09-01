-- Reativar expert N1 EDUARDO NASCIMENTO E SILVA (363744)
-- Execute este script no Supabase SQL Editor

INSERT INTO experts (matricula, login, name, active, is_n1_expert)
VALUES ('363744', '213669', 'EDUARDO NASCIMENTO E SILVA', TRUE, TRUE)
ON CONFLICT (matricula) DO UPDATE
SET active = TRUE, is_n1_expert = TRUE;
