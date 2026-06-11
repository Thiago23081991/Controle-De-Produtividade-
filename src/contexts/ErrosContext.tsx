import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { ErroRecord } from '../types';
import { errosService, ErroPeriod } from '../services/errosService';
import { useAuth } from './AuthContext';
import { useProductivity } from './ProductivityContext';

export interface RankingItem {
    expert_name: string;
    count: number;
    percentage: number;
}

interface ErrosContextType {
    erros: ErroRecord[];
    isLoading: boolean;
    isSaving: boolean;
    period: ErroPeriod;
    setPeriod: (p: ErroPeriod) => void;
    ranking: RankingItem[];
    addErro: (record: Omit<ErroRecord, 'id' | 'created_at'>) => Promise<boolean>;
    deleteErro: (id: string) => Promise<boolean>;
    loadErros: () => Promise<void>;
}

const ErrosContext = createContext<ErrosContextType | undefined>(undefined);

export const ErrosProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { currentUser, isAdmin } = useAuth();
    const { setNotification } = useProductivity();

    const [erros, setErros] = useState<ErroRecord[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [period, setPeriod] = useState<ErroPeriod>('today');

    const ranking = useMemo<RankingItem[]>(() => {
        const counts: Record<string, number> = {};
        erros.forEach(e => {
            counts[e.expert_name] = (counts[e.expert_name] || 0) + 1;
        });
        const total = erros.length;
        return Object.entries(counts)
            .map(([expert_name, count]) => ({
                expert_name,
                count,
                percentage: total > 0 ? Math.round((count / total) * 100) : 0
            }))
            .sort((a, b) => b.count - a.count);
    }, [erros]);

    const loadErros = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await errosService.getAll(period);
            setErros(data);
        } catch (e) {
            console.error('Erro ao carregar erros:', e);
            setNotification({ message: 'Erro ao carregar registros', visible: true, type: 'error' });
        } finally {
            setIsLoading(false);
        }
    }, [period, setNotification]);

    useEffect(() => {
        loadErros();
    }, [loadErros]);

    const addErro = async (record: Omit<ErroRecord, 'id' | 'created_at'>): Promise<boolean> => {
        setIsSaving(true);
        try {
            const added = await errosService.addErro({
                ...record,
                registrado_por: currentUser?.name || (isAdmin ? 'ADMIN' : 'SISTEMA')
            });
            if (added) {
                setErros(prev => [added, ...prev]);
                setNotification({ message: '⚠️ Erro registrado com sucesso!', visible: true, type: 'success' });
                return true;
            }
            return false;
        } catch (e) {
            console.error('Erro ao registrar:', e);
            setNotification({ message: 'Falha ao registrar erro', visible: true, type: 'error' });
            return false;
        } finally {
            setIsSaving(false);
        }
    };

    const deleteErro = async (id: string): Promise<boolean> => {
        try {
            await errosService.deleteErro(id);
            setErros(prev => prev.filter(e => e.id !== id));
            setNotification({ message: 'Registro removido', visible: true, type: 'info' });
            return true;
        } catch (e) {
            setNotification({ message: 'Erro ao remover registro', visible: true, type: 'error' });
            return false;
        }
    };

    return (
        <ErrosContext.Provider value={{
            erros, isLoading, isSaving, period, setPeriod,
            ranking, addErro, deleteErro, loadErros
        }}>
            {children}
        </ErrosContext.Provider>
    );
};

export const useErros = () => {
    const ctx = useContext(ErrosContext);
    if (!ctx) throw new Error('useErros must be used within ErrosProvider');
    return ctx;
};
