import React, { useCallback } from 'react';
import { Users, AlertCircle } from 'lucide-react';
import { useProductivity } from '../contexts/ProductivityContext';
import { useAuth } from '../contexts/AuthContext';
import { ProductivityTableRow } from './ProductivityTableRow';

const SkeletonRow = () => (
  <tr className="animate-pulse">
    <td className="p-8">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-2xl bg-slate-200"></div>
        <div className="space-y-2">
          <div className="h-3 w-32 bg-slate-200 rounded"></div>
          <div className="h-2 w-20 bg-slate-200 rounded"></div>
        </div>
      </div>
    </td>
    <td className="p-8"><div className="h-10 w-full bg-slate-100 rounded-xl"></div></td>
    <td className="p-8"><div className="h-10 w-full bg-slate-100 rounded-xl"></div></td>
    <td className="p-8"><div className="h-8 w-12 bg-slate-100 rounded-lg mx-auto"></div></td>
  </tr>
);

export const ProductivityTable: React.FC = () => {
  const { isAdmin } = useAuth();
  const {
    data, visibleExperts, isTableLoading, isSyncing, handleInputChange,
    expertMap, historicalAverages, tempMessages, setTempMessages,
    handleSendMessage, selectedSupervisor, viewMode, syncDaily
  } = useProductivity();

  const handleTempMessageChange = useCallback((expert: string, value: string) => {
    setTempMessages(expert, value);
  }, [setTempMessages]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 transition-colors duration-300">
      <div className="p-8 border-b border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/30 flex items-center justify-between">
        <h2 className="text-sm font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-2">
          <Users size={16} />
          {viewMode === 'monthly' ? 'Painel de Lançamento Mensal' : 'Painel de Lançamento Diário'}
        </h2>

        <div className="flex items-center gap-4">
          {isAdmin && viewMode === 'monthly' && (
            <button
              onClick={syncDaily}
              className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
            >
              <Users size={12} />
              Importar do Diário
            </button>
          )}
          {isSyncing && !isTableLoading && <div className="text-[9px] font-black text-orange-600 dark:text-orange-500 animate-pulse uppercase tracking-[0.2em]">Sincronizando Dados...</div>}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left table-fixed min-w-[1000px]">
          <thead className="bg-slate-50/50 dark:bg-slate-800/50 text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
            <tr>
              <th className="p-8 w-[25%]">Expert / Time</th>
              <th className="p-8 text-center w-[10%]">Meta</th>
              <th className="p-8 text-center w-[10%]">Tratativa</th>
              <th className="p-8 text-center w-[10%]">Finalizado</th>
              <th className="p-8 text-center w-[8%]">Eficiência</th>
              {isAdmin && <th className="p-8 w-[15%]">Observação</th>}
              {isAdmin && viewMode === 'daily' && <th className="p-8 w-[22%]">Chat Direto</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
            {isTableLoading ? (
              <>
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
              </>
            ) : visibleExperts.length > 0 ? visibleExperts.map((name) => (
              <ProductivityTableRow
                key={name}
                name={name}
                entry={data[name]}
                expertInfo={expertMap[name]}
                isAdmin={isAdmin}
                viewMode={viewMode}
                historicalAverage={historicalAverages[name]}
                tempMessage={tempMessages[name]}
                selectedSupervisor={selectedSupervisor}
                onInputChange={handleInputChange}
                onSendMessage={handleSendMessage}
                onTempMessageChange={handleTempMessageChange}
              />
            )) : (
              <tr>
                <td colSpan={isAdmin ? 7 : 4} className="p-20 text-center">
                  <AlertCircle size={40} className="mx-auto text-slate-100 dark:text-slate-800 mb-4" />
                  <p className="text-slate-400 dark:text-slate-600 font-black uppercase text-[10px] tracking-widest italic">Nenhum registro localizado</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
