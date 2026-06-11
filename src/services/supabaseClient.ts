
import { createClient } from '@supabase/supabase-js';

// SUAS CREDENCIAIS REAIS
export const supabaseUrl = ((import.meta as any).env?.VITE_SUPABASE_URL) || '';
const supabaseAnonKey = ((import.meta as any).env?.VITE_SUPABASE_ANON_KEY) || '';

// Verificador de configuração
export const isSupabaseConfigured = !!supabaseUrl && !!supabaseAnonKey &&
    supabaseUrl !== 'sua_url_do_supabase' &&
    supabaseAnonKey !== 'sua_chave_anonima';

// Criação do Cliente (usa credenciais seguras de fallback se não configurado para evitar crash de inicialização)
const finalUrl = isSupabaseConfigured ? supabaseUrl : 'https://placeholder-project.supabase.co';
const finalKey = isSupabaseConfigured ? supabaseAnonKey : 'placeholder-anon-key';

export const supabase = createClient(finalUrl, finalKey);
