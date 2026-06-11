import React from 'react';
import { AlertTriangle, TrendingUp, Calendar, CalendarDays, CalendarRange } from 'lucide-react';
import { useErros, RankingItem } from '../contexts/ErrosContext';
import { ErroPeriod } from '../services/errosService';

const PERIOD_OPTIONS: { key: ErroPeriod; label: string; icon: React.ReactNode }[] = [
    { key: 'today', label: 'Hoje',   icon: <Calendar size={14} /> },
    { key: 'week',  label: 'Semana', icon: <CalendarDays size={14} /> },
    { key: 'month', label: 'Mês',    icon: <CalendarRange size={14} /> },
];

const getBarColor = (pct: number) => {
    if (pct >= 50) return 'bg-red-500';
    if (pct >= 25) return 'bg-orange-500';
    return 'bg-yellow-500';
};

const getBadgeColor = (pct: number) => {
    if (pct >= 50) return 'bg-red-100 text-red-600';
    if (pct >= 25) return 'bg-orange-100 text-orange-600';
    return 'bg-yellow-100 text-yellow-600';
};

const RankingCard: React.FC<{ item: RankingItem; position: number; total: number }> = ({ item, position, total }) => {
    return (
        <div className={`bg-white dark:bg-slate-800 rounded-2xl p-5 border shadow-sm hover:shadow-md transition-all ${position === 1 ? 'border-red-200 dark:border-red-900/50' : 'border-slate-100 dark:border-slate-700'}`}>
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-sm text-white ${position === 1 ? 'bg-red-500' : position === 2 ? 'bg-orange-500' : 'bg-yellow-500'}`}>
                        {position}
                    </div>
                    <div>
                        <p className="text-sm font-black text-slate-800 dark:text-white leading-tight">
                            {item.expert_name.split(' ').slice(0, 2).join(' ')}
                        </p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                            {item.expert_name.split(' ').slice(2).join(' ')}
                        </p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-2xl font-black text-slate-800 dark:text-white leading-none">{item.count}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">erro{item.count !== 1 ? 's' : ''}</p>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5">
                <div className="h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-700 ${getBarColor(item.percentage)}`}
                        style={{ width: `${item.percentage}%` }}
                    />
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400">do total</span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${getBadgeColor(item.percentage)}`}>
                        {item.percentage}%
                    </span>
                </div>
            </div>
        </div>
    );
};

export const ErroRankingCards: React.FC = () => {
    const { ranking, erros, period, setPeriod, isLoading } = useErros();

    return (
        <section className="space-y-5">
            {/* Header + Period Filter */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-4">
                    <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-2xl">
                        <TrendingUp size={22} className="text-red-600" />
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-slate-800 dark:text-white tracking-tight">Ranking de Erros</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {erros.length} erro{erros.length !== 1 ? 's' : ''} registrado{erros.length !== 1 ? 's' : ''} no período
                        </p>
                    </div>
                </div>

                {/* Period Tabs */}
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                    {PERIOD_OPTIONS.map(opt => (
                        <button
                            key={opt.key}
                            onClick={() => setPeriod(opt.key)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${period === opt.key
                                ? 'bg-white dark:bg-slate-700 shadow text-red-600'
                                : 'text-slate-400 hover:text-slate-600'
                            }`}
                        >
                            {opt.icon} {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Cards */}
            {isLoading ? (
                <div className="text-center py-12 text-slate-400 font-bold">Carregando ranking...</div>
            ) : ranking.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-12 text-center border border-slate-100 dark:border-slate-800">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle size={32} className="text-green-500" />
                    </div>
                    <p className="font-black text-slate-700 dark:text-white text-lg">Nenhum erro registrado</p>
                    <p className="text-slate-400 text-sm font-bold mt-1">no período selecionado 🎉</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {ranking.map((item, idx) => (
                        <RankingCard
                            key={item.expert_name}
                            item={item}
                            position={idx + 1}
                            total={erros.length}
                        />
                    ))}
                </div>
            )}
        </section>
    );
};
