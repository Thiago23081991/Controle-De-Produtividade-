import { supabase, isSupabaseConfigured } from './supabaseClient';
import { BacklogRecord } from '../types';

const LOCAL_STORAGE_KEY = 'suvinil_backlog_records';

const getLocalStorageRecords = (): Record<string, BacklogRecord[]> => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!stored) return {};
    try {
        return JSON.parse(stored);
    } catch (e) {
        console.error("Failed to parse local backlog records", e);
        return {};
    }
};

const saveLocalStorageRecords = (data: Record<string, BacklogRecord[]>) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
};

export const backlogService = {
    async getRecordsByDate(date: string): Promise<BacklogRecord[]> {
        if (!isSupabaseConfigured) {
            const all = getLocalStorageRecords();
            return all[date] || [];
        }
        try {
            const { data, error } = await supabase
                .from('backlog_records')
                .select('*')
                .eq('date', date)
                .order('fila', { ascending: true })
                .order('status', { ascending: true });
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error("Supabase backlog error, falling back to local storage", error);
            const all = getLocalStorageRecords();
            return all[date] || [];
        }
    },

    async saveBulkRecords(records: Omit<BacklogRecord, 'id'>[], date: string): Promise<boolean> {
        if (!isSupabaseConfigured) {
            const all = getLocalStorageRecords();
            const recordsWithIds = records.map(r => ({
                ...r,
                id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9)
            }));
            all[date] = recordsWithIds;
            saveLocalStorageRecords(all);
            return true;
        }
        try {
            // Delete old records for that date first to avoid duplication
            const { error: deleteError } = await supabase
                .from('backlog_records')
                .delete()
                .eq('date', date);
            if (deleteError) throw deleteError;

            if (records.length === 0) return true;

            const { error: insertError } = await supabase
                .from('backlog_records')
                .insert(records);
            if (insertError) throw insertError;
            return true;
        } catch (error) {
            console.error("Supabase bulk insert failed, saving to local storage", error);
            const all = getLocalStorageRecords();
            const recordsWithIds = records.map(r => ({
                ...r,
                id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9)
            }));
            all[date] = recordsWithIds;
            saveLocalStorageRecords(all);
            return true;
        }
    },

    async deleteRecordsByDate(date: string): Promise<boolean> {
        if (!isSupabaseConfigured) {
            const all = getLocalStorageRecords();
            delete all[date];
            saveLocalStorageRecords(all);
            return true;
        }
        try {
            const { error } = await supabase
                .from('backlog_records')
                .delete()
                .eq('date', date);
            if (error) throw error;
            return true;
        } catch (error) {
            console.error("Supabase delete failed, updating local storage", error);
            const all = getLocalStorageRecords();
            delete all[date];
            saveLocalStorageRecords(all);
            return true;
        }
    },

    async addRecord(record: Omit<BacklogRecord, 'id'>): Promise<BacklogRecord | null> {
        const date = record.date;
        if (!isSupabaseConfigured) {
            const all = getLocalStorageRecords();
            const newRecord = {
                ...record,
                id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9)
            };
            if (!all[date]) all[date] = [];
            all[date].push(newRecord);
            saveLocalStorageRecords(all);
            return newRecord;
        }
        try {
            const { data, error } = await supabase
                .from('backlog_records')
                .insert([record])
                .select()
                .single();
            if (error) throw error;
            return data;
        } catch (error) {
            console.error("Supabase insert failed, saving to local storage", error);
            const all = getLocalStorageRecords();
            const newRecord = {
                ...record,
                id: (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9))
            };
            if (!all[date]) all[date] = [];
            all[date].push(newRecord);
            saveLocalStorageRecords(all);
            return newRecord;
        }
    },

    async updateRecord(id: string, date: string, updates: Partial<BacklogRecord>): Promise<BacklogRecord | null> {
        if (!isSupabaseConfigured) {
            const all = getLocalStorageRecords();
            const list = all[date] || [];
            const index = list.findIndex(r => r.id === id);
            if (index === -1) return null;
            const updated = { ...list[index], ...updates };
            list[index] = updated;
            all[date] = list;
            saveLocalStorageRecords(all);
            return updated;
        }
        try {
            const { data, error } = await supabase
                .from('backlog_records')
                .update(updates)
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            return data;
        } catch (error) {
            console.error("Supabase update failed, updating local storage", error);
            const all = getLocalStorageRecords();
            const list = all[date] || [];
            const index = list.findIndex(r => r.id === id);
            if (index === -1) return null;
            const updated = { ...list[index], ...updates };
            list[index] = updated;
            all[date] = list;
            saveLocalStorageRecords(all);
            return updated;
        }
    },

    async deleteRecord(id: string, date: string): Promise<boolean> {
        if (!isSupabaseConfigured) {
            const all = getLocalStorageRecords();
            const list = all[date] || [];
            all[date] = list.filter(r => r.id !== id);
            saveLocalStorageRecords(all);
            return true;
        }
        try {
            const { error } = await supabase
                .from('backlog_records')
                .delete()
                .eq('id', id);
            if (error) throw error;
            return true;
        } catch (error) {
            console.error("Supabase delete failed, updating local storage", error);
            const all = getLocalStorageRecords();
            const list = all[date] || [];
            all[date] = list.filter(r => r.id !== id);
            saveLocalStorageRecords(all);
            return true;
        }
    }
};
