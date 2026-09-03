import { supabase, isSupabaseConfigured } from './supabaseClient';
import { ReclameAquiRecord } from '../types';

export type ReclameAquiPeriod = 'today' | 'week' | 'month' | 'all' | string;

const getDateRange = (period: ReclameAquiPeriod): { start: string; end: string } => {
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

export const reclameAquiService = {
    async getAll(period: ReclameAquiPeriod = 'all'): Promise<ReclameAquiRecord[]> {
        if (!isSupabaseConfigured) return [];

        let query = supabase
            .from('reclame_aqui')
            .select('*')
            .order('created_at', { ascending: false });

        if (period !== 'all') {
            const { start, end } = getDateRange(period);
            query = query
                .gte('data_postagem', start)
                .lte('data_postagem', end);
        }

        const { data, error } = await query;
        if (error) {
            console.error('Erro ao buscar Reclame Aqui:', error);
            throw error;
        }
        return data || [];
    },

    async addRecord(record: Omit<ReclameAquiRecord, 'id' | 'created_at'>): Promise<ReclameAquiRecord | null> {
        if (!isSupabaseConfigured) return null;
        const { data, error } = await supabase
            .from('reclame_aqui')
            .insert([record])
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    async updateRecord(id: string, record: Partial<ReclameAquiRecord>): Promise<ReclameAquiRecord | null> {
        if (!isSupabaseConfigured) return null;
        const { data, error } = await supabase
            .from('reclame_aqui')
            .update(record)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    async deleteRecord(id: string): Promise<boolean> {
        if (!isSupabaseConfigured) return false;
        const { error } = await supabase
            .from('reclame_aqui')
            .delete()
            .eq('id', id);
        if (error) throw error;
        return true;
    },

    async insertBatch(records: Omit<ReclameAquiRecord, 'id' | 'created_at'>[]): Promise<{ count: number }> {
        if (!isSupabaseConfigured || records.length === 0) return { count: 0 };

        const BATCH_SIZE = 100;
        let inserted = 0;

        for (let i = 0; i < records.length; i += BATCH_SIZE) {
            const batch = records.slice(i, i + BATCH_SIZE);
            const { error } = await supabase
                .from('reclame_aqui')
                .insert(batch);
            if (error) throw error;
            inserted += batch.length;
        }

        return { count: inserted };
    }
};
