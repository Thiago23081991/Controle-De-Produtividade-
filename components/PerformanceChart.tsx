import React from 'react';
import { ManualEntryData } from '../types';
import { LayoutGrid, TrendingUp, CheckCircle2, AlertCircle, User, Award, Flame, Target } from 'lucide-react';

interface Props {
  data: ManualEntryData;
}

export const PerformanceChart: React.FC<Props> = ({ data }) => {
  const experts = Object.keys(data).sort();

  // Filter active experts (anyone with activity or a goal set)
  const activeExperts = experts.filter(e => {
    const d = data[e];
    return d.tratado > 0 || d.finalizado > 0 || (d.goal || 0) > 0;
  });

  if (activeExperts.length === 0) return null;

  return (
    <div className="space-y-8 mt-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">

      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100">
        <div className="flex items-center gap-6 w-full md:w-auto">
          <div className="bg-orange-100 p-4 rounded-3xl shadow-inner shadow-orange-200">
            <LayoutGrid className="text-orange-600 w-8 h-8" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-800 tracking-tight leading-none mb-1">Painel de Performance</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Monitoramento Executivo</p>
          </div>
        </div>

        {/* Visual Legend */}
        <div className="flex flex-wrap justify-center gap-3 text-[10px] font-black uppercase tracking-widest bg-slate-50 p-2 rounded-2xl border border-slate-100 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl shadow-sm border border-slate-100 text-slate-400">
            <div className="w-2 h-2 rounded-full bg-slate-300"></div> Em Andamento
          </div>
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl shadow-sm border border-yellow-100 text-yellow-600">
            <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></div> Quase Lá (>80%)
          </div>
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl shadow-sm border border-green-100 text-green-600">
            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div> Meta Batida
          </div>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {activeExperts.map((expert, index) => {
          const { tratado, finalizado, goal } = data[expert];
          const total = tratado + finalizado;
          const safeGoal = goal > 0 ? goal : 100; // Prevent div by zero
          const efficiency = goal > 0 ? Math.round((total / goal) * 100) : (total > 0 ? 100 : 0);

          // Card Status Logic
          let statusColor = "bg-white border-slate-100";
          let textColor = "text-slate-800";
          let icon = <User className="text-slate-300 w-12 h-12" strokeWidth={1.5} />;
          let progressBarColor = "bg-slate-200";
          let shadow = "shadow-sm hover:shadow-lg";

          if (goal > 0 && efficiency >= 100) {
            statusColor = "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200";
            textColor = "text-green-900";
            icon = <Award className="text-green-500 w-12 h-12 drop-shadow-sm" strokeWidth={1.5} />;
            progressBarColor = "bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.4)]";
            shadow = "shadow-lg shadow-green-100/50 hover:shadow-xl hover:shadow-green-200/50 hover:-translate-y-1";
          } else if (goal > 0 && efficiency >= 80) {
            statusColor = "bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200";
            textColor = "text-yellow-900";
            icon = <Flame className="text-yellow-500 w-12 h-12 animate-pulse" strokeWidth={1.5} />;
            progressBarColor = "bg-yellow-400";
            shadow = "shadow-lg shadow-yellow-100/50 hover:shadow-xl hover:shadow-yellow-200/50 hover:-translate-y-1";
          } else if (goal > 0 && efficiency < 50) {
            // Low performance indicator (subtle)
            statusColor = "bg-white border-red-100";
            icon = <AlertCircle className="text-red-200 w-12 h-12" strokeWidth={1.5} />;
          }

          return (
            <div
              key={expert}
              className={`relative p-6 rounded-[2rem] border transition-all duration-500 group overflow-hidden ${statusColor} ${shadow}`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Background Decoration */}
              <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:rotate-12 duration-700">
                {icon}
              </div>

              {/* Header: Identity */}
              <div className="flex items-center gap-4 mb-6 relative z-10">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black shadow-inner ${efficiency >= 100 ? 'bg-green-200 text-green-700' : 'bg-slate-100 text-slate-400'}`}>
                  {expert.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={`font-black text-sm truncate ${textColor}`}>{expert}</h4>
                  <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                    {efficiency >= 100 ? <span className="text-green-600 flex items-center gap-1"><CheckCircle2 size={10} /> Meta Batida</span> : <span>Em Andamento</span>}
                  </div>
                </div>
              </div>

              {/* Body: Big Metrics */}
              <div className="relative z-10 text-center py-2">
                <div className="flex items-baseline justify-center gap-1 mb-2">
                  <span className={`text-5xl font-black tracking-tighter ${efficiency >= 100 ? 'text-green-600' : (efficiency >= 80 ? 'text-yellow-500' : 'text-slate-300')}`}>
                    {efficiency}%
                  </span>
                </div>

                {/* Progress Bar Container */}
                <div className="h-3 w-full bg-white/50 rounded-full overflow-hidden shadow-inner border border-white/20 mb-1">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${progressBarColor}`}
                    style={{ width: `${Math.min(efficiency, 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[9px] font-black uppercase text-slate-400 px-1">
                  <span>0%</span>
                  <span>Meta</span>
                </div>
              </div>

              {/* Footer: Details */}
              <div className="mt-6 pt-4 border-t border-black/5 grid grid-cols-3 gap-2 text-center relative z-10">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Tratado</div>
                  <div className="text-lg font-black text-slate-700">{tratado}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Final</div>
                  <div className="text-lg font-black text-orange-600">{finalizado}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Meta</div>
                  <div className="text-lg font-black text-slate-400">{goal || '-'}</div>
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};
