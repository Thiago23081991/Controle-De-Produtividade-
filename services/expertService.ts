import { supabase } from './supabaseClient';
import { ExpertInfo } from '../types';

export const expertService = {
    async getAll(): Promise<ExpertInfo[]> {
        const { data, error } = await supabase
            .from('experts')
            .select('*')
            .eq('active', true)
            .order('name');

        if (error) {
            console.error('Error fetching experts:', error);
            return [];
        }

        return data || [];
    },

    async create(expert: Omit<ExpertInfo, 'id'>) {
        const { data, error } = await supabase
            .from('experts')
            .insert(expert)
            .select()
            .single();

        if (error) throw error;
        return data;
    }
};
