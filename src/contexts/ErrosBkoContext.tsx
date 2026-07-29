import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { ErroRecord } from '../types';
import { errosBkoService, ErroBkoPeriod } from '../services/errosBkoService';
import { useAuth } from './AuthContext';
import { useProductivity } from './ProductivityContext';

export interface RankingBkoItem {
    expert_name: string;
    count: number;
    percentage: number;
}

interface ErrosBkoContextType {
    erros: ErroRecord[];
    isLoading: boolean;
    isSaving: boolean;
    period: ErroBkoPeriod;
    setPeriod: (p: ErroBkoPeriod) => void;
    ranking: RankingBkoItem[];
    addErro: (record: Omit<ErroRecord, 'id' | 'created_at'>) => Promise<boolean>;
    deleteErro: (id: string) => Promise<boolean>;
    loadErros: () => Promise<void>;
}

const ErrosBkoContext = createContext<ErrosBkoContextType | undefined>(undefined);

export const ErrosBkoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { currentUser, isAdmin } = useAuth();
    const { setNotification } = useProductivity();

    const [erros, setErros] = useState<ErroRecord[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [period, setPeriod] = useState<ErroBkoPeriod>('today');

    const ranking = useMemo<RankingBkoItem[]>(() => {
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
            const data = await errosBkoService.getAll(period);
            setErros(data);
        } catch (e) {
            console.error('Erro ao carregar erros BKO:', e);
            setNotification({ message: 'Erro ao carregar registros BKO', visible: true, type: 'error' });
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
            const added = await errosBkoService.addErro({
                ...record,
                registrado_por: currentUser?.name || (isAdmin ? 'ADMIN' : 'SISTEMA')
            });
            if (added) {
                setErros(prev => [added, ...prev]);
                setNotification({ message: '⚠️ Erro BKO registrado com sucesso!', visible: true, type: 'success' });
                return true;
            }
            return false;
        } catch (e) {
            console.error('Erro ao registrar BKO:', e);
            setNotification({ message: 'Falha ao registrar erro BKO', visible: true, type: 'error' });
            return false;
        } finally {
            setIsSaving(false);
        }
    };

    const deleteErro = async (id: string): Promise<boolean> => {
        try {
            await errosBkoService.deleteErro(id);
            setErros(prev => prev.filter(e => e.id !== id));
            setNotification({ message: 'Registro BKO removido', visible: true, type: 'info' });
            return true;
        } catch (e) {
            setNotification({ message: 'Erro ao remover registro BKO', visible: true, type: 'error' });
            return false;
        }
    };

    return (
        <ErrosBkoContext.Provider value={{
            erros, isLoading, isSaving, period, setPeriod,
            ranking, addErro, deleteErro, loadErros
        }}>
            {children}
        </ErrosBkoContext.Provider>
    );
};

export const useErrosBko = () => {
    const ctx = useContext(ErrosBkoContext);
    if (!ctx) throw new Error('useErrosBko must be used within ErrosBkoProvider');
    return ctx;
};
