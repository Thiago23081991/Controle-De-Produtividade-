import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { CasoPerfeitoRecord } from '../types';
import { useCasoPerfeito } from '../contexts/CasoPerfeitoContext';

interface CasoPerfeitoTableProps {
    onEdit: (record: CasoPerfeitoRecord) => void;
}

export const CasoPerfeitoTable: React.FC<CasoPerfeitoTableProps> = ({ onEdit }) => {
    const { records, deleteRecord, isLoading } = useCasoPerfeito();

    if (isLoading) {
        return (
            <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl p-12 text-center border border-slate-100 dark:border-slate-800">
                <div className="w-12 h-12 border-4 border-slate-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Carregando dados...</p>
            </div>
        );
    }

    if (records.length === 0) {
        return (
            <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl p-12 text-center border border-slate-100 dark:border-slate-800">
                <div className="text-6xl mb-4 opacity-50">📂</div>
                <h3 className="text-xl font-black text-slate-700 dark:text-slate-300">Nenhum caso encontrado</h3>
                <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest">Adicione o primeiro caso para começar</p>
            </div>
        );
    }

    const handleDelete = async (id: string) => {
        if (window.confirm('Tem certeza que deseja remover este caso?')) {
            await deleteRecord(id);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 relative z-10">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                    <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800/50">
                            <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Expert</th>
                            <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Protocolo</th>
                            <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Consumidor Final / Lojista</th>
                            <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Processo Realizado</th>
                            <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Filtro / Motivo</th>
                            <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Está em qual Célula?</th>
                            <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {records.map((record) => (
                            <tr key={record.id} className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                <td className="p-6">
                                    <div className="text-sm font-black text-slate-800 dark:text-white">{record.expert_name.split(' ')[0]}</div>
                                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{new Date(record.date).toLocaleDateString('pt-BR')}</div>
                                </td>
                                <td className="p-6 text-sm font-bold text-slate-600 dark:text-slate-300">
                                    {record.protocolo}
                                </td>
                                <td className="p-6 text-sm font-bold text-slate-600 dark:text-slate-300">
                                    {record.consumidor_lojista}
                                </td>
                                <td className="p-6 text-sm font-bold text-slate-600 dark:text-slate-300 max-w-xs truncate" title={record.processo_realizado}>
                                    {record.processo_realizado}
                                </td>
                                <td className="p-6 text-sm font-bold text-slate-600 dark:text-slate-300 max-w-xs truncate" title={record.filtro}>
                                    {record.filtro || '-'}
                                </td>
                                <td className="p-6">
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400">
                                        {record.celula}
                                    </span>
                                </td>
                                <td className="p-6 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => onEdit(record)}
                                            className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-orange-600 rounded-xl transition-colors"
                                            title="Editar"
                                        >
                                            <Pencil size={16} />
                                        </button>
                                        <button
                                            onClick={() => record.id && handleDelete(record.id)}
                                            className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-red-600 rounded-xl transition-colors"
                                            title="Excluir"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
