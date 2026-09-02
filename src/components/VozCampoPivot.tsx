import React, { useState } from "react";
import { ChevronUp, ChevronDown, Users, Clock, Timer } from "lucide-react";
import { VozCampoRecord } from "../types";
import { parseTimeToSeconds, formatSecondsToHuman } from "../utils/timeHelpers";

interface VozCampoPivotProps {
    records: VozCampoRecord[];
}

interface TecnicoSummary {
    nome: string;
    funcao: string;
    totalLigacoes: number;
    totalCasos: number;
    mediaCasos: string;
    totalSeconds: number;
    tempoTotalFormatado: string;
    tempoMedioSeconds: number;
    tempoMedioFormatado: string;
    motivos: string[];
    motivoPrincipal: string;
}

type SortKey = "nome" | "totalLigacoes" | "totalCasos" | "mediaCasos" | "totalSeconds" | "tempoMedioSeconds";

export const VozCampoPivot: React.FC<VozCampoPivotProps> = ({ records }) => {
    const [sortKey, setSortKey] = useState<SortKey>("totalLigacoes");
    const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
    const [search, setSearch] = useState("");

    if (records.length === 0) return null;

    // Agrupa por tecnico
    const pivot: Record<string, {
        nome: string;
        funcao: string;
        totalLigacoes: number;
        totalCasos: number;
        totalSeconds: number;
        motivos: string[];
    }> = {};

    records.forEach(r => {
        const key = r.nome_tecnico_consultor || "(Não informado)";
        if (!pivot[key]) {
            pivot[key] = {
                nome: key,
                funcao: r.funcao,
                totalLigacoes: 0,
                totalCasos: 0,
                totalSeconds: 0,
                motivos: [],
            };
        }
        pivot[key].totalLigacoes += 1;
        pivot[key].totalCasos += r.quantos_casos_ligacao || 0;
        pivot[key].totalSeconds += parseTimeToSeconds(r.tempo_ligacao);
        pivot[key].motivos.push(r.solicitacao);
    });

    // Calcula medias, tempos formatados e motivo principal
    const rows: TecnicoSummary[] = Object.values(pivot).map(t => {
        const mediaCasos = t.totalLigacoes > 0 ? (t.totalCasos / t.totalLigacoes).toFixed(1) : "0";
        const tempoMedioSeconds = t.totalLigacoes > 0 ? Math.round(t.totalSeconds / t.totalLigacoes) : 0;
        
        const motiCount: Record<string, number> = {};
        t.motivos.forEach(m => { motiCount[m] = (motiCount[m] || 0) + 1; });
        const principal = Object.entries(motiCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "";

        return {
            nome: t.nome,
            funcao: t.funcao,
            totalLigacoes: t.totalLigacoes,
            totalCasos: t.totalCasos,
            mediaCasos,
            totalSeconds: t.totalSeconds,
            tempoTotalFormatado: formatSecondsToHuman(t.totalSeconds),
            tempoMedioSeconds,
            tempoMedioFormatado: formatSecondsToHuman(tempoMedioSeconds),
            motivos: t.motivos,
            motivoPrincipal: principal,
        };
    });

    // Filtro
    const filtered = rows.filter(r =>
        r.nome.toLowerCase().includes(search.toLowerCase()) ||
        r.funcao.toLowerCase().includes(search.toLowerCase()) ||
        r.motivoPrincipal.toLowerCase().includes(search.toLowerCase())
    );

    // Ordenacao
    const sorted = [...filtered].sort((a, b) => {
        let va: any = a[sortKey];
        let vb: any = b[sortKey];
        if (sortKey === "mediaCasos") { va = parseFloat(va); vb = parseFloat(vb); }
        if (sortKey === "nome") { va = va.toLowerCase(); vb = vb.toLowerCase(); }
        if (va < vb) return sortDir === "asc" ? -1 : 1;
        if (va > vb) return sortDir === "asc" ? 1 : -1;
        return 0;
    });

    const handleSort = (key: SortKey) => {
        if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
        else { setSortKey(key); setSortDir("desc"); }
    };

    const SortIcon = ({ k }: { k: SortKey }) => sortKey === k
        ? (sortDir === "desc" ? <ChevronDown size={12} className="inline ml-1 text-emerald-500" /> : <ChevronUp size={12} className="inline ml-1 text-emerald-500" />)
        : <ChevronDown size={12} className="inline ml-1 text-slate-300" />;

    const thClass = "px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-emerald-600 transition-colors select-none whitespace-nowrap";

    return (
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                        <Users size={18} className="text-emerald-600" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Consolidado por Técnico</p>
                        <p className="text-sm font-black text-slate-700 dark:text-slate-200">Ligações, Casos e Tempo em Linha</p>
                    </div>
                </div>
                <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Buscar técnico, função ou motivo..."
                    className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-4 text-sm font-bold text-slate-700 dark:text-slate-200 focus:border-emerald-400 outline-none transition-all placeholder:font-normal placeholder:text-slate-300 w-full sm:w-72"
                />
            </div>

            {sorted.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-sm font-bold">Nenhum resultado encontrado.</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                                <th className={thClass} onClick={() => handleSort("nome")}>Nome <SortIcon k="nome" /></th>
                                <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Função</th>
                                <th className={thClass + " text-center"} onClick={() => handleSort("totalLigacoes")}>Ligações <SortIcon k="totalLigacoes" /></th>
                                <th className={thClass + " text-center"} onClick={() => handleSort("totalSeconds")}>Tempo Total <SortIcon k="totalSeconds" /></th>
                                <th className={thClass + " text-center"} onClick={() => handleSort("tempoMedioSeconds")}>Tempo Médio <SortIcon k="tempoMedioSeconds" /></th>
                                <th className={thClass + " text-center"} onClick={() => handleSort("totalCasos")}>Casos <SortIcon k="totalCasos" /></th>
                                <th className={thClass + " text-center"} onClick={() => handleSort("mediaCasos")}>Média Casos <SortIcon k="mediaCasos" /></th>
                                <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Motivo Principal</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sorted.map((row, idx) => (
                                <tr key={row.nome} className={`border-b border-slate-100 dark:border-slate-800 transition-colors ${idx % 2 === 0 ? "bg-white dark:bg-slate-900" : "bg-slate-50/40 dark:bg-slate-800/20"}`}>
                                    <td className="px-4 py-3 text-xs font-black text-slate-700 dark:text-slate-200 max-w-[180px] truncate">{row.nome || "(Não informado)"}</td>
                                    <td className="px-4 py-3">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300">
                                            {row.funcao}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 font-black text-sm">
                                            {row.totalLigacoes}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className="inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 px-2.5 py-1 rounded-lg text-xs font-black">
                                            <Clock size={11} className="text-amber-500" />
                                            {row.tempoTotalFormatado}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-lg text-xs font-bold">
                                            <Timer size={11} className="text-slate-400" />
                                            {row.tempoMedioFormatado}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 font-black text-sm">
                                            {row.totalCasos}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className="text-xs font-black text-slate-600 dark:text-slate-300">{row.mediaCasos}</span>
                                    </td>
                                    <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400 max-w-[200px] truncate" title={row.motivoPrincipal}>
                                        {row.motivoPrincipal}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

