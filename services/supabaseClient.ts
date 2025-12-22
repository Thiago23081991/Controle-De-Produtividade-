
import { createClient } from '@supabase/supabase-js';

// Configurações centralizadas para evitar dependência de window.process clobbering
const supabaseUrl = 'https://vegxbxzitlvlbaljkbhz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlZ3hieHppdGx2bGJhbGprYmh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0ODY5MzMsImV4cCI6MjA4MDA2MjkzM30.YeQtMW-bb_NnX8vZkdGs-IYbE_xfABf3HQYiQNaz6Ao';

export const isSupabaseConfigured = true;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
