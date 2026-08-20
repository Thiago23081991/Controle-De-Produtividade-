import React, { useState } from 'react';
import { Trash2, Phone, Clock, FileText, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { useVozCampo } from '../contexts/VozCampoContext';
import { useAuth } from '../contexts/AuthContext';
import { VozCampoRecord } from '../types';

const FUNCAO_COLOR: Record<string, string> = {
    'Técnico Suvinil':           'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    'Técnico Sherwin':           'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    'Técnico da Distribuição':   'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    'Consultor':                 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    'Técnico da Representação':  'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
    'Promotor':                  'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
};

const FUNCAO_DOT: Record<string, string> = {
    'Técnico Suvinil':           'bg-blue-500',
    'Técnico Sherwin':           'bg-purple-500',
    'Técnico da Distribuição':   'bg-amber-500',
    'Consultor':                 'bg-emerald-500',
    'Técnico da Representação':  'bg-violet-500',
    'Promotor':                  'bg-pink-500',
};

const FuncaoBadge: React.FC<{ funcao: string }> = ({ funcao }) => (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${FUNCAO_COLOR[funcao] || 'bg-slate-100 text-slate-600'}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${FUNCAO_DOT[funcao] || 'bg-slate-400'}`} />
        {funcao}
    </span>
);

interface RowProps {
    record: VozCampoRecord;
    onDelete: (id: string) => void;
    isAdmin: boolean;
    isDeleting: string | null;
}

const Row: React.FC<RowProps> = ({ record, onDelete, isAdmin, isDeleting }) => {
    const [expanded, setExpanded] = useState(false);

    return (
        <>
            <tr
                className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                onClick={() => setExpanded(p => !p)}
            >
                <td className="px-4 py-4 text-xs font-bold text-slate-500 whitespace-nowrap">{record.date}</td>
                <td className="px-4 py-4">
                    <FuncaoBadge funcao={record.funcao} />
                </td>
                <td className="px-4 py-4 text-xs font-bold text-slate-600 dark:text-slate-300 max-w-[120px] truncate">{record.sub_campo}</td>
                <td className="px-4 py-4 text-xs font-bold text-slate-700 dark:text-slate-200 max-w-[150px] truncate">{record.nome_tecnico_consultor}</td>
                <td className="px-4 py-4 text-xs text-slate-600 dark:text-slate-300 max-w-[180px] truncate">{record.solicitacao}</td>
                <td className="px-4 py-4 text-center">
                    <span className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-lg text-[11px] font-bold">
                        <Clock size={10} />
                        {record.tempo_ligacao}
                    </span>
                </td>
                <td className="px-4 py-4 text-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 font-black text-sm">
                        {record.quantos_casos_ligacao}
                    </span>
                </td>
                <td className="px-4 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                        <button
                            onClick={e => { e.stopPropagation(); setExpanded(p => !p); }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                        >
                            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                        {isAdmin && (
                            <button
                                onClick={e => { e.stopPropagation(); record.id && onDelete(record.id); }}
                                disabled={isDeleting === record.id}
                                className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                            >
                                {isDeleting === record.id
                                    ? <Loader2 size={14} className="animate-spin" />
                                    : <Trash2 size={14} />}
                            </button>
                        )}
                    </div>
                </td>
            </tr>
            {expanded && (
                <tr className="bg-emerald-50/50 dark:bg-emerald-900/10 border-b border-slate-100 dark:border-slate-800">
                    <td colSpan={8} className="px-6 py-4">
                        <div className="flex flex-wrap gap-4">
                            <div className="flex items-start gap-2">
                                <FileText size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Solicitação Completa</p>
                                    <p className="text-sm text-slate-700 dark:text-slate-200 font-medium">{record.solicitacao}</p>
                                </div>
                            </div>
                            {record.registrado_por && (
                                <div className="ml-auto text-right">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Registrado por</p>
                                    <p className="text-xs font-bold text-slate-500">{record.registrado_por}</p>
                                </div>
                            )}
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
};

export const VozCampoTable: React.FC = () => {
    const { records, isLoading, deleteRecord } = useVozCampo();
    const { isAdmin } = useAuth();
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    const handleDelete = async (id: string) => {
        if (!window.confirm('Deseja remover este registro?')) return;
        setIsDeleting(id);
        await deleteRecord(id);
        setIsDeleting(null);
    };

    if (isLoading) {
        return (
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-xl border border-slate-100 dark:border-slate-800 p-16 flex flex-col items-center gap-4">
                <Loader2 size={36} className="animate-spin text-emerald-500" />
                <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">Carregando registros...</p>
            </div>
        );
    }

    if (records.length === 0) {
        return (
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-xl border border-slate-100 dark:border-slate-800 p-16 flex flex-col items-center gap-4 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                    <Phone size={28} className="text-emerald-300" />
                </div>
                <p className="text-slate-500 font-black text-sm uppercase tracking-widest">Nenhuma ligação registrada</p>
                <p className="text-slate-400 text-xs">Use o botão "Registrar Ligação" para adicionar</p>
            </div>
        );
    }

    // Resumo por função
    const countByFuncao = records.reduce((acc, r) => {
        acc[r.funcao] = (acc[r.funcao] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const totalCasos = records.reduce((sum, r) => sum + (r.quantos_casos_ligacao || 0), 0);

    return (
        <div className="space-y-4">
            {/* Summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 flex flex-col gap-1 shadow">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Ligações</p>
                    <p className="text-2xl font-black text-emerald-600">{records.length}</p>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 flex flex-col gap-1 shadow">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Casos</p>
                    <p className="text-2xl font-black text-teal-600">{totalCasos}</p>
                </div>
                {Object.entries(countByFuncao).map(([funcao, count]) => (
                    <div key={funcao} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 flex flex-col gap-1 shadow">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">{funcao}</p>
                        <div className="flex items-end gap-1">
                            <p className="text-2xl font-black text-slate-700 dark:text-white">{count}</p>
                            <span className="text-[10px] font-bold text-slate-400 mb-1">lig.</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                                <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Data</th>
                                <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Função</th>
                                <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Sub-Campo</th>
                                <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Nome</th>
                                <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Solicitação</th>
                                <th className="px-4 py-3 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Tempo</th>
                                <th className="px-4 py-3 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Casos</th>
                                <th className="px-4 py-3 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {records.map(record => (
                                <Row
                                    key={record.id}
                                    record={record}
                                    onDelete={handleDelete}
                                    isAdmin={isAdmin}
                                    isDeleting={isDeleting}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
