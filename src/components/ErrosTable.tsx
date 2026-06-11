import React from 'react';
import { Trash2, AlertTriangle, FileSearch } from 'lucide-react';
import { useErros } from '../contexts/ErrosContext';
import { useAuth } from '../contexts/AuthContext';

export const ErrosTable: React.FC = () => {
    const { erros, isLoading, deleteErro } = useErros();
    const { isAdmin } = useAuth();

    const formatDate = (dateStr: string) => {
        const [y, m, d] = dateStr.split('-');
        return `${d}/${m}/${y}`;
    };

    const handleDelete = async (id: string, expertName: string) => {
        if (!confirm(`Remover registro de erro de ${expertName}?`)) return;
        await deleteErro(id);
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
            {/* Table Header */}
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <div className="bg-red-100 dark:bg-red-900/30 p-2.5 rounded-xl">
                    <FileSearch size={18} className="text-red-600" />
                </div>
                <div>
                    <h3 className="font-black text-slate-800 dark:text-white text-base tracking-tight">Registros de Erros</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {erros.length} registro{erros.length !== 1 ? 's' : ''} no período
                    </p>
                </div>
            </div>

            {isLoading ? (
                <div className="py-16 text-center text-slate-400 font-bold">Carregando...</div>
            ) : erros.length === 0 ? (
                <div className="py-16 text-center">
                    <AlertTriangle size={40} className="text-slate-200 mx-auto mb-3" />
                    <p className="text-slate-400 font-bold">Nenhum erro registrado no período</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/50">
                                <th className="px-5 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Data</th>
                                <th className="px-5 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Nº Caso/Atividade</th>
                                <th className="px-5 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Expert</th>
                                <th className="px-5 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Onde está o Erro</th>
                                <th className="px-5 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Registrado por</th>
                                {isAdmin && <th className="px-5 py-3 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Ação</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                            {erros.map((erro, idx) => (
                                <tr key={erro.id || idx} className="hover:bg-red-50/40 dark:hover:bg-red-900/10 transition-colors group">
                                    <td className="px-5 py-4">
                                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                            {formatDate(erro.date)}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className="inline-flex items-center gap-1.5 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 px-3 py-1.5 rounded-lg text-xs font-black tracking-wide">
                                            <AlertTriangle size={11} />
                                            {erro.numero_caso}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-black text-slate-600 dark:text-slate-300 shrink-0">
                                                {erro.expert_name.substring(0, 2)}
                                            </div>
                                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200 leading-tight">
                                                {erro.expert_name}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 max-w-xs">
                                        <p className="text-xs font-medium text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                                            {erro.descricao_erro}
                                        </p>
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase">
                                            {erro.registrado_por || '—'}
                                        </span>
                                    </td>
                                    {isAdmin && (
                                        <td className="px-5 py-4 text-center">
                                            <button
                                                onClick={() => handleDelete(erro.id!, erro.expert_name)}
                                                className="opacity-0 group-hover:opacity-100 p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-400 hover:text-red-600 transition-all"
                                                title="Remover registro"
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};
