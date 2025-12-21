import React from 'react';
import { ManualEntryData } from '../types';
import { BarChart as BarIcon, Target, CheckCircle2 } from 'lucide-react';

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
  
  const safeMax = maxVal === 0 ? 10 : maxVal * 1.2; // Aumentado o respiro para caber as porcentagens

  if (activeExperts.length === 0) return null;

  return (
    <div className="bg-white shadow-xl rounded-xl p-6 border border-gray-200 mt-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <BarIcon className="w-5 h-5 text-indigo-600" />
            Visualização de Performance vs Metas
        </h3>
        <div className="flex gap-4 text-xs font-medium">
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-yellow-400 rounded-sm"></div><span className="text-gray-600">Tratado</span></div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-green-500 rounded-sm"></div><span className="text-gray-600">Finalizado</span></div>
            <div className="flex items-center gap-1.5"><div className="w-1 h-3 bg-indigo-500 border-l-2 border-dashed border-indigo-300 rounded-sm"></div><span className="text-gray-600">Meta</span></div>
        </div>
      </div>

      <div className="space-y-6">
        {activeExperts.map(expert => {
            const tratado = data[expert].tratado;
            const finalizado = data[expert].finalizado;
            const goal = data[expert].goal || 0;
            const metGoal = goal > 0 && finalizado >= goal;
            
            const completionPercent = goal > 0 ? Math.round((finalizado / goal) * 100) : 0;

            const goalPercent = Math.min((goal / safeMax) * 100, 100);
            const tratadoPercent = Math.min((tratado / safeMax) * 100, 100);
            const finalizadoPercent = Math.min((finalizado / safeMax) * 100, 100);

            return (
                <div key={expert} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <div className="w-full sm:w-56 text-xs font-bold text-gray-700 truncate flex items-center gap-2">
                        {metGoal ? <CheckCircle2 className="w-4 h-4 text-indigo-600" /> : <Target className="w-4 h-4 text-gray-400" />}
                        <span className={metGoal ? 'text-indigo-700' : ''}>{expert}</span>
                    </div>
                    
                    <div className="flex-1 w-full flex flex-col gap-1.5 relative pt-4">
                        {goal > 0 && (
                             <div 
                                style={{ left: `${goalPercent}%` }}
                                className="absolute top-0 bottom-0 w-px border-l-2 border-dashed border-indigo-400/50 z-10 flex flex-col justify-start"
                             >
                                <span className="text-[10px] text-indigo-600 font-extrabold -ml-1.5 -mt-4 bg-white px-1 rounded shadow-sm border border-indigo-100">
                                    {goal}
                                </span>
                             </div>
                        )}

                        {/* Barra Tratado */}
                        <div className="h-4 w-full bg-gray-50 rounded-r-md overflow-hidden flex items-center">
                            <div 
                                style={{ width: `${Math.max(tratadoPercent, 1)}%` }}
                                className={`h-full rounded-r-md transition-all duration-1000 ease-out flex items-center px-2 ${tratado > 0 ? 'bg-yellow-400' : 'bg-transparent'}`}
                            >
                                {tratado > 0 && tratadoPercent > 5 && <span className="text-[9px] font-bold text-yellow-900">{tratado}</span>}
                            </div>
                        </div>

                        {/* Barra Finalizado */}
                        <div className="h-4 w-full bg-gray-50 rounded-r-md overflow-hidden flex items-center">
                            <div 
                                style={{ width: `${Math.max(finalizadoPercent, 1)}%` }}
                                className={`h-full rounded-r-md transition-all duration-1000 delay-100 ease-out flex items-center px-2 ${
                                    finalizado > 0 
                                      ? (metGoal ? 'bg-gradient-to-r from-indigo-400 to-indigo-600 shadow-sm' : 'bg-green-500') 
                                      : 'bg-transparent'
                                }`}
                            >
                                {finalizado > 0 && finalizadoPercent > 5 && <span className={`text-[9px] font-bold ${metGoal ? 'text-white' : 'text-green-900'}`}>{finalizado}</span>}
                            </div>
                            
                            {/* Porcentagem de Conclusão da Meta */}
                            {goal > 0 && (
                              <span className={`ml-3 text-[10px] font-black italic tracking-tighter ${metGoal ? 'text-indigo-600 animate-pulse' : 'text-gray-400'}`}>
                                {completionPercent}%
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