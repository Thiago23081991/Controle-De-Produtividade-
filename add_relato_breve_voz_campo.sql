-- Adicionar campo relato_breve a tabela voz_campo (opcional)
ALTER TABLE public.voz_campo
ADD COLUMN IF NOT EXISTS relato_breve TEXT;
