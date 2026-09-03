import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { ReclameAquiRecord } from '../types';
import { reclameAquiService, ReclameAquiPeriod } from '../services/reclameAquiService';
import { useAuth } from './AuthContext';
import { useProductivity } from './ProductivityContext';

interface ReclameAquiContextType {
    records: ReclameAquiRecord[];
    isLoading: boolean;
    isSaving: boolean;
    period: ReclameAquiPeriod;
    setPeriod: (p: ReclameAquiPeriod) => void;
    loadRecords: () => Promise<void>;
    addRecord: (record: Omit<ReclameAquiRecord, 'id' | 'created_at'>) => Promise<boolean>;
    updateRecord: (id: string, record: Partial<ReclameAquiRecord>) => Promise<boolean>;
    deleteRecord: (id: string) => Promise<boolean>;
    importBatch: (records: Omit<ReclameAquiRecord, 'id' | 'created_at'>[]) => Promise<number>;
}

const ReclameAquiContext = createContext<ReclameAquiContextType | undefined>(undefined);

export const ReclameAquiProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { currentUser, isAdmin } = useAuth();
    const { setNotification } = useProductivity();

    const [records, setRecords] = useState<ReclameAquiRecord[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [period, setPeriod] = useState<ReclameAquiPeriod>('all');

    const loadRecords = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await reclameAquiService.getAll(period);
            setRecords(data);
        } catch (e) {
            console.error('Erro ao carregar registros do Reclame Aqui:', e);
            setNotification({ message: 'Erro ao carregar dados do Reclame Aqui', visible: true, type: 'error' });
        } finally {
            setIsLoading(false);
        }
    }, [period, setNotification]);

    useEffect(() => {
        loadRecords();
    }, [loadRecords]);

    const addRecord = async (record: Omit<ReclameAquiRecord, 'id' | 'created_at'>): Promise<boolean> => {
        setIsSaving(true);
        try {
            const added = await reclameAquiService.addRecord({
                ...record,
                registrado_por: currentUser?.name || (isAdmin ? 'ADMIN' : 'SISTEMA')
            });
            if (added) {
                setRecords(prev => [added, ...prev]);
                setNotification({ message: 'Reclamação registrada com sucesso!', visible: true, type: 'success' });
                return true;
            }
            return false;
        } catch (e) {
            console.error('Erro ao registrar Reclame Aqui:', e);
            setNotification({ message: 'Falha ao registrar reclamação', visible: true, type: 'error' });
            return false;
        } finally {
            setIsSaving(false);
        }
    };

    const updateRecord = async (id: string, updatedFields: Partial<ReclameAquiRecord>): Promise<boolean> => {
        setIsSaving(true);
        try {
            const updated = await reclameAquiService.updateRecord(id, updatedFields);
            if (updated) {
                setRecords(prev => prev.map(r => r.id === id ? updated : r));
                setNotification({ message: 'Registro atualizado com sucesso!', visible: true, type: 'success' });
                return true;
            }
            return false;
        } catch (e) {
            console.error('Erro ao atualizar Reclame Aqui:', e);
            setNotification({ message: 'Falha ao atualizar registro', visible: true, type: 'error' });
            return false;
        } finally {
            setIsSaving(false);
        }
    };

    const deleteRecord = async (id: string): Promise<boolean> => {
        try {
            await reclameAquiService.deleteRecord(id);
            setRecords(prev => prev.filter(r => r.id !== id));
            setNotification({ message: 'Registro excluído do Reclame Aqui', visible: true, type: 'info' });
            return true;
        } catch (e) {
            setNotification({ message: 'Erro ao excluir registro', visible: true, type: 'error' });
            return false;
        }
    };

    const importBatch = async (newRecords: Omit<ReclameAquiRecord, 'id' | 'created_at'>[]): Promise<number> => {
        setIsSaving(true);
        try {
            const result = await reclameAquiService.insertBatch(newRecords);
            await loadRecords();
            setNotification({ 
                message: `${result.count} registros importados com sucesso!`, 
                visible: true, 
                type: 'success' 
            });
            return result.count;
        } catch (e) {
            console.error('Erro na importação em lote:', e);
            setNotification({ message: 'Erro ao importar dados do Excel', visible: true, type: 'error' });
            return 0;
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <ReclameAquiContext.Provider value={{
            records, isLoading, isSaving, period, setPeriod,
            loadRecords, addRecord, updateRecord, deleteRecord, importBatch
        }}>
            {children}
        </ReclameAquiContext.Provider>
    );
};

export const useReclameAqui = () => {
    const ctx = useContext(ReclameAquiContext);
    if (!ctx) throw new Error('useReclameAqui must be used within ReclameAquiProvider');
    return ctx;
};
