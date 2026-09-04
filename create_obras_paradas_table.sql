-- Criação da tabela obras_paradas no Supabase
-- Execute este script no SQL Editor do seu projeto Supabase

CREATE TABLE IF NOT EXISTS public.obras_paradas (
    id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date        DATE NOT NULL,
    numero_caso TEXT NOT NULL,
    obra_parada BOOLEAN NOT NULL DEFAULT true,
    tempo_parada TEXT,
    tempo_ligacao TEXT,
    tipo_caso   TEXT NOT NULL CHECK (tipo_caso IN ('Novo', 'Rechamada')),
    registrado_por TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para melhora de performance nas consultas por data
CREATE INDEX IF NOT EXISTS idx_obras_paradas_date ON public.obras_paradas (date DESC);
CREATE INDEX IF NOT EXISTS idx_obras_paradas_created_at ON public.obras_paradas (created_at DESC);

-- Row Level Security (RLS) — ajuste conforme sua política de acesso
ALTER TABLE public.obras_paradas ENABLE ROW LEVEL SECURITY;

-- Política: qualquer usuário autenticado pode ler e inserir
CREATE POLICY "obras_paradas_select" ON public.obras_paradas
    FOR SELECT USING (true);

CREATE POLICY "obras_paradas_insert" ON public.obras_paradas
    FOR INSERT WITH CHECK (true);

CREATE POLICY "obras_paradas_delete" ON public.obras_paradas
    FOR DELETE USING (true);
