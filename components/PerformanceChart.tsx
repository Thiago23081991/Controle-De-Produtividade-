import React from 'react';
import { ManualEntryData } from '../types';
import { BarChart as BarIcon } from 'lucide-react';

interface Props {
  data: ManualEntryData;
}

export const PerformanceChart: React.FC<Props> = ({ data }) => {
  const experts = Object.keys(data).sort();
  
  // Filter only experts with some activity
  const activeExperts = experts.filter(e => (data[e].tratado > 0 || data[e].finalizado > 0));

  // Find maximum value to normalize bar widths
  let maxVal = 0;
  activeExperts.forEach(e => {
    maxVal = Math.max(maxVal, data[e].tratado, data[e].finalizado);
  });
  
  // Avoid division by zero and provide some headroom
  const safeMax = maxVal === 0 ? 10 : maxVal;

  if (activeExperts.length === 0) {
    return null;
  }

  return (
    <div className="bg-white shadow-xl rounded-xl p-6 border border-gray-200 mt-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <BarIcon className="w-5 h-5 text-indigo-600" />
            Visualização de Performance
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
        </div>
      </div>

      <div className="space-y-5">
        {activeExperts.map(expert => {
            const tratado = data[expert].tratado;
            const finalizado = data[expert].finalizado;

            return (
                <div key={expert} className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4">
                    <div className="w-full sm:w-48 text-xs font-semibold text-gray-700 truncate pt-1" title={expert}>
                        {expert}
                    </div>
                    <div className="flex-1 w-full flex flex-col gap-2 border-l border-gray-100 pl-2 sm:pl-0 sm:border-0">
                        {/* Tratado Bar */}
                        <div className="flex items-center gap-2 h-5 w-full">
                            <div 
                                style={{ width: `${Math.max((tratado / safeMax) * 100, 1)}%` }}
                                className={`h-full rounded-r-md transition-all duration-700 ease-out relative flex items-center ${tratado > 0 ? 'bg-yellow-400' : 'bg-gray-100 w-px'}`}
                            >
                                {tratado > 0 && <span className="absolute right-2 text-[10px] font-bold text-yellow-900 leading-none">{tratado}</span>}
                            </div>
                        </div>
                        {/* Finalizado Bar */}
                        <div className="flex items-center gap-2 h-5 w-full">
                            <div 
                                style={{ width: `${Math.max((finalizado / safeMax) * 100, 1)}%` }}
                                className={`h-full rounded-r-md transition-all duration-700 ease-out relative flex items-center ${finalizado > 0 ? 'bg-green-500' : 'bg-gray-100 w-px'}`}
                            >
                                {finalizado > 0 && <span className="absolute right-2 text-[10px] font-bold text-green-900 leading-none">{finalizado}</span>}
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