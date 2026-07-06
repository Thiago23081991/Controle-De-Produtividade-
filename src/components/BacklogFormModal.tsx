import React, { useState, useEffect } from 'react';
import { BacklogRecord } from '../types';
import { useBacklog } from '../contexts/BacklogContext';
import { X, Save } from 'lucide-react';

interface BacklogFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    recordToEdit?: BacklogRecord | null;
}

export const BacklogFormModal: React.FC<BacklogFormModalProps> = ({ isOpen, onClose, recordToEdit }) => {
    const { addRecord, updateRecord } = useBacklog();

    const [fila, setFila] = useState('');
    const [status, setStatus] = useState('');
    const [slaReal, setSlaReal] = useState(0);
    const [numeroCaso, setNumeroCaso] = useState('');
    const [resp, setResp] = useState('');
    const [periodo, setPeriodo] = useState('');
    const [tp, setTp] = useState('');
    const [isSavingLocal, setIsSavingLocal] = useState(false);

    useEffect(() => {
        if (recordToEdit) {
            setFila(recordToEdit.fila || '');
            setStatus(recordToEdit.status || '');
            setSlaReal(recordToEdit.sla_real || 0);
            setNumeroCaso(recordToEdit.numero_caso || '');
            setResp(recordToEdit.resp || '');
            setPeriodo(recordToEdit.periodo || '');
            setTp(recordToEdit.tp || '');
        } else {
            setFila('');
            setStatus('');
            setSlaReal(0);
            setNumeroCaso('');
            setResp('');
            setPeriodo('');
            setTp('');
        }
    }, [recordToEdit, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!fila.trim() || !status.trim()) {
            alert('Fila e Status são campos obrigatórios.');
            return;
        }

        setIsSavingLocal(true);
        const data = {
            fila: fila.trim(),
            status: status.trim(),
            sla_real: Number(slaReal),
            numero_caso: numeroCaso.trim() || `BL-${Date.now().toString().slice(-4)}`,
            resp: resp.trim() || 'Geral',
            periodo: periodo.trim() || '0 - 30',
            tp: tp.trim() || 'Geral'
        };

        let success = false;
        if (recordToEdit && recordToEdit.id) {
            success = await updateRecord(recordToEdit.id, data);
        } else {
            success = await addRecord(data);
        }

        setIsSavingLocal(false);
        if (success) {
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[110] flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 animate-in zoom-in duration-300 flex flex-col">
                
                {/* Header */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                    <h3 className="text-sm font-black italic text-slate-900 dark:text-white uppercase tracking-wider">
                        {recordToEdit ? 'Editar Caso do Backlog' : 'Novo Caso Manual'}
                    </h3>
                    <button 
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-655 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 p-2 rounded-full transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4 flex-1">
                    
                    {/* Caso */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Número do Caso / Chamado</label>
                        <input
                            type="text"
                            value={numeroCaso}
                            onChange={(e) => setNumeroCaso(e.target.value)}
                            placeholder="Ex: 12345678"
                            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl py-3 px-4 text-xs font-bold text-slate-755 dark:text-slate-350 focus:ring-2 focus:ring-orange-500 outline-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Fila de Referência */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Fila de Referência *</label>
                            <input
                                type="text"
                                value={fila}
                                onChange={(e) => setFila(e.target.value)}
                                placeholder="Ex: SAC Backoffice"
                                required
                                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl py-3 px-4 text-xs font-bold text-slate-755 dark:text-slate-350 focus:ring-2 focus:ring-orange-500 outline-none"
                            />
                        </div>

                        {/* Status */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Status *</label>
                            <input
                                type="text"
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                placeholder="Ex: Aberto"
                                required
                                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl py-3 px-4 text-xs font-bold text-slate-755 dark:text-slate-350 focus:ring-2 focus:ring-orange-500 outline-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* SLA Real */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">SLA Real (Aging)</label>
                            <input
                                type="number"
                                value={slaReal}
                                onChange={(e) => setSlaReal(Number(e.target.value))}
                                placeholder="Ex: -3 ou 1"
                                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl py-3 px-4 text-xs font-bold text-slate-755 dark:text-slate-350 focus:ring-2 focus:ring-orange-500 outline-none"
                            />
                        </div>

                        {/* RESP */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Responsável (RESP)</label>
                            <input
                                type="text"
                                value={resp}
                                onChange={(e) => setResp(e.target.value)}
                                placeholder="Ex: Thiago"
                                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl py-3 px-4 text-xs font-bold text-slate-755 dark:text-slate-350 focus:ring-2 focus:ring-orange-500 outline-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Periodo */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Período (Ex: 0 - 30)</label>
                            <input
                                type="text"
                                value={periodo}
                                onChange={(e) => setPeriodo(e.target.value)}
                                placeholder="Ex: 0 - 30"
                                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl py-3 px-4 text-xs font-bold text-slate-755 dark:text-slate-350 focus:ring-2 focus:ring-orange-500 outline-none"
                            />
                        </div>

                        {/* TP */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Tipo de Atividade (TP)</label>
                            <input
                                type="text"
                                value={tp}
                                onChange={(e) => setTp(e.target.value)}
                                placeholder="Ex: Geral"
                                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl py-3 px-4 text-xs font-bold text-slate-755 dark:text-slate-350 focus:ring-2 focus:ring-orange-500 outline-none"
                            />
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-205 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 py-3 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSavingLocal}
                            className="flex-1 bg-orange-600 hover:bg-orange-505 text-white py-3 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-md shadow-orange-600/20 active:scale-95"
                        >
                            <Save size={14} /> {recordToEdit ? 'Atualizar' : 'Salvar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
