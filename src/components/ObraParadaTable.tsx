import React, { useState } from 'react';
import { Trash2, ChevronUp, ChevronDown, HardHat, CheckCircle2, XCircle, RefreshCcw, PlusCircle } from 'lucide-react';
import { useObraParada } from '../contexts/ObraParadaContext';
import { useAuth } from '../contexts/AuthContext';
import { ObraParadaRecord } from '../types';

type SortKey = 'date' | 'numero_caso' | 'obra_parada' | 'tipo_caso';

export const ObraParadaTable: React.FC = () => {
    const { records, isLoading, deleteRecord } = useObraParada();
    const { isAdmin } = useAuth();
    const [sortKey, setSortKey] = useState<SortKey>('date');
    const [sortAsc, setSortAsc] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

    const handleSort = (key: SortKey) => {
        if (sortKey === key) setSortAsc(p => !p);
        else { setSortKey(key); setSortAsc(true); }
    };

    const sorted = [...records].sort((a, b) => {
        let valA: string | boolean = a[sortKey] ?? '';
        let valB: string | boolean = b[sortKey] ?? '';
        if (typeof valA === 'boolean') valA = String(valA);
        if (typeof valB === 'boolean') valB = String(valB);
        return sortAsc
            ? String(valA).localeCompare(String(valB))
            : String(valB).localeCompare(String(valA));
    });

    const SortIcon = ({ col }: { col: SortKey }) => {
        if (sortKey !== col) return <ChevronUp size={12} className="opacity-20" />;
        return sortAsc
            ? <ChevronUp size={12} className="text-amber-500" />
            : <ChevronDown size={12} className="text-amber-500" />;
    };

    const handleDelete = async (id: string) => {
        await deleteRecord(id);
        setConfirmDelete(null);
    };

    if (isLoading) {
        return (
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl p-12 flex flex-col items-center gap-4">
                <RefreshCcw size={32} className="text-amber-500 animate-spin" />
                <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">Carregando registros...</p>
            </div>
        );
    }

    if (records.length === 0) {
        return (
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl p-12 flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-[1.5rem] bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                    <HardHat size={32} className="text-amber-400" />
                </div>
                <div className="text-center">
                    <p className="font-black text-slate-700 dark:text-slate-200 text-lg">Nenhum registro encontrado</p>
                    <p className="text-slate-400 text-sm mt-1">Registre o primeiro caso de Obra Parada neste período.</p>
                </div>
                <div className="flex items-center gap-2 text-amber-500 text-xs font-black uppercase tracking-widest animate-pulse">
                    <PlusCircle size={14} /> Clique em "Registrar Caso" para começar
                </div>
            </div>
        );
    }

    const colClass = "px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-slate-400 cursor-pointer hover:text-amber-600 transition-colors select-none";

    return (
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden">
            {/* Summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 border-b border-slate-100 dark:border-slate-800">
                <SummaryCard label="Total de Casos" value={records.length} color="amber" />
                <SummaryCard label="Obras Paradas" value={records.filter(r => r.obra_parada).length} color="red" />
                <SummaryCard label="Em Andamento" value={records.filter(r => !r.obra_parada).length} color="green" />
                <SummaryCard label="Rechamadas" value={records.filter(r => r.tipo_caso === 'Rechamada').length} color="blue" />
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                            <th className={colClass} onClick={() => handleSort('date')}>
                                <span className="flex items-center gap-1">Data <SortIcon col="date" /></span>
                            </th>
                            <th className={colClass} onClick={() => handleSort('numero_caso')}>
                                <span className="flex items-center gap-1">Nº do Caso <SortIcon col="numero_caso" /></span>
                            </th>
                            <th className={colClass} onClick={() => handleSort('obra_parada')}>
                                <span className="flex items-center gap-1">Obra Parada? <SortIcon col="obra_parada" /></span>
                            </th>
                            <th className={colClass}>Tempo Parada</th>
                            <th className={colClass}>Tempo de Ligação</th>
                            <th className={colClass} onClick={() => handleSort('tipo_caso')}>
                                <span className="flex items-center gap-1">Tipo <SortIcon col="tipo_caso" /></span>
                            </th>
                            <th className={colClass}>Registrado Por</th>
                            {isAdmin && <th className={colClass}>Ações</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {sorted.map((record) => (
                            <Row
                                key={record.id}
                                record={record}
                                isAdmin={isAdmin}
                                confirmDelete={confirmDelete}
                                setConfirmDelete={setConfirmDelete}
                                onDelete={handleDelete}
                            />
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {records.length} registro{records.length !== 1 ? 's' : ''} no período
                </p>
            </div>
        </div>
    );
};

const SummaryCard: React.FC<{ label: string; value: number; color: 'amber' | 'red' | 'green' | 'blue' }> = ({ label, value, color }) => {
    const colors = {
        amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600',
        red: 'bg-red-50 dark:bg-red-900/20 text-red-600',
        green: 'bg-green-50 dark:bg-green-900/20 text-green-600',
        blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600',
    };
    return (
        <div className={`rounded-2xl p-4 ${colors[color]}`}>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-70">{label}</p>
            <p className="text-3xl font-black mt-1">{value}</p>
        </div>
    );
};

interface RowProps {
    record: ObraParadaRecord;
    isAdmin: boolean;
    confirmDelete: string | null;
    setConfirmDelete: (id: string | null) => void;
    onDelete: (id: string) => void;
}

const Row: React.FC<RowProps> = ({ record, isAdmin, confirmDelete, setConfirmDelete, onDelete }) => {
    const isConfirming = confirmDelete === record.id;

    const fmtDate = (d: string) => {
        const [y, m, day] = d.split('-');
        return `${day}/${m}/${y}`;
    };

    return (
        <tr className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-amber-50/30 dark:hover:bg-amber-900/5 transition-colors">
            <td className="px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-300 whitespace-nowrap">
                {fmtDate(record.date)}
            </td>
            <td className="px-4 py-3">
                <span className="text-xs font-black text-slate-800 dark:text-slate-100">{record.numero_caso}</span>
            </td>
            <td className="px-4 py-3">
                {record.obra_parada ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 dark:bg-red-900/20 text-red-600 text-[10px] font-black uppercase tracking-widest">
                        <XCircle size={12} /> Sim
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/20 text-green-600 text-[10px] font-black uppercase tracking-widest">
                        <CheckCircle2 size={12} /> Não
                    </span>
                )}
            </td>
            <td className="px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400">
                {record.obra_parada ? (record.tempo_parada || '—') : '—'}
            </td>
            <td className="px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400">
                {record.tempo_ligacao || '—'}
            </td>
            <td className="px-4 py-3">
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    record.tipo_caso === 'Novo'
                        ? 'bg-amber-100 dark:bg-amber-900/20 text-amber-700'
                        : 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700'
                }`}>
                    {record.tipo_caso === 'Novo' ? '🆕' : '🔄'} {record.tipo_caso}
                </span>
            </td>
            <td className="px-4 py-3 text-xs text-slate-400 font-bold">{record.registrado_por || '—'}</td>
            {isAdmin && (
                <td className="px-4 py-3">
                    {isConfirming ? (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => onDelete(record.id!)}
                                className="px-2 py-1 rounded-lg bg-red-500 text-white text-[10px] font-black uppercase hover:bg-red-600 transition-colors"
                            >
                                Confirmar
                            </button>
                            <button
                                onClick={() => setConfirmDelete(null)}
                                className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-black uppercase hover:bg-slate-200 transition-colors"
                            >
                                Cancelar
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setConfirmDelete(record.id!)}
                            className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-300 hover:text-red-500 transition-all"
                            title="Remover registro"
                        >
                            <Trash2 size={14} />
                        </button>
                    )}
                </td>
            )}
        </tr>
    );
};
