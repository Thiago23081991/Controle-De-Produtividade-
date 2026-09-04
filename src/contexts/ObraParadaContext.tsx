import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { ObraParadaRecord } from '../types';
import { obraParadaService, ObraParadaPeriod } from '../services/obraParadaService';
import { useAuth } from './AuthContext';
import { useProductivity } from './ProductivityContext';

interface ObraParadaContextType {
    records: ObraParadaRecord[];
    isLoading: boolean;
    isSaving: boolean;
    period: ObraParadaPeriod;
    setPeriod: (p: ObraParadaPeriod) => void;
    addRecord: (record: Omit<ObraParadaRecord, 'id' | 'created_at'>) => Promise<boolean>;
    deleteRecord: (id: string) => Promise<boolean>;
    loadRecords: () => Promise<void>;
}

const ObraParadaContext = createContext<ObraParadaContextType | undefined>(undefined);

export const ObraParadaProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { currentUser, isAdmin } = useAuth();
    const { setNotification } = useProductivity();

    const [records, setRecords] = useState<ObraParadaRecord[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [period, setPeriod] = useState<ObraParadaPeriod>('today');

    const loadRecords = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await obraParadaService.getAll(period);
            setRecords(data);
        } catch (e) {
            console.error('Erro ao carregar obras paradas:', e);
            setNotification({ message: 'Erro ao carregar registros de Obras Paradas', visible: true, type: 'error' });
        } finally {
            setIsLoading(false);
        }
    }, [period, setNotification]);

    useEffect(() => {
        loadRecords();
    }, [loadRecords]);

    const addRecord = async (record: Omit<ObraParadaRecord, 'id' | 'created_at'>): Promise<boolean> => {
        setIsSaving(true);
        try {
            const added = await obraParadaService.addRecord({
                ...record,
                registrado_por: currentUser?.name || (isAdmin ? 'ADMIN' : 'SISTEMA')
            });
            if (added) {
                setRecords(prev => [added, ...prev]);
                setNotification({ message: '🏗️ Obra Parada registrada com sucesso!', visible: true, type: 'success' });
                return true;
            }
            return false;
        } catch (e) {
            console.error('Erro ao registrar obra parada:', e);
            setNotification({ message: 'Falha ao registrar Obra Parada', visible: true, type: 'error' });
            return false;
        } finally {
            setIsSaving(false);
        }
    };

    const deleteRecord = async (id: string): Promise<boolean> => {
        try {
            await obraParadaService.deleteRecord(id);
            setRecords(prev => prev.filter(r => r.id !== id));
            setNotification({ message: 'Registro removido', visible: true, type: 'info' });
            return true;
        } catch (e) {
            setNotification({ message: 'Erro ao remover registro', visible: true, type: 'error' });
            return false;
        }
    };

    return (
        <ObraParadaContext.Provider value={{
            records, isLoading, isSaving, period, setPeriod,
            addRecord, deleteRecord, loadRecords
        }}>
            {children}
        </ObraParadaContext.Provider>
    );
};

export const useObraParada = () => {
    const ctx = useContext(ObraParadaContext);
    if (!ctx) throw new Error('useObraParada must be used within ObraParadaProvider');
    return ctx;
};
