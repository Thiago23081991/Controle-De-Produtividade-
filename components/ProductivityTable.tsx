import React from 'react';
import { Users, AlertCircle, MessageSquare, Send } from 'lucide-react';
import { ManualEntryData, ExpertInfo } from '../types';

interface ProductivityTableProps {
  data: ManualEntryData;
  visibleExperts: string[];
  isAdmin: boolean;
  isTableLoading: boolean;
  isSyncing: boolean;
  handleInputChange: (expert: string, field: 'tratado' | 'finalizado' | 'observacao' | 'goal', value: string) => void;
  expertMap: Record<string, ExpertInfo>;
  historicalAverages: Record<string, number>;
  tempMessages: Record<string, string>;
  setTempMessages: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  handleSendMessage: (expert: string) => void;
  selectedSupervisor: string;
}

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

export const ProductivityTable: React.FC<ProductivityTableProps> = ({
  data,
  visibleExperts,
  isAdmin,
  isTableLoading,
  isSyncing,
  handleInputChange,
  expertMap,
  historicalAverages,
  tempMessages,
  setTempMessages,
  handleSendMessage,
  selectedSupervisor
}) => {
  return (
    <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100">
      <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
        <h2 className="text-sm font-black uppercase tracking-widest text-slate-500 flex items-center gap-2"><Users size={16} /> Painel de Lançamento</h2>
        {isSyncing && !isTableLoading && <div className="text-[9px] font-black text-orange-600 animate-pulse uppercase tracking-[0.2em]">Sincronizando Dados...</div>}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left table-fixed min-w-[1000px]">
          <thead className="bg-slate-50/50 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
            <tr>
              <th className="p-8 w-[25%]">Expert / Time</th>
              <th className="p-8 text-center w-[10%]">Meta</th>
              <th className="p-8 text-center w-[10%]">Tratativa</th>
              <th className="p-8 text-center w-[10%]">Finalizado</th>
              <th className="p-8 text-center w-[8%]">Eficiência</th>
              {isAdmin && <th className="p-8 w-[15%]">Observação</th>}
              {isAdmin && <th className="p-8 w-[22%]">Chat Direto</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {isTableLoading ? (
              <>
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
              </>
            ) : visibleExperts.length > 0 ? visibleExperts.map((name, i) => {
              const entry = data[name];
              if (!entry) return null; // Safety check

              const total = (entry.tratado || 0) + (entry.finalizado || 0);
              // Eficiência: (Tratado + Finalizado) / Meta
              const eff = entry.goal > 0 ? Math.round((total / entry.goal) * 100) : 0;
              const avg = historicalAverages[name] || 0;

              return (
                <tr key={name} className="hover:bg-slate-50/40 transition-all duration-300">
                  <td className="p-8">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-orange-600 text-white flex items-center justify-center font-black text-xs shadow-lg shadow-orange-600/10">
                        {name.charAt(0)}
                      </div>
                      <div className="truncate">
                        <div className="font-black text-slate-800 text-sm truncate">{name}</div>
                        <div className="text-[9px] font-black text-slate-400 uppercase mt-0.5">{expertMap[name]?.supervisor || 'Geral'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-8">
                    <div className="relative">
                      <input
                        type="number"
                        value={entry.goal === 0 ? '' : entry.goal}
                        disabled={!isAdmin}
                        onChange={(e) => handleInputChange(name, 'goal', e.target.value)}
                        className={`w-full text-center font-black text-orange-600 bg-orange-50/50 rounded-xl p-3 border-2 border-transparent focus:border-orange-200 outline-none disabled:opacity-100 disabled:bg-transparent disabled:text-slate-500`}
                        placeholder="-"
                      />
                      {isAdmin && avg > 0 && <div className="text-[8px] text-center text-slate-400 font-bold mt-1 uppercase tracking-wider" title="Média dos últimos 30 dias">Média: {avg}</div>}
                    </div>
                  </td>
                  <td className="p-8">
                    <input type="number" value={entry.tratado === 0 ? '' : entry.tratado} onChange={(e) => handleInputChange(name, 'tratado', e.target.value)} className="w-full text-center font-bold text-slate-600 bg-slate-50 rounded-xl p-3 border-2 border-transparent focus:border-slate-200 outline-none" placeholder="0" />
                  </td>
                  <td className="p-8">
                    <input type="number" value={entry.finalizado === 0 ? '' : entry.finalizado} onChange={(e) => handleInputChange(name, 'finalizado', e.target.value)} className="w-full text-center font-black text-green-600 bg-green-50 rounded-xl p-3 border-2 border-transparent focus:border-green-200 outline-none shadow-sm" placeholder="0" />
                  </td>
                  <td className="p-8 text-center">
                    <span className={`text-xs font-black p-2 rounded-lg ${eff >= 100 ? 'bg-orange-600 text-white shadow-lg' : 'text-slate-400'}`}>{eff}%</span>
                  </td>
                  {isAdmin && (
                    <td className="p-8">
                      <div className="relative group/obs">
                        {entry.isUrgent && (
                          <div className="absolute -top-3 -right-2 bg-red-600 text-white p-1.5 rounded-full shadow-lg z-10 animate-bounce" title="URGENTE: Observação Prioritária">
                            <AlertCircle size={10} strokeWidth={3} />
                          </div>
                        )}
                        <input
                          type="text"
                          value={entry.observacao || ''}
                          onChange={(e) => handleInputChange(name, 'observacao', e.target.value)}
                          className={`w-full p-3 rounded-xl text-[10px] font-bold outline-none border-2 transition-all placeholder:text-slate-300 ${entry.isUrgent
                            ? 'bg-red-50 border-red-200 text-red-800 focus:border-red-300 placeholder:text-red-300'
                            : 'bg-slate-50 border-transparent focus:border-slate-200'
                            }`}
                          placeholder={entry.isUrgent ? "⚠️ PRIORIDADE ALTA..." : "Nota privada..."}
                        />
                      </div>
                    </td>
                  )}
                  {isAdmin && (
                    <td className="p-8">
                      <div className="flex flex-col gap-2">
                        {/* Área de Visualização da Mensagem do Expert */}
                        {entry.expertMessage && (
                          <div className={`p-3 rounded-xl border relative group animate-in slide-in-from-left-2 ${entry.targetSupervisor && entry.targetSupervisor.trim() !== selectedSupervisor && selectedSupervisor !== 'TODOS' ? 'bg-slate-100 border-slate-200 opacity-50' : 'bg-orange-100 border-orange-200'}`}>
                            <div className="text-[10px] font-black text-orange-800 flex items-center justify-between gap-1 mb-1">
                              <div className="flex items-center gap-1"><MessageSquare size={10} /> {name.split(' ')[0]} diz:</div>
                              {entry.targetSupervisor && <div className="text-[8px] bg-white/50 px-1.5 rounded-full uppercase tracking-widest">Para: {entry.targetSupervisor.split(' ')[0]}</div>}
                            </div>
                            <div className="text-[11px] font-bold text-slate-700 leading-tight">
                              {entry.expertMessage}
                            </div>
                          </div>
                        )}

                        {/* Área de Resposta do Admin */}
                        <div className="flex gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100 group-within:border-orange-200 transition-colors">
                          <input
                            value={tempMessages[name] || ''}
                            onChange={(e) => setTempMessages(prev => ({ ...prev, [name]: e.target.value }))}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(name)}
                            className="bg-transparent p-2 rounded-xl text-[10px] font-bold outline-none flex-1 placeholder:text-slate-300"
                            placeholder="Responder expert..."
                          />
                          <button
                            onClick={() => handleSendMessage(name)}
                            className="bg-slate-900 text-white p-3 rounded-xl hover:bg-orange-600 transition-all shadow-lg active:scale-90"
                          >
                            <Send size={14} />
                          </button>
                        </div>
                      </div>
                    </td>
                  )}
                </tr>
              )
            }) : (
              <tr>
                <td colSpan={isAdmin ? 7 : 4} className="p-20 text-center">
                  <AlertCircle size={40} className="mx-auto text-slate-100 mb-4" />
                  <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest italic">Nenhum registro localizado</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
