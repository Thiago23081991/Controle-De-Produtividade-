import React, { useState } from 'react';
import { X, HardHat, Loader2 } from 'lucide-react';
import { useObraParada } from '../contexts/ObraParadaContext';
import { useAuth } from '../contexts/AuthContext';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

const today = () => new Date().toISOString().slice(0, 10);

export const ObraParadaFormModal: React.FC<Props> = ({ isOpen, onClose }) => {
    const { addRecord, isSaving } = useObraParada();
    const { currentUser, isAdmin } = useAuth();

    const [date, setDate] = useState(today());
    const [numeroCaso, setNumeroCaso] = useState('');
    const [obraParada, setObraParada] = useState<'sim' | 'nao'>('sim');
    const [tempoParada, setTempoParada] = useState('');
    const [tempoLigacao, setTempoLigacao] = useState('');
    const [tipoCaso, setTipoCaso] = useState<'Novo' | 'Rechamada'>('Novo');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!numeroCaso.trim()) return;

        const ok = await addRecord({
            date,
            numero_caso: numeroCaso.trim(),
            obra_parada: obraParada === 'sim',
            tempo_parada: obraParada === 'sim' ? tempoParada.trim() || undefined : undefined,
            tempo_ligacao: tempoLigacao.trim() || undefined,
            tipo_caso: tipoCaso,
            registrado_por: currentUser?.name || (isAdmin ? 'ADMIN' : 'SISTEMA'),
        });

        if (ok) {
            setNumeroCaso('');
            setObraParada('sim');
            setTempoParada('');
            setTempoLigacao('');
            setTipoCaso('Novo');
            setDate(today());
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-100 dark:border-slate-800 w-full max-w-lg animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                            <HardHat size={20} className="text-amber-600" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Novo Registro</p>
                            <h2 className="text-base font-black text-slate-800 dark:text-white">Obra Parada</h2>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">

                    {/* Data */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Data</label>
                        <input
                            type="date"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            required
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-amber-500 outline-none transition"
                        />
                    </div>

                    {/* Número do Caso */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            Número do Caso <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={numeroCaso}
                            onChange={e => setNumeroCaso(e.target.value)}
                            placeholder="Ex: 12345678"
                            required
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-200 placeholder-slate-300 focus:ring-2 focus:ring-amber-500 outline-none transition"
                        />
                    </div>

                    {/* Tempo de Ligação */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            Tempo de Ligação
                        </label>
                        <input
                            type="text"
                            value={tempoLigacao}
                            onChange={e => setTempoLigacao(e.target.value)}
                            placeholder="Ex: 00:05:30, 10 min..."
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-200 placeholder-slate-300 focus:ring-2 focus:ring-amber-500 outline-none transition"
                        />
                    </div>

                    {/* A Obra Está Parada? */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">A Obra Está Parada?</label>
                        <div className="flex gap-3">
                            {(['sim', 'nao'] as const).map(v => (
                                <button
                                    key={v}
                                    type="button"
                                    onClick={() => setObraParada(v)}
                                    className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest border transition-all ${
                                        obraParada === v
                                            ? v === 'sim'
                                                ? 'bg-red-500 border-red-400 text-white shadow-lg shadow-red-200 dark:shadow-red-900/30'
                                                : 'bg-green-500 border-green-400 text-white shadow-lg shadow-green-200 dark:shadow-green-900/30'
                                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:border-slate-300'
                                    }`}
                                >
                                    {v === 'sim' ? '✗ Sim, Parada' : '✓ Não, Em Andamento'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Quanto Tempo Está Parada? (só aparece se sim) */}
                    {obraParada === 'sim' && (
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                Quanto Tempo Está Parada?
                            </label>
                            <input
                                type="text"
                                value={tempoParada}
                                onChange={e => setTempoParada(e.target.value)}
                                placeholder="Ex: 3 dias, 2 semanas, 1 mês..."
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-200 placeholder-slate-300 focus:ring-2 focus:ring-amber-500 outline-none transition"
                            />
                        </div>
                    )}

                    {/* Caso Novo ou Rechamada */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tipo do Caso</label>
                        <div className="flex gap-3">
                            {(['Novo', 'Rechamada'] as const).map(v => (
                                <button
                                    key={v}
                                    type="button"
                                    onClick={() => setTipoCaso(v)}
                                    className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest border transition-all ${
                                        tipoCaso === v
                                            ? 'bg-amber-500 border-amber-400 text-white shadow-lg shadow-amber-200 dark:shadow-amber-900/30'
                                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:border-slate-300'
                                    }`}
                                >
                                    {v === 'Novo' ? '🆕 Caso Novo' : '🔄 Rechamada'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Botões */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 text-xs font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving || !numeroCaso.trim()}
                            className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-amber-200 dark:shadow-amber-900/30"
                        >
                            {isSaving ? (
                                <><Loader2 size={14} className="animate-spin" /> Salvando...</>
                            ) : (
                                <><HardHat size={14} /> Registrar</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
