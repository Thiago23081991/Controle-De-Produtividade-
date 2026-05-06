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
    onInputChange: (expert: string, field: 'tratado' | 'finalizado' | 'whatsapp' | 'revenda' | 'encontre_pintor' | 'lojas_online' | 'observacao' | 'goal', value: string) => void;
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
        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-6 shadow-xl shadow-slate-200/40 border border-slate-100 dark:border-slate-700 flex flex-col gap-6 relative overflow-hidden group hover:border-orange-200 hover:shadow-2xl transition-all duration-300">
            {/* Header: Avatar, Name, Efficiency */}
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-700 text-white flex items-center justify-center font-black text-lg shadow-lg shadow-orange-600/30">
                        {name.charAt(0)}
                    </div>
                    <div className="truncate">
                        <div className="font-black text-slate-800 dark:text-slate-200 text-base truncate" title={name}>{name.split(' ')[0]} {name.split(' ')[1] || ''}</div>
                        <div className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase">{expertInfo?.supervisor || 'Visualização Geral'}</div>
                    </div>
                </div>
                <div className="flex flex-col items-end">
                    <span className={`text-xs font-black px-3 py-1.5 rounded-xl ${eff >= 100 ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/30' : 'bg-slate-100 text-slate-500 dark:bg-slate-900'}`}>{eff}%</span>
                    {avg > 0 && <span className="text-[8px] text-slate-400 font-bold mt-1 uppercase tracking-wider">Média: {avg}</span>}
                </div>
            </div>

            {/* Mini-Grid of Inputs */}
            <div className="grid grid-cols-8 gap-3">
                {/* Meta */}
                <div className="col-span-8 flex flex-col gap-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Meta do Dia</label>
                    <input type="number" value={entry.goal === 0 ? '' : entry.goal} disabled={!isAdmin} onChange={(e) => onInputChange(name, 'goal', e.target.value)} className="w-full text-center font-black text-orange-600 bg-orange-50/50 rounded-xl p-3 border-2 border-transparent outline-none focus:border-orange-200 disabled:bg-transparent placeholder:text-orange-200 transition-colors" placeholder="0" />
                </div>
                
                {/* Tratado */}
                <div className="col-span-4 flex flex-col gap-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1 text-center">Tratado Geral</label>
                    <input type="number" value={entry.tratado === 0 ? '' : entry.tratado} onChange={(e) => onInputChange(name, 'tratado', e.target.value)} className="w-full text-center font-bold text-slate-600 bg-slate-50 rounded-xl p-3 outline-none focus:ring-2 focus:ring-slate-200 placeholder:text-slate-200 transition-shadow" placeholder="0" />
                </div>

                {/* Finalizado */}
                <div className="col-span-4 flex flex-col gap-1">
                    <label className="text-[9px] font-black text-emerald-500 uppercase tracking-widest pl-1 text-center">Finalizado</label>
                    <input type="number" value={entry.finalizado === 0 ? '' : entry.finalizado} onChange={(e) => onInputChange(name, 'finalizado', e.target.value)} className="w-full text-center font-black text-emerald-600 bg-emerald-50 rounded-xl p-3 outline-none focus:ring-2 focus:ring-emerald-200 placeholder:text-emerald-200 transition-shadow" placeholder="0" />
                </div>

                {/* Queues (Whatsapp, Revenda, Pintor, Lojas) */}
                <div className="col-span-2 flex flex-col gap-1 mt-2">
                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest pl-1 text-center truncate" title="WhatsApp">Whats</label>
                    <input type="number" value={entry.whatsapp === 0 ? '' : entry.whatsapp} onChange={(e) => onInputChange(name, 'whatsapp', e.target.value)} className="w-full text-center font-bold text-slate-600 bg-white border border-slate-200 rounded-xl p-2 text-sm outline-none focus:ring-2 focus:ring-orange-100 placeholder:text-slate-200 shadow-sm" placeholder="-" />
                </div>
                <div className="col-span-2 flex flex-col gap-1 mt-2">
                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest pl-1 text-center truncate" title="Revenda">Reven</label>
                    <input type="number" value={entry.revenda === 0 ? '' : entry.revenda} onChange={(e) => onInputChange(name, 'revenda', e.target.value)} className="w-full text-center font-bold text-slate-600 bg-white border border-slate-200 rounded-xl p-2 text-sm outline-none focus:ring-2 focus:ring-orange-100 placeholder:text-slate-200 shadow-sm" placeholder="-" />
                </div>
                <div className="col-span-2 flex flex-col gap-1 mt-2">
                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest pl-1 text-center truncate" title="Encontre seu pintor">Pintor</label>
                    <input type="number" value={entry.encontre_pintor === 0 ? '' : entry.encontre_pintor} onChange={(e) => onInputChange(name, 'encontre_pintor', e.target.value)} className="w-full text-center font-bold text-slate-600 bg-white border border-slate-200 rounded-xl p-2 text-sm outline-none focus:ring-2 focus:ring-orange-100 placeholder:text-slate-200 shadow-sm" placeholder="-" />
                </div>
                <div className="col-span-2 flex flex-col gap-1 mt-2">
                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest pl-1 text-center truncate" title="Lojas Online">Lojas</label>
                    <input type="number" value={entry.lojas_online === 0 ? '' : entry.lojas_online} onChange={(e) => onInputChange(name, 'lojas_online', e.target.value)} className="w-full text-center font-bold text-slate-600 bg-white border border-slate-200 rounded-xl p-2 text-sm outline-none focus:ring-2 focus:ring-orange-100 placeholder:text-slate-200 shadow-sm" placeholder="-" />
                </div>
            </div>

            {/* Footer: Observação & Chat */}
            {isAdmin && (
                <div className="pt-4 border-t border-slate-100 dark:border-slate-700/50 flex flex-col gap-3">
                    <div className="relative group/obs">
                        {entry.isUrgent && (
                            <div className="absolute -top-3 -right-2 bg-red-500 text-white p-1.5 rounded-full shadow-lg z-10 animate-bounce" title="URGENTE: Observação Prioritária">
                                <AlertCircle size={10} strokeWidth={3} />
                            </div>
                        )}
                        <input
                            type="text"
                            value={entry.observacao || ''}
                            onChange={(e) => onInputChange(name, 'observacao', e.target.value)}
                            className={`w-full p-3 rounded-xl text-[10px] font-bold outline-none border transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600 ${entry.isUrgent
                                ? 'bg-red-50 border-red-200 text-red-800 focus:border-red-300 placeholder:text-red-300'
                                : 'bg-slate-50 text-slate-700 border-transparent focus:border-slate-200 focus:bg-white'
                                }`}
                            placeholder={entry.isUrgent ? "⚠️ PRIORIDADE ALTA..." : "Adicionar nota rápida privativa..."}
                        />
                    </div>
                    
                    {viewMode === 'daily' && (
                        <div className="flex flex-col gap-2">
                            {entry.expertMessage && (
                                <div className={`p-3 rounded-xl border relative shadow-sm ${entry.targetSupervisor && entry.targetSupervisor.trim() !== selectedSupervisor && selectedSupervisor !== 'TODOS' ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-orange-50/50 border-orange-100'}`}>
                                    <div className="text-[9px] font-black text-orange-800 flex items-center justify-between gap-1 mb-1.5">
                                        <div className="flex items-center gap-1.5"><MessageSquare size={10} /> {name.split(' ')[0]} enviou:</div>
                                        {entry.targetSupervisor && <div className="text-[7px] bg-white px-2 py-0.5 rounded-full uppercase tracking-widest shadow-sm">Para: {entry.targetSupervisor.split(' ')[0]}</div>}
                                    </div>
                                    <div className="text-[11px] font-bold text-slate-700 leading-relaxed">
                                        {entry.expertMessage}
                                    </div>
                                </div>
                            )}
                            <div className="flex gap-2">
                                <input
                                    value={tempMessage || ''}
                                    onChange={(e) => onTempMessageChange(name, e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && onSendMessage(name)}
                                    className="bg-slate-50 p-2.5 rounded-xl text-xs font-bold outline-none flex-1 placeholder:text-slate-400 text-slate-700 border border-transparent focus:border-slate-200 transition-colors"
                                    placeholder="Responder equipe..."
                                />
                                <button
                                    onClick={() => onSendMessage(name)}
                                    className="bg-slate-800 text-white p-2.5 rounded-xl hover:bg-orange-600 transition-all shadow-lg active:scale-95 flex items-center justify-center w-10 h-10"
                                >
                                    <Send size={14} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
});
