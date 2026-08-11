import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { ErroN1Record } from '../types';
import { errosN1Service, ErroN1Period } from '../services/errosN1Service';
import { useAuth } from './AuthContext';
import { useProductivity } from './ProductivityContext';

export interface RankingN1Item {
    expert_name: string;
    count: number;
    percentage: number;
}

interface ErrosN1ContextType {
    erros: ErroN1Record[];
    isLoading: boolean;
    isSaving: boolean;
    period: ErroN1Period;
    setPeriod: (p: ErroN1Period) => void;
    ranking: RankingN1Item[];
    addErro: (record: Omit<ErroN1Record, 'id' | 'created_at'>) => Promise<boolean>;
    deleteErro: (id: string) => Promise<boolean>;
    loadErros: () => Promise<void>;
}

const ErrosN1Context = createContext<ErrosN1ContextType | undefined>(undefined);

export const ErrosN1Provider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { currentUser, isAdmin } = useAuth();
    const { setNotification } = useProductivity();

    const [erros, setErros] = useState<ErroN1Record[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [period, setPeriod] = useState<ErroN1Period>('today');

    const ranking = useMemo<RankingN1Item[]>(() => {
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
            const data = await errosN1Service.getAll(period);
            setErros(data);
        } catch (e) {
            console.error('Erro ao carregar erros N1:', e);
            setNotification({ message: 'Erro ao carregar registros N1', visible: true, type: 'error' });
        } finally {
            setIsLoading(false);
        }
    }, [period, setNotification]);

    useEffect(() => {
        loadErros();
    }, [loadErros]);

    const addErro = async (record: Omit<ErroN1Record, 'id' | 'created_at'>): Promise<boolean> => {
        setIsSaving(true);
        try {
            const added = await errosN1Service.addErro({
                ...record,
                registrado_por: currentUser?.name || (isAdmin ? 'ADMIN' : 'SISTEMA')
            });
            if (added) {
                setErros(prev => [added, ...prev]);
                setNotification({ message: '⚠️ Erro N1 registrado com sucesso!', visible: true, type: 'success' });
                return true;
            }
            return false;
        } catch (e) {
            console.error('Erro ao registrar N1:', e);
            setNotification({ message: 'Falha ao registrar erro N1', visible: true, type: 'error' });
            return false;
        } finally {
            setIsSaving(false);
        }
    };

    const deleteErro = async (id: string): Promise<boolean> => {
        try {
            await errosN1Service.deleteErro(id);
            setErros(prev => prev.filter(e => e.id !== id));
            setNotification({ message: 'Registro N1 removido', visible: true, type: 'info' });
            return true;
        } catch (e) {
            setNotification({ message: 'Erro ao remover registro N1', visible: true, type: 'error' });
            return false;
        }
    };

    return (
        <ErrosN1Context.Provider value={{
            erros, isLoading, isSaving, period, setPeriod,
            ranking, addErro, deleteErro, loadErros
        }}>
            {children}
        </ErrosN1Context.Provider>
    );
};

export const useErrosN1 = () => {
    const ctx = useContext(ErrosN1Context);
    if (!ctx) throw new Error('useErrosN1 must be used within ErrosN1Provider');
    return ctx;
};
