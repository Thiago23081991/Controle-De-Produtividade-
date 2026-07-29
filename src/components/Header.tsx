import React from 'react';
import { LogOut, Sun, Moon, Calendar, LayoutGrid, List, Award, RefreshCcw, Download, Shield, ShieldCheck, AlertTriangle, ListTodo, PackageSearch, Phone, LayoutDashboard } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useProductivity } from '../contexts/ProductivityContext';
import { useNavigate, useLocation } from 'react-router-dom';

// Header no longer needs props as it consumes contexts
export const Header: React.FC = () => {
    const { theme, toggleTheme } = useTheme();
    const { currentUser, isAdmin, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const {
        isSupabaseConfigured, dailyQuote, selectedSupervisor, setSelectedSupervisor, supervisors,
        selectedDate, setSelectedDate, isSyncing, refreshData, handleExport,
        viewMode, setViewMode, selectedMonth, setSelectedMonth, selectedYear, setSelectedYear
    } = useProductivity();

    const navItems = [
        {
            path: '/',
            label: 'Dashboard',
            icon: <LayoutDashboard size={15} />,
            activeColor: 'bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700',
            inactiveColor: 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-transparent hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-orange-900/20',
            show: true,
        },
        {
            path: '/caso-perfeito',
            label: 'Caso Perfeito',
            icon: <ShieldCheck size={15} />,
            activeColor: 'bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700',
            inactiveColor: 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-transparent hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-orange-900/20',
            show: isAdmin || !!currentUser?.is_caso_perfeito_expert,
        },
        {
            path: '/erros',
            label: 'Erros',
            icon: <AlertTriangle size={15} />,
            activeColor: 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700',
            inactiveColor: 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-transparent hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20',
            show: true,
        },
        {
            path: '/erros-bko',
            label: 'Erros BKO',
            icon: <AlertTriangle size={15} />,
            activeColor: 'bg-indigo-100 text-indigo-700 border-indigo-300 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-700',
            inactiveColor: 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-transparent hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-900/20',
            show: true,
        },
        {
            path: '/backlog',
            label: 'Backlog',
            icon: <ListTodo size={15} />,
            activeColor: 'bg-sky-100 text-sky-700 border-sky-300 dark:bg-sky-900/30 dark:text-sky-300 dark:border-sky-700',
            inactiveColor: 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-transparent hover:bg-sky-50 hover:text-sky-600 dark:hover:bg-sky-900/20',
            show: true,
        },
        {
            path: '/casos-br01',
            label: 'BR01',
            icon: <PackageSearch size={15} />,
            activeColor: 'bg-violet-100 text-violet-700 border-violet-300 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-700',
            inactiveColor: 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-transparent hover:bg-violet-50 hover:text-violet-600 dark:hover:bg-violet-900/20',
            show: true,
        },
        {
            path: '/voz-campo',
            label: 'Voz de Campo',
            icon: <Phone size={15} />,
            activeColor: 'bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700',
            inactiveColor: 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-transparent hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-900/20',
            show: true,
        },
        {
            path: '/admin',
            label: 'Gestão',
            icon: <Shield size={15} />,
            activeColor: 'bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700',
            inactiveColor: 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-transparent hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-orange-900/20',
            show: isAdmin,
        },
    ];

    return (
        <header className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 relative overflow-hidden transition-colors duration-300">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600" />

            {/* ── Linha 1: Logo + Controles de produtividade + Utilitários ── */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 px-6 pt-6 pb-4">

                {/* Logo */}
                <div className="flex items-center gap-4 z-10 shrink-0">
                    <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-2xl border border-orange-100 dark:border-orange-800/50">
                        <Award className="text-orange-600 w-7 h-7" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-slate-900 dark:text-white italic tracking-tighter">
                            Suvinil <span className="text-orange-600">Service</span>
                        </h1>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            Produtividade Cloud
                            <span className={`w-2 h-2 rounded-full ${isSupabaseConfigured ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} title={isSupabaseConfigured ? 'Online' : 'Offline'} />
                        </p>
                    </div>
                </div>

                {/* Motivational Quote */}
                <div className="hidden xl:flex flex-1 mx-6 justify-center opacity-40 hover:opacity-100 transition-opacity">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center italic">
                        "{dailyQuote}"
                    </p>
                </div>

                {/* Controles de produtividade + utilitários */}
                <div className="flex flex-wrap items-center gap-2 z-10">
                    {/* Supervisor Filter for Admin */}
                    {isAdmin && (
                        <div className="relative group">
                            <select
                                value={selectedSupervisor}
                                onChange={(e) => setSelectedSupervisor(e.target.value)}
                                className="w-40 bg-slate-50 dark:bg-slate-800 border-none rounded-xl py-2.5 px-3 text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-wide focus:ring-2 focus:ring-orange-500 outline-none appearance-none cursor-pointer hover:bg-slate-100 transition-colors"
                            >
                                {supervisors.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                <List size={12} />
                            </div>
                        </div>
                    )}

                    {/* Date Controls */}
                    <div className="flex bg-slate-50 dark:bg-slate-800 p-1 rounded-xl">
                        <button
                            onClick={() => setViewMode('daily')}
                            className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${viewMode === 'daily' ? 'bg-white dark:bg-slate-700 shadow-md text-orange-600' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <Calendar size={13} /> Dia
                        </button>
                        <button
                            onClick={() => setViewMode('monthly')}
                            className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${viewMode === 'monthly' ? 'bg-white dark:bg-slate-700 shadow-md text-orange-600' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <LayoutGrid size={13} /> Mês
                        </button>
                    </div>

                    {viewMode === 'daily' ? (
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="bg-slate-50 dark:bg-slate-800 border-none rounded-xl py-2 px-3 text-xs font-black text-slate-600 dark:text-slate-300 focus:ring-2 focus:ring-orange-500 outline-none cursor-pointer hover:bg-slate-100 transition-colors"
                        />
                    ) : (
                        <div className="flex gap-2">
                            <select
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                                className="bg-slate-50 dark:bg-slate-800 border-none rounded-xl py-2 px-3 text-xs font-black text-slate-600 dark:text-slate-300 focus:ring-2 focus:ring-orange-500 outline-none cursor-pointer"
                            >
                                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                                    <option key={m} value={m}>{new Date(0, m - 1).toLocaleString('pt-BR', { month: 'long' }).toUpperCase()}</option>
                                ))}
                            </select>
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(Number(e.target.value))}
                                className="bg-slate-50 dark:bg-slate-800 border-none rounded-xl py-2 px-3 text-xs font-black text-slate-600 dark:text-slate-300 focus:ring-2 focus:ring-orange-500 outline-none cursor-pointer"
                            >
                                <option value={2024}>2024</option>
                                <option value={2025}>2025</option>
                                <option value={2026}>2026</option>
                            </select>
                        </div>
                    )}

                    {/* Separador */}
                    <div className="h-7 w-px bg-slate-200 dark:bg-slate-700 mx-1" />

                    {/* Export */}
                    <button
                        onClick={handleExport}
                        className="p-2.5 rounded-xl bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                        title="Exportar Excel"
                    >
                        <Download size={16} />
                    </button>

                    {/* Sync */}
                    <button
                        onClick={refreshData}
                        disabled={isSyncing}
                        className={`p-2.5 rounded-xl transition-all ${isSyncing ? 'bg-orange-50 text-orange-400' : 'bg-slate-50 text-slate-500 hover:bg-orange-50 hover:text-orange-600'}`}
                        title="Sincronizar"
                    >
                        <RefreshCcw size={16} className={isSyncing ? 'animate-spin' : ''} />
                    </button>

                    {/* Theme */}
                    <button
                        onClick={toggleTheme}
                        className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-slate-700 transition-all"
                    >
                        {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                    </button>

                    <div className="h-7 w-px bg-slate-200 dark:bg-slate-700 mx-1" />

                    {/* Logout */}
                    <button
                        onClick={logout}
                        className="flex items-center gap-1.5 text-red-500 font-black text-[10px] hover:text-white hover:bg-red-500 transition-all bg-red-50 dark:bg-red-900/20 p-2.5 rounded-xl border border-red-200 dark:border-red-800/50 uppercase tracking-widest"
                        title="Sair"
                    >
                        <LogOut size={16} /> <span className="hidden sm:inline">Sair</span>
                    </button>
                </div>
            </div>

            {/* ── Linha 2: Barra de navegação ── */}
            <div className="border-t border-slate-100 dark:border-slate-800 px-6 pb-4 pt-3">
                <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
                    {navItems
                        .filter(item => item.show)
                        .map(item => {
                            const isActive = location.pathname === item.path;
                            return (
                                <button
                                    key={item.path}
                                    onClick={() => navigate(item.path)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all border whitespace-nowrap shrink-0 ${isActive ? item.activeColor : item.inactiveColor}`}
                                    title={item.label}
                                >
                                    {item.icon}
                                    <span>{item.label}</span>
                                </button>
                            );
                        })}
                </div>
            </div>
        </header>
    );
};
