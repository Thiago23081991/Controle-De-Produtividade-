import React from "react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend,
    AreaChart, Area
} from "recharts";
import { VozCampoRecord } from "../types";

interface VozCampoChartsProps {
    records: VozCampoRecord[];
}

const FUNCAO_COLORS: Record<string, string> = {
    "Tecnico Suvinil":          "#10b981",
    "Tecnico Sherwin":          "#8b5cf6",
    "Tecnico da Distribuicao":  "#f59e0b",
    "Consultor":                "#3b82f6",
    "Tecnico da Representacao": "#a855f7",
    "Promotor":                 "#ec4899",
};
const COLOR_FALLBACK = ["#10b981","#3b82f6","#f59e0b","#8b5cf6","#ec4899","#14b8a6","#64748b"];

const TooltipBar = ({ active, payload, label }: any) => active && payload?.length ? (
    <div className="bg-slate-900 text-white rounded-2xl px-4 py-3 shadow-2xl border border-slate-700 text-xs max-w-[220px]">
        <p className="font-black text-emerald-400 mb-1">{label}</p>
        <p className="font-bold">{payload[0].value} ocorrencia{payload[0].value !== 1 ? "s" : ""}</p>
    </div>
) : null;

const TooltipPie = ({ active, payload }: any) => active && payload?.length ? (
    <div className="bg-slate-900 text-white rounded-2xl px-4 py-3 shadow-2xl border border-slate-700 text-xs">
        <p className="font-black mb-1" style={{ color: payload[0].payload.fill }}>{payload[0].name}</p>
        <p className="font-bold">{payload[0].value} ligacao{payload[0].value !== 1 ? "oes" : ""}</p>
        <p className="text-slate-400">{payload[0].payload.percent}%</p>
    </div>
) : null;

const TooltipLine = ({ active, payload, label }: any) => active && payload?.length ? (
    <div className="bg-slate-900 text-white rounded-2xl px-4 py-3 shadow-2xl border border-slate-700 text-xs">
        <p className="font-black text-emerald-400 mb-1">{label}</p>
        <p className="font-bold">{payload[0].value} ligacao{payload[0].value !== 1 ? "oes" : ""}</p>
        {payload[1] && <p className="text-teal-400 font-bold">{payload[1].value} caso{payload[1].value !== 1 ? "s" : ""}</p>}
    </div>
) : null;

export const VozCampoCharts: React.FC<VozCampoChartsProps> = ({ records }) => {
    if (records.length === 0) return null;

    // Solicitacoes mais frequentes
    const solMap = records.reduce((acc, r) => {
        const k = r.solicitacao.length > 38 ? r.solicitacao.slice(0, 38) + "..." : r.solicitacao;
        acc[k] = (acc[k] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    const solData = Object.entries(solMap).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, value]) => ({ name, value }));

    // Distribuicao por funcao
    const funcMap = records.reduce((acc, r) => { acc[r.funcao] = (acc[r.funcao] || 0) + 1; return acc; }, {} as Record<string, number>);
    const total = Object.values(funcMap).reduce((a, b) => a + b, 0);
    const funcData = Object.entries(funcMap).sort((a, b) => b[1] - a[1]).map(([name, value], i) => ({
        name, value,
        fill: FUNCAO_COLORS[name] || COLOR_FALLBACK[i % COLOR_FALLBACK.length],
        percent: Math.round((value / total) * 100),
    }));

    // Ligacoes por dia
    const dayMap = records.reduce((acc, r) => {
        acc[r.date] = acc[r.date] || { date: r.date, ligacoes: 0, casos: 0 };
        acc[r.date].ligacoes += 1;
        acc[r.date].casos += r.quantos_casos_ligacao || 0;
        return acc;
    }, {} as Record<string, { date: string; ligacoes: number; casos: number }>);
    const lineData = Object.values(dayMap).sort((a, b) => a.date.localeCompare(b.date)).map(d => ({ ...d, label: d.date.slice(5).replace("-", "/") }));
    const showLine = lineData.length > 1;

    return (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

            {/* Barras - Solicitacoes */}
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-xl border border-slate-100 dark:border-slate-800 p-6 xl:col-span-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ranking de Solicitacoes</p>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-6">Motivos de ligacao mais frequentes</p>
                <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={solData} layout="vertical" margin={{ left: 8, right: 32, top: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                        <XAxis type="number" tick={{ fontSize: 11, fontWeight: 700, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                        <YAxis type="category" dataKey="name" width={210} tick={{ fontSize: 10, fontWeight: 600, fill: "#64748b" }} axisLine={false} tickLine={false} />
                        <Tooltip content={<TooltipBar />} cursor={{ fill: "rgba(16,185,129,0.06)" }} />
                        <Bar dataKey="value" fill="#10b981" radius={[0, 8, 8, 0]} barSize={20} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Donut - Funcoes */}
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-xl border border-slate-100 dark:border-slate-800 p-6">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Distribuicao por Funcao</p>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-4">Perfil das ligacoes recebidas</p>
                <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                        <Pie data={funcData} cx="50%" cy="50%" innerRadius={65} outerRadius={100} paddingAngle={3} dataKey="value">
                            {funcData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                        </Pie>
                        <Tooltip content={<TooltipPie />} />
                        <Legend formatter={(v) => <span style={{ fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>{v}</span>} />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* Area - Volume por dia */}
            {showLine ? (
                <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-xl border border-slate-100 dark:border-slate-800 p-6">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Volume por Dia</p>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-4">Ligacoes e casos ao longo do periodo</p>
                    <ResponsiveContainer width="100%" height={260}>
                        <AreaChart data={lineData} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
                            <defs>
                                <linearGradient id="gL" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="gC" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="label" tick={{ fontSize: 10, fontWeight: 700, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 10, fontWeight: 700, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                            <Tooltip content={<TooltipLine />} />
                            <Area type="monotone" dataKey="ligacoes" name="Ligacoes" stroke="#10b981" strokeWidth={2.5} fill="url(#gL)" dot={{ r: 4, fill: "#10b981", strokeWidth: 2, stroke: "#fff" }} />
                            <Area type="monotone" dataKey="casos" name="Casos" stroke="#14b8a6" strokeWidth={2} strokeDasharray="4 2" fill="url(#gC)" dot={{ r: 3, fill: "#14b8a6", strokeWidth: 2, stroke: "#fff" }} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-xl border border-slate-100 dark:border-slate-800 p-6 flex flex-col items-center justify-center text-center gap-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Volume por Dia</p>
                    <p className="text-slate-400 text-sm mt-2">Selecione um periodo com mais de 1 dia para ver a linha do tempo.</p>
                </div>
            )}
        </div>
    );
};
