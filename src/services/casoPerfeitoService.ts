import { supabase, isSupabaseConfigured } from './supabaseClient';
import { CasoPerfeitoRecord } from '../types';

export const casoPerfeitoService = {
    async getRecordsByDate(date: string): Promise<CasoPerfeitoRecord[]> {
        if (!isSupabaseConfigured) return [];
        const { data, error } = await supabase
            .from('caso_perfeito_records')
            .select('*')
            .eq('date', date)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Erro ao buscar casos perfeitos:', error);
            throw error;
        }
        return data || [];
    },

    async getRecordsByExpertAndDate(expertName: string, date: string): Promise<CasoPerfeitoRecord[]> {
        if (!isSupabaseConfigured) return [];
        const { data, error } = await supabase
            .from('caso_perfeito_records')
            .select('*')
            .eq('expert_name', expertName)
            .eq('date', date)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Erro ao buscar casos perfeitos por expert:', error);
            throw error;
        }
        return data || [];
    },

    async addRecord(record: Omit<CasoPerfeitoRecord, 'id'>): Promise<CasoPerfeitoRecord | null> {
        if (!isSupabaseConfigured) return null;
        const { data, error } = await supabase
            .from('caso_perfeito_records')
            .insert([record])
            .select()
            .single();

        if (error) {
            console.error('Erro ao adicionar caso perfeito:', error);
            throw error;
        }
        return data;
    },

    async updateRecord(id: string, updates: Partial<CasoPerfeitoRecord>): Promise<CasoPerfeitoRecord | null> {
        if (!isSupabaseConfigured) return null;
        const { data, error } = await supabase
            .from('caso_perfeito_records')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Erro ao atualizar caso perfeito:', error);
            throw error;
        }
        return data;
    },

    async deleteRecord(id: string): Promise<boolean> {
        if (!isSupabaseConfigured) return false;
        const { error } = await supabase
            .from('caso_perfeito_records')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Erro ao deletar caso perfeito:', error);
            throw error;
        }
        return true;
    }
};
