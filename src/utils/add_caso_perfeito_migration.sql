-- 1. Adicionar flag de acesso na tabela experts
ALTER TABLE experts ADD COLUMN IF NOT EXISTS is_caso_perfeito_expert BOOLEAN DEFAULT FALSE;

-- 2. Criar a nova tabela para os registros do Caso Perfeito
CREATE TABLE IF NOT EXISTS caso_perfeito_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE NOT NULL,
    expert_name TEXT NOT NULL,
    protocolo TEXT NOT NULL,
    consumidor_lojista TEXT NOT NULL,
    processo_realizado TEXT,
    celula TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Criar índices para otimização
CREATE INDEX IF NOT EXISTS idx_caso_perfeito_date ON caso_perfeito_records(date);
CREATE INDEX IF NOT EXISTS idx_caso_perfeito_expert ON caso_perfeito_records(expert_name);
