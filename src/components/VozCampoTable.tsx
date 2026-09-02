import React, { useState, useMemo } from 'react';
import { Trash2, Phone, Clock, FileText, Loader2, ChevronDown, ChevronUp, Search, Trophy, BarChart2, Timer } from 'lucide-react';
import { useVozCampo } from '../contexts/VozCampoContext';
import { useAuth } from '../contexts/AuthContext';
import { VozCampoRecord } from '../types';
import { parseTimeToSeconds, formatSecondsToHuman } from '../utils/timeHelpers';

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
                        <div className="flex flex-wrap gap-6">
                            <div className="flex items-start gap-2 flex-1 min-w-[200px]">
                                <FileText size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Solicitação Completa</p>
                                    <p className="text-sm text-slate-700 dark:text-slate-200 font-medium">{record.solicitacao}</p>
                                </div>
                            </div>
                            {record.relato_breve && (
                                <div className="flex items-start gap-2 flex-1 min-w-[200px]">
                                    <FileText size={14} className="text-teal-500 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Relato Breve</p>
                                        <p className="text-sm text-slate-700 dark:text-slate-200 font-medium">{record.relato_breve}</p>
                                    </div>
                                </div>
                            )}
                            {record.registrado_por && (
                                <div className="ml-auto text-right shrink-0">
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
    const [search, setSearch] = useState('');
    const [sortKey, setSortKey] = useState<'date' | 'funcao' | 'nome_tecnico_consultor' | 'quantos_casos_ligacao'>('date');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

    const handleDelete = async (id: string) => {
        if (!window.confirm('Deseja remover este registro?')) return;
        setIsDeleting(id);
        await deleteRecord(id);
        setIsDeleting(null);
    };

    const handleSort = (key: typeof sortKey) => {
        if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortKey(key); setSortDir('desc'); }
    };

    const SortIcon = ({ k }: { k: typeof sortKey }) =>
        sortKey === k
            ? (sortDir === 'desc' ? <ChevronDown size={11} className="inline ml-1 text-emerald-500" /> : <ChevronUp size={11} className="inline ml-1 text-emerald-500" />)
            : <ChevronDown size={11} className="inline ml-1 text-slate-300" />;

    const thClass = "px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-emerald-600 transition-colors select-none whitespace-nowrap";

    // --- Métricas (hooks ANTES dos early returns) ---
    const totalCasos = useMemo(() => records.reduce((sum, r) => sum + (r.quantos_casos_ligacao || 0), 0), [records]);
    const mediaCasos = useMemo(() => records.length > 0 ? (totalCasos / records.length).toFixed(1) : '0', [totalCasos, records.length]);

    // Métricas de Tempo
    const totalSeconds = useMemo(() => records.reduce((sum, r) => sum + parseTimeToSeconds(r.tempo_ligacao), 0), [records]);
    const avgSeconds = useMemo(() => records.length > 0 ? Math.round(totalSeconds / records.length) : 0, [totalSeconds, records.length]);

    // Estatísticas por Técnico (Ligações e Tempo)
    const statsTecnico = useMemo(() => {
        const stats: Record<string, { nome: string; funcao: string; count: number; totalSeconds: number }> = {};
        records.forEach(r => {
            const k = r.nome_tecnico_consultor || '(Não informado)';
            if (!stats[k]) {
                stats[k] = { nome: k, funcao: r.funcao, count: 0, totalSeconds: 0 };
            }
            stats[k].count += 1;
            stats[k].totalSeconds += parseTimeToSeconds(r.tempo_ligacao);
        });
        return stats;
    }, [records]);

    // Técnico que mais ligou (ordenado por qtd de ligações, desempate por tempo)
    const topTecnico = useMemo(() => {
        const list = Object.values(statsTecnico);
        return list.sort((a, b) => b.count - a.count || b.totalSeconds - a.totalSeconds)[0];
    }, [statsTecnico]);

    // Técnico com maior tempo em ligação
    const topTecnicoTempo = useMemo(() => {
        const list = Object.values(statsTecnico);
        return list.sort((a, b) => b.totalSeconds - a.totalSeconds)[0];
    }, [statsTecnico]);

    const countByFuncao = useMemo(() => records.reduce((acc, r) => {
        acc[r.funcao] = (acc[r.funcao] || 0) + 1;
        return acc;
    }, {} as Record<string, number>), [records]);

    // --- Filtro + Ordenação (hooks ANTES dos early returns) ---
    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return records.filter(r =>
            r.nome_tecnico_consultor?.toLowerCase().includes(q) ||
            r.solicitacao?.toLowerCase().includes(q) ||
            r.funcao?.toLowerCase().includes(q) ||
            r.sub_campo?.toLowerCase().includes(q)
        );
    }, [records, search]);

    const sorted = useMemo(() => {
        return [...filtered].sort((a, b) => {
            let va: any = a[sortKey] ?? '';
            let vb: any = b[sortKey] ?? '';
            if (sortKey === 'quantos_casos_ligacao') { va = Number(va); vb = Number(vb); }
            else { va = String(va).toLowerCase(); vb = String(vb).toLowerCase(); }
            if (va < vb) return sortDir === 'asc' ? -1 : 1;
            if (va > vb) return sortDir === 'asc' ? 1 : -1;
            return 0;
        });
    }, [filtered, sortKey, sortDir]);

    // Early returns DEPOIS de todos os hooks
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

    return (
        <div className="space-y-4">
            {/* Cards de resumo com Técnico que mais ligou e Tempo em linha */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 flex flex-col gap-1 shadow">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Ligações</p>
                    <p className="text-2xl font-black text-emerald-600">{records.length}</p>
                    <p className="text-[10px] text-slate-400 font-bold">no período</p>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 flex flex-col gap-1 shadow">
                    <div className="flex items-center gap-1.5 mb-0.5">
                        <Timer size={11} className="text-emerald-500" />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tempo em Linha</p>
                    </div>
                    <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400">{formatSecondsToHuman(totalSeconds)}</p>
                    <p className="text-[10px] text-slate-400 font-bold">Média: {formatSecondsToHuman(avgSeconds)} / lig.</p>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 flex flex-col gap-1 shadow">
                    <div className="flex items-center gap-1.5 mb-0.5">
                        <BarChart2 size={11} className="text-slate-400" />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Casos</p>
                    </div>
                    <p className="text-2xl font-black text-teal-600">{totalCasos}</p>
                    <p className="text-[10px] text-slate-400 font-bold">{mediaCasos} casos por ligação</p>
                </div>

                {/* Card do Técnico que Mais Ligou */}
                {topTecnico && (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-amber-500/30 dark:border-amber-500/20 p-4 flex flex-col gap-1 shadow xl:col-span-2 relative overflow-hidden">
                        <div className="flex items-center justify-between mb-0.5">
                            <div className="flex items-center gap-1.5">
                                <Trophy size={13} className="text-amber-500 animate-pulse" />
                                <p className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest">Técnico + Acionado</p>
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                                {topTecnico.funcao}
                            </span>
                        </div>
                        <p className="text-sm font-black text-slate-800 dark:text-white leading-tight truncate" title={topTecnico.nome}>
                            {topTecnico.nome}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-[11px] font-bold text-slate-600 dark:text-slate-300">
                            <span className="bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-md font-black">
                                {topTecnico.count} ligação{topTecnico.count !== 1 ? 'ões' : ''}
                            </span>
                            <span className="text-slate-400">•</span>
                            <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                                <Clock size={12} className="text-amber-500" />
                                {formatSecondsToHuman(topTecnico.totalSeconds)} em linha
                            </span>
                        </div>
                    </div>
                )}

                {/* Card de maior tempo em ligação (ou resumo por função) */}
                {topTecnicoTempo && topTecnicoTempo.nome !== topTecnico?.nome ? (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 flex flex-col gap-1 shadow">
                        <div className="flex items-center gap-1.5 mb-0.5">
                            <Clock size={11} className="text-blue-500" />
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">+ Tempo em Linha</p>
                        </div>
                        <p className="text-xs font-black text-slate-700 dark:text-white leading-tight truncate" title={topTecnicoTempo.nome}>
                            {topTecnicoTempo.nome}
                        </p>
                        <p className="text-sm font-black text-blue-600">{formatSecondsToHuman(topTecnicoTempo.totalSeconds)}</p>
                        <p className="text-[10px] text-slate-400 font-bold">{topTecnicoTempo.count} lig.</p>
                    </div>
                ) : (
                    Object.entries(countByFuncao).slice(0, 1).map(([funcao, count]) => (
                        <div key={funcao} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 flex flex-col gap-1 shadow">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">{funcao}</p>
                            <div className="flex items-end gap-1">
                                <p className="text-2xl font-black text-slate-700 dark:text-white">{count}</p>
                                <span className="text-[10px] font-bold text-slate-400 mb-1">lig.</span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Tabela com busca e ordenação */}
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                {/* Barra de busca */}
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                    <div className="flex items-center gap-2 flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5">
                        <Search size={14} className="text-slate-400 shrink-0" />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Buscar por nome, solicitação, função, sub-campo..."
                            className="bg-transparent text-sm font-bold text-slate-700 dark:text-slate-200 outline-none w-full placeholder:font-normal placeholder:text-slate-300"
                        />
                    </div>
                    {search && (
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
                            {sorted.length} resultado{sorted.length !== 1 ? 's' : ''}
                        </span>
                    )}
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                                <th className={thClass} onClick={() => handleSort('date')}>Data <SortIcon k="date" /></th>
                                <th className={thClass} onClick={() => handleSort('funcao')}>Função <SortIcon k="funcao" /></th>
                                <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Sub-Campo</th>
                                <th className={thClass} onClick={() => handleSort('nome_tecnico_consultor')}>Nome <SortIcon k="nome_tecnico_consultor" /></th>
                                <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Solicitação</th>
                                <th className="px-4 py-3 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Tempo</th>
                                <th className={thClass + ' text-center'} onClick={() => handleSort('quantos_casos_ligacao')}>Casos <SortIcon k="quantos_casos_ligacao" /></th>
                                <th className="px-4 py-3 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sorted.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-4 py-12 text-center text-slate-400 text-sm font-bold">
                                        Nenhum resultado para "{search}"
                                    </td>
                                </tr>
                            ) : sorted.map(record => (
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
