
import React from 'react';
import { ManualEntryData } from '../types';
import { BarChart as BarIcon, Target, CheckCircle2, Palette } from 'lucide-react';

interface Props {
  data: ManualEntryData;
}

export const PerformanceChart: React.FC<Props> = ({ data }) => {
  const experts = Object.keys(data).sort();
  const activeExperts = experts.filter(e => (data[e].tratado > 0 || data[e].finalizado > 0 || (data[e].goal || 0) > 0));

  let maxVal = 0;
  activeExperts.forEach(e => {
    const goal = data[e].goal || 0;
    maxVal = Math.max(maxVal, data[e].tratado, data[e].finalizado, goal);
  });
  
  const safeMax = maxVal === 0 ? 10 : maxVal * 1.2;

  if (activeExperts.length === 0) return null;

  return (
    <div className="bg-white shadow-2xl rounded-[2.5rem] p-8 border border-slate-100 mt-12">
      <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-6">
        <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
            <Palette className="w-6 h-6 text-orange-600" />
            Visualização de Produtividade <span className="text-orange-600">Suvinil</span>
        </h3>
        <div className="flex gap-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <div className="flex items-center gap-2"><div className="w-4 h-4 bg-yellow-400 rounded-lg shadow-sm"></div><span>Tratativa</span></div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 bg-orange-600 rounded-lg shadow-sm"></div><span>Finalizado</span></div>
            <div className="flex items-center gap-2"><div className="w-1.5 h-4 bg-slate-900 rounded-full"></div><span>Meta</span></div>
        </div>
      </div>

      <div className="space-y-8">
        {activeExperts.map(expert => {
            const tratado = data[expert].tratado;
            const finalizado = data[expert].finalizado;
            const goal = data[expert].goal || 0;
            // Meta Batida = (Tratado + Finalizado) >= Goal
            const totalProd = tratado + finalizado;
            const metGoal = goal > 0 && totalProd >= goal;
            
            // Porcentagem de conclusão agora é sobre o total produzido
            const completionPercent = goal > 0 ? Math.round((totalProd / goal) * 100) : 0;

            const goalPercent = Math.min((goal / safeMax) * 100, 100);
            const tratadoPercent = Math.min((tratado / safeMax) * 100, 100);
            const finalizadoPercent = Math.min((finalizado / safeMax) * 100, 100);

            return (
                <div key={expert} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 group">
                    <div className="w-full sm:w-56 text-sm font-black text-slate-800 truncate flex items-center gap-3">
                        {metGoal ? <CheckCircle2 className="w-5 h-5 text-orange-600" /> : <Target className="w-5 h-5 text-slate-300" />}
                        <span className={metGoal ? 'text-orange-700' : ''}>{expert}</span>
                    </div>
                    
                    <div className="flex-1 w-full flex flex-col gap-2 relative pt-6 pb-2">
                        {goal > 0 && (
                             <div 
                                style={{ left: `${goalPercent}%` }}
                                className="absolute top-0 bottom-0 w-0.5 bg-slate-900/10 z-10 flex flex-col justify-start"
                             >
                                <div className="w-1 h-full bg-slate-900 rounded-full opacity-20 group-hover:opacity-40 transition-opacity"></div>
                                <span className="text-[10px] text-white font-black -ml-3 -mt-6 bg-slate-900 px-2 py-0.5 rounded-lg shadow-lg z-20">
                                    {goal}
                                </span>
                             </div>
                        )}

                        {/* Barra Tratado (Amarelo) */}
                        <div className="h-4 w-full bg-slate-50 rounded-2xl overflow-hidden flex items-center shadow-inner">
                            <div 
                                style={{ width: `${Math.max(tratadoPercent, 1)}%` }}
                                className={`h-full rounded-2xl transition-all duration-1000 ease-out flex items-center px-3 ${tratado > 0 ? 'bg-yellow-400 shadow-lg' : 'bg-transparent'}`}
                            >
                                {tratado > 0 && tratadoPercent > 5 && <span className="text-[9px] font-black text-yellow-900">{tratado}</span>}
                            </div>
                        </div>

                        {/* Barra Finalizado (Laranja Suvinil) */}
                        <div className="h-6 w-full bg-slate-50 rounded-2xl overflow-hidden flex items-center shadow-inner">
                            <div 
                                style={{ width: `${Math.max(finalizadoPercent, 1)}%` }}
                                className={`h-full rounded-2xl transition-all duration-1000 delay-100 ease-out flex items-center px-3 ${
                                    finalizado > 0 
                                      ? (metGoal ? 'bg-gradient-to-r from-orange-400 to-orange-700 shadow-xl' : 'bg-orange-500 shadow-lg') 
                                      : 'bg-transparent'
                                }`}
                            >
                                {finalizado > 0 && finalizadoPercent > 5 && <span className={`text-[10px] font-black text-white`}>{finalizado}</span>}
                            </div>
                            
                            {/* Porcentagem de Conclusão da Meta */}
                            {goal > 0 && (
                              <span className={`ml-4 text-[11px] font-black italic tracking-tighter ${metGoal ? 'text-orange-600 animate-pulse' : 'text-slate-400'}`}>
                                {completionPercent}% {metGoal ? 'BATIDA!' : ''}
                              </span>
                            )}
                        </div>
                    </div>
                </div>
            )
        })}
      </div>
    </div>
  );
};
