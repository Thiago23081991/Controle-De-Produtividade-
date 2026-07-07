import { supabase, isSupabaseConfigured } from './supabaseClient';
import { CasosBR01Record } from '../types';

export const casosBR01Service = {
    async getAllCases(): Promise<CasosBR01Record[]> {
        if (!isSupabaseConfigured) return [];
        const { data, error } = await supabase
            .from('casos_br01')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Erro ao buscar casos BR01:', error);
            throw error;
        }
        return data || [];
    },

    async addCase(record: Omit<CasosBR01Record, 'id' | 'created_at'>): Promise<CasosBR01Record | null> {
        if (!isSupabaseConfigured) return null;
        const { data, error } = await supabase
            .from('casos_br01')
            .insert([record])
            .select()
            .single();

        if (error) {
            console.error('Erro ao adicionar caso BR01:', error);
            throw error;
        }
        return data;
    },

    async deleteCase(id: string): Promise<boolean> {
        if (!isSupabaseConfigured) return false;
        const { error } = await supabase
            .from('casos_br01')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Erro ao deletar caso BR01:', error);
            throw error;
        }
        return true;
    }
};
