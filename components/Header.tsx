import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { ClipboardList, Sparkles, RefreshCw, Calendar, LogOut, Users, Database, Moon, Sun, Download } from 'lucide-react';

interface HeaderProps {
    isAdmin: boolean;
    isDemoMode: boolean;
    isSupabaseConfigured: boolean;
    dailyQuote: string;
    selectedSupervisor: string;
    setSelectedSupervisor: (s: string) => void;
    supervisors: string[];
    selectedDate: string;
    setSelectedDate: (d: string) => void;
    isSyncing: boolean;
    onRefresh: () => void;
    onLogout: () => void;
    showAdminPanel?: boolean;
    setShowAdminPanel?: (show: boolean) => void;
    viewMode: 'daily' | 'monthly';
    onViewModeChange: (mode: 'daily' | 'monthly') => void;
    selectedMonth: number;
    setSelectedMonth: (m: number) => void;
    selectedYear: number;
    setSelectedYear: (y: number) => void;
    onExport: () => void;
}

export const Header: React.FC<HeaderProps> = ({
    isAdmin,
    isDemoMode,
    isSupabaseConfigured,
    dailyQuote,
    selectedSupervisor,
    setSelectedSupervisor,
    supervisors,
    selectedDate,
    setSelectedDate,
    isSyncing,
    onRefresh,
    onLogout,
    showAdminPanel,
    setShowAdminPanel,
    viewMode,
    onViewModeChange,
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,
    onExport
}) => {
    const { theme, toggleTheme } = useTheme();

    return (
        <header className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row justify-between items-center gap-4 border border-slate-100 dark:border-slate-800 relative overflow-hidden transition-colors duration-300">
            {isDemoMode && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-yellow-100 text-yellow-800 text-[9px] font-black px-4 py-1 rounded-b-xl border border-yellow-200 uppercase tracking-widest flex items-center gap-2">
                    <Database size={10} /> Modo Demonstração (Somente Leitura/Básico)
                </div>
            )}
            {!isSupabaseConfigured && !isDemoMode && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-slate-800 text-slate-200 text-[9px] font-black px-4 py-1 rounded-b-xl border border-slate-700 uppercase tracking-widest flex items-center gap-2">
                    <Database size={10} /> Modo Offline (Sem Banco de Dados)
                </div>
            )}
            <div className="flex items-center gap-4">
                <div className="bg-slate-900 dark:bg-slate-800 p-3 rounded-2xl shadow-lg shadow-slate-900/20"><ClipboardList className="text-orange-500" /></div>
                <div><h1 className="text-2xl font-black italic tracking-tighter dark:text-slate-100">Suvinil <span className="text-orange-600">Cloud</span></h1><p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Monitoring Systems v2.5</p></div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
                {/* Mensagem Motivacional */}
                <div className="hidden lg:flex items-center gap-2 bg-orange-50/50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-900/50 px-4 py-2 rounded-2xl mr-4">
                    <Sparkles size={14} className="text-orange-500" />
                    <span className="text-[10px] font-black text-orange-800 dark:text-orange-400 uppercase tracking-widest italic">
                        "{dailyQuote}"
                    </span>
                </div>

                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className="p-3 rounded-2xl border transition-colors bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400 hover:text-orange-600 dark:hover:text-orange-400"
                    title={theme === 'dark' ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
                >
                    {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                </button>

                {isAdmin && (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowAdminPanel && setShowAdminPanel(!showAdminPanel)}
                            className={`p-3 rounded-2xl border transition-colors flex items-center gap-2 text-[10px] uppercase font-black tracking-widest ${showAdminPanel ? 'bg-orange-600 text-white border-orange-600' : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-100 dark:border-slate-700 hover:text-orange-600'}`}
                        >
                            <Users size={16} />
                            {showAdminPanel ? 'Voltar ao Dashboard' : 'Gerenciar Equipe'}
                        </button>

                        {!showAdminPanel && (
                            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-2 rounded-2xl border border-slate-100 dark:border-slate-700 px-4">
                                <Users size={14} className="text-slate-400" />
                                <select
                                    value={selectedSupervisor}
                                    onChange={(e) => setSelectedSupervisor(e.target.value)}
                                    className="bg-transparent border-none outline-none text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 cursor-pointer"
                                >
                                    {supervisors.map(s => <option key={s} value={s} className="dark:bg-slate-800">{s}</option>)}
                                </select>
                            </div>
                        )}
                    </div>
                )}

                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                    <button
                        onClick={() => onViewModeChange('daily')}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${viewMode === 'daily' ? 'bg-white dark:bg-slate-600 text-orange-600 dark:text-orange-400 shadow-sm' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
                    >
                        Diário
                    </button>
                    <button
                        onClick={() => onViewModeChange('monthly')}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${viewMode === 'monthly' ? 'bg-white dark:bg-slate-600 text-orange-600 dark:text-orange-400 shadow-sm' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
                    >
                        Mensal
                    </button>
                </div>

                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-2 rounded-2xl border border-slate-100 dark:border-slate-700 px-4">
                    <Calendar size={14} className="text-slate-400" />
                    {viewMode === 'daily' ? (
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="bg-transparent border-none outline-none text-[10px] font-black text-slate-600 dark:text-slate-300 cursor-pointer dark:in-range:bg-slate-800"
                        />
                    ) : (
                        <div className="flex gap-2">
                            <select
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                                className="bg-transparent border-none outline-none text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 cursor-pointer"
                            >
                                {Array.from({ length: 12 }, (_, i) => (
                                    <option key={i + 1} value={i + 1} className="dark:bg-slate-800">
                                        {new Date(0, i).toLocaleString('pt-BR', { month: 'long' }).toUpperCase()}
                                    </option>
                                ))}
                            </select>
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(Number(e.target.value))}
                                className="bg-transparent border-none outline-none text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 cursor-pointer"
                            >
                                {Array.from({ length: 5 }, (_, i) => {
                                    const year = new Date().getFullYear() - 1 + i;
                                    return <option key={year} value={year} className="dark:bg-slate-800">{year}</option>;
                                })}
                            </select>
                        </div>
                    )}
                </div>

                {isAdmin && !showAdminPanel && (
                    <div className="flex gap-2">
                        <button onClick={onExport} className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 p-3 rounded-2xl border border-green-100 dark:border-green-900/30 hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors" title="Exportar para Excel">
                            <Download size={16} />
                        </button>
                        <button onClick={onRefresh} className="bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl border border-slate-100 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-orange-600 transition-colors" title="Forçar Atualização">
                            <RefreshCw size={16} className={isSyncing ? "animate-spin" : ""} />
                        </button>
                    </div>
                )}

                <button onClick={onLogout} className="flex items-center gap-2 text-slate-400 font-black text-[10px] hover:text-red-600 transition-colors bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl border border-slate-100 dark:border-slate-700 uppercase tracking-widest"><LogOut size={16} /> Sair</button>
            </div>
        </header>
    );
};
