import React from 'react';
import { LogOut, Sun, Moon, Calendar, LayoutGrid, List, Database, Award, RefreshCcw, Download } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useProductivity } from '../contexts/ProductivityContext';

// Header no longer needs props as it consumes contexts
export const Header: React.FC = () => {
    const { theme, toggleTheme } = useTheme();
    const { isAdmin, logout } = useAuth();
    const {
        isSupabaseConfigured, dailyQuote, selectedSupervisor, setSelectedSupervisor, supervisors,
        selectedDate, setSelectedDate, isSyncing, refreshData, handleExport,
        viewMode, setViewMode, selectedMonth, setSelectedMonth, selectedYear, setSelectedYear
    } = useProductivity();

    return (
        <header className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row justify-between items-center gap-4 border border-slate-100 dark:border-slate-800 relative overflow-hidden transition-colors duration-300">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600"></div>

            <div className="flex items-center gap-6 z-10 w-full md:w-auto">
                <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-2xl border border-orange-100 dark:border-orange-800/50">
                    <Award className="text-orange-600 w-8 h-8" />
                </div>
                <div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white italic tracking-tighter">
                        Suvinil <span className="text-orange-600">Service</span>
                    </h1>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        Produtividade Cloud
                        <span className={`w-2 h-2 rounded-full ${isSupabaseConfigured ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} title={isSupabaseConfigured ? "Online" : "Offline"}></span>
                    </p>
                </div>
            </div>

            {/* Motivational Quote (Hidden on mobile) */}
            <div className="hidden md:flex flex-1 mx-8 justify-center opacity-40 hover:opacity-100 transition-opacity">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center italic">
                    "{dailyQuote}"
                </p>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-3 z-10 w-full md:w-auto">
                {/* Supervisor Filter for Admin */}
                {isAdmin && (
                    <div className="relative group w-full md:w-auto">
                        <select
                            value={selectedSupervisor}
                            onChange={(e) => setSelectedSupervisor(e.target.value)}
                            className="w-full md:w-48 bg-slate-50 dark:bg-slate-800 border-none rounded-xl py-3 px-4 text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-wide focus:ring-2 focus:ring-orange-500 outline-none appearance-none cursor-pointer hover:bg-slate-100 transition-colors"
                        >
                            {supervisors.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                            <List size={14} />
                        </div>
                    </div>
                )}

                {/* Date Controls */}
                <div className="flex bg-slate-50 dark:bg-slate-800 p-1 rounded-xl w-full md:w-auto">
                    <button
                        onClick={() => setViewMode('daily')}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${viewMode === 'daily' ? 'bg-white dark:bg-slate-700 shadow-md text-orange-600' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <Calendar size={14} /> Dia
                    </button>
                    <button
                        onClick={() => setViewMode('monthly')}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${viewMode === 'monthly' ? 'bg-white dark:bg-slate-700 shadow-md text-orange-600' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <LayoutGrid size={14} /> Mês
                    </button>
                </div>

                {viewMode === 'daily' ? (
                    <div className="relative w-full md:w-auto group">
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl py-2.5 px-4 text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-wide focus:ring-2 focus:ring-orange-500 outline-none cursor-pointer hover:bg-slate-100 transition-colors"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-orange-500 transition-colors">
                            <Calendar size={14} />
                        </div>
                    </div>
                ) : (
                    <div className="flex gap-2 w-full md:w-auto">
                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(Number(e.target.value))}
                            className="bg-slate-50 dark:bg-slate-800 border-none rounded-xl py-2.5 px-3 text-xs font-black text-slate-600 dark:text-slate-300 focus:ring-2 focus:ring-orange-500 outline-none cursor-pointer"
                        >
                            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                                <option key={m} value={m}>{new Date(0, m - 1).toLocaleString('pt-BR', { month: 'long' }).toUpperCase()}</option>
                            ))}
                        </select>
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(Number(e.target.value))}
                            className="bg-slate-50 dark:bg-slate-800 border-none rounded-xl py-2.5 px-3 text-xs font-black text-slate-600 dark:text-slate-300 focus:ring-2 focus:ring-orange-500 outline-none cursor-pointer"
                        >
                            <option value={2024}>2024</option>
                            <option value={2025}>2025</option>
                            <option value={2026}>2026</option>
                        </select>
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleExport}
                        className="p-3 rounded-xl bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                        title="Exportar Excel"
                    >
                        <Download size={18} />
                    </button>

                    <button
                        onClick={refreshData}
                        disabled={isSyncing}
                        className={`p-3 rounded-xl transition-all ${isSyncing ? 'bg-orange-50 text-orange-400' : 'bg-slate-50 text-slate-500 hover:bg-orange-50 hover:text-orange-600'}`}
                        title="Sincronizar"
                    >
                        <RefreshCcw size={18} className={isSyncing ? 'animate-spin' : ''} />
                    </button>

                    <button
                        onClick={toggleTheme}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-slate-700 transition-all"
                    >
                        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                    </button>

                    <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>

                    <button onClick={logout} className="flex items-center gap-2 text-slate-400 font-black text-[10px] hover:text-red-600 transition-colors bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl border border-slate-100 dark:border-slate-700 uppercase tracking-widest">
                        <LogOut size={16} /> <span className="hidden md:inline">Sair</span>
                    </button>
                </div>
            </div>
        </header>
    );
};
