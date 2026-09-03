import React, { useMemo } from 'react';
import { BarChart3, PieChart, Info, Layers } from 'lucide-react';
import { useErrosBko } from '../contexts/ErrosBkoContext';

const COLORS = [
    '#6366F1', // Indigo 500
    '#8B5CF6', // Violet 500
    '#A855F7', // Purple 500
    '#EC4899', // Pink 500
    '#06B6D4', // Cyan 500
    '#10B981', // Emerald 500
    '#F59E0B', // Amber 500
    '#EF4444', // Red 500
];

const OTHER_COLOR = '#64748B'; // Slate 500

export const ErrosBkoChart: React.FC = () => {
    const { ranking, erros, isLoading, period } = useErrosBko();
    const isAll = period === 'all';

    const chartData = useMemo(() => {
        if (ranking.length === 0) return [];

        if (ranking.length <= 7) {
            return ranking.map((r, idx) => ({
                name: r.expert_name,
                count: r.count,
                percentage: r.percentage,
                color: COLORS[idx % COLORS.length]
            }));
        }

        const top = ranking.slice(0, 6).map((r, idx) => ({
            name: r.expert_name,
            count: r.count,
            percentage: r.percentage,
            color: COLORS[idx % COLORS.length]
        }));

        const othersCount = ranking.slice(6).reduce((acc, r) => acc + r.count, 0);
        const totalCount = erros.length;
        const othersPercentage = totalCount > 0 ? Math.round((othersCount / totalCount) * 100) : 0;

        return [
            ...top,
            { name: 'Outros Experts', count: othersCount, percentage: othersPercentage, color: OTHER_COLOR }
        ];
    }, [ranking, erros]);

    const submotivoRanking = useMemo(() => {
        const counts: Record<string, number> = {};
        erros.forEach(e => {
            const key = e.motivo || e.submotivo;
            if (key) {
                counts[key] = (counts[key] || 0) + 1;
            }
        });
        const total = Object.values(counts).reduce((a, b) => a + b, 0);
        return Object.entries(counts)
            .map(([name, count]) => ({
                name,
                count,
                percentage: total > 0 ? Math.round((count / total) * 100) : 0
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
    }, [erros]);

    const RADIUS = 50;
    const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

    const donutSegments = useMemo(() => {
        let accumulatedPercentage = 0;
        return chartData.map(d => {
            const strokeDasharray = `${(d.percentage / 100) * CIRCUMFERENCE} ${CIRCUMFERENCE}`;
            const rotation = (accumulatedPercentage / 100) * 360 - 90;
            accumulatedPercentage += d.percentage;
            return { ...d, strokeDasharray, rotation };
        });
    }, [chartData, CIRCUMFERENCE]);

    if (isLoading) {
        return (
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm text-center text-slate-400 font-bold">
                Carregando gráficos...
            </div>
        );
    }

    if (erros.length === 0) return null;

    return (
        <div className="space-y-4">
            {isAll && (
                <div className="flex items-center gap-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700/40 rounded-2xl px-5 py-3">
                    <div className="bg-indigo-500 p-2 rounded-xl">
                        <Layers size={16} className="text-white" />
                    </div>
                    <div>
                        <p className="text-xs font-black text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">Modo Consolidado Ativo</p>
                        <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
                            Exibindo <span className="font-black">{erros.length}</span> erros BKO de todo o histórico disponível
                        </p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Donut Chart */}
                <div className={`bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border shadow-sm flex flex-col items-center justify-between min-h-[350px] transition-colors ${isAll ? 'border-indigo-200 dark:border-indigo-700/40' : 'border-slate-100 dark:border-slate-800'}`}>
                    <div className="w-full flex items-center gap-3 mb-6">
                        <div className={`p-2.5 rounded-xl ${isAll ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600' : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600'}`}>
                            <PieChart size={18} />
                        </div>
                        <div>
                            <h3 className="font-black text-slate-800 dark:text-white text-sm tracking-tight">Participação de Erros</h3>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                {isAll ? 'Consolidado — Todo o histórico' : 'Distribuição Percentual'}
                            </p>
                        </div>
                    </div>

                    <div className="relative w-44 h-44 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-1" viewBox="0 0 120 120">
                            <circle cx="60" cy="60" r={RADIUS} fill="transparent" stroke="#f1f5f9" className="dark:stroke-slate-800" strokeWidth="12" />
                            {donutSegments.map((seg, idx) => (
                                <circle
                                    key={idx}
                                    cx="60" cy="60" r={RADIUS}
                                    fill="transparent"
                                    stroke={seg.color}
                                    strokeWidth="12"
                                    strokeDasharray={seg.strokeDasharray}
                                    transform={`rotate(${seg.rotation} 60 60)`}
                                    strokeLinecap={seg.percentage > 0 ? "butt" : "round"}
                                    className="transition-all duration-1000 ease-out hover:stroke-[14px] cursor-pointer"
                                />
                            ))}
                        </svg>
                        <div className="absolute text-center">
                            <p className="text-3xl font-black text-slate-800 dark:text-white leading-none">{erros.length}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Total Erros</p>
                        </div>
                    </div>

                    <div className="w-full grid grid-cols-2 gap-2 mt-6">
                        {chartData.slice(0, 4).map((d, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 truncate" title={d.name}>
                                    {(d.name || '').split(' ')[0]} ({d.percentage}%)
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bar Chart */}
                <div className={`bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border shadow-sm flex flex-col justify-between min-h-[350px] transition-colors ${isAll ? 'border-indigo-200 dark:border-indigo-700/40' : 'border-slate-100 dark:border-slate-800'}`}>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600">
                                <BarChart3 size={18} />
                            </div>
                            <div>
                                <h3 className="font-black text-slate-800 dark:text-white text-sm tracking-tight">Comparativo de Experts</h3>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                    {isAll ? 'Consolidado — Todo o histórico' : 'Frequência comparada de erros'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-700 text-slate-400">
                            <Info size={12} />
                            <span className="text-[9px] font-black uppercase tracking-wider">Top Recorrência</span>
                        </div>
                    </div>

                    <div className="space-y-4 flex-1 flex flex-col justify-center">
                        {chartData.slice(0, 5).map((d, idx) => {
                            const maxCount = chartData[0]?.count || 1;
                            const barWidthScale = (d.count / maxCount) * 100;
                            return (
                                <div key={idx} className="space-y-1">
                                    <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
                                        <span className="truncate max-w-[150px]">{d.name}</span>
                                        <span className="font-black">
                                            {d.count} <span className="text-slate-400 font-normal">({d.percentage}%)</span>
                                        </span>
                                    </div>
                                    <div className="h-4 bg-slate-50 dark:bg-slate-800 rounded-lg overflow-hidden flex">
                                        <div
                                            className="h-full rounded-lg transition-all duration-1000 ease-out"
                                            style={{ width: `${barWidthScale}%`, backgroundColor: d.color }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Top 5 Submotivos */}
                <div className={`bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border shadow-sm flex flex-col justify-between min-h-[350px] transition-colors ${isAll ? 'border-indigo-200 dark:border-indigo-700/40' : 'border-slate-100 dark:border-slate-800'}`}>
                    <div className="w-full flex items-center gap-3 mb-6">
                        <div className="p-2.5 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600">
                            <BarChart3 size={18} />
                        </div>
                        <div>
                            <h3 className="font-black text-slate-800 dark:text-white text-sm tracking-tight">Top 5 Motivos</h3>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                {isAll ? 'Consolidado — Todo o histórico' : 'Motivos mais recorrentes'}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4 flex-1 flex flex-col justify-center">
                        {submotivoRanking.length === 0 ? (
                            <p className="text-xs text-slate-400 font-bold text-center py-8">Nenhum motivo registrado no período</p>
                        ) : (
                            submotivoRanking.map((d, idx) => {
                                const maxCount = submotivoRanking[0]?.count || 1;
                                const barWidthScale = (d.count / maxCount) * 100;
                                const BAR_COLORS = ['bg-indigo-500', 'bg-violet-500', 'bg-purple-400', 'bg-pink-500', 'bg-cyan-500'];
                                const barColor = BAR_COLORS[idx] ?? 'bg-slate-400';
                                return (
                                    <div key={idx} className="space-y-1">
                                        <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
                                            <span className="truncate max-w-[155px]" title={d.name}>{d.name}</span>
                                            <span className="font-black">
                                                {d.count} <span className="text-slate-400 font-normal">({d.percentage}%)</span>
                                            </span>
                                        </div>
                                        <div className="h-4 bg-slate-50 dark:bg-slate-800 rounded-lg overflow-hidden flex">
                                            <div
                                                className={`h-full rounded-lg transition-all duration-1000 ease-out ${barColor}`}
                                                style={{ width: `${barWidthScale}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};
