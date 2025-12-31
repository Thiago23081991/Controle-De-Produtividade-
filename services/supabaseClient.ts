
import { createClient } from '@supabase/supabase-js';

// SUAS CREDENCIAIS REAIS
const YOUR_PROJECT_URL = 'https://vegxbxzitlvlbaljkbhz.supabase.co';
const YOUR_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlZ3hieHppdGx2bGJhbGprYmh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0ODY5MzMsImV4cCI6MjA4MDA2MjkzM30.YeQtMW-bb_NnX8vZkdGs-IYbE_xfABf3HQYiQNaz6Ao';

// Lógica de Conexão:
// Tenta ler do arquivo .env primeiro. Se falhar, usa as constantes acima hardcoded.
export const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || YOUR_PROJECT_URL;
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || YOUR_ANON_KEY;

// Verificador de configuração
export const isSupabaseConfigured = !!supabaseUrl && !!supabaseAnonKey;

// Criação do Cliente
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
