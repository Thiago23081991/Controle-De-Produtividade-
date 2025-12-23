
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { ClipboardList, Sparkles, RefreshCw, Calendar, LogOut, Send, BellRing, Mail, Clock, Palette, BrainCircuit, Users, Megaphone, AlertCircle, X, BarChart3, TrendingUp, CheckCircle, Activity, LayoutDashboard, Zap } from 'lucide-react';
import { EXPERT_ROSTER, EXPERT_MAP, EXPERT_LIST } from './utils/parser';
import { analyzeProductivity } from './services/geminiService';
import { ManualEntryData, ExpertInfo } from './types';
import { PerformanceChart } from './components/PerformanceChart';
import { supabase, isSupabaseConfigured } from './services/supabaseClient';

const ADMIN_MATRICULAS = ['301052', '322110', '221362', '333596', '246794'];
const MESSAGE_DURATION_MS = 3 * 60 * 1000; // 3 minutos

// Gerenciamento de Áudio Global
let globalAudioCtx: AudioContext | null = null;

const initAudio = () => {
  if (!globalAudioCtx) {
    const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      globalAudioCtx = new AudioContextClass();
    }
  }
  if (globalAudioCtx && globalAudioCtx.state === 'suspended') {
    globalAudioCtx.resume();
  }
  return globalAudioCtx;
};

const playUrnaBeep = () => {
  try {
    const ctx = initAudio();
    if (!ctx) return;
    const playTone = (freq: number, start: number, duration: number, vol: number = 0.05) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
      gain.gain.setValueAtTime(0, ctx.currentTime + start);
      gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + start + 0.01);
      gain.gain.setValueAtTime(vol, ctx.currentTime + start + duration - 0.01);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + start + duration);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + duration);
    };
    const t = 0.12;
    playTone(1000, 0, t);
    playTone(1250, t, t);
    playTone(1500, t * 2, t * 2.5, 0.07);
  } catch (e) { console.error(e); }
};

const playSuccessBeep = () => {
  try {
    const ctx = initAudio();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1800, ctx.currentTime);
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  } catch (e) { console.error(e); }
};

const getTodayString = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getCurrentWeekRange = () => {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 (Sun) to 6 (Sat)
  const diffToMonday = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diffToMonday));
  monday.setHours(0, 0, 0, 0);
  
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  
  return {
    start: monday.toISOString().split('T')[0],
    end: sunday.toISOString().split('T')[0]
  };
};

const getInitialData = (): ManualEntryData => {
  const sortedRoster = [...EXPERT_ROSTER].sort((a, b) => a.localeCompare(b));
  return sortedRoster.reduce((acc, name) => {
    acc[name] = { tratado: 0, finalizado: 0, observacao: '', isUrgent: false, goal: 0, managerMessage: '' };
    return acc;
  }, {} as ManualEntryData);
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<ExpertInfo | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loginInput, setLoginInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(getTodayString());
  const [selectedSupervisor, setSelectedSupervisor] = useState<string>('TODOS');
  const [notification, setNotification] = useState<{ message: string; visible: boolean; type?: 'success' | 'info' | 'error' | 'alert' } | null>(null);
  const [tempMessages, setTempMessages] = useState<Record<string, string>>({});
  const [data, setData] = useState<ManualEntryData>(getInitialData);
  const [weeklyStats, setWeeklyStats] = useState({ tratado: 0, finalizado: 0 });
  
  const lastMessageRef = useRef<string>('');

  const supervisors = useMemo(() => {
    const list = new Set<string>();
    EXPERT_LIST.forEach(e => e.supervisor && list.add(e.supervisor));
    return ['TODOS', ...Array.from(list).sort()];
  }, []);

  const loadWeeklyStats = useCallback(async (expertName: string) => {
    if (!isSupabaseConfigured) return;
    const { start, end } = getCurrentWeekRange();
    try {
      const { data: records, error } = await supabase
        .from('productivity_records')
        .select('tratado, finalizado')
        .eq('expert_name', expertName)
        .gte('date', start)
        .lte('date', end);

      if (!error && records) {
        const totals = records.reduce((acc, rec) => ({
          tratado: acc.tratado + (rec.tratado || 0),
          finalizado: acc.finalizado + (rec.finalizado || 0)
        }), { tratado: 0, finalizado: 0 });
        setWeeklyStats(totals);
      }
    } catch (e) {
      console.error("Erro ao carregar stats semanais:", e);
    }
  }, []);

  const loadSupabaseData = useCallback(async (date: string) => {
    if (!isSupabaseConfigured) return;
    setIsSyncing(true);
    const freshSlate = getInitialData();
    try {
      const { data: records, error } = await supabase.from('productivity_records').select('*').eq('date', date);
      if (!error && records) {
        records.forEach(rec => {
          if (freshSlate[rec.expert_name]) {
            freshSlate[rec.expert_name] = {
              tratado: rec.tratado,
              finalizado: rec.finalizado,
              goal: rec.goal,
              observacao: rec.observacao || '',
              isUrgent: rec.is_urgent,
              managerMessage: rec.manager_message
            };
          }
        });
        setData(freshSlate);
      }
    } finally {
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    loadSupabaseData(selectedDate);
    if (currentUser) {
      loadWeeklyStats(currentUser.name);
    }
    const channel = supabase.channel(`prod-changes-${selectedDate}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'productivity_records', filter: `date=eq.${selectedDate}` }, (payload) => {
          const rec = payload.new as any;
          if (rec && rec.expert_name) {
            setData(prev => ({
              ...prev,
              [rec.expert_name]: {
                tratado: rec.tratado,
                finalizado: rec.finalizado,
                goal: rec.goal,
                observacao: rec.observacao || '',
                isUrgent: rec.is_urgent,
                managerMessage: rec.manager_message
              }
            }));
            if (currentUser && rec.expert_name === currentUser.name) {
                loadWeeklyStats(currentUser.name);
            }
          }
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [selectedDate, loadSupabaseData, currentUser, loadWeeklyStats]);

  const saveToSupabase = async (expert: string, updateData: Partial<ManualEntryData[string]>) => {
    if (!isSupabaseConfigured) return;
    const entry = data[expert];
    const fullData = { ...entry, ...updateData };
    await supabase.from('productivity_records').upsert({
      date: selectedDate,
      expert_name: expert,
      tratado: fullData.tratado,
      finalizado: fullData.finalizado,
      goal: fullData.goal,
      observacao: fullData.observacao,
      is_urgent: fullData.isUrgent,
      manager_message: fullData.managerMessage,
      updated_at: new Date().toISOString()
    }, { onConflict: 'date,expert_name' });
    
    if (currentUser && expert === currentUser.name) {
        loadWeeklyStats(expert);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    initAudio();
    const input = loginInput.trim();
    if (ADMIN_MATRICULAS.includes(input)) {
      setIsAdmin(true); setIsLoggedIn(true);
    } else {
      const expert = EXPERT_LIST.find(e => e.matricula === input || e.login === input);
      if (expert) { 
        setCurrentUser(expert); 
        setIsLoggedIn(true); 
      }
      else setLoginError('Login não encontrado.');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false); setCurrentUser(null); setIsAdmin(false); setLoginInput(''); lastMessageRef.current = '';
  };

  const handleInputChange = (expert: string, field: 'tratado' | 'finalizado' | 'observacao' | 'goal', value: string) => {
    const finalValue = field === 'observacao' ? value : Math.max(0, parseInt(value) || 0);
    setData(prev => ({ ...prev, [expert]: { ...prev[expert], [field]: finalValue } }));
    saveToSupabase(expert, { [field]: finalValue });
  };

  const handleSendMessage = (expert: string) => {
    const msg = tempMessages[expert] || '';
    if (!msg.trim()) return;
    saveToSupabase(expert, { managerMessage: msg });
    playSuccessBeep();
    setNotification({ message: `Aviso enviado para ${expert.split(' ')[0]}`, visible: true, type: 'success' });
    setTempMessages(prev => ({ ...prev, [expert]: '' }));
  };

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const analysis = await analyzeProductivity(data);
      setAiAnalysis(analysis);
      setNotification({ message: 'Análise gerada!', visible: true, type: 'success' });
    } catch (err) {
      setNotification({ message: 'Erro na análise IA.', visible: true, type: 'error' });
    } finally { setIsAnalyzing(false); }
  };

  const visibleExperts = useMemo(() => {
    if (!isAdmin) return currentUser ? [currentUser.name] : [];
    return Object.keys(data).filter(name => {
      if (selectedSupervisor === 'TODOS') return true;
      return EXPERT_MAP[name]?.supervisor === selectedSupervisor;
    }).sort();
  }, [isAdmin, currentUser, data, selectedSupervisor]);

  const expertReceivedMessage = (!isAdmin && currentUser) ? data[currentUser.name]?.managerMessage : null;

  useEffect(() => {
    if (!isAdmin && currentUser && expertReceivedMessage) {
      const msg = expertReceivedMessage.trim();
      if (msg && msg !== lastMessageRef.current) {
        playUrnaBeep();
        setNotification({ message: '🔔 NOVA MENSAGEM DA GESTÃO', visible: true, type: 'alert' });
        lastMessageRef.current = msg;
      }
      const timer = setTimeout(() => {
        saveToSupabase(currentUser.name, { managerMessage: '' });
        lastMessageRef.current = '';
        setNotification(null);
      }, MESSAGE_DURATION_MS);
      return () => clearTimeout(timer);
    }
  }, [expertReceivedMessage, currentUser, isAdmin]);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-white p-10 rounded-[3rem] shadow-2xl w-full max-w-sm text-center border-b-[12px] border-orange-600">
          <Palette className="w-16 h-16 text-orange-600 mx-auto mb-6 animate-bounce" />
          <h1 className="text-3xl font-black mb-2 italic">Suvinil Service</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-8">Produtividade Cloud</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="text" value={loginInput} onChange={(e) => setLoginInput(e.target.value)}
              className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-orange-500 outline-none text-center font-black text-xl placeholder:text-slate-200" 
              placeholder="000000" 
            />
            {loginError && <p className="text-red-600 text-[10px] font-black uppercase tracking-widest">{loginError}</p>}
            <button className="w-full bg-orange-600 text-white font-black py-4 rounded-2xl shadow-xl hover:bg-orange-700 transition-all active:scale-95">ACESSAR PAINEL</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans transition-all duration-700" onClick={() => initAudio()}>
      <div className="max-w-7xl mx-auto space-y-6">
        
        <header className="bg-white p-6 rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row justify-between items-center gap-4 border border-slate-100">
          <div className="flex items-center gap-4">
             <div className="bg-slate-900 p-3 rounded-2xl shadow-lg shadow-slate-900/20"><ClipboardList className="text-orange-500" /></div>
             <div><h1 className="text-2xl font-black italic tracking-tighter">Suvinil <span className="text-orange-600">Cloud</span></h1><p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Monitoring Systems v2.5</p></div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {isAdmin && (
              <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-100 px-4">
                <Users size={14} className="text-slate-400" />
                <select 
                  value={selectedSupervisor} 
                  onChange={(e) => setSelectedSupervisor(e.target.value)}
                  className="bg-transparent border-none outline-none text-[10px] font-black uppercase tracking-widest text-slate-600 cursor-pointer"
                >
                  {supervisors.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            )}
            
            <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-100 px-4">
                <Calendar size={14} className="text-slate-400" />
                <input 
                  type="date" 
                  value={selectedDate} 
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-transparent border-none outline-none text-[10px] font-black text-slate-600 cursor-pointer"
                />
            </div>

            <button onClick={handleLogout} className="flex items-center gap-2 text-slate-400 font-black text-[10px] hover:text-red-600 transition-colors bg-slate-50 p-3 rounded-2xl border border-slate-100 uppercase tracking-widest"><LogOut size={16} /> Sair</button>
          </div>
        </header>

        {expertReceivedMessage && (
          <div className="bg-slate-900 text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center gap-10 animate-in fade-in slide-in-from-top-10 duration-700 border-4 border-orange-600">
             <div className="absolute top-0 left-0 h-2 bg-orange-600 z-10" style={{ width: '100%', animation: `shrinkWidth ${MESSAGE_DURATION_MS}ms linear forwards` }}></div>
             <div className="bg-orange-600 p-6 rounded-[2rem] shadow-xl shadow-orange-600/30 rotate-3">
                <Megaphone size={56} className="text-white animate-pulse" />
             </div>
             <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] bg-white/10 px-4 py-1.5 rounded-full">Gestão Direta</span>
                  <div className="flex gap-1">
                    {[1,2,3].map(i => <div key={i} className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-ping" style={{ animationDelay: `${i*200}ms` }}></div>)}
                  </div>
                </div>
                <p className="text-4xl font-black italic tracking-tighter leading-none text-orange-50 underline decoration-orange-600/50 underline-offset-8">"{expertReceivedMessage}"</p>
                <div className="mt-8 flex items-center justify-center md:justify-start gap-2 text-slate-500 font-bold text-[10px] uppercase tracking-widest">
                  <Clock size={12} /> Esta mensagem expira em 3 minutos
                </div>
             </div>
          </div>
        )}

        {!isAdmin && currentUser && (
          <section className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <LayoutDashboard size={18} className="text-orange-600" />
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Minha Performance Semanal</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              <div className="bg-slate-900 p-8 rounded-[3rem] shadow-2xl border border-slate-800 relative overflow-hidden group transition-all flex flex-col justify-between">
                 <div className="flex items-center gap-4 mb-6">
                    <div className="bg-white/10 p-4 rounded-2xl group-hover:bg-orange-600 transition-all">
                        <BarChart3 size={28} className="text-white" />
                    </div>
                    <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Meta de Hoje</p>
                        <p className="text-[9px] font-bold text-orange-400">Objetivo Individual</p>
                    </div>
                 </div>
                 <div>
                    <div className="flex items-baseline gap-2 mb-2">
                       <h4 className="text-5xl font-black text-white italic tracking-tighter">
                         {data[currentUser.name]?.goal || 0}
                       </h4>
                       <span className="text-slate-500 font-black text-sm uppercase tracking-widest">Alvo</span>
                    </div>
                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                       <div 
                         className="h-full bg-orange-600 transition-all duration-1000" 
                         style={{ width: `${Math.min(((data[currentUser.name]?.finalizado || 0) / (data[currentUser.name]?.goal || 1)) * 100, 100)}%` }}
                       />
                    </div>
                 </div>
                 <p className="mt-4 text-[10px] font-black text-white/40 uppercase tracking-widest">
                    {(data[currentUser.name]?.goal || 0) - (data[currentUser.name]?.finalizado || 0) <= 0 
                      ? "🎯 META BATIDA! PARABÉNS!" 
                      : `Faltam ${(data[currentUser.name]?.goal || 0) - (data[currentUser.name]?.finalizado || 0)} para o objetivo`}
                 </p>
              </div>
            </div>
          </section>
        )}

        <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100">
           <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-500 flex items-center gap-2"><Users size={16} /> Painel de Lançamento</h2>
              {isSyncing && <div className="text-[9px] font-black text-orange-600 animate-pulse uppercase tracking-[0.2em]">Sincronizando Dados...</div>}
           </div>
           <div className="overflow-x-auto">
             <table className="w-full text-left table-fixed min-w-[1000px]">
                <thead className="bg-slate-50/50 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
                   <tr>
                      <th className="p-8 w-[25%]">Expert / Time</th>
                      <th className="p-8 text-center w-[10%]">Meta</th>
                      <th className="p-8 text-center w-[10%]">Tratativa</th>
                      <th className="p-8 text-center w-[10%]">Finalizado</th>
                      <th className="p-8 text-center w-[8%]">Eficiência</th>
                      {isAdmin && <th className="p-8 w-[15%]">Observação</th>}
                      {isAdmin && <th className="p-8 w-[22%]">Chat Direto</th>}
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                   {visibleExperts.length > 0 ? visibleExperts.map((name, i) => {
                      const entry = data[name];
                      const total = entry.tratado + entry.finalizado;
                      const eff = total > 0 ? Math.round((entry.finalizado / total) * 100) : 0;
                      return (
                         <tr key={name} className="hover:bg-slate-50/40 transition-all duration-300">
                            <td className="p-8">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-2xl bg-orange-600 text-white flex items-center justify-center font-black text-xs shadow-lg shadow-orange-600/10">
                                  {name.charAt(0)}
                                </div>
                                <div className="truncate">
                                  <div className="font-black text-slate-800 text-sm truncate">{name}</div>
                                  <div className="text-[9px] font-black text-slate-400 uppercase mt-0.5">{EXPERT_MAP[name]?.supervisor || 'Geral'}</div>
                                </div>
                              </div>
                            </td>
                            <td className="p-8">
                               <input type="number" value={entry.goal || ''} disabled={!isAdmin} onChange={(e) => handleInputChange(name, 'goal', e.target.value)} className="w-full text-center font-black text-orange-600 bg-orange-50/50 rounded-xl p-3 border-2 border-transparent focus:border-orange-200 outline-none disabled:opacity-50" placeholder="0" />
                            </td>
                            <td className="p-8">
                               <input type="number" value={entry.tratado || ''} onChange={(e) => handleInputChange(name, 'tratado', e.target.value)} className="w-full text-center font-bold text-slate-600 bg-slate-50 rounded-xl p-3 border-2 border-transparent focus:border-slate-200 outline-none" placeholder="0" />
                            </td>
                            <td className="p-8">
                               <input type="number" value={entry.finalizado || ''} onChange={(e) => handleInputChange(name, 'finalizado', e.target.value)} className="w-full text-center font-black text-green-600 bg-green-50 rounded-xl p-3 border-2 border-transparent focus:border-green-200 outline-none shadow-sm" placeholder="0" />
                            </td>
                            <td className="p-8 text-center">
                               <span className={`text-xs font-black p-2 rounded-lg ${eff >= 100 ? 'bg-orange-600 text-white shadow-lg' : 'text-slate-400'}`}>{eff}%</span>
                            </td>
                            {isAdmin && (
                              <td className="p-8">
                                 <input 
                                   type="text"
                                   value={entry.observacao || ''} 
                                   onChange={(e) => handleInputChange(name, 'observacao', e.target.value)}
                                   className="w-full bg-slate-50 p-3 rounded-xl text-[10px] font-bold outline-none border-2 border-transparent focus:border-slate-200 placeholder:text-slate-300" 
                                   placeholder="Nota privada..." 
                                 />
                              </td>
                            )}
                            {isAdmin && (
                              <td className="p-8">
                                 <div className="flex gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100 group-within:border-orange-200 transition-colors">
                                    <input 
                                      value={tempMessages[name] || ''} 
                                      onChange={(e) => setTempMessages(prev => ({ ...prev, [name]: e.target.value }))}
                                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(name)}
                                      className="bg-transparent p-2 rounded-xl text-[10px] font-bold outline-none flex-1 placeholder:text-slate-300" 
                                      placeholder="Enviar instrução..." 
                                    />
                                    <button 
                                      onClick={() => handleSendMessage(name)} 
                                      className="bg-slate-900 text-white p-3 rounded-xl hover:bg-orange-600 transition-all shadow-lg active:scale-90"
                                    >
                                      <Send size={14} />
                                    </button>
                                 </div>
                              </td>
                            )}
                         </tr>
                      )
                   }) : (
                     <tr>
                       <td colSpan={isAdmin ? 7 : 5} className="p-20 text-center">
                          <AlertCircle size={40} className="mx-auto text-slate-100 mb-4" />
                          <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest italic">Nenhum registro localizado</p>
                       </td>
                     </tr>
                   )}
                </tbody>
             </table>
           </div>
        </div>

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

        {aiAnalysis && (
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

      </div>

      {notification?.visible && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm px-6 animate-in fade-in zoom-in slide-in-from-top-10 duration-500">
           <div className={`px-8 py-6 rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] text-white font-black flex items-center gap-6 border-2 border-white/20 backdrop-blur-md ${
              notification.type === 'error' ? 'bg-red-600' : 
              notification.type === 'alert' ? 'bg-orange-600' : 
              notification.type === 'info' ? 'bg-slate-900' : 'bg-slate-900'
           }`}>
              <div className="bg-white/10 p-3 rounded-2xl animate-pulse">
                <BellRing size={24} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] opacity-60 uppercase tracking-widest mb-1 font-black">Sistema Cloud</p>
                <span className="text-sm block tracking-tight leading-tight uppercase italic">{notification.message}</span>
              </div>
              <button onClick={() => setNotification(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={20} /></button>
           </div>
        </div>
      )}

      <style>{`
        @keyframes shrinkWidth { from { width: 100%; } to { width: 0%; } }
        .animate-in { animation-duration: 0.7s; animation-fill-mode: both; }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes zoom-in { from { transform: scale(0.9); } to { transform: scale(1); } }
        @keyframes slide-in-from-top-10 { from { transform: translateY(-2.5rem); } to { transform: translateY(0); } }
        .fade-in { animation-name: fade-in; }
        .zoom-in { animation-name: zoom-in; }
        .slide-in-from-top-10 { animation-name: slide-in-from-top-10; }
      `}</style>
    </div>
  );
}

export default App;
