import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { VozCampoRecord } from '../types';
import { vozCampoService, VozCampoPeriod } from '../services/vozCampoService';
import { useAuth } from './AuthContext';
import { useProductivity } from './ProductivityContext';

interface VozCampoContextType {
    records: VozCampoRecord[];
    isLoading: boolean;
    isSaving: boolean;
    period: VozCampoPeriod;
    setPeriod: (p: VozCampoPeriod) => void;
    addRecord: (record: Omit<VozCampoRecord, 'id' | 'created_at'>) => Promise<boolean>;
    deleteRecord: (id: string) => Promise<boolean>;
    loadRecords: () => Promise<void>;
}

const VozCampoContext = createContext<VozCampoContextType | undefined>(undefined);

export const VozCampoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { currentUser, isAdmin } = useAuth();
    const { setNotification } = useProductivity();

    const [records, setRecords] = useState<VozCampoRecord[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [period, setPeriod] = useState<VozCampoPeriod>('today');

    const loadRecords = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await vozCampoService.getAll(period);
            setRecords(data);
        } catch (e) {
            console.error('Erro ao carregar voz de campo:', e);
            setNotification({ message: 'Erro ao carregar registros de Voz de Campo', visible: true, type: 'error' });
        } finally {
            setIsLoading(false);
        }
    }, [period, setNotification]);

    useEffect(() => {
        loadRecords();
    }, [loadRecords]);

    const addRecord = async (record: Omit<VozCampoRecord, 'id' | 'created_at'>): Promise<boolean> => {
        setIsSaving(true);
        try {
            const added = await vozCampoService.addRecord({
                ...record,
                registrado_por: currentUser?.name || (isAdmin ? 'ADMIN' : 'SISTEMA')
            });
            if (added) {
                setRecords(prev => [added, ...prev]);
                setNotification({ message: '📞 Ligação registrada com sucesso!', visible: true, type: 'success' });
                return true;
            }
            return false;
        } catch (e) {
            console.error('Erro ao registrar ligação:', e);
            setNotification({ message: 'Falha ao registrar ligação', visible: true, type: 'error' });
            return false;
        } finally {
            setIsSaving(false);
        }
    };

    const deleteRecord = async (id: string): Promise<boolean> => {
        try {
            await vozCampoService.deleteRecord(id);
            setRecords(prev => prev.filter(r => r.id !== id));
            setNotification({ message: 'Registro removido', visible: true, type: 'info' });
            return true;
        } catch (e) {
            setNotification({ message: 'Erro ao remover registro', visible: true, type: 'error' });
            return false;
        }
    };

    return (
        <VozCampoContext.Provider value={{
            records, isLoading, isSaving, period, setPeriod,
            addRecord, deleteRecord, loadRecords
        }}>
            {children}
        </VozCampoContext.Provider>
    );
};

export const useVozCampo = () => {
    const ctx = useContext(VozCampoContext);
    if (!ctx) throw new Error('useVozCampo must be used within VozCampoProvider');
    return ctx;
};
