import React, { useState, useEffect } from 'react';
import { X, Phone, Loader2 } from 'lucide-react';
import { useVozCampo } from '../contexts/VozCampoContext';

interface VozCampoFormModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const getTodayString = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const FUNCAO_OPTIONS = [
    'Técnico Suvinil',
    'Técnico Sherwin',
    'Técnico da Distribuição',
    'Consultor',
];

const inputClass =
    'w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-sm font-bold text-slate-700 dark:text-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition-all placeholder:font-normal placeholder:text-slate-300';

const selectClass =
    'w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-sm font-bold text-slate-700 dark:text-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition-all appearance-none cursor-pointer';

export const VozCampoFormModal: React.FC<VozCampoFormModalProps> = ({ isOpen, onClose }) => {
    const { addRecord, isSaving } = useVozCampo();

    const [date, setDate] = useState(getTodayString());
    const [funcao, setFuncao] = useState('');
    const [subCampo, setSubCampo] = useState('');
    const [nomeTecnico, setNomeTecnico] = useState('');
    const [solicitacao, setSolicitacao] = useState('');
    const [tempoLigacao, setTempoLigacao] = useState('');
    const [quantosCasos, setQuantosCasos] = useState<number | ''>('');

    useEffect(() => {
        if (isOpen) {
            setDate(getTodayString());
            setFuncao('');
            setSubCampo('');
            setNomeTecnico('');
            setSolicitacao('');
            setTempoLigacao('');
            setQuantosCasos('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const isValid =
        funcao &&
        subCampo.trim() &&
        nomeTecnico.trim() &&
        solicitacao.trim() &&
        tempoLigacao.trim() &&
        quantosCasos !== '' &&
        Number(quantosCasos) >= 0;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isValid) return;

        const success = await addRecord({
            date,
            funcao,
            sub_campo: subCampo.trim(),
            nome_tecnico_consultor: nomeTecnico.trim(),
            solicitacao: solicitacao.trim(),
            tempo_ligacao: tempoLigacao.trim(),
            quantos_casos_ligacao: Number(quantosCasos),
        });

        if (success) onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-lg border border-slate-100 dark:border-slate-800 overflow-hidden animate-in zoom-in duration-300">

                {/* Header */}
                <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-8 relative overflow-hidden">
                    <div className="absolute -top-4 -right-4 opacity-10">
                        <Phone size={120} className="text-white" />
                    </div>
                    <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="bg-white/20 p-3 rounded-2xl">
                                <Phone size={22} className="text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-white tracking-tight">Registrar Ligação</h2>
                                <p className="text-emerald-200 text-[10px] font-bold uppercase tracking-widest">Voz de Campo</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-xl transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-8 space-y-5 max-h-[70vh] overflow-y-auto">

                    {/* Data */}
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                            Data
                        </label>
                        <input
                            type="date"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            className={inputClass}
                        />
                    </div>

                    {/* Função */}
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                            Função <span className="text-emerald-500">*</span>
                        </label>
                        <select
                            value={funcao}
                            onChange={e => setFuncao(e.target.value)}
                            required
                            className={selectClass}
                        >
                            <option value="">Selecione a função...</option>
                            {FUNCAO_OPTIONS.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                    </div>

                    {/* Sub-Campo */}
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                            Sub-Campo <span className="text-emerald-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={subCampo}
                            onChange={e => setSubCampo(e.target.value)}
                            placeholder="Ex: Região Sul, Distribuidor XYZ..."
                            required
                            className={inputClass}
                        />
                    </div>

                    {/* Nome Técnico/Consultor */}
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                            Nome Técnico / Consultor <span className="text-emerald-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={nomeTecnico}
                            onChange={e => setNomeTecnico(e.target.value)}
                            placeholder="Nome completo..."
                            required
                            className={inputClass}
                        />
                    </div>

                    {/* Solicitação */}
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                            Solicitação <span className="text-emerald-500">*</span>
                        </label>
                        <textarea
                            value={solicitacao}
                            onChange={e => setSolicitacao(e.target.value)}
                            placeholder="Descreva a solicitação realizada na ligação..."
                            required
                            rows={3}
                            className={`${inputClass} resize-none`}
                        />
                    </div>

                    {/* Tempo de Ligação + Casos em Ligação — side by side */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                Tempo de Ligação <span className="text-emerald-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={tempoLigacao}
                                onChange={e => setTempoLigacao(e.target.value)}
                                placeholder="Ex: 00:15:00"
                                required
                                className={inputClass}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                Qtd. Casos <span className="text-emerald-500">*</span>
                            </label>
                            <input
                                type="number"
                                min={0}
                                value={quantosCasos}
                                onChange={e => setQuantosCasos(e.target.value === '' ? '' : Number(e.target.value))}
                                placeholder="0"
                                required
                                className={inputClass}
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving || !isValid}
                            className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-200 active:scale-95"
                        >
                            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Phone size={16} />}
                            {isSaving ? 'Salvando...' : 'Registrar Ligação'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
