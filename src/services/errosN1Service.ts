import { supabase, isSupabaseConfigured } from './supabaseClient';
import { ErroN1Record } from '../types';

export type ErroN1Period = 'today' | 'week' | 'month' | 'all' | string; // string cobre 'YYYY-MM'

const getDateRange = (period: ErroN1Period): { start: string; end: string } => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const fmt = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

    if (period === 'today') {
        const t = fmt(now);
        return { start: t, end: t };
    }

    if (period === 'week') {
        const day = now.getDay();
        const diffToMonday = now.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(now);
        monday.setDate(diffToMonday);
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        return { start: fmt(monday), end: fmt(sunday) };
    }

    // Formato 'YYYY-MM' — mês específico
    if (/^\d{4}-\d{2}$/.test(period)) {
        const [year, month] = period.split('-').map(Number);
        const start = new Date(year, month - 1, 1);
        const end   = new Date(year, month, 0);
        return { start: fmt(start), end: fmt(end) };
    }

    // month — mês atual
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end   = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { start: fmt(start), end: fmt(end) };
};

export const errosN1Service = {
    async getAll(period: ErroN1Period = 'today'): Promise<ErroN1Record[]> {
        if (!isSupabaseConfigured) return [];

        if (period === 'all') {
            const { data, error } = await supabase
                .from('erros_n1')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data || [];
        }

        const { start, end } = getDateRange(period);
        const { data, error } = await supabase
            .from('erros_n1')
            .select('*')
            .gte('date', start)
            .lte('date', end)
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
    },

    async addErro(record: Omit<ErroN1Record, 'id' | 'created_at'>): Promise<ErroN1Record | null> {
        if (!isSupabaseConfigured) return null;
        const { data, error } = await supabase
            .from('erros_n1')
            .insert([record])
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    async deleteErro(id: string): Promise<boolean> {
        if (!isSupabaseConfigured) return false;
        const { error } = await supabase
            .from('erros_n1')
            .delete()
            .eq('id', id);
        if (error) throw error;
        return true;
    }
};
