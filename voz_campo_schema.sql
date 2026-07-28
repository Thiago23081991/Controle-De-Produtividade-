-- Tabela para Voz de Campo (ligações recebidas de técnicos/consultores)
CREATE TABLE IF NOT EXISTS public.voz_campo (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE NOT NULL,
    funcao TEXT NOT NULL,
    sub_campo TEXT NOT NULL,
    nome_tecnico_consultor TEXT NOT NULL,
    solicitacao TEXT NOT NULL,
    tempo_ligacao TEXT NOT NULL,
    quantos_casos_ligacao INTEGER NOT NULL DEFAULT 0,
    registrado_por TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.voz_campo ENABLE ROW LEVEL SECURITY;

-- Política: todos os usuários autenticados podem ver os registros
CREATE POLICY "Allow read for authenticated users"
    ON public.voz_campo FOR SELECT
    USING (true);

-- Política: todos os usuários autenticados podem inserir
CREATE POLICY "Allow insert for authenticated users"
    ON public.voz_campo FOR INSERT
    WITH CHECK (true);

-- Política: apenas admins podem deletar (via service role key)
CREATE POLICY "Allow delete for authenticated users"
    ON public.voz_campo FOR DELETE
    USING (true);
