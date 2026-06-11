import React, { useState } from 'react';
import { AlertTriangle, Plus, RefreshCcw, Download } from 'lucide-react';
import { ErroFormModal } from '../components/ErroFormModal';
import { ErroRankingCards } from '../components/ErroRankingCards';
import { ErroChart } from '../components/ErroChart';
import { ErrosTable } from '../components/ErrosTable';
import { ErrosProvider, useErros } from '../contexts/ErrosContext';
import { useAuth } from '../contexts/AuthContext';
import { exportErrosToExcel } from '../utils/excelExport';

const ErrosContent: React.FC = () => {
    const { isAdmin } = useAuth();
    const { loadErros, isLoading, erros, period } = useErros();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleExportExcel = () => {
        const periodLabel = period === 'today' ? 'Hoje' : period === 'week' ? 'Semana' : 'Mes';
        exportErrosToExcel(erros, periodLabel);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-top-10 duration-700">

            {/* Banner Hero */}
            <div className="bg-gradient-to-br from-slate-900 to-red-950 rounded-[3rem] shadow-2xl p-8 md:p-12 border-4 border-red-600 relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="absolute -top-8 -right-8 opacity-5 pointer-events-none">
                    <AlertTriangle size={200} className="text-red-500" />
                </div>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-orange-500 to-red-600" />

                <div className="z-10 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 bg-red-600/20 text-red-400 px-4 py-1.5 rounded-full mb-4">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Controle de Qualidade</span>
                    </div>
                    <h1 className="text-4xl font-black text-white italic tracking-tighter">
                        Registro de <span className="text-red-500">Erros</span>
                    </h1>
                    <p className="text-slate-400 font-bold text-sm mt-2">
                        Acompanhamento de erros no script de ressarcimento.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 z-10">
                    <button
                        onClick={() => loadErros()}
                        disabled={isLoading}
                        className="p-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                        title="Atualizar"
                    >
                        <RefreshCcw size={18} className={isLoading ? 'animate-spin' : ''} />
                    </button>

                    {isAdmin && (
                        <button
                            onClick={handleExportExcel}
                            disabled={isLoading || erros.length === 0}
                            className="bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white px-6 py-4 rounded-[2rem] font-black uppercase tracking-widest text-xs flex items-center gap-3 transition-all border border-slate-700 shadow-xl active:scale-95"
                            title="Exportar Relatório Excel"
                        >
                            <Download size={18} />
                            Planilha
                        </button>
                    )}

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-red-600 hover:bg-red-500 text-white px-8 py-4 rounded-[2rem] font-black uppercase tracking-widest text-xs flex items-center gap-3 transition-all shadow-xl shadow-red-900/40 active:scale-95 group"
                    >
                        <div className="bg-white/20 p-2 rounded-xl group-hover:rotate-90 transition-transform">
                            <Plus size={18} />
                        </div>
                        Registrar Erro
                    </button>
                </div>
            </div>

            {/* Ranking — Apenas Admin */}
            {isAdmin && <ErroRankingCards />}

            {/* Gráficos — Apenas Admin */}
            {isAdmin && <ErroChart />}

            {/* Tabela */}
            <ErrosTable />

            {/* Modal */}
            <ErroFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
};

export const Erros: React.FC = () => (
    <ErrosProvider>
        <ErrosContent />
    </ErrosProvider>
);
