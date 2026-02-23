import React from 'react';
import { LayoutDashboard, TrendingUp, Activity, Zap, CheckCircle, BarChart3, MessageSquare, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useProductivity } from '../contexts/ProductivityContext';

const SkeletonCard = () => (
    <div className="bg-white p-8 rounded-[3rem] shadow-2xl border border-slate-100 relative overflow-hidden flex flex-col justify-between h-[240px]">
        <div className="flex items-center gap-4 mb-6">
            <div className="bg-slate-200 w-16 h-16 rounded-2xl animate-pulse"></div>
            <div className="space-y-2">
                <div className="h-2 w-24 bg-slate-200 rounded animate-pulse"></div>
                <div className="h-2 w-20 bg-slate-200 rounded animate-pulse"></div>
            </div>
        </div>
        <div className="space-y-2">
            <div className="h-10 w-20 bg-slate-200 rounded animate-pulse"></div>
            <div className="h-3 w-16 bg-slate-200 rounded animate-pulse"></div>
        </div>
        <div className="mt-4 pt-4 border-t border-slate-50 flex items-center gap-2">
            <div className="h-3 w-32 bg-slate-200 rounded animate-pulse"></div>
        </div>
    </div>
);

export const UserDashboard: React.FC = () => {
    const { currentUser } = useAuth();
    const {
        data, weeklyStats, isStatsLoading, supervisors,
        expertTargetSupervisor, setExpertTargetSupervisor,
        expertMessageInput, setExpertMessageInput, handleSendExpertMessage
    } = useProductivity();

    if (!currentUser) return null;

    const expertData = data[currentUser.name] || { tratado: 0, finalizado: 0, goal: 0, targetSupervisor: '', expertMessage: '' };
    const currentTotal = (expertData.tratado || 0) + (expertData.finalizado || 0);
    const currentGoal = expertData.goal || 0;
    const isGoalMet = currentGoal > 0 && currentTotal >= currentGoal;
    const goalProgress = currentGoal > 0 ? Math.min((currentTotal / currentGoal) * 100, 100) : 0;
    const missingForGoal = Math.max(0, currentGoal - currentTotal);

    return (
        <section className="space-y-6">
            <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <LayoutDashboard size={18} className="text-orange-600" />
                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Minha Performance Semanal</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {isStatsLoading ? (
                            <>
                                <SkeletonCard />
                                <SkeletonCard />
                                <SkeletonCard />
                            </>
                        ) : (
                            <>
                                {/* Card Tratados Semanal */}
                                <div className="bg-white p-8 rounded-[3rem] shadow-2xl border border-slate-100 relative overflow-hidden group hover:border-orange-200 transition-all flex flex-col justify-between">
                                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                        <TrendingUp size={80} className="text-orange-600" />
                                    </div>
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="bg-orange-100 p-4 rounded-2xl group-hover:scale-110 transition-transform">
                                            <Activity size={28} className="text-orange-600" />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Tratados na Semana</p>
                                            <p className="text-[9px] font-bold text-orange-600">Segunda a Domingo</p>
                                        </div>
                                    </div>
                                    <div className="flex items-baseline gap-2">
                                        <h4 className="text-5xl font-black text-slate-900 italic tracking-tighter">
                                            {weeklyStats.tratado}
                                        </h4>
                                        <span className="text-slate-400 font-black text-sm uppercase tracking-widest">Casos</span>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-slate-50 flex items-center gap-2 text-[10px] font-bold text-slate-400">
                                        <Zap size={12} className="text-orange-400" />
                                        Média de {(weeklyStats.tratado / 5).toFixed(1)} / dia útil
                                    </div>
                                </div>

                                {/* Card Finalizados Semanal */}
                                <div className="bg-white p-8 rounded-[3rem] shadow-2xl border border-slate-100 relative overflow-hidden group hover:border-green-200 transition-all flex flex-col justify-between">
                                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                        <CheckCircle size={80} className="text-green-600" />
                                    </div>
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="bg-green-100 p-4 rounded-2xl group-hover:scale-110 transition-transform">
                                            <CheckCircle size={28} className="text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Finalizados na Semana</p>
                                            <p className="text-[9px] font-bold text-green-600">Entrega Total</p>
                                        </div>
                                    </div>
                                    <div className="flex items-baseline gap-2">
                                        <h4 className="text-5xl font-black text-slate-900 italic tracking-tighter">
                                            {weeklyStats.finalizado}
                                        </h4>
                                        <span className="text-slate-400 font-black text-sm uppercase tracking-widest">Resolvidos</span>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-slate-50 flex items-center gap-2 text-[10px] font-bold text-slate-400">
                                        <TrendingUp size={12} className="text-green-400" />
                                        Taxa de Conversão: {weeklyStats.tratado > 0 ? Math.round((weeklyStats.finalizado / (weeklyStats.tratado + weeklyStats.finalizado)) * 100) : 0}%
                                    </div>
                                </div>

                                {/* Card Meta Diária (Visão Rápida) */}
                                <div className={`p-8 rounded-[3rem] shadow-2xl border relative overflow-hidden group transition-all flex flex-col justify-between ${isGoalMet
                                    ? 'bg-gradient-to-br from-orange-600 to-orange-800 border-orange-400 shadow-orange-600/30 scale-[1.02]'
                                    : 'bg-slate-900 border-slate-800'
                                    }`}>
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className={`p-4 rounded-2xl group-hover:scale-110 transition-all ${isGoalMet
                                            ? 'bg-white/20 text-yellow-300'
                                            : 'bg-white/10 text-white group-hover:bg-orange-600'
                                            }`}>
                                            <BarChart3 size={28} />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Meta de Hoje</p>
                                            <p className={`text-[9px] font-bold ${isGoalMet
                                                ? 'text-yellow-300'
                                                : 'text-orange-400'
                                                }`}>Objetivo Individual</p>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex items-baseline gap-2 mb-2">
                                            <h4 className="text-5xl font-black text-white italic tracking-tighter">
                                                {currentGoal || 0}
                                            </h4>
                                            <span className="text-slate-500 font-black text-sm uppercase tracking-widest">Alvo</span>
                                        </div>
                                        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full transition-all duration-1000 ${isGoalMet
                                                    ? 'bg-yellow-400'
                                                    : 'bg-orange-600'
                                                    }`}
                                                style={{ width: `${goalProgress}%` }}
                                            />
                                        </div>
                                    </div>
                                    <p className="mt-4 text-[10px] font-black text-white/40 uppercase tracking-widest">
                                        {isGoalMet
                                            ? "🎯 META BATIDA! PARABÉNS!"
                                            : `Faltam ${missingForGoal} para o objetivo`}
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Seção de Comunicação Direta para o Expert */}
            <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-slate-100 flex flex-col md:flex-row items-center gap-6">
                <div className="bg-slate-100 p-4 rounded-full">
                    <MessageSquare className="text-slate-500" size={24} />
                </div>
                <div className="flex-1 w-full">
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Canal com a Supervisão</h4>
                        <div className="relative group">
                            <select
                                value={expertTargetSupervisor}
                                onChange={(e) => setExpertTargetSupervisor(e.target.value)}
                                className="appearance-none bg-slate-50 border border-slate-200 text-slate-600 py-1 pl-3 pr-8 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none focus:border-orange-400 cursor-pointer"
                            >
                                {supervisors.filter(s => s !== 'TODOS').map(s => (
                                    <option key={s} value={s}>{s.split(' ')[0]}</option>
                                ))}
                            </select>
                            <ChevronDown size={12} className="absolute right-2 top-1.5 text-slate-400 pointer-events-none" />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={expertMessageInput}
                            onChange={(e) => setExpertMessageInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendExpertMessage()}
                            className="flex-1 bg-slate-50 p-4 rounded-2xl border-2 border-slate-100 focus:border-orange-200 outline-none text-xs font-bold text-slate-700 placeholder:text-slate-400"
                            placeholder={`Enviar para ${expertTargetSupervisor ? expertTargetSupervisor.split(' ')[0] : 'seu supervisor'}...`}
                        />
                        <button
                            onClick={handleSendExpertMessage}
                            className="bg-orange-600 text-white px-6 rounded-2xl font-black text-xs hover:bg-orange-700 transition-colors shadow-lg shadow-orange-200"
                        >
                            ENVIAR
                        </button>
                    </div>
                    {data[currentUser.name]?.expertMessage && (
                        <div className="mt-2 text-[10px] text-slate-400 font-bold flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            Última mensagem enviada para {data[currentUser.name]?.targetSupervisor?.split(' ')[0] || 'Supervisão'}: "{data[currentUser.name]?.expertMessage}"
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};
