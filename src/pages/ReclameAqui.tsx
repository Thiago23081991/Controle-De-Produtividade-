import React, { useState } from 'react';
import { 
    MessageSquare, Plus, RefreshCcw, Upload, Download, 
    BarChart2, ChevronDown, ChevronUp, Layers 
} from 'lucide-react';
import { ReclameAquiProvider, useReclameAqui } from '../contexts/ReclameAquiContext';
import { ReclameAquiTable } from '../components/ReclameAquiTable';
import { ReclameAquiCharts } from '../components/ReclameAquiCharts';
import { ReclameAquiFormModal } from '../components/ReclameAquiFormModal';
import { ReclameAquiImportModal } from '../components/ReclameAquiImportModal';
import { ReclameAquiRecord } from '../types';

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

const ReclameAquiContent: React.FC = () => {
    const { records, loadRecords, isLoading, period, setPeriod } = useReclameAqui();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState<ReclameAquiRecord | null>(null);
    const [showCharts, setShowCharts] = useState(true);

    const monthOptions = getLastMonths();
    const isSpecificMonth = /^\d{4}-\d{2}$/.test(period);

    const handleNewRecord = () => {
        setEditingRecord(null);
        setIsFormOpen(true);
    };

    const handleEditRecord = (rec: ReclameAquiRecord) => {
        setEditingRecord(rec);
        setIsFormOpen(true);
    };

    const handleExportCSV = () => {
        if (records.length === 0) return;

        const headers = [
            'Registro R.A.', 'Nota Fiscal', 'Data Da Postagem', 'Consumidor', 'Entrada',
            'Status Atual', 'Chamado', 'E-mail', 'Data do Contato', 'Resposta Pública',
            'Patologia/Causa RA', 'Voltaria fazer negócio', 'Resolvido', 'Nota', 'Moderação',
            'Visita Técnica (Nome Do Técnico)', 'Data Réplica', 'Data Tréplica', 'Procedente', 'MO', 'Produto'
        ];

        const escape = (val?: string) => `"${(val || '').replace(/"/g, '""')}"`;

        const csvContent = '\uFEFF' + [
            headers.join(';'),
            ...records.map(r => [
                escape(r.registro_ra),
                escape(r.nota_fiscal),
                escape(r.data_postagem),
                escape(r.consumidor),
                escape(r.entrada),
                escape(r.status_atual),
                escape(r.chamado),
                escape(r.email),
                escape(r.data_contato),
                escape(r.resposta_publica),
                escape(r.patologia_causa),
                escape(r.voltaria_fazer_negocio),
                escape(r.resolvido),
                escape(r.nota_avaliacao),
                escape(r.moderacao),
                escape(r.visita_tecnica),
                escape(r.data_replica),
                escape(r.data_treplica),
                escape(r.procedente),
                escape(r.mo),
                escape(r.produto)
            ].join(';'))
        ].join('\r\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `ReclameAqui_${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-top-10 duration-700 pb-24">

            {/* Banner Hero */}
            <div className="bg-gradient-to-br from-slate-900 via-red-950 to-slate-900 rounded-[3rem] shadow-2xl p-8 md:p-12 border-4 border-red-600 relative overflow-hidden flex flex-col gap-6">
                <div className="absolute -top-8 -right-8 opacity-5 pointer-events-none">
                    <MessageSquare size={200} className="text-red-500" />
                </div>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-rose-500 to-red-600" />

                {/* Título + Ações */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 z-10">
                    <div className="text-center md:text-left">
                        <div className="inline-flex items-center gap-2 bg-red-600/20 text-red-400 px-4 py-1.5 rounded-full mb-4">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Gestão de Reputação</span>
                        </div>
                        <h1 className="text-4xl font-black text-white italic tracking-tighter">
                            Painel <span className="text-red-500">Reclame Aqui</span>
                        </h1>
                        <p className="text-slate-400 font-bold text-sm mt-2">
                            Acompanhamento, índices de resolução e tratativas de casos RA.
                        </p>
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
                            onClick={handleExportCSV}
                            disabled={records.length === 0}
                            className="bg-white/10 hover:bg-white/20 disabled:opacity-40 text-white px-5 py-4 rounded-[2rem] font-black uppercase tracking-widest text-xs flex items-center gap-2 transition-all"
                            title="Exportar base para Excel"
                        >
                            <Download size={16} />
                            Exportar
                        </button>

                        <button
                            onClick={() => setIsImportOpen(true)}
                            className="bg-white/10 hover:bg-white/20 text-white px-6 py-4 rounded-[2rem] font-black uppercase tracking-widest text-xs flex items-center gap-2 transition-all border border-white/10"
                            title="Importar planilha do Excel"
                        >
                            <Upload size={16} />
                            Importar Planilha
                        </button>

                        <button
                            onClick={handleNewRecord}
                            className="bg-red-600 hover:bg-red-500 text-white px-8 py-4 rounded-[2rem] font-black uppercase tracking-widest text-xs flex items-center gap-3 transition-all shadow-xl shadow-red-900/40 active:scale-95 group"
                        >
                            <div className="bg-white/20 p-2 rounded-xl group-hover:rotate-90 transition-transform">
                                <Plus size={18} />
                            </div>
                            Novo Caso
                        </button>
                    </div>
                </div>

                {/* Filtro de Período */}
                <div className="z-10 flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">Período:</span>

                    <button
                        onClick={() => setPeriod('all')}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border flex items-center gap-2 ${
                            period === 'all'
                                ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-900/40'
                                : 'bg-white/10 border-white/10 text-slate-300 hover:bg-white/20'
                        }`}
                    >
                        <span className={`w-2 h-2 rounded-full ${period === 'all' ? 'bg-white animate-pulse' : 'bg-red-400'}`} />
                        Todos os Registros
                    </button>

                    {(['today', 'week', 'month'] as const).map((p) => {
                        const labels: Record<string, string> = { today: 'Hoje', week: 'Semana', month: 'Mês Atual' };
                        return (
                            <button
                                key={p}
                                onClick={() => setPeriod(p)}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${
                                    period === p
                                        ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-900/40'
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
                                ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-900/40'
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

            {/* Toggle de Gráficos */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => setShowCharts(p => !p)}
                    className="flex items-center gap-2 text-xs font-black text-slate-600 dark:text-slate-300 hover:text-red-600 transition-colors uppercase tracking-wider"
                >
                    <BarChart2 size={16} className="text-red-500" />
                    <span>{showCharts ? 'Ocultar Gráficos e Indicadores' : 'Exibir Gráficos e Indicadores'}</span>
                    {showCharts ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
            </div>

            {/* Gráficos */}
            {showCharts && <ReclameAquiCharts records={records} />}

            {/* Tabela */}
            <ReclameAquiTable onEditRecord={handleEditRecord} />

            {/* Modal de Cadastro / Edição */}
            <ReclameAquiFormModal
                isOpen={isFormOpen}
                onClose={() => { setIsFormOpen(false); setEditingRecord(null); }}
                editingRecord={editingRecord}
            />

            {/* Modal de Importação Excel */}
            <ReclameAquiImportModal
                isOpen={isImportOpen}
                onClose={() => setIsImportOpen(false)}
            />
        </div>
    );
};

export const ReclameAqui: React.FC = () => (
    <ReclameAquiProvider>
        <ReclameAquiContent />
    </ReclameAquiProvider>
);
