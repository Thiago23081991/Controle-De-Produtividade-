-- Adicionando campos específicos de filas na tabela de registros diários
ALTER TABLE productivity_records ADD COLUMN whatsapp integer DEFAULT 0;
ALTER TABLE productivity_records ADD COLUMN revenda integer DEFAULT 0;
ALTER TABLE productivity_records ADD COLUMN encontre_pintor integer DEFAULT 0;

-- Adicionando campos específicos de filas na tabela de registros mensais
ALTER TABLE monthly_productivity ADD COLUMN whatsapp integer DEFAULT 0;
ALTER TABLE monthly_productivity ADD COLUMN revenda integer DEFAULT 0;
ALTER TABLE monthly_productivity ADD COLUMN encontre_pintor integer DEFAULT 0;
