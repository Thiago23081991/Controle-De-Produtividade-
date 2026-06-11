import { supabase, isSupabaseConfigured } from './supabaseClient';
import { ErroRecord } from '../types';

export type ErroPeriod = 'today' | 'week' | 'month';

const getDateRange = (period: ErroPeriod): { start: string; end: string } => {
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

    // month
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end   = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { start: fmt(start), end: fmt(end) };
};

export const errosService = {
    async getAll(period: ErroPeriod = 'today'): Promise<ErroRecord[]> {
        if (!isSupabaseConfigured) return [];
        const { start, end } = getDateRange(period);
        const { data, error } = await supabase
            .from('erros_ressarcimento')
            .select('*')
            .gte('date', start)
            .lte('date', end)
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
    },

    async addErro(record: Omit<ErroRecord, 'id' | 'created_at'>): Promise<ErroRecord | null> {
        if (!isSupabaseConfigured) return null;
        const { data, error } = await supabase
            .from('erros_ressarcimento')
            .insert([record])
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    async deleteErro(id: string): Promise<boolean> {
        if (!isSupabaseConfigured) return false;
        const { error } = await supabase
            .from('erros_ressarcimento')
            .delete()
            .eq('id', id);
        if (error) throw error;
        return true;
    }
};
