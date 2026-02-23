import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode, useMemo } from 'react';
import { ManualEntryData, ExpertInfo } from '../types';
import { expertService } from '../services/expertService';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import { useAuth } from './AuthContext';
import { analyzeProductivity } from '../services/geminiService';
import { useAudio } from '../hooks/useAudio';

interface Notification {
    message: string;
    visible: boolean;
    type?: 'success' | 'info' | 'error' | 'alert' | 'celebration';
}

interface ProductivityContextType {
    // Data
    data: ManualEntryData;
    rankingData: ManualEntryData;
    visibleExperts: string[];
    weeklyStats: { tratado: number; finalizado: number };
    historicalAverages: Record<string, number>;
    tempMessages: Record<string, string>;
    expertMap: Record<string, ExpertInfo>;
    supervisors: string[];

    // UI State
    selectedDate: string;
    setSelectedDate: (d: string) => void;
    viewMode: 'daily' | 'monthly';
    setViewMode: (m: 'daily' | 'monthly') => void;
    selectedMonth: number;
    setSelectedMonth: (m: number) => void;
    selectedYear: number;
    setSelectedYear: (y: number) => void;
    selectedSupervisor: string;
    setSelectedSupervisor: (s: string) => void;
    notification: Notification | null;
    setNotification: (n: Notification | null) => void;
    expertMessageInput: string;
    setExpertMessageInput: (s: string) => void;
    expertTargetSupervisor: string;
    setExpertTargetSupervisor: (s: string) => void;
    aiAnalysis: string | null;
    setAiAnalysis: (s: string | null) => void;
    dailyQuote: string;

    // Loading States
    isSyncing: boolean;
    isTableLoading: boolean;
    isStatsLoading: boolean;
    isAnalyzing: boolean;

    // Actions
    handleInputChange: (expert: string, field: 'tratado' | 'finalizado' | 'observacao' | 'goal', value: string) => void;
    handleSendMessage: (expert: string) => void;
    handleSendExpertMessage: () => void;
    handleRunAnalysis: () => void;
    handleExport: () => void;
    refreshData: () => void;
    syncDaily: () => void;
    setTempMessages: (expert: string, msg: string) => void;
    isSupabaseConfigured: boolean;
}

const ProductivityContext = createContext<ProductivityContextType | undefined>(undefined);

const MOTIVATIONAL_QUOTES = [
    "O sucesso é a soma de pequenos esforços repetidos dia após dia.",
    "A persistência é o caminho do êxito.",
    "Não pare até se orgulhar do que construiu.",
    "Grandes coisas nunca vêm de zonas de conforto.",
    "Seu único limite é onde você decide parar.",
    "Foco na meta, força na luta.",
    "Transforme obstáculos em degraus para o topo.",
    "A disciplina é a ponte entre metas e realizações.",
    "Faça hoje o seu melhor absoluto.",
    "A excelência não é um ato, mas um hábito.",
    "Qualidade significa fazer certo quando ninguém está olhando.",
    "Sua atitude determina sua altitude.",
    "O único lugar onde o sucesso vem antes do trabalho é no dicionário."
];

const getTodayString = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const getCurrentWeekRange = () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diffToMonday = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diffToMonday));
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    return {
        start: monday.toISOString().split('T')[0],
        end: sunday.toISOString().split('T')[0]
    };
};

const getInitialData = (experts: ExpertInfo[]): ManualEntryData => {
    const sortedRoster = experts.map(e => e.name).sort((a, b) => a.localeCompare(b));
    return sortedRoster.reduce((acc, name) => {
        acc[name] = { tratado: 0, finalizado: 0, observacao: '', isUrgent: false, goal: 0, managerMessage: '', expertMessage: '', targetSupervisor: '' };
        return acc;
    }, {} as ManualEntryData);
};

const MESSAGE_DURATION_MS = 3 * 60 * 1000;
const SAVE_DEBOUNCE_MS = 1000;
const POLLING_INTERVAL_MS = 30000; // Increased to 30s

export const ProductivityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { currentUser, isAdmin, experts } = useAuth();
    const { playUrnaBeep, playGoalReachedBeep, playSuccessBeep } = useAudio();

    // States
    const [data, setData] = useState<ManualEntryData>({});
    const [weeklyStats, setWeeklyStats] = useState({ tratado: 0, finalizado: 0 });
    const [historicalAverages, setHistoricalAverages] = useState<Record<string, number>>({});
    const [tempMessages, setTempMessages] = useState<Record<string, string>>({});

    // UI State
    const [selectedDate, setSelectedDate] = useState<string>(getTodayString());
    const [viewMode, setViewMode] = useState<'daily' | 'monthly'>('daily');
    const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
    const [selectedSupervisor, setSelectedSupervisor] = useState<string>('TODOS');
    const [notification, setNotification] = useState<Notification | null>(null);
    const [expertMessageInput, setExpertMessageInput] = useState('');
    const [expertTargetSupervisor, setExpertTargetSupervisor] = useState('');
    const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);

    // Loading States
    const [isSyncing, setIsSyncing] = useState(false);
    const [isTableLoading, setIsTableLoading] = useState(false);
    const [isStatsLoading, setIsStatsLoading] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // Refs
    const dataRef = useRef(data);
    useEffect(() => { dataRef.current = data; }, [data]);
    const saveTimeoutRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
    const lastMessageRef = useRef<string>('');
    const goalReachedRef = useRef<boolean>(false);
    const prevExpertMessages = useRef<Record<string, string>>({});

    // Memos
    const dailyQuote = useMemo(() => MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)], []);

    const expertMap = useMemo(() => {
        return experts.reduce((acc, expert) => {
            acc[expert.name] = expert;
            return acc;
        }, {} as Record<string, ExpertInfo>);
    }, [experts]);

    const supervisors = useMemo(() => {
        const list = new Set<string>();
        experts.forEach(e => e.supervisor && list.add(e.supervisor));
        return ['TODOS', ...Array.from(list).sort()];
    }, [experts]);

    const visibleExperts = useMemo(() => {
        if (!isAdmin) return currentUser ? [currentUser.name] : [];
        return Object.keys(data).filter(name => {
            if (selectedSupervisor === 'TODOS') return true;
            const officialSupervisor = expertMap[name]?.supervisor;
            const targetSupervisor = data[name]?.targetSupervisor;
            const hasMessage = !!data[name]?.expertMessage;
            const isTeamMember = officialSupervisor === selectedSupervisor;
            const isTargetingThisSupervisor = hasMessage && targetSupervisor && targetSupervisor.trim() === selectedSupervisor;
            return isTeamMember || isTargetingThisSupervisor;
        }).sort();
    }, [isAdmin, currentUser, data, selectedSupervisor, expertMap]);

    const rankingData = useMemo(() => {
        if (selectedSupervisor === 'TODOS') return data;
        const filtered: ManualEntryData = {};
        Object.keys(data).forEach(key => {
            if (expertMap[key]?.supervisor === selectedSupervisor) {
                filtered[key] = data[key];
            }
        });
        return filtered;
    }, [data, selectedSupervisor, expertMap]);

    // Derived Logic
    useEffect(() => {
        if (currentUser && data[currentUser.name]) {
            const savedTarget = data[currentUser.name].targetSupervisor;
            if (savedTarget) {
                setExpertTargetSupervisor(savedTarget);
            } else if (currentUser.supervisor) {
                setExpertTargetSupervisor(currentUser.supervisor);
            }
        }
    }, [currentUser, data]);

    // Data Fetching
    const loadWeeklyStats = useCallback(async (expertName: string) => {
        if (!isSupabaseConfigured) return;
        const { start, end } = getCurrentWeekRange();
        try {
            const { data: records, error } = await supabase
                .from('productivity_records')
                .select('tratado, finalizado')
                .eq('expert_name', expertName)
                .gte('date', start)
                .lte('date', end);

            if (!error && records) {
                const totals = records.reduce((acc, rec) => ({
                    tratado: acc.tratado + (rec.tratado || 0),
                    finalizado: acc.finalizado + (rec.finalizado || 0)
                }), { tratado: 0, finalizado: 0 });
                setWeeklyStats(totals);
            }
        } catch (e) { console.error(e); }
    }, []);

    const loadHistoryData = useCallback(async (date: string, specificExpert?: string) => {
        if (!isSupabaseConfigured || experts.length === 0) return;

        try {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

            let queryHistory = supabase.from('productivity_records')
                .select('expert_name, tratado, finalizado')
                .lt('date', date)
                .gte('date', thirtyDaysAgoStr);

            if (specificExpert) {
                queryHistory = queryHistory.eq('expert_name', specificExpert);
            }

            const historyResult = await queryHistory;
            if (historyResult.error) throw historyResult.error;

            const averagesSum: Record<string, number> = {};
            const averagesCount: Record<string, number> = {};
            const calculatedAverages: Record<string, number> = {};

            if (historyResult.data) {
                historyResult.data.forEach(rec => {
                    const totalProd = (rec.tratado || 0) + (rec.finalizado || 0);
                    if (totalProd > 0) {
                        averagesSum[rec.expert_name] = (averagesSum[rec.expert_name] || 0) + totalProd;
                        averagesCount[rec.expert_name] = (averagesCount[rec.expert_name] || 0) + 1;
                    }
                });
                Object.keys(averagesSum).forEach(name => {
                    const count = averagesCount[name];
                    calculatedAverages[name] = count > 0 ? Math.round(averagesSum[name] / count) : 0;
                });
                if (!specificExpert) setHistoricalAverages(calculatedAverages);
            }
            return calculatedAverages; // Return for immediate use in loadTodayData
        } catch (e) {
            console.error("Load History Error:", e);
            return {};
        }
    }, [experts]);

    const loadTodayData = useCallback(async (date: string, isBackground = false, specificExpert?: string, preloadedAverages?: Record<string, number>) => {
        if (!isSupabaseConfigured || experts.length === 0) return;
        if (isBackground) setIsSyncing(true);

        try {
            let queryToday = supabase.from('productivity_records').select('*').eq('date', date);
            if (specificExpert) {
                queryToday = queryToday.eq('expert_name', specificExpert);
            }

            const { data: todayRecords, error } = await queryToday;
            if (error) throw error;

            setData(prev => {
                const nextData = { ...prev };
                if (Object.keys(nextData).length === 0) {
                    Object.assign(nextData, getInitialData(experts));
                }

                const currentAverages = preloadedAverages || historicalAverages;

                todayRecords?.forEach(rec => {
                    const avgGoal = currentAverages[rec.expert_name] || 0;
                    const effectiveGoal = rec.goal > 0 ? rec.goal : avgGoal;

                    nextData[rec.expert_name] = {
                        tratado: rec.tratado,
                        finalizado: rec.finalizado,
                        goal: effectiveGoal,
                        observacao: rec.observacao || '',
                        isUrgent: rec.is_urgent,
                        managerMessage: rec.manager_message || '',
                        expertMessage: rec.expert_message || '',
                        targetSupervisor: rec.target_supervisor || ''
                    };
                });

                if (!isBackground) {
                    // Fill gaps with averages if goals are 0
                    Object.keys(currentAverages).forEach(expert => {
                        if ((!nextData[expert] || (nextData[expert].goal === 0)) && currentAverages[expert] > 0) {
                            nextData[expert] = {
                                ...(nextData[expert] || getInitialData(experts)[expert]),
                                goal: currentAverages[expert]
                            };
                        }
                    });
                }
                return nextData;
            });

        } catch (e: any) {
            console.error("Load Today Data Error:", e);
            if (!isBackground) setNotification({ message: 'Erro ao carregar dados.', visible: true, type: 'error' });
        } finally {
            if (isBackground) setIsSyncing(false);
        }
    }, [experts, historicalAverages]); // Depends on historicalAverages

    const loadMonthlyData = useCallback(async (month: number, year: number) => {
        if (!isSupabaseConfigured) return;
        setIsTableLoading(true);
        try {
            const monthlyData = await expertService.getMonthlyData(month, year);
            setData(() => {
                const nextData = getInitialData(experts);
                monthlyData.forEach((rec: any) => {
                    if (nextData[rec.expert_name]) {
                        nextData[rec.expert_name] = {
                            ...nextData[rec.expert_name],
                            tratado: rec.tratado,
                            finalizado: rec.finalizado,
                            goal: rec.goal,
                            observacao: rec.observacao || ''
                        };
                    }
                });
                return nextData;
            });
        } catch (error) {
            console.error("Monthly Data Error:", error);
            setNotification({ message: 'Erro dados mensais.', visible: true, type: 'error' });
        } finally {
            setIsTableLoading(false);
        }
    }, [experts]);

    // Initial Load & Effects
    useEffect(() => {
        if (experts.length > 0) {
            // Initial Full Load
            Promise.all([
                // Load history first to set averages
                loadHistoryData(selectedDate),
            ]).then(([averages]) => {
                // Then load today
                loadTodayData(selectedDate, false, undefined, averages);
            });
        }
    }, [experts, selectedDate, viewMode, selectedMonth, selectedYear]); // Triggered on criteria change

    // Polling & Realtime
    useEffect(() => {
        if (!isSupabaseConfigured || viewMode === 'monthly') return;

        const channel = supabase.channel(`prod-changes-${selectedDate}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'productivity_records', filter: `date=eq.${selectedDate}` }, (payload) => {
                const rec = payload.new as any;
                if (rec && rec.expert_name) {
                    setData(prev => ({
                        ...prev,
                        [rec.expert_name]: {
                            tratado: rec.tratado ?? 0,
                            finalizado: rec.finalizado ?? 0,
                            goal: rec.goal ?? 0,
                            observacao: rec.observacao || '',
                            isUrgent: rec.is_urgent,
                            managerMessage: rec.manager_message || '',
                            expertMessage: rec.expert_message || '',
                            targetSupervisor: rec.target_supervisor || ''
                        }
                    }));
                    if (currentUser && rec.expert_name === currentUser.name) {
                        loadWeeklyStats(currentUser.name);
                    }
                }
            }).subscribe();

        const pollInterval = setInterval(() => {
            if (!document.hidden) loadTodayData(selectedDate, true); // Only load today data
        }, POLLING_INTERVAL_MS);

        const onFocus = () => loadTodayData(selectedDate, true);
        window.addEventListener('focus', onFocus);

        return () => {
            supabase.removeChannel(channel);
            clearInterval(pollInterval);
            window.removeEventListener('focus', onFocus);
        };
    }, [selectedDate, viewMode, currentUser, loadWeeklyStats, loadTodayData]);

    // Notifications for Admin
    useEffect(() => {
        Object.keys(data).forEach(name => {
            const msg = data[name]?.expertMessage || '';
            const target = data[name]?.targetSupervisor;
            const prevMsg = prevExpertMessages.current[name];

            if (isAdmin && !isSyncing && prevMsg !== undefined && msg !== prevMsg && msg.trim() !== '') {
                const isForMe = selectedSupervisor === 'TODOS' || (target && target.trim() === selectedSupervisor);
                if (isForMe) {
                    playUrnaBeep();
                    setNotification({
                        message: `💬 ${name.split(' ')[0]} para ${target ? target.split(' ')[0] : 'Supervisão'}`,
                        visible: true,
                        type: 'info'
                    });
                }
            }
            prevExpertMessages.current[name] = msg;
        });
    }, [data, isAdmin, isSyncing, selectedSupervisor, playUrnaBeep]);

    // User Message & Goal Notifications
    useEffect(() => {
        if (!isAdmin && currentUser) {
            const expertData = data[currentUser.name];
            const msg = expertData?.managerMessage?.trim();

            if (msg && msg !== lastMessageRef.current) {
                playUrnaBeep();
                setNotification({ message: '🔔 NOVA MENSAGEM DA GESTÃO', visible: true, type: 'alert' });
                lastMessageRef.current = msg;
                setTimeout(() => {
                    saveToSupabase(currentUser.name, { managerMessage: '' });
                    lastMessageRef.current = '';
                    setNotification(null);
                }, MESSAGE_DURATION_MS);
            }

            if (expertData) {
                const totalProd = (expertData.tratado || 0) + (expertData.finalizado || 0);
                if (expertData.goal > 0 && totalProd >= expertData.goal) {
                    if (!goalReachedRef.current) {
                        playGoalReachedBeep();
                        setNotification({ message: '🏆 PARABÉNS! META DIÁRIA BATIDA!', visible: true, type: 'celebration' });
                        goalReachedRef.current = true;
                    }
                } else {
                    goalReachedRef.current = false;
                }
            }
        }
    }, [data, currentUser, isAdmin, playUrnaBeep, playGoalReachedBeep]);

    // Actions Implementation
    const refreshData = async () => {
        if (viewMode === 'monthly') {
            await loadMonthlyData(selectedMonth, selectedYear);
        } else {
            setIsTableLoading(true);
            if (currentUser && !isAdmin) setIsStatsLoading(true);

            // Refreshes both history and today
            const averages = await loadHistoryData(selectedDate);
            await Promise.all([
                loadTodayData(selectedDate, false, (!isAdmin && currentUser) ? currentUser.name : undefined, averages),
                (!isAdmin && currentUser) ? loadWeeklyStats(currentUser.name) : Promise.resolve(),
                // Load full data for table if needed
                loadTodayData(selectedDate, false, undefined, averages)
            ]);

            setIsTableLoading(false);
            setIsStatsLoading(false);
        }
    };

    const saveToSupabase = async (expert: string, updateData: Partial<ManualEntryData[string]>) => {
        if (!isSupabaseConfigured) return;
        const entry = dataRef.current[expert];
        const fullData = { ...entry, ...updateData };
        const payload: any = {
            expert_name: expert,
            tratado: fullData.tratado ?? 0,
            finalizado: fullData.finalizado ?? 0,
            goal: fullData.goal ?? 0,
            observacao: fullData.observacao ?? '',
            updated_at: new Date().toISOString()
        };

        if (viewMode === 'daily') {
            payload.date = selectedDate;
            payload.is_urgent = fullData.isUrgent ?? false;
            payload.manager_message = fullData.managerMessage ?? '';
            payload.expert_message = fullData.expertMessage ?? '';
            payload.target_supervisor = fullData.targetSupervisor ?? '';
        } else {
            payload.month = selectedMonth;
            payload.year = selectedYear;
        }

        try {
            const { error } = await supabase
                .from(viewMode === 'daily' ? 'productivity_records' : 'monthly_productivity')
                .upsert(payload, { onConflict: viewMode === 'daily' ? 'date,expert_name' : 'expert_name,month,year' });

            if (error) throw error;
        } catch (e: any) {
            console.error("Save Error:", e);
            setNotification({ message: 'Erro ao salvar alteração.', visible: true, type: 'error' });
        }

        if (currentUser && expert === currentUser.name) loadWeeklyStats(expert);
    };

    const handleInputChange = (expert: string, field: 'tratado' | 'finalizado' | 'observacao' | 'goal', value: string) => {
        const finalValue = field === 'observacao' ? value : Math.max(0, parseInt(value) || 0);
        setData(prev => ({ ...prev, [expert]: { ...prev[expert], [field]: finalValue } }));

        if (saveTimeoutRef.current[expert]) clearTimeout(saveTimeoutRef.current[expert]);
        saveTimeoutRef.current[expert] = setTimeout(() => {
            saveToSupabase(expert, { [field]: finalValue });
        }, SAVE_DEBOUNCE_MS);
    };

    const handleSendMessage = (expert: string) => {
        const msg = tempMessages[expert] || '';
        if (!msg.trim()) return;
        saveToSupabase(expert, { managerMessage: msg });
        playSuccessBeep();
        setNotification({ message: `Aviso enviado para ${expert.split(' ')[0]}`, visible: true, type: 'success' });
        setTempMessages(prev => ({ ...prev, [expert]: '' }));
    };

    const handleSendExpertMessage = () => {
        if (!currentUser || !expertMessageInput.trim()) return;
        const target = expertTargetSupervisor || (currentUser.supervisor ? currentUser.supervisor : 'TODOS');
        const newData = { ...data[currentUser.name], expertMessage: expertMessageInput, targetSupervisor: target };
        setData(prev => ({ ...prev, [currentUser.name]: newData }));
        saveToSupabase(currentUser.name, { expertMessage: expertMessageInput, targetSupervisor: target });
        playSuccessBeep();
        setNotification({ message: `Enviada para ${target === 'TODOS' ? 'Supervisão Geral' : target.split(' ')[0]}!`, visible: true, type: 'success' });
        setExpertMessageInput('');
    };

    const handleRunAnalysis = async () => {
        setIsAnalyzing(true);
        try {
            const analysis = await analyzeProductivity(data);
            setAiAnalysis(analysis);
            setNotification({ message: 'Análise gerada!', visible: true, type: 'success' });
        } catch (err) {
            setNotification({ message: 'Erro na análise IA.', visible: true, type: 'error' });
        } finally { setIsAnalyzing(false); }
    };

    const handleExport = () => {
        import('../utils/excelExport').then(mod => {
            mod.exportToExcel({
                data,
                expertMap,
                viewMode,
                period: viewMode === 'daily'
                    ? selectedDate.split('-').reverse().join('/')
                    : `${new Date(0, selectedMonth - 1).toLocaleString('pt-BR', { month: 'long' })}_${selectedYear}`
            });
        });
    };

    const syncDaily = () => {
        Object.keys(data).forEach(async (expertName) => {
            if (!expertMap[expertName]) return;
            try {
                const totals = await expertService.aggregateDailyRecords(expertName, selectedMonth, selectedYear);
                handleInputChange(expertName, 'tratado', totals.tratado.toString());
                handleInputChange(expertName, 'finalizado', totals.finalizado.toString());
                setNotification({ message: `Sincronizado: ${expertName}`, visible: true, type: 'success' });
            } catch (e) {
                console.error('Erro ao sincronizar expert:', expertName, e);
            }
        });
    };

    const setTempMessageHelper = (expert: string, msg: string) => {
        setTempMessages(prev => ({ ...prev, [expert]: msg }));
    };

    return (
        <ProductivityContext.Provider value={{
            data, rankingData, visibleExperts, weeklyStats, historicalAverages, tempMessages, expertMap, supervisors,
            selectedDate, setSelectedDate, viewMode, setViewMode, selectedMonth, setSelectedMonth, selectedYear, setSelectedYear,
            selectedSupervisor, setSelectedSupervisor, notification, setNotification, expertMessageInput, setExpertMessageInput,
            expertTargetSupervisor, setExpertTargetSupervisor, aiAnalysis, setAiAnalysis, dailyQuote,
            isSyncing, isTableLoading, isStatsLoading, isAnalyzing,
            handleInputChange, handleSendMessage, handleSendExpertMessage, handleRunAnalysis, handleExport, refreshData, syncDaily,
            setTempMessages: setTempMessageHelper,
            isSupabaseConfigured
        }}>
            {children}
        </ProductivityContext.Provider>
    );
};

export const useProductivity = () => {
    const context = useContext(ProductivityContext);
    if (context === undefined) throw new Error('useProductivity must be used within a ProductivityProvider');
    return context;
};
