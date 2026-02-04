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
    },

    async getMonthlyData(month: number, year: number): Promise<any[]> {
        const { data, error } = await supabase
            .from('monthly_productivity')
            .select('*')
            .eq('month', month)
            .eq('year', year);

        if (error) {
            console.error('Error fetching monthly data:', error);
            return [];
        }
        return data || [];
    },

    async saveMonthlyData(data: { expert_name: string, month: number, year: number, tratado: number, finalizado: number, goal: number, observacao: string }) {
        const { error } = await supabase
            .from('monthly_productivity')
            .upsert(data, { onConflict: 'expert_name,month,year' });

        if (error) throw error;
    },

    async aggregateDailyRecords(expertName: string, month: number, year: number) {
        // Calculate start and end dates for the month
        const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
        const lastDay = new Date(year, month, 0).getDate();
        const endDate = new Date(year, month - 1, lastDay).toISOString().split('T')[0];

        const { data, error } = await supabase
            .from('productivity_records')
            .select('tratado, finalizado')
            .eq('expert_name', expertName)
            .gte('date', startDate)
            .lte('date', endDate);

        if (error) throw error;

        const totals = (data || []).reduce((acc, rec) => ({
            tratado: acc.tratado + (rec.tratado || 0),
            finalizado: acc.finalizado + (rec.finalizado || 0)
        }), { tratado: 0, finalizado: 0 });

        return totals;
    }
};
