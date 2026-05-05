import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { CasoPerfeitoRecord } from '../types';
import { casoPerfeitoService } from '../services/casoPerfeitoService';
import { useAuth } from './AuthContext';
import { useProductivity } from './ProductivityContext';

interface CasoPerfeitoContextType {
    records: CasoPerfeitoRecord[];
    isLoading: boolean;
    isSaving: boolean;
    loadRecords: () => Promise<void>;
    addRecord: (record: Omit<CasoPerfeitoRecord, 'id' | 'expert_name' | 'date'>) => Promise<boolean>;
    updateRecord: (id: string, updates: Partial<CasoPerfeitoRecord>) => Promise<boolean>;
    deleteRecord: (id: string) => Promise<boolean>;
    hasAccess: boolean;
}

const CasoPerfeitoContext = createContext<CasoPerfeitoContextType | undefined>(undefined);

export const CasoPerfeitoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { currentUser, isAdmin } = useAuth();
    const { selectedDate, setNotification } = useProductivity(); // Reaproveitar notificação e data global

    const [records, setRecords] = useState<CasoPerfeitoRecord[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Tem acesso se for admin ou se tiver a flag ligada
    const hasAccess = isAdmin || !!currentUser?.is_caso_perfeito_expert;

    const loadRecords = useCallback(async () => {
        if (!hasAccess) return;
        setIsLoading(true);
        try {
            let data: CasoPerfeitoRecord[];
            if (isAdmin) {
                // Admin vê todos daquele dia
                data = await casoPerfeitoService.getRecordsByDate(selectedDate);
            } else if (currentUser) {
                // Expert vê os seus daquele dia
                data = await casoPerfeitoService.getRecordsByExpertAndDate(currentUser.name, selectedDate);
            } else {
                data = [];
            }
            setRecords(data);
        } catch (error) {
            console.error(error);
            setNotification({ message: 'Erro ao carregar Casos Perfeitos', visible: true, type: 'error' });
        } finally {
            setIsLoading(false);
        }
    }, [isAdmin, currentUser, selectedDate, hasAccess, setNotification]);

    useEffect(() => {
        loadRecords();
    }, [loadRecords]);

    const addRecord = async (recordData: Omit<CasoPerfeitoRecord, 'id' | 'expert_name' | 'date'>) => {
        if (!currentUser && !isAdmin) return false;
        
        setIsSaving(true);
        try {
            const newRecord = {
                ...recordData,
                expert_name: currentUser ? currentUser.name : 'ADMIN', // Ou talvez permitir que Admin adicione para outro expert, mas por padrão vamos usar quem tá logado.
                date: selectedDate,
            };
            
            const added = await casoPerfeitoService.addRecord(newRecord);
            if (added) {
                setRecords(prev => [added, ...prev]);
                setNotification({ message: 'Caso salvo com sucesso!', visible: true, type: 'success' });
                return true;
            }
            return false;
        } catch (error) {
             setNotification({ message: 'Erro ao salvar caso', visible: true, type: 'error' });
             return false;
        } finally {
            setIsSaving(false);
        }
    };

    const updateRecord = async (id: string, updates: Partial<CasoPerfeitoRecord>) => {
        setIsSaving(true);
        try {
            const updated = await casoPerfeitoService.updateRecord(id, updates);
            if (updated) {
                setRecords(prev => prev.map(r => r.id === id ? updated : r));
                setNotification({ message: 'Caso atualizado!', visible: true, type: 'success' });
                return true;
            }
            return false;
        } catch (error) {
             setNotification({ message: 'Erro ao atualizar caso', visible: true, type: 'error' });
             return false;
        } finally {
            setIsSaving(false);
        }
    };

    const deleteRecord = async (id: string) => {
        setIsSaving(true);
        try {
            const success = await casoPerfeitoService.deleteRecord(id);
            if (success) {
                setRecords(prev => prev.filter(r => r.id !== id));
                setNotification({ message: 'Caso deletado!', visible: true, type: 'info' });
                return true;
            }
            return false;
        } catch (error) {
            setNotification({ message: 'Erro ao deletar caso', visible: true, type: 'error' });
            return false;
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <CasoPerfeitoContext.Provider value={{
            records, isLoading, isSaving, loadRecords, addRecord, updateRecord, deleteRecord, hasAccess
        }}>
            {children}
        </CasoPerfeitoContext.Provider>
    );
};

export const useCasoPerfeito = () => {
    const context = useContext(CasoPerfeitoContext);
    if (context === undefined) {
        throw new Error('useCasoPerfeito must be used within a CasoPerfeitoProvider');
    }
    return context;
};
