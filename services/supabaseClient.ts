
import { createClient } from '@supabase/supabase-js';

const getEnv = (key: string): string => {
  const win = window as any;
  return win.process?.env?.[key] || '';
};

const supabaseUrl = getEnv('SUPABASE_URL');
const supabaseAnonKey = getEnv('SUPABASE_ANON_KEY');

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

// Inicializa o cliente com as credenciais detectadas
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
);
