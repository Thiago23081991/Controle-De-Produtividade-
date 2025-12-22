
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ClipboardList, Sparkles, Copy, RefreshCw, AlertTriangle, Calendar, Siren, FileSpreadsheet, Trophy, Award, LogIn, LogOut, User, CheckCircle, X, Send, BellRing, MessageSquareText, Mail, Database, AlertCircle, Terminal, Code, Clock, Palette, Download, FileText, BrainCircuit, Hash, Volume2, Rocket, Target, Sun } from 'lucide-react';
import { EXPERT_ROSTER, EXPERT_MAP, EXPERT_LIST, generateMarkdownTable } from './utils/parser';
import { analyzeProductivity } from './services/geminiService';
import { ManualEntryData, ExpertInfo, TimeSlot } from './types';
import { PerformanceChart } from './components/PerformanceChart';
import { supabase, isSupabaseConfigured } from './services/supabaseClient';

const ADMIN_MATRICULAS = ['301052', '322110', '221362', '333596', '246794'];
const MESSAGE_DURATION_MS = 3 * 60 * 1000; // 3 minutos

// Gerenciamento de Áudio Global
let globalAudioCtx: AudioContext | null = null;

const initAudio = () => {
  if (!globalAudioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
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

    const playTone = (freq: number, start: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
      gain.gain.setValueAtTime(0, ctx.currentTime + start);
      gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + duration);
    };

    // Som de notificação sutil inspirado na urna (Pilim!)
    playTone(1100, 0, 0.2);
    playTone(1350, 0.08, 0.25);
  } catch (e) {
    console.error("Erro ao tocar beep:", e);
  }
};

const SQL_SETUP_SCRIPT = `-- EXECUTE ESTE SCRIPT NO SQL EDITOR DO SUPABASE:
CREATE TABLE IF NOT EXISTS productivity_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date TEXT NOT NULL,
  expert_name TEXT NOT NULL,
  tratado INTEGER DEFAULT 0,
  finalizado INTEGER DEFAULT 0,
  goal INTEGER DEFAULT 0,
  observacao TEXT DEFAULT '',
  is_urgent BOOLEAN DEFAULT false,
  manager_message TEXT DEFAULT '',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(date, expert_name)
);
alter publication supabase_realtime add table productivity_records;`;

const getTodayString = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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
  const [showSqlHelp, setShowSqlHelp] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(getTodayString());
  const [notification, setNotification] = useState<{ message: string; visible: boolean; type?: 'success' | 'info' | 'error' } | null>(null);
  const [tempMessages, setTempMessages] = useState<Record<string, string>>({});
  const [data, setData] = useState<ManualEntryData>(getInitialData);
  
  const lastMessageRef = useRef<string>('');

  // Sincronização inicial e Realtime
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
          }
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [selectedDate, loadSupabaseData]);

  // Monitor de Áudio Global na primeira interação
  useEffect(() => {
    const wakeUpAudio = () => { initAudio(); window.removeEventListener('click', wakeUpAudio); };
    window.addEventListener('click', wakeUpAudio);
    return () => window.removeEventListener('click', wakeUpAudio);
  }, []);

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
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    initAudio();
    const input = loginInput.trim();
    if (ADMIN_MATRICULAS.includes(input)) {
      setIsAdmin(true); setIsLoggedIn(true);
    } else {
      const expert = EXPERT_LIST.find(e => e.matricula === input || e.login === input);
      if (expert) { setCurrentUser(expert); setIsLoggedIn(true); }
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
    setNotification({ message: `Mensagem enviada!`, visible: true, type: 'success' });
    setTempMessages(prev => ({ ...prev, [expert]: '' }));
  };

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const analysis = await analyzeProductivity(data);
      setAiAnalysis(analysis);
      setNotification({ message: 'Análise concluída!', visible: true, type: 'success' });
    } catch (err) {
      setNotification({ message: 'Erro ao gerar análise.', visible: true, type: 'error' });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const visibleExperts = isAdmin ? Object.keys(data).sort() : (currentUser ? [currentUser.name] : []);
  const expertReceivedMessage = (!isAdmin && currentUser) ? data[currentUser.name]?.managerMessage : null;

  // Lógica de Alerta de Mensagem (Som + Toast)
  useEffect(() => {
    if (!isAdmin && currentUser && expertReceivedMessage) {
      const msg = expertReceivedMessage.trim();
      if (msg && msg !== lastMessageRef.current) {
        playUrnaBeep();
        setNotification({ 
          message: '🔔 Nova mensagem da gestão recebida!', 
          visible: true, 
          type: 'info' 
        });
        lastMessageRef.current = msg;
      }
      const timer = setTimeout(() => {
        saveToSupabase(currentUser.name, { managerMessage: '' });
        lastMessageRef.current = '';
      }, MESSAGE_DURATION_MS);
      return () => clearTimeout(timer);
    }
  }, [expertReceivedMessage, currentUser, isAdmin]);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-white p-10 rounded-[3rem] shadow-2xl w-full max-w-sm text-center">
          <Palette className="w-16 h-16 text-orange-600 mx-auto mb-6" />
          <h1 className="text-3xl font-black mb-2">Suvinil Service</h1>
          <form onSubmit={handleLogin} className="space-y-4 mt-8">
            <input 
              type="text" value={loginInput} onChange={(e) => setLoginInput(e.target.value)}
              className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-orange-500 outline-none text-center font-bold text-xl" 
              placeholder="Sua Matrícula" 
            />
            {loginError && <p className="text-red-600 text-xs font-bold">{loginError}</p>}
            <button className="w-full bg-orange-600 text-white font-black py-4 rounded-2xl shadow-lg hover:scale-[1.02] transition-transform">ACESSAR</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans" onClick={() => initAudio()}>
      <div className="max-w-7xl mx-auto space-y-6">
        
        <header className="bg-white p-6 rounded-[2rem] shadow-xl flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
             <div className="bg-slate-900 p-3 rounded-2xl"><ClipboardList className="text-orange-500" /></div>
             <div><h1 className="text-xl font-black">Suvinil <span className="text-orange-600">Cloud</span></h1><p className="text-[10px] font-bold text-slate-400">PAINEL DE PRODUTIVIDADE</p></div>
          </div>
          <div className="flex items-center gap-4">
            {isSyncing && <div className="text-[10px] font-black text-orange-600 animate-pulse tracking-widest uppercase">Sincronizando...</div>}
            <button onClick={handleLogout} className="flex items-center gap-2 text-slate-400 font-bold hover:text-red-600 transition-colors"><LogOut size={18} /> SAIR</button>
          </div>
        </header>

        {expertReceivedMessage && (
          <div className="bg-orange-600 text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden flex items-center gap-6 animate-pulse">
             <div className="absolute top-0 left-0 h-1 bg-white/40" style={{ width: '100%', animation: `shrinkWidth ${MESSAGE_DURATION_MS}ms linear forwards` }}></div>
             <Mail size={40} className="shrink-0" />
             <div className="flex-1">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-70 block mb-1">📢 Aviso Prioritário da Gestão</span>
                <p className="text-2xl font-black italic tracking-tight">"{expertReceivedMessage}"</p>
             </div>
          </div>
        )}

        <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200">
           <table className="w-full text-left table-fixed">
              <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                 <tr>
                    <th className="p-6 w-[20%]">Expert</th>
                    <th className="p-6 text-center w-[10%]">Meta</th>
                    <th className="p-6 text-center w-[10%]">Tratativa</th>
                    <th className="p-6 text-center w-[10%]">Finalizado</th>
                    <th className="p-6 text-center w-[10%]">% Efic.</th>
                    {isAdmin && <th className="p-6 w-[20%]">Justificativa</th>}
                    {isAdmin && <th className="p-6 w-[20%]">Comunicação</th>}
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                 {visibleExperts.map((name, i) => {
                    const entry = data[name];
                    const total = entry.tratado + entry.finalizado;
                    const eff = total > 0 ? Math.round((entry.finalizado / total) * 100) : 0;
                    return (
                       <tr key={name} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-6 font-black text-slate-800 truncate">{name}</td>
                          <td className="p-6">
                             <input type="number" value={entry.goal || ''} disabled={!isAdmin} onChange={(e) => handleInputChange(name, 'goal', e.target.value)} className="w-20 mx-auto block text-center font-black text-orange-600 bg-orange-50/50 rounded-lg p-2" />
                          </td>
                          <td className="p-6">
                             <input type="number" value={entry.tratado || ''} onChange={(e) => handleInputChange(name, 'tratado', e.target.value)} className="w-20 mx-auto block text-center font-bold text-slate-600 bg-slate-50 rounded-lg p-2" />
                          </td>
                          <td className="p-6">
                             <input type="number" value={entry.finalizado || ''} onChange={(e) => handleInputChange(name, 'finalizado', e.target.value)} className="w-20 mx-auto block text-center font-black text-green-600 bg-green-50 rounded-lg p-2" />
                          </td>
                          <td className="p-6 text-center font-black text-slate-400">{eff}%</td>
                          {isAdmin && (
                            <td className="p-6">
                               <input 
                                 type="text"
                                 value={entry.observacao || ''} 
                                 onChange={(e) => handleInputChange(name, 'observacao', e.target.value)}
                                 className="w-full bg-slate-50 p-2 rounded-lg text-[10px] font-bold outline-none border border-transparent focus:border-orange-500 placeholder:text-slate-300" 
                                 placeholder="Nota da gestão..." 
                               />
                            </td>
                          )}
                          {isAdmin && (
                            <td className="p-6">
                               <div className="flex gap-2">
                                  <input 
                                    value={tempMessages[name] || ''} 
                                    onChange={(e) => setTempMessages(prev => ({ ...prev, [name]: e.target.value }))}
                                    className="bg-slate-50 p-2 rounded-lg text-[10px] font-bold outline-none flex-1 border border-transparent focus:border-orange-500" 
                                    placeholder="Enviar aviso..." 
                                  />
                                  <button onClick={() => handleSendMessage(name)} className="bg-orange-600 text-white p-2 rounded-lg hover:bg-orange-700 transition-colors"><Send size={12} /></button>
                               </div>
                            </td>
                          )}
                       </tr>
                    )
                 })}
              </tbody>
           </table>
        </div>

        {isAdmin && <PerformanceChart data={data} />}

        {isAdmin && (
           <button 
             onClick={handleRunAnalysis}
             disabled={isAnalyzing}
             className="w-full bg-slate-900 text-white p-6 rounded-[2rem] font-black flex items-center justify-center gap-3 hover:bg-orange-600 transition-colors shadow-xl disabled:bg-slate-300"
           >
             {isAnalyzing ? <RefreshCw className="animate-spin" /> : <BrainCircuit />} GERAR ANÁLISE EXECUTIVA IA
           </button>
        )}

        {aiAnalysis && (
          <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl border-l-8 border-orange-600">
             <div className="flex justify-between items-center mb-6">
               <h3 className="text-xl font-black flex items-center gap-3"><Sparkles className="text-orange-500" /> Relatório IA Suvinil</h3>
               <button onClick={() => setAiAnalysis(null)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
             </div>
             <div className="prose prose-slate max-w-none text-slate-600 font-medium leading-relaxed">
                {aiAnalysis.split('\n').map((l, i) => (
                  <p key={i} className="mb-2">{l}</p>
                ))}
             </div>
          </div>
        )}

      </div>

      {notification?.visible && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-bounce">
           <div className={`px-8 py-4 rounded-full shadow-2xl text-white font-black flex items-center gap-4 ${notification.type === 'error' ? 'bg-red-600' : notification.type === 'info' ? 'bg-slate-900' : 'bg-orange-600'}`}>
              <BellRing size={20} className="animate-pulse" />
              <span>{notification.message}</span>
              <button onClick={() => setNotification(null)} className="p-1 hover:bg-white/20 rounded-full"><X size={16} /></button>
           </div>
        </div>
      )}

      <style>{`
        @keyframes shrinkWidth { from { width: 100%; } to { width: 0%; } }
      `}</style>
    </div>
  );
}

export default App;
