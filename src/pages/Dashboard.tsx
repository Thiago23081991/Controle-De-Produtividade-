import React from 'react';
import { UserDashboard } from '../components/UserDashboard';
import { RankingPodium } from '../components/RankingPodium';
import { ProductivityTable } from '../components/ProductivityTable';
import { PerformanceChart } from '../components/PerformanceChart';
import { Megaphone, Clock, RefreshCw, BrainCircuit, Sparkles, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useProductivity } from '../contexts/ProductivityContext';

export const Dashboard: React.FC = () => {
    const { currentUser, isAdmin } = useAuth();
    const {
        data, rankingData, visibleExperts,
        selectedSupervisor,
        handleRunAnalysis, isAnalyzing, aiAnalysis, setAiAnalysis
    } = useProductivity();

    const expertReceivedMessage = (!isAdmin && currentUser) ? data[currentUser.name]?.managerMessage : null;

    return (
        <>
            {expertReceivedMessage && (
                <div className="bg-slate-900 text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center gap-10 animate-in fade-in slide-in-from-top-10 duration-700 border-4 border-orange-600">
                    <div className="absolute top-0 left-0 h-2 bg-orange-600 z-10" style={{ width: '100%', animation: `shrinkWidth ${3 * 60 * 1000}ms linear forwards` }}></div>
                    <div className="bg-orange-600 p-6 rounded-[2rem] shadow-xl shadow-orange-600/30 rotate-3">
                        <Megaphone size={56} className="text-white animate-pulse" />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] bg-white/10 px-4 py-1.5 rounded-full">Gestão Direta</span>
                        </div>
                        <p className="text-4xl font-black italic tracking-tighter leading-none text-orange-50 underline decoration-orange-600/50 underline-offset-8">"{expertReceivedMessage}"</p>
                        <div className="mt-8 flex items-center justify-center md:justify-start gap-2 text-slate-500 font-bold text-[10px] uppercase tracking-widest">
                            <Clock size={12} /> Esta mensagem expira em 3 minutos
                        </div>
                    </div>
                </div>
            )}

            {!isAdmin && currentUser && (
                <UserDashboard />
            )}

            {isAdmin && rankingData && <RankingPodium data={rankingData} />}

            <ProductivityTable />

            {isAdmin && <PerformanceChart data={Object.fromEntries(visibleExperts.map(name => [name, data[name]]))} />}

            {isAdmin && (
                <button
                    onClick={handleRunAnalysis}
                    disabled={isAnalyzing}
                    className="w-full bg-slate-900 text-white p-8 rounded-[3rem] font-black flex items-center justify-center gap-4 hover:bg-orange-600 transition-all shadow-2xl disabled:bg-slate-200 group active:scale-[0.99]"
                >
                    {isAnalyzing ? <RefreshCw className="animate-spin" /> : <BrainCircuit className="group-hover:rotate-12 transition-transform" />}
                    <span className="uppercase tracking-[0.3em] text-xs">Gerar Inteligência Operacional {selectedSupervisor !== 'TODOS' ? `| TIME ${selectedSupervisor}` : ''}</span>
                </button>
            )}

            {isAdmin && aiAnalysis && (
                <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl border-l-[16px] border-orange-600 animate-in zoom-in duration-500">
                    <div className="flex justify-between items-center mb-10">
                        <div className="flex items-center gap-4">
                            <div className="bg-orange-100 p-3 rounded-2xl"><Sparkles className="text-orange-600" /></div>
                            <div>
                                <h3 className="text-xl font-black italic tracking-tight">Relatório Executivo IA</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Análise Baseada em Dados Suvinil</p>
                            </div>
                        </div>
                        <button onClick={() => setAiAnalysis(null)} className="text-slate-300 hover:text-slate-900 bg-slate-50 p-3 rounded-full transition-colors"><X size={24} /></button>
                    </div>
                    <div className="prose prose-slate max-w-none text-slate-700 font-medium leading-relaxed text-lg whitespace-pre-line">
                        {aiAnalysis}
                    </div>
                </div>
            )}
        </>
    );
};
