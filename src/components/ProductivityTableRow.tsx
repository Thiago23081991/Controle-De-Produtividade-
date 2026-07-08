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

    const effColor = eff >= 100
        ? 'bg-orange-600 text-white shadow-orange-200 dark:shadow-orange-900/30'
        : eff >= 70
        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400';

    const inputBase = "w-full text-center font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-1 text-sm outline-none focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-900/40 placeholder:text-slate-300 dark:placeholder:text-slate-600 transition-all";

    return (
        <div className="group border-b border-slate-50 dark:border-slate-800 last:border-0 hover:bg-orange-50/30 dark:hover:bg-orange-900/5 transition-colors duration-150">
            {/* ── Linha principal ── */}
            <div className="flex items-center gap-3 px-4 py-3">

                {/* Avatar + Nome */}
                <div className="flex items-center gap-3 w-48 flex-shrink-0">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-orange-700 text-white flex items-center justify-center font-black text-sm shadow-md shadow-orange-600/20 flex-shrink-0">
                        {name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                        <div className="font-black text-slate-800 dark:text-slate-200 text-xs truncate leading-tight" title={name}>
                            {name.split(' ')[0]} {name.split(' ')[1] || ''}
                        </div>
                        <div className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase truncate">
                            {expertInfo?.supervisor || 'Geral'}
                        </div>
                    </div>
                </div>

                {/* % Eficiência */}
                <div className="flex flex-col items-center w-14 flex-shrink-0">
                    <span className={`text-[10px] font-black px-2 py-1 rounded-lg shadow-sm ${effColor}`}>
                        {eff}%
                    </span>
                    {avg > 0 && (
                        <span className="text-[8px] text-slate-400 font-bold mt-0.5 uppercase">
                            Md: {avg}
                        </span>
                    )}
                </div>

                {/* Meta */}
                <div className="flex flex-col items-center w-16 flex-shrink-0">
                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-wider mb-1">Meta</label>
                    <input
                        type="number"
                        value={entry.goal === 0 ? '' : entry.goal}
                        disabled={!isAdmin}
                        onChange={(e) => onInputChange(name, 'goal', e.target.value)}
                        className="w-full text-center font-black text-orange-600 bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800/30 rounded-xl py-2 px-1 text-sm outline-none focus:ring-2 focus:ring-orange-200 disabled:opacity-60 disabled:cursor-default placeholder:text-orange-200 transition-all"
                        placeholder="0"
                    />
                </div>

                {/* Tratado */}
                <div className="flex flex-col items-center w-20 flex-shrink-0">
                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-wider mb-1">Tratado</label>
                    <input
                        type="number"
                        value={entry.tratado === 0 ? '' : entry.tratado}
                        onChange={(e) => onInputChange(name, 'tratado', e.target.value)}
                        className={inputBase}
                        placeholder="0"
                    />
                </div>

                {/* Finalizado */}
                <div className="flex flex-col items-center w-20 flex-shrink-0">
                    <label className="text-[8px] font-black text-emerald-500 uppercase tracking-wider mb-1">Finalizado</label>
                    <input
                        type="number"
                        value={entry.finalizado === 0 ? '' : entry.finalizado}
                        onChange={(e) => onInputChange(name, 'finalizado', e.target.value)}
                        className="w-full text-center font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/30 rounded-xl py-2 px-1 text-sm outline-none focus:ring-2 focus:ring-emerald-200 placeholder:text-emerald-200 transition-all"
                        placeholder="0"
                    />
                </div>

                {/* Divisor */}
                <div className="w-px h-10 bg-slate-100 dark:bg-slate-800 flex-shrink-0" />

                {/* Whats */}
                <div className="flex flex-col items-center w-14 flex-shrink-0">
                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-wider mb-1">Whats</label>
                    <input type="number" value={entry.whatsapp === 0 ? '' : entry.whatsapp} onChange={(e) => onInputChange(name, 'whatsapp', e.target.value)} className={inputBase} placeholder="—" />
                </div>

                {/* Revenda */}
                <div className="flex flex-col items-center w-14 flex-shrink-0">
                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-wider mb-1">Reven</label>
                    <input type="number" value={entry.revenda === 0 ? '' : entry.revenda} onChange={(e) => onInputChange(name, 'revenda', e.target.value)} className={inputBase} placeholder="—" />
                </div>

                {/* Pintor */}
                <div className="flex flex-col items-center w-14 flex-shrink-0">
                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-wider mb-1">Pintor</label>
                    <input type="number" value={entry.encontre_pintor === 0 ? '' : entry.encontre_pintor} onChange={(e) => onInputChange(name, 'encontre_pintor', e.target.value)} className={inputBase} placeholder="—" />
                </div>

                {/* Lojas */}
                <div className="flex flex-col items-center w-14 flex-shrink-0">
                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-wider mb-1">Lojas</label>
                    <input type="number" value={entry.lojas_online === 0 ? '' : entry.lojas_online} onChange={(e) => onInputChange(name, 'lojas_online', e.target.value)} className={inputBase} placeholder="—" />
                </div>

                {/* Observação + Chat (Admin) */}
                {isAdmin && (
                    <>
                        <div className="w-px h-10 bg-slate-100 dark:bg-slate-800 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                            <input
                                type="text"
                                value={entry.observacao || ''}
                                onChange={(e) => onInputChange(name, 'observacao', e.target.value)}
                                className={`w-full p-2 rounded-xl text-[10px] font-bold outline-none border transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600 ${
                                    entry.isUrgent
                                        ? 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950/20 dark:border-red-800 dark:text-red-400'
                                        : 'bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 border-transparent focus:border-slate-200 focus:bg-white dark:focus:bg-slate-800'
                                }`}
                                placeholder={entry.isUrgent ? '⚠️ PRIORIDADE ALTA...' : 'Nota privativa...'}
                            />
                        </div>

                        {viewMode === 'daily' && (
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <input
                                    value={tempMessage || ''}
                                    onChange={(e) => onTempMessageChange(name, e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && onSendMessage(name)}
                                    className="bg-slate-50 dark:bg-slate-800 p-2 rounded-xl text-xs font-bold outline-none w-32 placeholder:text-slate-400 text-slate-700 dark:text-slate-300 border border-transparent focus:border-slate-200 transition-colors"
                                    placeholder="Responder..."
                                />
                                <button
                                    onClick={() => onSendMessage(name)}
                                    className="bg-slate-800 dark:bg-slate-700 text-white p-2 rounded-xl hover:bg-orange-600 transition-all shadow-md active:scale-95 flex-shrink-0"
                                >
                                    <Send size={13} />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Mensagem do expert (se houver) */}
            {isAdmin && viewMode === 'daily' && entry.expertMessage && (
                <div className={`mx-4 mb-3 p-2.5 rounded-xl border text-[10px] ${
                    entry.targetSupervisor && entry.targetSupervisor.trim() !== selectedSupervisor && selectedSupervisor !== 'TODOS'
                        ? 'bg-slate-50 border-slate-100 opacity-60'
                        : 'bg-orange-50/50 dark:bg-orange-900/10 border-orange-100 dark:border-orange-900/30'
                }`}>
                    <div className="font-black text-orange-800 dark:text-orange-400 flex items-center gap-1 mb-1">
                        <MessageSquare size={9} />
                        {name.split(' ')[0]} enviou:
                        {entry.targetSupervisor && (
                            <span className="text-[7px] bg-white dark:bg-slate-800 px-2 py-0.5 rounded-full uppercase tracking-widest ml-1 shadow-sm">
                                Para: {entry.targetSupervisor.split(' ')[0]}
                            </span>
                        )}
                    </div>
                    <div className="font-bold text-slate-700 dark:text-slate-300">{entry.expertMessage}</div>
                </div>
            )}
        </div>
    );
});
