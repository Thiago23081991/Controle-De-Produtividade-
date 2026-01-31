import React from 'react';
import { ClipboardList, Sparkles, RefreshCw, Calendar, LogOut, Users, Database } from 'lucide-react';

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
    onLogout
}) => {
    return (
        <header className="bg-white p-6 rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row justify-between items-center gap-4 border border-slate-100 relative overflow-hidden">
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
                <div className="bg-slate-900 p-3 rounded-2xl shadow-lg shadow-slate-900/20"><ClipboardList className="text-orange-500" /></div>
                <div><h1 className="text-2xl font-black italic tracking-tighter">Suvinil <span className="text-orange-600">Cloud</span></h1><p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Monitoring Systems v2.5</p></div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
                {/* Mensagem Motivacional */}
                <div className="hidden lg:flex items-center gap-2 bg-orange-50/50 border border-orange-100 px-4 py-2 rounded-2xl mr-4">
                    <Sparkles size={14} className="text-orange-500" />
                    <span className="text-[10px] font-black text-orange-800 uppercase tracking-widest italic">
                        "{dailyQuote}"
                    </span>
                </div>

                {isAdmin && (
                    <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-100 px-4">
                        <Users size={14} className="text-slate-400" />
                        <select
                            value={selectedSupervisor}
                            onChange={(e) => setSelectedSupervisor(e.target.value)}
                            className="bg-transparent border-none outline-none text-[10px] font-black uppercase tracking-widest text-slate-600 cursor-pointer"
                        >
                            {supervisors.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                )}

                <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-100 px-4">
                    <Calendar size={14} className="text-slate-400" />
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="bg-transparent border-none outline-none text-[10px] font-black text-slate-600 cursor-pointer"
                    />
                </div>

                {isAdmin && (
                    <button onClick={onRefresh} className="bg-slate-50 p-3 rounded-2xl border border-slate-100 hover:bg-slate-100 text-slate-400 hover:text-orange-600 transition-colors" title="Forçar Atualização">
                        <RefreshCw size={16} className={isSyncing ? "animate-spin" : ""} />
                    </button>
                )}

                <button onClick={onLogout} className="flex items-center gap-2 text-slate-400 font-black text-[10px] hover:text-red-600 transition-colors bg-slate-50 p-3 rounded-2xl border border-slate-100 uppercase tracking-widest"><LogOut size={16} /> Sair</button>
            </div>
        </header>
    );
};
