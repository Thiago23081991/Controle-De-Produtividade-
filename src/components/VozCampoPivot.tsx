import React, { useState } from "react";
import { ChevronUp, ChevronDown, Users } from "lucide-react";
import { VozCampoRecord } from "../types";

interface VozCampoPivotProps {
    records: VozCampoRecord[];
}

interface TecnicoSummary {
    nome: string;
    funcao: string;
    totalLigacoes: number;
    totalCasos: number;
    mediaCasos: string;
    motivos: string[];
    motivoPrincipal: string;
}

type SortKey = "nome" | "totalLigacoes" | "totalCasos" | "mediaCasos";

export const VozCampoPivot: React.FC<VozCampoPivotProps> = ({ records }) => {
    const [sortKey, setSortKey] = useState<SortKey>("totalLigacoes");
    const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
    const [search, setSearch] = useState("");

    if (records.length === 0) return null;

    // Agrupa por tecnico
    const pivot: Record<string, TecnicoSummary> = {};
    records.forEach(r => {
        const key = r.nome_tecnico_consultor || "(Nao informado)";
        if (!pivot[key]) {
            pivot[key] = {
                nome: key,
                funcao: r.funcao,
                totalLigacoes: 0,
                totalCasos: 0,
                mediaCasos: "0",
                motivos: [],
                motivoPrincipal: "",
            };
        }
        pivot[key].totalLigacoes += 1;
        pivot[key].totalCasos += r.quantos_casos_ligacao || 0;
        pivot[key].motivos.push(r.solicitacao);
    });

    // Calcula media e motivo principal
    const rows: TecnicoSummary[] = Object.values(pivot).map(t => {
        const media = t.totalLigacoes > 0 ? (t.totalCasos / t.totalLigacoes).toFixed(1) : "0";
        const motiCount: Record<string, number> = {};
        t.motivos.forEach(m => { motiCount[m] = (motiCount[m] || 0) + 1; });
        const principal = Object.entries(motiCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "";
        return { ...t, mediaCasos: media, motivoPrincipal: principal };
    });

    // Filtro
    const filtered = rows.filter(r =>
        r.nome.toLowerCase().includes(search.toLowerCase()) ||
        r.funcao.toLowerCase().includes(search.toLowerCase())
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
        if (sortKey === key) setDir(sortDir === "asc" ? "desc" : "asc");
        else { setSortKey(key); setSortDir("desc"); }
    };
    const setDir = setSortDir;

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
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Consolidado</p>
                        <p className="text-sm font-black text-slate-700 dark:text-slate-200">por Tecnico / Consultor</p>
                    </div>
                </div>
                <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Buscar tecnico ou funcao..."
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
                                <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Funcao</th>
                                <th className={thClass} onClick={() => handleSort("totalLigacoes")}>Ligacoes <SortIcon k="totalLigacoes" /></th>
                                <th className={thClass} onClick={() => handleSort("totalCasos")}>Casos <SortIcon k="totalCasos" /></th>
                                <th className={thClass} onClick={() => handleSort("mediaCasos")}>Media/Lig. <SortIcon k="mediaCasos" /></th>
                                <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Motivo Principal</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sorted.map((row, idx) => (
                                <tr key={row.nome} className={`border-b border-slate-100 dark:border-slate-800 transition-colors ${idx % 2 === 0 ? "bg-white dark:bg-slate-900" : "bg-slate-50/40 dark:bg-slate-800/20"}`}>
                                    <td className="px-4 py-3 text-xs font-black text-slate-700 dark:text-slate-200 max-w-[180px] truncate">{row.nome || "(Nao informado)"}</td>
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
