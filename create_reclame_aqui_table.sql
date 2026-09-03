-- =======================================================
-- TABELA: reclame_aqui
-- Execute este script no SQL Editor do Supabase
-- =======================================================

CREATE TABLE IF NOT EXISTS reclame_aqui (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registro_ra TEXT,
    nota_fiscal TEXT,
    data_postagem TEXT,
    consumidor TEXT,
    entrada TEXT,
    status_atual TEXT,
    chamado TEXT,
    email TEXT,
    data_contato TEXT,
    resposta_publica TEXT,
    patologia_causa TEXT,
    voltaria_fazer_negocio TEXT,
    resolvido TEXT,
    nota_avaliacao TEXT,
    moderacao TEXT,
    visita_tecnica TEXT,
    data_replica TEXT,
    data_treplica TEXT,
    procedente TEXT,
    mo TEXT,
    produto TEXT,
    registrado_por TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para buscas rápidas
CREATE INDEX IF NOT EXISTS idx_reclame_aqui_registro_ra ON reclame_aqui (registro_ra);
CREATE INDEX IF NOT EXISTS idx_reclame_aqui_consumidor ON reclame_aqui (consumidor);
CREATE INDEX IF NOT EXISTS idx_reclame_aqui_chamado ON reclame_aqui (chamado);
CREATE INDEX IF NOT EXISTS idx_reclame_aqui_status_atual ON reclame_aqui (status_atual);
CREATE INDEX IF NOT EXISTS idx_reclame_aqui_created_at ON reclame_aqui (created_at DESC);

-- Habilitar RLS (Row Level Security) e permitir acesso anônimo/autenticado se aplicável
ALTER TABLE reclame_aqui ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir leitura para todos" ON reclame_aqui FOR SELECT USING (true);
CREATE POLICY "Permitir inserção para todos" ON reclame_aqui FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização para todos" ON reclame_aqui FOR UPDATE USING (true);
CREATE POLICY "Permitir exclusão para todos" ON reclame_aqui FOR DELETE USING (true);
