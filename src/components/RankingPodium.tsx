import React from 'react';
import { ManualEntryData } from '../types';
import { Trophy, Medal, Crown } from 'lucide-react';

interface Props {
    data: ManualEntryData;
}

export const RankingPodium: React.FC<Props> = ({ data }) => {
    const top3 = React.useMemo(() => {
        const experts = Object.keys(data).filter(e => {
            const d = data[e];
            return (d.tratado || 0) + (d.finalizado || 0) > 0;
        });

        const sortedExperts = experts.sort((a, b) => {
            const totalA = (data[a].tratado || 0) + (data[a].finalizado || 0);
            const totalB = (data[b].tratado || 0) + (data[b].finalizado || 0);
            return totalB - totalA;
        });

        return sortedExperts.slice(0, 3);
    }, [data]);

    if (top3.length === 0) return null;

    const getStats = (name: string) => {
        const d = data[name];
        const total = (d.tratado || 0) + (d.finalizado || 0);
        return { name, total, goal: d.goal || 0 };
    };

    const first = top3[0] ? getStats(top3[0]) : null;
    const second = top3[1] ? getStats(top3[1]) : null;
    const third = top3[2] ? getStats(top3[2]) : null;

    return (
        <div className="mb-12 animate-in fade-in slide-in-from-top-8 duration-1000">
            <div className="text-center mb-8">
                <h3 className="text-3xl font-black italic tracking-tighter text-slate-800 dark:text-slate-100 uppercase">
                    <span className="text-orange-600 dark:text-orange-500">Top 3</span> Produtividade
                </h3>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">
                    Destaques do Dia
                </p>
            </div>

            <div className="flex justify-center items-end gap-4 sm:gap-8 h-64 sm:h-80">
                {/* 2nd Place */}
                {second && (
                    <div className="flex flex-col items-center w-1/3 max-w-[140px] animate-in slide-in-from-bottom-12 duration-1000 delay-150">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-600 dark:to-slate-700 border-4 border-slate-100 dark:border-slate-800 shadow-xl flex items-center justify-center text-2xl font-black text-slate-600 dark:text-slate-300 mb-[-1.5rem] relative z-10">
                            {second.name.charAt(0)}
                            <div className="absolute -bottom-2 -right-2 bg-slate-500 text-white text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full border-2 border-slate-100 dark:border-slate-800">2º</div>
                        </div>
                        <div className="w-full bg-gradient-to-t from-slate-200 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-t-[2rem] h-32 sm:h-40 flex flex-col justify-end p-4 text-center shadow-lg relative overflow-hidden group">
                            <Medal className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 w-20 h-20 opacity-20" />
                            <div className="relative z-10">
                                <h4 className="font-black text-xs sm:text-sm text-slate-700 dark:text-slate-300 truncate w-full">{second.name.split(' ')[0]}</h4>
                                <div className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white">{second.total}</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 1st Place */}
                {first && (
                    <div className="flex flex-col items-center w-1/3 max-w-[160px] relative z-10 animate-in slide-in-from-bottom-12 duration-1000">
                        <div className="absolute -top-10 animate-bounce">
                            <Crown className="text-yellow-400 fill-yellow-400 w-10 h-10 drop-shadow-lg" />
                        </div>
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 border-4 border-yellow-100 dark:border-yellow-900 shadow-2xl flex items-center justify-center text-3xl font-black text-yellow-900 mb-[-2rem] relative z-20">
                            {first.name.charAt(0)}
                            <div className="absolute -bottom-2 -right-2 bg-yellow-600 text-white text-xs sm:text-sm font-bold px-3 py-0.5 rounded-full border-2 border-yellow-100 dark:border-yellow-900">1º</div>
                        </div>
                        <div className="w-full bg-gradient-to-t from-yellow-200 to-yellow-100 dark:from-yellow-900/40 dark:to-yellow-800/40 rounded-t-[2.5rem] h-40 sm:h-52 flex flex-col justify-end p-4 pb-6 text-center shadow-[0_20px_50px_-12px_rgba(234,179,8,0.5)] relative overflow-hidden ring-4 ring-yellow-400/20">
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                            <Trophy className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-yellow-500 w-24 h-24 opacity-20 animate-pulse" />
                            <div className="relative z-10">
                                <h4 className="font-black text-sm sm:text-lg text-yellow-900 dark:text-yellow-200 truncate w-full">{first.name.split(' ')[0]}</h4>
                                <div className="text-4xl sm:text-5xl font-black text-yellow-800 dark:text-yellow-400 tracking-tighter">{first.total}</div>
                                <div className="text-[10px] font-bold text-yellow-700 dark:text-yellow-300 uppercase mt-1">Produtividade Total</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 3rd Place */}
                {third && (
                    <div className="flex flex-col items-center w-1/3 max-w-[140px] animate-in slide-in-from-bottom-12 duration-1000 delay-300">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-orange-200 to-orange-300 dark:from-orange-800 dark:to-orange-900 border-4 border-orange-100 dark:border-orange-900/50 shadow-xl flex items-center justify-center text-2xl font-black text-orange-800 dark:text-orange-200 mb-[-1.5rem] relative z-10">
                            {third.name.charAt(0)}
                            <div className="absolute -bottom-2 -right-2 bg-orange-700 text-white text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full border-2 border-orange-100 dark:border-orange-900">3º</div>
                        </div>
                        <div className="w-full bg-gradient-to-t from-orange-200 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 rounded-t-[2rem] h-24 sm:h-32 flex flex-col justify-end p-4 text-center shadow-lg relative overflow-hidden">
                            <Medal className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-orange-400 w-20 h-20 opacity-20" />
                            <div className="relative z-10">
                                <h4 className="font-black text-xs sm:text-sm text-orange-900 dark:text-orange-200 truncate w-full">{third.name.split(' ')[0]}</h4>
                                <div className="text-2xl sm:text-3xl font-black text-orange-900 dark:text-orange-100">{third.total}</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
