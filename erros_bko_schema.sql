-- Tabela: erros_bko
CREATE TABLE IF NOT EXISTS erros_bko (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE NOT NULL,
    numero_caso TEXT NOT NULL,
    expert_name TEXT NOT NULL,
    descricao_erro TEXT NOT NULL,
    motivo TEXT,
    submotivo TEXT,
    registrado_por TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar Row Level Security
ALTER TABLE erros_bko ENABLE ROW LEVEL SECURITY;

-- Policy: leitura para todos autenticados
CREATE POLICY "Allow read erros_bko" ON erros_bko
    FOR SELECT USING (true);

-- Policy: inserção para todos autenticados
CREATE POLICY "Allow insert erros_bko" ON erros_bko
    FOR INSERT WITH CHECK (true);

-- Policy: deleção para todos autenticados
CREATE POLICY "Allow delete erros_bko" ON erros_bko
    FOR DELETE USING (true);
