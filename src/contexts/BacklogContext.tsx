import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { BacklogRecord } from '../types';
import { backlogService } from '../services/backlogService';
import { useProductivity } from './ProductivityContext';

interface BacklogContextType {
    records: BacklogRecord[];
    filteredRecords: BacklogRecord[];
    isLoading: boolean;
    isSaving: boolean;
    selectedDate: string;
    setSelectedDate: (d: string) => void;
    selectedResps: string[];
    setSelectedResps: (resps: string[]) => void;
    selectedTps: string[];
    setSelectedTps: (tps: string[]) => void;
    allResps: string[];
    allTps: string[];
    loadRecords: () => Promise<void>;
    importBacklog: (newRecords: Omit<BacklogRecord, 'id'>[]) => Promise<boolean>;
    clearBacklog: () => Promise<boolean>;
    addRecord: (record: Omit<BacklogRecord, 'id' | 'date'>) => Promise<boolean>;
    updateRecord: (id: string, updates: Partial<BacklogRecord>) => Promise<boolean>;
    deleteRecord: (id: string) => Promise<boolean>;
}

const BacklogContext = createContext<BacklogContextType | undefined>(undefined);

export const BacklogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { setNotification } = useProductivity();

    const getTodayString = () => {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const [selectedDate, setSelectedDate] = useState<string>(getTodayString());
    const [records, setRecords] = useState<BacklogRecord[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Filters (RESP and TP)
    const [selectedResps, setSelectedResps] = useState<string[]>([]);
    const [selectedTps, setSelectedTps] = useState<string[]>([]);

    const loadRecords = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await backlogService.getRecordsByDate(selectedDate);
            setRecords(data);
        } catch (error) {
            console.error('Erro ao carregar backlog:', error);
            setNotification({ message: 'Erro ao carregar registros do backlog', visible: true, type: 'error' });
        } finally {
            setIsLoading(false);
        }
    }, [selectedDate, setNotification]);

    useEffect(() => {
        loadRecords();
        // Reset filters when date changes
        setSelectedResps([]);
        setSelectedTps([]);
    }, [loadRecords]);

    // Unique lists for filters
    const allResps = useMemo(() => {
        const set = new Set<string>();
        records.forEach(r => r.resp && set.add(r.resp));
        return Array.from(set).sort((a, b) => a.localeCompare(b));
    }, [records]);

    const allTps = useMemo(() => {
        const set = new Set<string>();
        records.forEach(r => r.tp && set.add(r.tp));
        return Array.from(set).sort((a, b) => a.localeCompare(b));
    }, [records]);

    // Filter records
    const filteredRecords = useMemo(() => {
        return records.filter(r => {
            const matchResp = selectedResps.length === 0 || selectedResps.includes(r.resp);
            const matchTp = selectedTps.length === 0 || selectedTps.includes(r.tp);
            return matchResp && matchTp;
        });
    }, [records, selectedResps, selectedTps]);

    const importBacklog = async (newRecords: Omit<BacklogRecord, 'id'>[]) => {
        setIsSaving(true);
        try {
            const success = await backlogService.saveBulkRecords(newRecords, selectedDate);
            if (success) {
                setNotification({ message: `Backlog importado com sucesso! (${newRecords.length} registros)`, visible: true, type: 'success' });
                await loadRecords();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Erro ao importar backlog:', error);
            setNotification({ message: 'Erro ao importar dados do backlog', visible: true, type: 'error' });
            return false;
        } finally {
            setIsSaving(false);
        }
    };

    const clearBacklog = async () => {
        setIsSaving(true);
        try {
            const success = await backlogService.deleteRecordsByDate(selectedDate);
            if (success) {
                setRecords([]);
                setNotification({ message: 'Backlog limpo para a data selecionada', visible: true, type: 'info' });
                return true;
            }
            return false;
        } catch (error) {
            console.error('Erro ao limpar backlog:', error);
            setNotification({ message: 'Erro ao limpar dados do backlog', visible: true, type: 'error' });
            return false;
        } finally {
            setIsSaving(false);
        }
    };

    const addRecord = async (recordData: Omit<BacklogRecord, 'id' | 'date'>) => {
        setIsSaving(true);
        try {
            const added = await backlogService.addRecord({
                ...recordData,
                date: selectedDate
            });
            if (added) {
                setRecords(prev => [...prev, added]);
                setNotification({ message: 'Registro adicionado ao backlog!', visible: true, type: 'success' });
                return true;
            }
            return false;
        } catch (error) {
            console.error('Erro ao adicionar registro:', error);
            setNotification({ message: 'Erro ao adicionar registro', visible: true, type: 'error' });
            return false;
        } finally {
            setIsSaving(false);
        }
    };

    const updateRecord = async (id: string, updates: Partial<BacklogRecord>) => {
        setIsSaving(true);
        try {
            const updated = await backlogService.updateRecord(id, selectedDate, updates);
            if (updated) {
                setRecords(prev => prev.map(r => r.id === id ? updated : r));
                setNotification({ message: 'Registro atualizado!', visible: true, type: 'success' });
                return true;
            }
            return false;
        } catch (error) {
            console.error('Erro ao atualizar registro:', error);
            setNotification({ message: 'Erro ao atualizar registro', visible: true, type: 'error' });
            return false;
        } finally {
            setIsSaving(false);
        }
    };

    const deleteRecord = async (id: string) => {
        setIsSaving(true);
        try {
            const success = await backlogService.deleteRecord(id, selectedDate);
            if (success) {
                setRecords(prev => prev.filter(r => r.id !== id));
                setNotification({ message: 'Registro removido', visible: true, type: 'info' });
                return true;
            }
            return false;
        } catch (error) {
            console.error('Erro ao deletar registro:', error);
            setNotification({ message: 'Erro ao remover registro', visible: true, type: 'error' });
            return false;
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <BacklogContext.Provider value={{
            records, filteredRecords, isLoading, isSaving,
            selectedDate, setSelectedDate,
            selectedResps, setSelectedResps,
            selectedTps, setSelectedTps,
            allResps, allTps,
            loadRecords, importBacklog, clearBacklog,
            addRecord, updateRecord, deleteRecord
        }}>
            {children}
        </BacklogContext.Provider>
    );
};

export const useBacklog = () => {
    const context = useContext(BacklogContext);
    if (!context) throw new Error('useBacklog must be used within BacklogProvider');
    return context;
};
