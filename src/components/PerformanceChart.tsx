import React from 'react';
import { ManualEntryData } from '../types';
import { LayoutGrid, CheckCircle2, AlertCircle, Award, Flame, TrendingUp } from 'lucide-react';

interface Props {
  data: ManualEntryData;
}

export const PerformanceChart: React.FC<Props> = ({ data }) => {
  const experts = Object.keys(data).sort();

  const activeExperts = experts.filter(e => {
    const d = data[e];
    return d.tratado > 0 || d.finalizado > 0 || (d.goal || 0) > 0;
  });

  if (activeExperts.length === 0) return null;

  return (
    <div className="space-y-6 mt-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">

      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 px-8 py-5 rounded-[2.5rem] shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 border border-slate-100 dark:border-slate-800 transition-all duration-300">
        <div className="flex items-center gap-4">
          <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-2xl">
            <LayoutGrid className="text-orange-600 dark:text-orange-400 w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 tracking-tight leading-none">Painel de Performance</h3>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Monitoramento Executivo</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 text-[9px] font-black uppercase tracking-widest">
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-700 text-slate-400">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-500" /> Em Andamento
          </div>
          <div className="flex items-center gap-1.5 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-1.5 rounded-xl border border-yellow-100 dark:border-yellow-900/30 text-yellow-600 dark:text-yellow-400">
            <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" /> Quase Lá (&gt;80%)
          </div>
          <div className="flex items-center gap-1.5 bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-xl border border-green-100 dark:border-green-900/30 text-green-600 dark:text-green-400">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" /> Meta Batida
          </div>
        </div>
      </div>

      {/* Lista em linhas */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 border border-slate-100 dark:border-slate-800 overflow-hidden">

        {/* Cabeçalho da tabela */}
        <div className="flex items-center gap-3 px-6 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
          <div className="w-48 flex-shrink-0">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Expert</span>
          </div>
          <div className="w-24 flex-shrink-0 text-center">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Eficiência</span>
          </div>
          <div className="flex-1">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Progresso</span>
          </div>
          <div className="w-16 flex-shrink-0 text-center">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Tratado</span>
          </div>
          <div className="w-16 flex-shrink-0 text-center">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Final</span>
          </div>
          <div className="w-16 flex-shrink-0 text-center">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Meta</span>
          </div>
          <div className="w-20 flex-shrink-0 text-center">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Status</span>
          </div>
        </div>

        {/* Linhas */}
        <div className="divide-y divide-slate-50 dark:divide-slate-800">
          {activeExperts.map((expert, index) => {
            const { tratado, finalizado, goal } = data[expert];
            const total = tratado + finalizado;
            const efficiency = goal > 0 ? Math.round((total / goal) * 100) : (total > 0 ? 100 : 0);

            const isGoalHit = goal > 0 && efficiency >= 100;
            const isNearGoal = goal > 0 && efficiency >= 80 && efficiency < 100;
            const isLow = goal > 0 && efficiency < 50;

            const rowBg = isGoalHit
              ? 'bg-green-50/40 dark:bg-green-900/10 hover:bg-green-50 dark:hover:bg-green-900/20'
              : isNearGoal
              ? 'bg-yellow-50/40 dark:bg-yellow-900/10 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
              : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/30';

            const effTextColor = isGoalHit
              ? 'text-green-600 dark:text-green-400'
              : isNearGoal
              ? 'text-yellow-500 dark:text-yellow-400'
              : 'text-slate-400 dark:text-slate-500';

            const progressColor = isGoalHit
              ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]'
              : isNearGoal
              ? 'bg-yellow-400'
              : isLow
              ? 'bg-red-300 dark:bg-red-700'
              : 'bg-slate-300 dark:bg-slate-600';

            const StatusIcon = isGoalHit ? Award : isNearGoal ? Flame : isLow ? AlertCircle : TrendingUp;
            const statusIconColor = isGoalHit
              ? 'text-green-500'
              : isNearGoal
              ? 'text-yellow-500 animate-pulse'
              : isLow
              ? 'text-red-300'
              : 'text-slate-300 dark:text-slate-600';

            const avatarBg = isGoalHit
              ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400';

            return (
              <div
                key={expert}
                className={`flex items-center gap-3 px-6 py-3.5 transition-colors duration-150 ${rowBg}`}
                style={{ animationDelay: `${index * 40}ms` }}
              >
                {/* Avatar + Nome */}
                <div className="flex items-center gap-3 w-48 flex-shrink-0">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black flex-shrink-0 ${avatarBg}`}>
                    {expert.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="font-black text-xs text-slate-800 dark:text-slate-200 truncate" title={expert}>
                      {expert.split(' ').slice(0, 2).join(' ')}
                    </div>
                    <div className={`text-[9px] font-bold uppercase flex items-center gap-1 ${isGoalHit ? 'text-green-500' : 'text-slate-400'}`}>
                      {isGoalHit && <CheckCircle2 size={8} />}
                      {isGoalHit ? 'Meta Batida' : isNearGoal ? 'Quase lá' : 'Em andamento'}
                    </div>
                  </div>
                </div>

                {/* % */}
                <div className="w-24 flex-shrink-0 text-center">
                  <span className={`text-2xl font-black tracking-tight ${effTextColor}`}>
                    {efficiency}%
                  </span>
                </div>

                {/* Barra de progresso */}
                <div className="flex-1">
                  <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ease-out ${progressColor}`}
                      style={{ width: `${Math.min(efficiency, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[8px] font-black text-slate-300 dark:text-slate-600 px-0.5 mt-0.5">
                    <span>0%</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* Tratado */}
                <div className="w-16 flex-shrink-0 text-center">
                  <span className="text-sm font-black text-slate-700 dark:text-slate-300">{tratado}</span>
                </div>

                {/* Finalizado */}
                <div className="w-16 flex-shrink-0 text-center">
                  <span className="text-sm font-black text-orange-600 dark:text-orange-400">{finalizado}</span>
                </div>

                {/* Meta */}
                <div className="w-16 flex-shrink-0 text-center">
                  <span className="text-sm font-black text-slate-400 dark:text-slate-600">{goal || '—'}</span>
                </div>

                {/* Ícone de status */}
                <div className="w-20 flex-shrink-0 flex justify-center">
                  <StatusIcon size={20} className={statusIconColor} strokeWidth={1.5} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
