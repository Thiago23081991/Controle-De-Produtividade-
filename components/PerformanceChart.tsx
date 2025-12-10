import React from 'react';
import { ManualEntryData } from '../types';
import { BarChart as BarIcon, Target } from 'lucide-react';

interface Props {
  data: ManualEntryData;
}

export const PerformanceChart: React.FC<Props> = ({ data }) => {
  const experts = Object.keys(data).sort();
  
  // Filter only experts with some activity OR a set goal
  const activeExperts = experts.filter(e => (data[e].tratado > 0 || data[e].finalizado > 0 || (data[e].goal || 0) > 0));

  // Find maximum value to normalize bar widths
  let maxVal = 0;
  activeExperts.forEach(e => {
    // Include goal in max calculation so the goal marker fits
    const goal = data[e].goal || 0;
    maxVal = Math.max(maxVal, data[e].tratado, data[e].finalizado, goal);
  });
  
  // Avoid division by zero and provide some headroom (10%)
  const safeMax = maxVal === 0 ? 10 : maxVal * 1.1;

  if (activeExperts.length === 0) {
    return null;
  }

  return (
    <div className="bg-white shadow-xl rounded-xl p-6 border border-gray-200 mt-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <BarIcon className="w-5 h-5 text-indigo-600" />
            Visualização de Performance vs Metas
        </h3>
        <div className="flex gap-4 text-xs font-medium">
            <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-yellow-400 rounded-sm"></div>
                <span className="text-gray-600">Tratado</span>
            </div>
            <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                <span className="text-gray-600">Finalizado</span>
            </div>
            <div className="flex items-center gap-1.5">
                <div className="w-1 h-3 bg-indigo-500 rounded-sm"></div>
                <span className="text-gray-600">Meta</span>
            </div>
        </div>
      </div>

      <div className="space-y-5">
        {activeExperts.map(expert => {
            const tratado = data[expert].tratado;
            const finalizado = data[expert].finalizado;
            const goal = data[expert].goal || 0;
            const metGoal = goal > 0 && finalizado >= goal;

            // Calculate percentages with explicit clamping to 100%
            const goalPercent = Math.min((goal / safeMax) * 100, 100);
            const tratadoPercent = Math.min((tratado / safeMax) * 100, 100);
            const finalizadoPercent = Math.min((finalizado / safeMax) * 100, 100);

            return (
                <div key={expert} className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4">
                    <div className="w-full sm:w-48 text-xs font-semibold text-gray-700 truncate pt-1 flex items-center gap-1" title={expert}>
                        {expert}
                        {metGoal && <Target className="w-3 h-3 text-indigo-600" />}
                    </div>
                    <div className="flex-1 w-full flex flex-col gap-2 border-l border-gray-100 pl-2 sm:pl-0 sm:border-0 relative">
                        
                        {/* Goal Marker Line (Absolute positioned over the bars area) */}
                        {goal > 0 && (
                             <div 
                                style={{ left: `${goalPercent}%` }}
                                className="absolute top-0 bottom-0 w-px border-l-2 border-dashed border-indigo-300 z-10 flex flex-col justify-end"
                                title={`Meta: ${goal}`}
                             >
                                <span className="text-[9px] text-indigo-500 font-bold -ml-1.5 -mb-4 bg-white px-0.5 rounded">
                                    {goal}
                                </span>
                             </div>
                        )}

                        {/* Tratado Bar */}
                        <div className="flex items-center gap-2 h-5 w-full z-0">
                            <div 
                                style={{ width: `${Math.max(tratadoPercent, 1)}%` }}
                                className={`h-full rounded-r-md transition-all duration-700 ease-out relative flex items-center ${tratado > 0 ? 'bg-yellow-400' : 'bg-gray-100 w-px'}`}
                            >
                                {tratado > 0 && <span className="absolute right-2 text-[10px] font-bold text-yellow-900 leading-none">{tratado}</span>}
                            </div>
                        </div>
                        {/* Finalizado Bar */}
                        <div className="flex items-center gap-2 h-5 w-full z-0">
                            <div 
                                style={{ width: `${Math.max(finalizadoPercent, 1)}%` }}
                                className={`h-full rounded-r-md transition-all duration-700 ease-out relative flex items-center ${
                                    finalizado > 0 
                                      ? (metGoal ? 'bg-indigo-500' : 'bg-green-500') 
                                      : 'bg-gray-100 w-px'
                                }`}
                            >
                                {finalizado > 0 && <span className={`absolute right-2 text-[10px] font-bold leading-none ${metGoal ? 'text-white' : 'text-green-900'}`}>{finalizado}</span>}
                            </div>
                        </div>
                    </div>
                </div>
            )
        })}
      </div>
    </div>
  );
};