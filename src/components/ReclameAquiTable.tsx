import React, { useState, useMemo } from 'react';
import { 
    Search, ChevronDown, ChevronUp, Trash2, Edit2, Loader2, 
    MessageSquare, CheckCircle2, XCircle, Star, AlertCircle, 
    FileText, User, Tag, Calendar, Mail, Wrench
} from 'lucide-react';
import { useReclameAqui } from '../contexts/ReclameAquiContext';
import { useAuth } from '../contexts/AuthContext';
import { ReclameAquiRecord } from '../types';

interface ReclameAquiTableProps {
    onEditRecord: (record: ReclameAquiRecord) => void;
}

const STATUS_BADGE: Record<string, string> = {
    'Em Tratativa': 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200',
    'Respondido': 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200',
    'Aguardando Consumidor': 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200',
    'Finalizado': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200',
    'Moderação Solicitada': 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300 border-rose-200',
    'Desativada': 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-200',
};

type SortKey = 'data_postagem' | 'registro_ra' | 'consumidor' | 'status_atual' | 'resolvido' | 'nota_avaliacao';

export const ReclameAquiTable: React.FC<ReclameAquiTableProps> = ({ onEditRecord }) => {
    const { records, isLoading, deleteRecord } = useReclameAqui();
    const { isAdmin } = useAuth();

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [sortKey, setSortKey] = useState<SortKey>('data_postagem');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
    const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Paginação
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;

    // --- Métricas Gerais ---
    const metrics = useMemo(() => {
        const total = records.length;
        if (total === 0) return { total: 0, resolvidosPct: '0%', voltariaPct: '0%', notaMedia: '0.0', emTratativa: 0 };

        let resolvidosSim = 0;
        let voltariaSim = 0;
        let sumNotas = 0;
        let countNotas = 0;
        let emTratativa = 0;

        records.forEach(r => {
            const res = (r.resolvido || '').toLowerCase().trim();
            if (res.startsWith('s')) resolvidosSim++;

            const vol = (r.voltaria_fazer_negocio || '').toLowerCase().trim();
            if (vol.startsWith('s')) voltariaSim++;

            const st = (r.status_atual || '').toLowerCase().trim();
            if (st.includes('tratativa') || st.includes('aberto')) emTratativa++;

            const notaNum = parseFloat(String(r.nota_avaliacao || '').replace(',', '.'));
            if (!isNaN(notaNum)) {
                sumNotas += notaNum;
                countNotas++;
            }
        });

        return {
            total,
            resolvidosPct: `${Math.round((resolvidosSim / total) * 100)}%`,
            voltariaPct: `${Math.round((voltariaSim / total) * 100)}%`,
            notaMedia: countNotas > 0 ? (sumNotas / countNotas).toFixed(1) : '—',
            emTratativa
        };
    }, [records]);

    // --- Filtros e Ordenação ---
    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return records.filter(r => {
            const matchesSearch = (
                (r.consumidor || '').toLowerCase().includes(q) ||
                (r.registro_ra || '').toLowerCase().includes(q) ||
                (r.chamado || '').toLowerCase().includes(q) ||
                (r.produto || '').toLowerCase().includes(q) ||
                (r.patologia_causa || '').toLowerCase().includes(q) ||
                (r.nota_fiscal || '').toLowerCase().includes(q) ||
                (r.visita_tecnica || '').toLowerCase().includes(q)
            );

            const matchesStatus = statusFilter === 'ALL' || r.status_atual === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [records, search, statusFilter]);

    const sorted = useMemo(() => {
        return [...filtered].sort((a, b) => {
            let va: any = a[sortKey] || '';
            let vb: any = b[sortKey] || '';

            if (sortKey === 'nota_avaliacao') {
                va = parseFloat(String(va).replace(',', '.')) || 0;
                vb = parseFloat(String(vb).replace(',', '.')) || 0;
            } else {
                va = String(va).toLowerCase();
                vb = String(vb).toLowerCase();
            }

            if (va < vb) return sortDir === 'asc' ? -1 : 1;
            if (va > vb) return sortDir === 'asc' ? 1 : -1;
            return 0;
        });
    }, [filtered, sortKey, sortDir]);

    const paginated = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return sorted.slice(start, start + itemsPerPage);
    }, [sorted, currentPage]);

    const totalPages = Math.ceil(sorted.length / itemsPerPage);

    const handleSort = (key: SortKey) => {
        if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortKey(key); setSortDir('desc'); }
    };

    const toggleRow = (id: string) => {
        setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir esta reclamação do Reclame Aqui?')) {
            setDeletingId(id);
            await deleteRecord(id);
            setDeletingId(null);
        }
    };

    const SortIcon = ({ k }: { k: SortKey }) => sortKey === k
        ? (sortDir === 'desc' ? <ChevronDown size={12} className="inline ml-1 text-red-500" /> : <ChevronUp size={12} className="inline ml-1 text-red-500" />)
        : <ChevronDown size={12} className="inline ml-1 text-slate-300" />;

    const thClass = "px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-red-600 transition-colors select-none whitespace-nowrap";

    if (isLoading) {
        return (
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-xl border border-slate-100 dark:border-slate-800 p-16 flex flex-col items-center gap-4">
                <Loader2 size={36} className="animate-spin text-red-500" />
                <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">Carregando dados do Reclame Aqui...</p>
            </div>
        );
    }

    if (records.length === 0) {
        return (
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-xl border border-slate-100 dark:border-slate-800 p-16 flex flex-col items-center gap-4 text-center">
                <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                    <MessageSquare size={28} className="text-red-400" />
                </div>
                <p className="text-slate-700 dark:text-white font-black text-base">Nenhum caso cadastrado</p>
                <p className="text-slate-400 text-xs max-w-sm">
                    Utilize o botão "Importar Planilha" para subir sua base do Excel ou "Novo Caso" para registrar manualmente.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">

            {/* Cards de Métricas */}
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3">
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 flex flex-col gap-1 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Reclamações</p>
                    <p className="text-2xl font-black text-slate-800 dark:text-white">{metrics.total}</p>
                    <p className="text-[10px] text-slate-400 font-bold">{metrics.emTratativa} em tratativa</p>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 flex flex-col gap-1 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Índice Resolvido</p>
                    <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{metrics.resolvidosPct}</p>
                    <p className="text-[10px] text-slate-400 font-bold">casos solucionados</p>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 flex flex-col gap-1 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Voltaria a Fazer Negócio</p>
                    <p className="text-2xl font-black text-blue-600 dark:text-blue-400">{metrics.voltariaPct}</p>
                    <p className="text-[10px] text-slate-400 font-bold">retenção do cliente</p>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 flex flex-col gap-1 shadow-sm">
                    <div className="flex items-center gap-1">
                        <Star size={12} className="text-amber-500 fill-amber-500" />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nota Média RA</p>
                    </div>
                    <p className="text-2xl font-black text-amber-500">{metrics.notaMedia}</p>
                    <p className="text-[10px] text-slate-400 font-bold">avaliação do consumidor</p>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 flex flex-col gap-1 shadow-sm col-span-2 sm:col-span-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Resultados Filtrados</p>
                    <p className="text-2xl font-black text-red-600">{filtered.length}</p>
                    <p className="text-[10px] text-slate-400 font-bold">exibidos na tabela</p>
                </div>
            </div>

            {/* Tabela de Casos */}
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden">

                {/* Barra de Busca e Filtros */}
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-3">
                    <div className="flex items-center gap-2 flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 w-full">
                        <Search size={14} className="text-slate-400 shrink-0" />
                        <input
                            type="text"
                            value={search}
                            onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                            placeholder="Buscar por Consumidor, Registro R.A., Chamado, Produto, NF..."
                            className="bg-transparent text-xs font-bold text-slate-700 dark:text-slate-200 outline-none w-full placeholder:font-normal placeholder:text-slate-300"
                        />
                    </div>

                    <select
                        value={statusFilter}
                        onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                        className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer w-full sm:w-auto shrink-0"
                    >
                        <option value="ALL">Todos os Status</option>
                        <option value="Em Tratativa">Em Tratativa</option>
                        <option value="Respondido">Respondido</option>
                        <option value="Aguardando Consumidor">Aguardando Consumidor</option>
                        <option value="Finalizado">Finalizado</option>
                        <option value="Moderação Solicitada">Moderação Solicitada</option>
                    </select>
                </div>

                {/* Listagem */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                                <th className={thClass} onClick={() => handleSort('registro_ra')}>Registro R.A. <SortIcon k="registro_ra" /></th>
                                <th className={thClass} onClick={() => handleSort('data_postagem')}>Data Postagem <SortIcon k="data_postagem" /></th>
                                <th className={thClass} onClick={() => handleSort('consumidor')}>Consumidor <SortIcon k="consumidor" /></th>
                                <th className={thClass} onClick={() => handleSort('status_atual')}>Status <SortIcon k="status_atual" /></th>
                                <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Chamado</th>
                                <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Patologia / Causa</th>
                                <th className={thClass + " text-center"} onClick={() => handleSort('resolvido')}>Resolvido <SortIcon k="resolvido" /></th>
                                <th className={thClass + " text-center"} onClick={() => handleSort('nota_avaliacao')}>Nota <SortIcon k="nota_avaliacao" /></th>
                                <th className="px-4 py-3 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginated.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="p-12 text-center text-slate-400 text-xs font-bold">
                                        Nenhum registro encontrado para a busca.
                                    </td>
                                </tr>
                            ) : (
                                paginated.map((r, idx) => {
                                    const isExpanded = !!expandedRows[r.id || String(idx)];
                                    const rowKey = r.id || String(idx);
                                    const isResolvidoSim = (r.resolvido || '').toLowerCase().startsWith('s');

                                    return (
                                        <React.Fragment key={rowKey}>
                                            <tr
                                                onClick={() => toggleRow(rowKey)}
                                                className={`border-b border-slate-100 dark:border-slate-800 transition-colors cursor-pointer hover:bg-red-50/30 dark:hover:bg-red-950/10 ${idx % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/40 dark:bg-slate-800/20'}`}
                                            >
                                                {/* Registro RA */}
                                                <td className="px-4 py-3.5 whitespace-nowrap">
                                                    <span className="font-black text-xs text-red-600 dark:text-red-400">
                                                        {r.registro_ra || '—'}
                                                    </span>
                                                </td>

                                                {/* Data Postagem */}
                                                <td className="px-4 py-3.5 text-xs font-bold text-slate-500 whitespace-nowrap">
                                                    {r.data_postagem || '—'}
                                                </td>

                                                {/* Consumidor */}
                                                <td className="px-4 py-3.5 text-xs font-black text-slate-800 dark:text-slate-200 max-w-[180px] truncate" title={r.consumidor}>
                                                    {r.consumidor || '—'}
                                                </td>

                                                {/* Status Atual */}
                                                <td className="px-4 py-3.5 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${STATUS_BADGE[r.status_atual || ''] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                                                        {r.status_atual || 'Pendente'}
                                                    </span>
                                                </td>

                                                {/* Chamado */}
                                                <td className="px-4 py-3.5 text-xs font-bold text-slate-600 dark:text-slate-300 whitespace-nowrap">
                                                    {r.chamado || '—'}
                                                </td>

                                                {/* Patologia */}
                                                <td className="px-4 py-3.5 text-xs text-slate-600 dark:text-slate-400 max-w-[160px] truncate" title={r.patologia_causa}>
                                                    {r.patologia_causa || '—'}
                                                </td>

                                                {/* Resolvido */}
                                                <td className="px-4 py-3.5 text-center whitespace-nowrap">
                                                    {r.resolvido ? (
                                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black ${isResolvidoSim ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'}`}>
                                                            {isResolvidoSim ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                                                            {r.resolvido}
                                                        </span>
                                                    ) : '—'}
                                                </td>

                                                {/* Nota */}
                                                <td className="px-4 py-3.5 text-center whitespace-nowrap">
                                                    {r.nota_avaliacao ? (
                                                        <span className="inline-flex items-center gap-1 font-black text-xs text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-lg">
                                                            <Star size={10} className="fill-amber-500" />
                                                            {r.nota_avaliacao}
                                                        </span>
                                                    ) : '—'}
                                                </td>

                                                {/* Ações */}
                                                <td className="px-4 py-3.5 text-center whitespace-nowrap" onClick={e => e.stopPropagation()}>
                                                    <div className="flex items-center justify-center gap-1.5">
                                                        <button
                                                            onClick={() => toggleRow(rowKey)}
                                                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                                            title="Ver detalhes completos"
                                                        >
                                                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                                        </button>
                                                        <button
                                                            onClick={() => onEditRecord(r)}
                                                            className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                                            title="Editar registro"
                                                        >
                                                            <Edit2 size={14} />
                                                        </button>
                                                        {isAdmin && r.id && (
                                                            <button
                                                                onClick={() => handleDelete(r.id!)}
                                                                disabled={deletingId === r.id}
                                                                className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                                                                title="Excluir"
                                                            >
                                                                {deletingId === r.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>

                                            {/* Linha Expandida com todas as 21 colunas */}
                                            {isExpanded && (
                                                <tr className="bg-red-50/40 dark:bg-red-950/10 border-b border-slate-200 dark:border-slate-800 animate-in fade-in duration-200">
                                                    <td colSpan={9} className="px-6 py-5">
                                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 text-xs">
                                                            <div>
                                                                <p className="text-[10px] font-black text-slate-400 uppercase">Nota Fiscal</p>
                                                                <p className="font-bold text-slate-700 dark:text-slate-200">{r.nota_fiscal || '—'}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] font-black text-slate-400 uppercase">Entrada / Canal</p>
                                                                <p className="font-bold text-slate-700 dark:text-slate-200">{r.entrada || '—'}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] font-black text-slate-400 uppercase">E-mail</p>
                                                                <p className="font-bold text-slate-700 dark:text-slate-200 truncate" title={r.email}>{r.email || '—'}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] font-black text-slate-400 uppercase">Data do Contato</p>
                                                                <p className="font-bold text-slate-700 dark:text-slate-200">{r.data_contato || '—'}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] font-black text-slate-400 uppercase">Resposta Pública</p>
                                                                <p className="font-bold text-slate-700 dark:text-slate-200">{r.resposta_publica || '—'}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] font-black text-slate-400 uppercase">Voltaria a Fazer Negócio</p>
                                                                <p className="font-bold text-slate-700 dark:text-slate-200">{r.voltaria_fazer_negocio || '—'}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] font-black text-slate-400 uppercase">Moderação</p>
                                                                <p className="font-bold text-slate-700 dark:text-slate-200">{r.moderacao || '—'}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] font-black text-slate-400 uppercase">Visita Técnica</p>
                                                                <p className="font-bold text-slate-700 dark:text-slate-200">{r.visita_tecnica || '—'}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] font-black text-slate-400 uppercase">Data Réplica</p>
                                                                <p className="font-bold text-slate-700 dark:text-slate-200">{r.data_replica || '—'}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] font-black text-slate-400 uppercase">Data Tréplica</p>
                                                                <p className="font-bold text-slate-700 dark:text-slate-200">{r.data_treplica || '—'}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] font-black text-slate-400 uppercase">Procedente</p>
                                                                <p className="font-bold text-slate-700 dark:text-slate-200">{r.procedente || '—'}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] font-black text-slate-400 uppercase">MO (Mão de Obra)</p>
                                                                <p className="font-bold text-slate-700 dark:text-slate-200">{r.mo || '—'}</p>
                                                            </div>
                                                            <div className="col-span-2 sm:col-span-3">
                                                                <p className="text-[10px] font-black text-slate-400 uppercase">Produto Envolvido</p>
                                                                <p className="font-bold text-slate-700 dark:text-slate-200">{r.produto || '—'}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Paginação */}
                {totalPages > 1 && (
                    <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-slate-500">
                        <span>Página {currentPage} de {totalPages} ({sorted.length} itens)</span>
                        <div className="flex gap-1">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 disabled:opacity-40"
                            >
                                Anterior
                            </button>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 disabled:opacity-40"
                            >
                                Próxima
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};
