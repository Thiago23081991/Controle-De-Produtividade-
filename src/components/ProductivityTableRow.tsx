import React from 'react';
import { AlertCircle, MessageSquare, Send } from 'lucide-react';
import { ManualEntryData, ExpertInfo } from '../types';

interface ProductivityTableRowProps {
    name: string;
    entry: ManualEntryData[string];
    expertInfo: ExpertInfo | undefined;
    isAdmin: boolean;
    viewMode: 'daily' | 'monthly';
    historicalAverage: number;
    tempMessage: string;
    selectedSupervisor: string;
    onInputChange: (expert: string, field: 'tratado' | 'finalizado' | 'observacao' | 'goal', value: string) => void;
    onSendMessage: (expert: string) => void;
    onTempMessageChange: (expert: string, value: string) => void;
}

export const ProductivityTableRow: React.FC<ProductivityTableRowProps> = React.memo(({
    name, entry, expertInfo, isAdmin, viewMode, historicalAverage, tempMessage, selectedSupervisor,
    onInputChange, onSendMessage, onTempMessageChange
}) => {
    if (!entry) return null;

    const total = (entry.tratado || 0) + (entry.finalizado || 0);
    const eff = entry.goal > 0 ? Math.round((total / entry.goal) * 100) : 0;
    const avg = historicalAverage || 0;

    return (
        <tr className="hover:bg-slate-50/40 dark:hover:bg-slate-800/40 transition-all duration-300">
            <td className="p-8">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-orange-600 dark:bg-orange-700 text-white flex items-center justify-center font-black text-xs shadow-lg shadow-orange-600/10 dark:shadow-none">
                        {name.charAt(0)}
                    </div>
                    <div className="truncate">
                        <div className="font-black text-slate-800 dark:text-slate-200 text-sm truncate">{name}</div>
                        <div className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase mt-0.5">{expertInfo?.supervisor || 'Geral'}</div>
                    </div>
                </div>
            </td>
            <td className="p-8">
                <div className="relative">
                    <input
                        type="number"
                        value={entry.goal === 0 ? '' : entry.goal}
                        disabled={!isAdmin}
                        onChange={(e) => onInputChange(name, 'goal', e.target.value)}
                        className={`w-full text-center font-black text-orange-600 dark:text-orange-400 bg-orange-50/50 dark:bg-orange-900/20 rounded-xl p-3 border-2 border-transparent focus:border-orange-200 dark:focus:border-orange-800 outline-none disabled:opacity-100 disabled:bg-transparent disabled:text-slate-500 dark:disabled:text-slate-500`}
                        placeholder="-"
                    />
                    {isAdmin && avg > 0 && <div className="text-[8px] text-center text-slate-400 dark:text-slate-600 font-bold mt-1 uppercase tracking-wider" title="Média dos últimos 30 dias">Média: {avg}</div>}
                </div>
            </td>
            <td className="p-8">
                <input type="number" value={entry.tratado === 0 ? '' : entry.tratado} onChange={(e) => onInputChange(name, 'tratado', e.target.value)} className="w-full text-center font-bold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 rounded-xl p-3 border-2 border-transparent focus:border-slate-200 dark:focus:border-slate-600 outline-none" placeholder="0" />
            </td>
            <td className="p-8">
                <input type="number" value={entry.finalizado === 0 ? '' : entry.finalizado} onChange={(e) => onInputChange(name, 'finalizado', e.target.value)} className="w-full text-center font-black text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 rounded-xl p-3 border-2 border-transparent focus:border-green-200 dark:focus:border-green-800 outline-none shadow-sm dark:shadow-none" placeholder="0" />
            </td>
            <td className="p-8 text-center">
                <span className={`text-xs font-black p-2 rounded-lg ${eff >= 100 ? 'bg-orange-600 text-white shadow-lg' : 'text-slate-400 dark:text-slate-600'}`}>{eff}%</span>
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
                            onChange={(e) => onInputChange(name, 'observacao', e.target.value)}
                            className={`w-full p-3 rounded-xl text-[10px] font-bold outline-none border-2 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600 ${entry.isUrgent
                                ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 focus:border-red-300 placeholder:text-red-300'
                                : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-transparent focus:border-slate-200 dark:focus:border-slate-600'
                                }`}
                            placeholder={entry.isUrgent ? "⚠️ PRIORIDADE ALTA..." : "Nota privada..."}
                        />
                    </div>
                </td>
            )}
            {isAdmin && viewMode === 'daily' && (
                <td className="p-8">
                    <div className="flex flex-col gap-2">
                        {/* Área de Visualização da Mensagem do Expert */}
                        {entry.expertMessage && (
                            <div className={`p-3 rounded-xl border relative group animate-in slide-in-from-left-2 ${entry.targetSupervisor && entry.targetSupervisor.trim() !== selectedSupervisor && selectedSupervisor !== 'TODOS' ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 opacity-50' : 'bg-orange-100 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'}`}>
                                <div className="text-[10px] font-black text-orange-800 dark:text-orange-300 flex items-center justify-between gap-1 mb-1">
                                    <div className="flex items-center gap-1"><MessageSquare size={10} /> {name.split(' ')[0]} diz:</div>
                                    {entry.targetSupervisor && <div className="text-[8px] bg-white/50 dark:bg-slate-900/50 px-1.5 rounded-full uppercase tracking-widest">Para: {entry.targetSupervisor.split(' ')[0]}</div>}
                                </div>
                                <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 leading-tight">
                                    {entry.expertMessage}
                                </div>
                            </div>
                        )}

                        {/* Área de Resposta do Admin */}
                        <div className="flex gap-2 bg-slate-50 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-100 dark:border-slate-700 group-within:border-orange-200 dark:group-within:border-orange-800 transition-colors">
                            <input
                                value={tempMessage || ''}
                                onChange={(e) => onTempMessageChange(name, e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && onSendMessage(name)}
                                className="bg-transparent p-2 rounded-xl text-[10px] font-bold outline-none flex-1 placeholder:text-slate-300 dark:placeholder:text-slate-500 text-slate-700 dark:text-slate-200"
                                placeholder="Responder expert..."
                            />
                            <button
                                onClick={() => onSendMessage(name)}
                                className="bg-slate-900 dark:bg-slate-700 text-white p-3 rounded-xl hover:bg-orange-600 dark:hover:bg-orange-600 transition-all shadow-lg active:scale-90"
                            >
                                <Send size={14} />
                            </button>
                        </div>
                    </div>
                </td>
            )}
        </tr>
    );
});
