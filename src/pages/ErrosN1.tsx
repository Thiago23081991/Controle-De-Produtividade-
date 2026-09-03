import React, { useState } from 'react';
import { AlertTriangle, Plus, RefreshCcw } from 'lucide-react';
import { ErrosN1FormModal } from '../components/ErrosN1FormModal';
import { ErrosN1RankingCards } from '../components/ErrosN1RankingCards';
import { ErrosN1Chart } from '../components/ErrosN1Chart';
import { ErrosN1Table } from '../components/ErrosN1Table';
import { ErrosN1Provider, useErrosN1 } from '../contexts/ErrosN1Context';
import { useAuth } from '../contexts/AuthContext';

const ErrosN1Content: React.FC = () => {
    const { isAdmin } = useAuth();
    const { loadErros, isLoading, period, setPeriod } = useErrosN1();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const MESES_PT = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
    const getLastMonths = () => {
        const options: { value: string; label: string }[] = [];
        const now = new Date();
        for (let i = 0; i < 13; i++) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            const label = `${MESES_PT[d.getMonth()]}/${d.getFullYear()}`;
            options.push({ value, label });
        }
        return options;
    };
    const monthOptions = getLastMonths();
    const isSpecificMonth = /^\d{4}-\d{2}$/.test(period);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-top-10 duration-700 pb-24">

            {/* Banner Hero */}
            <div className="bg-gradient-to-br from-slate-900 to-rose-950 rounded-[3rem] shadow-2xl p-8 md:p-12 border-4 border-rose-600 relative overflow-hidden flex flex-col gap-6">
                <div className="absolute -top-8 -right-8 opacity-5 pointer-events-none">
                    <AlertTriangle size={200} className="text-rose-500" />
                </div>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-600 via-pink-500 to-rose-600" />

                {/* Título + Botões */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 z-10">
                    <div className="text-center md:text-left">
                        <div className="inline-flex items-center gap-2 bg-rose-600/20 text-rose-400 px-4 py-1.5 rounded-full mb-4">
                            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Melhoria Contínua</span>
                        </div>
                        <h1 className="text-4xl font-black text-white italic tracking-tighter">
                            Registro de <span className="text-rose-400">Erros N1</span>
                        </h1>
                        <p className="text-slate-400 font-bold text-sm mt-2">
                            Mapeamento de casos incorretos para melhoria da operação.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 z-10">
                        <button
                            onClick={() => loadErros()}
                            disabled={isLoading}
                            className="p-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                            title="Atualizar"
                        >
                            <RefreshCcw size={18} className={isLoading ? 'animate-spin' : ''} />
                        </button>

                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-rose-600 hover:bg-rose-500 text-white px-8 py-4 rounded-[2rem] font-black uppercase tracking-widest text-xs flex items-center gap-3 transition-all shadow-xl shadow-rose-900/40 active:scale-95 group"
                        >
                            <div className="bg-white/20 p-2 rounded-xl group-hover:rotate-90 transition-transform">
                                <Plus size={18} />
                            </div>
                            Registrar Erro
                        </button>
                    </div>
                </div>

                {/* Filtro de Período */}
                <div className="z-10 flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">Período:</span>

                    {(['today', 'week', 'month'] as const).map((p) => {
                        const labels: Record<string, string> = { today: 'Hoje', week: 'Semana', month: 'Mês Atual' };
                        return (
                            <button
                                key={p}
                                onClick={() => setPeriod(p)}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${
                                    period === p
                                        ? 'bg-rose-600 border-rose-500 text-white shadow-lg shadow-rose-900/40'
                                        : 'bg-white/10 border-white/10 text-slate-300 hover:bg-white/20'
                                }`}
                            >
                                {labels[p]}
                            </button>
                        );
                    })}

                    <select
                        value={isSpecificMonth ? period : ''}
                        onChange={e => { if (e.target.value) setPeriod(e.target.value); }}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border cursor-pointer ${
                            isSpecificMonth
                                ? 'bg-rose-600 border-rose-500 text-white shadow-lg shadow-rose-900/40'
                                : 'bg-white/10 border-white/10 text-slate-300 hover:bg-white/20'
                        }`}
                        style={{ backgroundColor: isSpecificMonth ? undefined : 'rgba(255,255,255,0.1)' }}
                        title="Selecionar mês específico"
                    >
                        <option value="" disabled className="bg-slate-900 text-slate-300">📅 Mês anterior...</option>
                        {monthOptions.map(opt => (
                            <option key={opt.value} value={opt.value} className="bg-slate-900 text-white">{opt.label}</option>
                        ))}
                    </select>

                    <button
                        onClick={() => setPeriod('all')}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border flex items-center gap-2 ${
                            period === 'all'
                                ? 'bg-amber-500 border-amber-400 text-white shadow-lg shadow-amber-900/40'
                                : 'bg-white/10 border-white/10 text-slate-300 hover:bg-amber-500/30 hover:border-amber-400/40'
                        }`}
                        title="Ver todos os erros consolidados"
                    >
                        <span className={`w-2 h-2 rounded-full ${period === 'all' ? 'bg-white animate-pulse' : 'bg-amber-400'}`} />
                        Consolidado
                    </button>
                </div>
            </div>

            {/* Ranking — Apenas Admin */}
            {isAdmin && <ErrosN1RankingCards />}

            {/* Gráficos (Comparativo + Top 5 Motivos) — Apenas Admin */}
            {isAdmin && <ErrosN1Chart />}

            {/* Tabela */}
            <ErrosN1Table />

            {/* FAB */}
            <button
                onClick={() => setIsModalOpen(true)}
                className="fixed bottom-8 right-8 z-40 bg-rose-600 hover:bg-rose-500 text-white px-6 py-4 rounded-[2rem] font-black uppercase tracking-widest text-xs flex items-center gap-3 shadow-2xl shadow-rose-900/50 active:scale-95 transition-all group animate-in fade-in slide-in-from-bottom-4 duration-500"
                title="Registrar novo erro N1"
            >
                <div className="bg-white/20 p-1.5 rounded-xl group-hover:rotate-90 transition-transform">
                    <Plus size={16} />
                </div>
                Registrar Erro
            </button>

            {/* Modal */}
            <ErrosN1FormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
};

export const ErrosN1: React.FC = () => (
    <ErrosN1Provider>
        <ErrosN1Content />
    </ErrosN1Provider>
);
