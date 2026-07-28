import { supabase, isSupabaseConfigured } from './supabaseClient';
import { VozCampoRecord } from '../types';

export type VozCampoPeriod = 'today' | 'week' | 'month' | string;

const getDateRange = (period: VozCampoPeriod): { start: string; end: string } => {
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

    if (/^\d{4}-\d{2}$/.test(period)) {
        const [year, month] = period.split('-').map(Number);
        const start = new Date(year, month - 1, 1);
        const end = new Date(year, month, 0);
        return { start: fmt(start), end: fmt(end) };
    }

    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { start: fmt(start), end: fmt(end) };
};

export const vozCampoService = {
    async getAll(period: VozCampoPeriod = 'today'): Promise<VozCampoRecord[]> {
        if (!isSupabaseConfigured) return [];
        const { start, end } = getDateRange(period);
        const { data, error } = await supabase
            .from('voz_campo')
            .select('*')
            .gte('date', start)
            .lte('date', end)
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
    },

    async addRecord(record: Omit<VozCampoRecord, 'id' | 'created_at'>): Promise<VozCampoRecord | null> {
        if (!isSupabaseConfigured) return null;
        const { data, error } = await supabase
            .from('voz_campo')
            .insert([record])
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    async deleteRecord(id: string): Promise<boolean> {
        if (!isSupabaseConfigured) return false;
        const { error } = await supabase
            .from('voz_campo')
            .delete()
            .eq('id', id);
        if (error) throw error;
        return true;
    }
};
