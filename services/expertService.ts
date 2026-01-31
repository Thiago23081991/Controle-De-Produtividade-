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
    },

    async getAllAdmin(): Promise<ExpertInfo[]> {
        const { data, error } = await supabase
            .from('experts')
            .select('*')
            .order('name');

        if (error) {
            console.error('Error fetching all experts:', error);
            return [];
        }
        return data || [];
    },

    async update(id: string, updates: Partial<ExpertInfo>) {
        const { data, error } = await supabase
            .from('experts')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async toggleStatus(id: string, isActive: boolean) {
        const { data, error } = await supabase
            .from('experts')
            .update({ active: isActive })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }
};
