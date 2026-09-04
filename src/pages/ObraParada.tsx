import React, { useState } from 'react';
import { HardHat, Plus, RefreshCcw, Download } from 'lucide-react';
import { ObraParadaFormModal } from '../components/ObraParadaFormModal';
import { ObraParadaTable } from '../components/ObraParadaTable';
import { ObraParadaProvider, useObraParada } from '../contexts/ObraParadaContext';

const MESES_PT = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

const getLastMonths = () => {
    const options: { value: string; label: string }[] = [];
    const now = new Date();
    for (let i = 0; i < 13; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const label = `${MESES_PT[d.getMonth()]}/${d.getFullYear()}`;
        options.push({ value, label });
    }
    return options;
};

const ObraParadaContent: React.FC = () => {
    const { loadRecords, isLoading, period, setPeriod, records } = useObraParada();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleExport = () => {
        if (records.length === 0) return;

        const headers = ['Data', 'Número do Caso', 'Obra Parada?', 'Tempo Parada', 'Tempo de Ligação', 'Tipo do Caso', 'Registrado Por'];
        const rows = records.map(r => [
            r.date,
            r.numero_caso,
            r.obra_parada ? 'Sim' : 'Não',
            r.tempo_parada || '',
            r.tempo_ligacao || '',
            r.tipo_caso,
            r.registrado_por || ''
        ]);

        const csvContent = [headers, ...rows]
            .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(';'))
            .join('\n');

        const BOM = '\uFEFF';
        const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const periodLabel = period === 'today' ? 'Hoje' : period === 'week' ? 'Semana' : period === 'month' ? 'MesAtual' : period;
        link.href = url;
        link.download = `ObrasParadas_${periodLabel}_${new Date().toISOString().slice(0,10)}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const monthOptions = getLastMonths();
    const isSpecificMonth = /^\d{4}-\d{2}$/.test(period);

    // Estatísticas rápidas
    const totalParadas = records.filter(r => r.obra_parada).length;
    const totalRechamadas = records.filter(r => r.tipo_caso === 'Rechamada').length;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-top-10 duration-700 pb-24">

            {/* Banner Hero */}
            <div className="bg-gradient-to-br from-slate-900 to-amber-950 rounded-[3rem] shadow-2xl p-8 md:p-12 border-4 border-amber-600 relative overflow-hidden flex flex-col gap-6">
                <div className="absolute -top-8 -right-8 opacity-5 pointer-events-none">
                    <HardHat size={200} className="text-amber-400" />
                </div>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600" />

                {/* Título + Botões de ação */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 z-10">
                    <div className="text-center md:text-left">
                        <div className="inline-flex items-center gap-2 bg-amber-600/20 text-amber-400 px-4 py-1.5 rounded-full mb-4">
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Controle de Obras</span>
                        </div>
                        <h1 className="text-4xl font-black text-white italic tracking-tighter">
                            Obras <span className="text-amber-400">Paradas</span>
                        </h1>
                        <p className="text-slate-400 font-bold text-sm mt-2">
                            Registre e acompanhe os casos de obras paradas por período.
                        </p>

                        {/* Mini stats */}
                        {records.length > 0 && (
                            <div className="flex gap-4 mt-4">
                                <div className="bg-white/10 rounded-xl px-4 py-2">
                                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Paradas</p>
                                    <p className="text-2xl font-black text-red-400">{totalParadas}</p>
                                </div>
                                <div className="bg-white/10 rounded-xl px-4 py-2">
                                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Rechamadas</p>
                                    <p className="text-2xl font-black text-indigo-400">{totalRechamadas}</p>
                                </div>
                                <div className="bg-white/10 rounded-xl px-4 py-2">
                                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Total</p>
                                    <p className="text-2xl font-black text-white">{records.length}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 z-10">
                        <button
                            onClick={() => loadRecords()}
                            disabled={isLoading}
                            className="p-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                            title="Atualizar"
                        >
                            <RefreshCcw size={18} className={isLoading ? 'animate-spin' : ''} />
                        </button>

                        <button
                            onClick={handleExport}
                            disabled={records.length === 0}
                            className="bg-white/10 hover:bg-amber-500 disabled:opacity-40 disabled:cursor-not-allowed text-white px-6 py-4 rounded-[2rem] font-black uppercase tracking-widest text-xs flex items-center gap-3 transition-all border border-white/20 hover:border-amber-400 active:scale-95 group"
                            title="Baixar relatório CSV"
                        >
                            <div className="bg-white/20 p-2 rounded-xl group-hover:scale-110 transition-transform">
                                <Download size={18} />
                            </div>
                            Baixar Relatório
                        </button>

                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-amber-600 hover:bg-amber-500 text-white px-8 py-4 rounded-[2rem] font-black uppercase tracking-widest text-xs flex items-center gap-3 transition-all shadow-xl shadow-amber-900/40 active:scale-95 group"
                        >
                            <div className="bg-white/20 p-2 rounded-xl group-hover:rotate-90 transition-transform">
                                <Plus size={18} />
                            </div>
                            Registrar Caso
                        </button>
                    </div>
                </div>

                {/* Filtro de Período */}
                <div className="z-10 flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">Período:</span>

                    {(['today', 'week', 'month'] as const).map((p) => {
                        const labels: Record<string, string> = { today: 'Hoje', week: 'Semana', month: 'Mês Atual' };
                        return (
                            <button
                                key={p}
                                onClick={() => setPeriod(p)}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${
                                    period === p
                                        ? 'bg-amber-600 border-amber-500 text-white shadow-lg shadow-amber-900/40'
                                        : 'bg-white/10 border-white/10 text-slate-300 hover:bg-white/20'
                                }`}
                            >
                                {labels[p]}
                            </button>
                        );
                    })}

                    <select
                        value={isSpecificMonth ? period : ''}
                        onChange={e => { if (e.target.value) setPeriod(e.target.value); }}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border cursor-pointer ${
                            isSpecificMonth
                                ? 'bg-amber-600 border-amber-500 text-white shadow-lg shadow-amber-900/40'
                                : 'bg-white/10 border-white/10 text-slate-300 hover:bg-white/20'
                        }`}
                        style={{ backgroundColor: isSpecificMonth ? undefined : 'rgba(255,255,255,0.1)' }}
                        title="Selecionar mês específico"
                    >
                        <option value="" disabled className="bg-slate-900 text-slate-300">📅 Mês anterior...</option>
                        {monthOptions.map(opt => (
                            <option key={opt.value} value={opt.value} className="bg-slate-900 text-white">{opt.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Tabela */}
            <ObraParadaTable />

            {/* FAB — Botão flutuante fixo */}
            <button
                onClick={() => setIsModalOpen(true)}
                className="fixed bottom-8 right-8 z-40 bg-amber-600 hover:bg-amber-500 text-white px-6 py-4 rounded-[2rem] font-black uppercase tracking-widest text-xs flex items-center gap-3 shadow-2xl shadow-amber-900/50 active:scale-95 transition-all group animate-in fade-in slide-in-from-bottom-4 duration-500"
                title="Registrar novo caso"
            >
                <div className="bg-white/20 p-1.5 rounded-xl group-hover:rotate-90 transition-transform">
                    <Plus size={16} />
                </div>
                Registrar Caso
            </button>

            {/* Modal */}
            <ObraParadaFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
};

export const ObraParada: React.FC = () => (
    <ObraParadaProvider>
        <ObraParadaContent />
    </ObraParadaProvider>
);
