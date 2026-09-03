import React from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';
import { ReclameAquiRecord } from '../types';

interface ReclameAquiChartsProps {
    records: ReclameAquiRecord[];
}

const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#64748b'];

const TooltipCustom = ({ active, payload, label }: any) => active && payload?.length ? (
    <div className="bg-slate-900 text-white rounded-2xl px-4 py-3 shadow-2xl border border-slate-700 text-xs max-w-[240px]">
        <p className="font-black text-red-400 mb-1">{label || payload[0]?.name}</p>
        <p className="font-bold">{payload[0].value} caso{payload[0].value !== 1 ? 's' : ''}</p>
        {payload[0]?.payload?.percentage && (
            <p className="text-slate-400">{payload[0].payload.percentage}% do total</p>
        )}
    </div>
) : null;

export const ReclameAquiCharts: React.FC<ReclameAquiChartsProps> = ({ records }) => {
    if (records.length === 0) return null;

    // 1. Top Patologias / Causas
    const patologiaMap = records.reduce((acc, r) => {
        const k = (r.patologia_causa || 'Não informada').trim();
        const short = k.length > 30 ? k.slice(0, 30) + '...' : k;
        acc[short] = (acc[short] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const patologiaData = Object.entries(patologiaMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([name, value]) => ({ name, value }));

    // 2. Status Atual
    const statusMap = records.reduce((acc, r) => {
        const k = (r.status_atual || 'Não informado').trim();
        acc[k] = (acc[k] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const statusTotal = Object.values(statusMap).reduce((a, b) => a + b, 0);
    const statusData = Object.entries(statusMap)
        .sort((a, b) => b[1] - a[1])
        .map(([name, value], idx) => ({
            name,
            value,
            percentage: Math.round((value / statusTotal) * 100),
            fill: COLORS[idx % COLORS.length]
        }));

    // 3. Resolvido vs Não Resolvido
    const resolvidoMap = records.reduce((acc, r) => {
        const val = (r.resolvido || '').toLowerCase().trim();
        const k = val.startsWith('s') ? 'Sim' : val.startsWith('n') ? 'Não' : 'Pendente';
        acc[k] = (acc[k] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const resolvidoData = [
        { name: 'Sim (Resolvido)', value: resolvidoMap['Sim'] || 0, fill: '#10b981' },
        { name: 'Não Resolvido', value: resolvidoMap['Não'] || 0, fill: '#ef4444' },
        { name: 'Pendente', value: resolvidoMap['Pendente'] || 0, fill: '#f59e0b' },
    ].filter(d => d.value > 0);

    // 4. Volume por Data de Postagem
    const dayMap = records.reduce((acc, r) => {
        if (r.data_postagem) {
            const d = r.data_postagem.slice(0, 10);
            acc[d] = (acc[d] || 0) + 1;
        }
        return acc;
    }, {} as Record<string, number>);

    const lineData = Object.entries(dayMap)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .slice(-15)
        .map(([date, total]) => ({
            date: date.slice(5).replace('-', '/'),
            casos: total
        }));

    return (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

            {/* Ranking de Patologias / Causas */}
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-xl border border-slate-100 dark:border-slate-800 p-6">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    Principais Patologias / Causas
                </p>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-6">
                    Motivos de reclamação mais frequentes
                </p>
                <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={patologiaData} layout="vertical" margin={{ left: 8, right: 32, top: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                        <XAxis type="number" tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                        <YAxis type="category" dataKey="name" width={170} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                        <Tooltip content={<TooltipCustom />} cursor={{ fill: 'rgba(239,68,68,0.06)' }} />
                        <Bar dataKey="value" fill="#ef4444" radius={[0, 8, 8, 0]} barSize={20} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Distribuição por Status */}
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-xl border border-slate-100 dark:border-slate-800 p-6">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    Status dos Casos
                </p>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-4">
                    Andamento das tratativas
                </p>
                <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                        <Pie data={statusData} cx="50%" cy="50%" innerRadius={65} outerRadius={100} paddingAngle={3} dataKey="value">
                            {statusData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                        </Pie>
                        <Tooltip content={<TooltipCustom />} />
                        <Legend formatter={(v) => <span style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{v}</span>} />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* Índice de Resolução */}
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-xl border border-slate-100 dark:border-slate-800 p-6">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    Índice de Resolução (Resolvido?)
                </p>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-4">
                    Percentual de problemas solucionados
                </p>
                <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                        <Pie data={resolvidoData} cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={4} dataKey="value">
                            {resolvidoData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                        </Pie>
                        <Tooltip content={<TooltipCustom />} />
                        <Legend formatter={(v) => <span style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{v}</span>} />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* Volume por Período */}
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-xl border border-slate-100 dark:border-slate-800 p-6">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    Volume de Reclamações
                </p>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-4">
                    Evolução das postagens recentes
                </p>
                {lineData.length > 1 ? (
                    <ResponsiveContainer width="100%" height={260}>
                        <AreaChart data={lineData} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
                            <defs>
                                <linearGradient id="gRA" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="date" tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                            <Tooltip content={<TooltipCustom />} />
                            <Area type="monotone" dataKey="casos" name="Casos" stroke="#ef4444" strokeWidth={2.5} fill="url(#gRA)" dot={{ r: 4, fill: '#ef4444', strokeWidth: 2, stroke: '#fff' }} />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-[260px] flex items-center justify-center text-slate-400 text-xs font-bold">
                        Dados de datas insuficientes para traçar linha do tempo.
                    </div>
                )}
            </div>

        </div>
    );
};
