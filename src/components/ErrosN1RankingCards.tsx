import React from 'react';
import { Trophy, AlertTriangle } from 'lucide-react';
import { useErrosN1 } from '../contexts/ErrosN1Context';

const MEDAL_COLORS = [
    { bg: 'from-yellow-400 to-amber-500', text: 'text-white', label: '🥇' },
    { bg: 'from-slate-300 to-slate-400',  text: 'text-white', label: '🥈' },
    { bg: 'from-orange-400 to-amber-600', text: 'text-white', label: '🥉' },
];

export const ErrosN1RankingCards: React.FC = () => {
    const { ranking, erros } = useErrosN1();

    if (ranking.length === 0) return null;

    return (
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 p-6">
            <div className="flex items-center gap-3 mb-5">
                <div className="bg-rose-100 dark:bg-rose-900/30 p-2.5 rounded-xl">
                    <Trophy size={18} className="text-rose-500" />
                </div>
                <div>
                    <h3 className="font-black text-slate-800 dark:text-white text-base tracking-tight">
                        Ranking de Erros N1
                    </h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {erros.length} erro{erros.length !== 1 ? 's' : ''} no período
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {ranking.map((item, idx) => {
                    const medal = MEDAL_COLORS[idx] || null;
                    return (
                        <div
                            key={item.expert_name}
                            className="relative bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-700/50 flex items-center gap-3 hover:shadow-md transition-shadow"
                        >
                            {/* Rank badge */}
                            <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center font-black text-sm ${
                                medal
                                    ? `bg-gradient-to-br ${medal.bg} ${medal.text} shadow-md`
                                    : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-300'
                            }`}>
                                {medal ? medal.label : `#${idx + 1}`}
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-black text-slate-700 dark:text-slate-200 leading-tight truncate">
                                    {item.expert_name.split(' ')[0]}
                                </p>
                                <p className="text-[10px] font-bold text-slate-400 truncate" title={item.expert_name}>
                                    {item.expert_name}
                                </p>
                            </div>

                            <div className="text-right shrink-0">
                                <p className="text-lg font-black text-rose-500">{item.count}</p>
                                <p className="text-[10px] font-bold text-slate-400">{item.percentage}%</p>
                            </div>

                            {/* Barra de progresso */}
                            <div
                                className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-rose-400 to-pink-500 rounded-b-2xl transition-all duration-700"
                                style={{ width: `${item.percentage}%` }}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
