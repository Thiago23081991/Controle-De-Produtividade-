import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { CasoPerfeitoRecord } from '../types';
import { useCasoPerfeito } from '../contexts/CasoPerfeitoContext';

interface CasoPerfeitoFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    recordToEdit?: CasoPerfeitoRecord | null;
}

const CELULAS_OPTIONS = [
    'BACKOFFICE',
    'PRODUTO',
    'LABORÁTORIO',
    'RESSARCIMENTO',
    'DESENVOLVIMENTO DE COR',
    'SERVIÇO AO MERCADO'
];

const FILTROS_OPTIONS = [
    'Atrasos na entrega',
    'Erro na compra',
    'Solicitações de cancelamento / devolução / troca',
    '2ª via da Nota Fiscal',
    'Duplicidade / cobrança indevida',
    'Avaria',
    'Falta de estoque',
    'Atraso na retirada',
    'Alteração no pedido',
    'Produto ausente do pedido',
    'Recebeu cor errada',
    'Recebeu produto diferente',
    'Cliente ausente'
];

export const CasoPerfeitoFormModal: React.FC<CasoPerfeitoFormModalProps> = ({ isOpen, onClose, recordToEdit }) => {
    const { addRecord, updateRecord, isSaving } = useCasoPerfeito();
    
    const [protocolo, setProtocolo] = useState('');
    const [consumidor, setConsumidor] = useState('');
    const [processo, setProcesso] = useState('');
    const [celula, setCelula] = useState('');
    const [filtro, setFiltro] = useState('');

    useEffect(() => {
        if (recordToEdit) {
            setProtocolo(recordToEdit.protocolo);
            setConsumidor(recordToEdit.consumidor_lojista);
            setProcesso(recordToEdit.processo_realizado || '');
            setCelula(recordToEdit.celula);
            setFiltro(recordToEdit.filtro || '');
        } else {
            setProtocolo('');
            setConsumidor('');
            setProcesso('');
            setCelula('');
            setFiltro('');
        }
    }, [recordToEdit, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const data = {
            protocolo,
            consumidor_lojista: consumidor,
            processo_realizado: processo,
            celula,
            filtro
        };

        let success = false;
        if (recordToEdit && recordToEdit.id) {
            success = await updateRecord(recordToEdit.id, data);
        } else {
            success = await addRecord(data);
        }

        if (success) {
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 zoom-in flex flex-col max-h-[90vh]">
                <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 dark:text-white italic tracking-tighter">
                            {recordToEdit ? 'Editar Caso' : 'Novo Caso Perfeito'}
                        </h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                            Preencha os dados do acompanhamento
                        </p>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-500">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-8 overflow-y-auto flex-1">
                    <form id="caso-form" onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Protocolo</label>
                                <input
                                    required
                                    type="text"
                                    value={protocolo}
                                    onChange={(e) => setProtocolo(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl py-3 px-4 text-sm font-bold text-slate-700 dark:text-slate-200 focus:border-orange-400 focus:ring-4 focus:ring-orange-400/20 outline-none transition-all"
                                    placeholder="Ex: 12345678"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Consumidor Final / Lojista</label>
                                <input
                                    required
                                    type="text"
                                    value={consumidor}
                                    onChange={(e) => setConsumidor(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl py-3 px-4 text-sm font-bold text-slate-700 dark:text-slate-200 focus:border-orange-400 focus:ring-4 focus:ring-orange-400/20 outline-none transition-all"
                                    placeholder="Nome do cliente/loja"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Está em qual célula?</label>
                                <select
                                    required
                                    value={celula}
                                    onChange={(e) => setCelula(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl py-3 px-4 text-sm font-bold text-slate-700 dark:text-slate-200 focus:border-orange-400 focus:ring-4 focus:ring-orange-400/20 outline-none transition-all appearance-none cursor-pointer"
                                >
                                    <option value="" disabled>Selecione a célula...</option>
                                    {CELULAS_OPTIONS.map(opt => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Filtro / Motivo</label>
                                <select
                                    required
                                    value={filtro}
                                    onChange={(e) => setFiltro(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl py-3 px-4 text-sm font-bold text-slate-700 dark:text-slate-200 focus:border-orange-400 focus:ring-4 focus:ring-orange-400/20 outline-none transition-all appearance-none cursor-pointer"
                                >
                                    <option value="" disabled>Selecione o filtro...</option>
                                    {FILTROS_OPTIONS.map(opt => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Processo Realizado</label>
                            <textarea
                                required
                                value={processo}
                                onChange={(e) => setProcesso(e.target.value)}
                                rows={4}
                                className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl py-3 px-4 text-sm font-bold text-slate-700 dark:text-slate-200 focus:border-orange-400 focus:ring-4 focus:ring-orange-400/20 outline-none transition-all resize-none"
                                placeholder="Descreva o que foi feito..."
                            />
                        </div>
                    </form>
                </div>

                <div className="p-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        form="caso-form"
                        type="submit"
                        disabled={isSaving}
                        className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg shadow-orange-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSaving ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Save size={16} />
                        )}
                        Salvar
                    </button>
                </div>
            </div>
        </div>
    );
};
