
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ClipboardList, Sparkles, Copy, RefreshCw, AlertTriangle, Calendar, Siren, FileSpreadsheet, Trophy, Award, LogIn, LogOut, User, CheckCircle, X, Send, BellRing, MessageSquareText, Mail, Database, AlertCircle, Terminal, Code, Clock, Palette, Download, FileText, BrainCircuit, Hash, Volume2, Rocket, Target, Sun } from 'lucide-react';
import { EXPERT_ROSTER, EXPERT_MAP, EXPERT_LIST, generateMarkdownTable } from './utils/parser';
import { analyzeProductivity } from './services/geminiService';
import { ManualEntryData, ExpertInfo, TimeSlot } from './types';
import { PerformanceChart } from './components/PerformanceChart';
import { supabase, isSupabaseConfigured } from './services/supabaseClient';

const ADMIN_MATRICULAS = ['301052', '322110'];
const MESSAGE_DURATION_MS = 3 * 60 * 1000; // 3 minutos

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

-- Habilita o Realtime
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

const playBeepSound = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    gainNode.gain.setValueAtTime(0.02, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  } catch (e) {}
};

const playSuccessSound = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
    gainNode.gain.setValueAtTime(0.05, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch (e) {}
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

  const loadSupabaseData = useCallback(async (date: string) => {
    if (!isSupabaseConfigured) return;

    setIsSyncing(true);
    // Importante: Resetar para o estado inicial antes de carregar dados da nova data
    const freshSlate = getInitialData();
    
    try {
      const { data: records, error } = await supabase
        .from('productivity_records')
        .select('*')
        .eq('date', date);

      if (error) {
        const errorMsg = error.message || JSON.stringify(error);
        if (errorMsg.includes('not found')) {
          setNotification({ message: `Configuração pendente no banco!`, visible: true, type: 'error' });
          setShowSqlHelp(true);
        } else {
          setNotification({ message: `Erro Cloud: ${errorMsg}`, visible: true, type: 'error' });
        }
        setData(freshSlate);
      } else if (records) {
        records.forEach(rec => {
          if (freshSlate[rec.expert_name]) {
            freshSlate[rec.expert_name] = {
              tratado: rec.tratado,
              finalizado: rec.finalizado,
              goal: rec.goal,
              observacao: rec.observacao,
              isUrgent: rec.is_urgent,
              managerMessage: rec.manager_message
            };
          }
        });
        setData(freshSlate);
      }
    } catch (e) {
      setData(freshSlate);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    loadSupabaseData(selectedDate);
    const channel = supabase
      .channel(`prod-changes-${selectedDate}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'productivity_records', filter: `date=eq.${selectedDate}` }, (payload) => {
          const rec = payload.new as any;
          if (rec && rec.expert_name) {
            setData(prev => ({
              ...prev,
              [rec.expert_name]: {
                tratado: rec.tratado,
                finalizado: rec.finalizado,
                goal: rec.goal,
                observacao: rec.observacao,
                isUrgent: rec.is_urgent,
                managerMessage: rec.manager_message
              }
            }));
          }
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [selectedDate, loadSupabaseData]);

  const saveToSupabase = async (expert: string, updateData: Partial<ManualEntryData[string]>) => {
    if (!isSupabaseConfigured) return;
    const entry = data[expert];
    const fullData = { ...entry, ...updateData };
    const { error } = await supabase
      .from('productivity_records')
      .upsert({
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

    if (error && error.message?.includes('not found')) setShowSqlHelp(true);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    
    const sanitizedInput = loginInput.trim();
    
    if (!sanitizedInput) {
      setLoginError('Digite sua matrícula ou login.');
      return;
    }

    if (ADMIN_MATRICULAS.includes(sanitizedInput)) {
      setIsAdmin(true);
      setIsLoggedIn(true);
      return;
    }
    
    const expert = EXPERT_LIST.find(e => e.matricula === sanitizedInput || e.login === sanitizedInput);
    if (expert) {
      setCurrentUser(expert);
      setIsAdmin(false);
      setIsLoggedIn(true);
    } else {
      setLoginError('Matrícula/Login não localizado no cadastro.');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setIsAdmin(false);
    setLoginInput('');
    setShowSqlHelp(false);
    setAiAnalysis(null);
  };

  const handleInputChange = (expert: string, field: 'tratado' | 'finalizado' | 'observacao' | 'goal', value: string) => {
    const numValue = (value === '' ? 0 : parseInt(value));
    const finalValue = field === 'observacao' ? value : Math.max(0, isNaN(numValue) ? 0 : numValue);
    if (field === 'finalizado') {
      const currentGoal = data[expert].goal || 0;
      if (currentGoal > 0 && data[expert].finalizado < currentGoal && numValue >= currentGoal) {
        playSuccessSound();
        setNotification({ message: `🎯 Meta Alcançada!`, visible: true, type: 'success' });
      }
    }
    setData(prev => ({ ...prev, [expert]: { ...prev[expert], [field]: finalValue } }));
    saveToSupabase(expert, { [field]: finalValue });
  };

  const handleSendMessage = (expert: string) => {
    const message = tempMessages[expert] || '';
    if (!message.trim()) return;

    playBeepSound();
    setData(prev => ({ ...prev, [expert]: { ...prev[expert], managerMessage: message } }));
    saveToSupabase(expert, { managerMessage: message });
    setNotification({ message: `Mensagem enviada para ${expert}!`, visible: true, type: 'success' });
    setTempMessages(prev => ({ ...prev, [expert]: '' }));
  };

  const toggleUrgency = (expert: string) => {
    const newValue = !data[expert].isUrgent;
    setData(prev => ({ ...prev, [expert]: { ...prev[expert], isUrgent: newValue } }));
    saveToSupabase(expert, { isUrgent: newValue });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number, field: string, listLen: number, expertName?: string) => {
    if (e.key === 'Enter' && field === 'managerMessage' && expertName) {
      handleSendMessage(expertName);
      return;
    }

    const focusInput = (idx: number, f: string) => {
      const el = document.getElementById(`input-${idx}-${f}`);
      if (el) (el as HTMLInputElement).focus();
    };
    const visibleFields = ['goal', 'tratado', 'finalizado', 'observacao', 'managerMessage'].filter(f => 
      isAdmin || !(f === 'goal' || f === 'observacao' || f === 'managerMessage')
    );
    const currentFieldIndex = visibleFields.indexOf(field);
    if (e.key === 'ArrowRight') focusInput(index, visibleFields[currentFieldIndex + 1]);
    else if (e.key === 'ArrowLeft') focusInput(index, visibleFields[currentFieldIndex - 1]);
    else if (e.key === 'ArrowDown') focusInput(index + 1, field);
    else if (e.key === 'ArrowUp') focusInput(index - 1, field);
  };

  const getEfficiency = (expert: string) => {
    const total = (data[expert]?.tratado || 0) + (data[expert]?.finalizado || 0);
    return total === 0 ? 0 : Math.round(((data[expert]?.finalizado || 0) / total) * 100);
  };

  const handleGenerateAnalysis = async () => {
    setIsAnalyzing(true);
    setAiAnalysis(null);
    try {
      const result = await analyzeProductivity(data);
      setAiAnalysis(result);
      setNotification({ message: 'Análise gerada com sucesso!', visible: true, type: 'success' });
    } catch (e) {
      setNotification({ message: 'Falha na análise IA.', visible: true, type: 'error' });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleExportCSV = () => {
    const experts = Object.keys(data).sort();
    let csv = 'Matricula,Expert,Supervisor,Meta,Tratativa,Finalizado,Total,Eficiencia,Urgente,Observacao\n';
    
    experts.forEach(name => {
      const info = EXPERT_MAP[name];
      const entry = data[name];
      const total = entry.tratado + entry.finalizado;
      const eff = getEfficiency(name);
      csv += `${info?.matricula || '-'},"${name}","${info?.supervisor || ''}",${entry.goal || 0},${entry.tratado},${entry.finalizado},${total},${eff}%,${entry.isUrgent ? 'SIM' : 'NAO'},"${entry.observacao || ''}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `produtividade_suvinil_${selectedDate}.csv`;
    link.click();
    setNotification({ message: 'CSV exportado!', visible: true, type: 'info' });
  };

  const handleCopyReport = () => {
    const experts = Object.keys(data).sort();
    let md = `### 🎨 Relatório Suvinil Service - ${selectedDate}\n\n`;
    md += `| Expert | Supervisor | Meta | Trat. | Fin. | % |\n`;
    md += `| :--- | :--- | :---: | :---: | :---: | :---: |\n`;
    
    experts.forEach(name => {
      const entry = data[name];
      const info = EXPERT_MAP[name];
      if (entry.tratado > 0 || entry.finalizado > 0 || (entry.goal || 0) > 0) {
        const eff = getEfficiency(name);
        md += `| ${name} | ${info?.supervisor || ''} | ${entry.goal || 0} | ${entry.tratado} | ${entry.finalizado} | ${eff}% |\n`;
      }
    });

    navigator.clipboard.writeText(md);
    setNotification({ message: 'Markdown copiado!', visible: true, type: 'info' });
  };

  const copySql = () => {
    navigator.clipboard.writeText(SQL_SETUP_SCRIPT);
    setNotification({ message: 'Script SQL copiado!', visible: true, type: 'info' });
  };

  const visibleExperts = isAdmin ? Object.keys(data).sort() : (currentUser ? [currentUser.name] : []);
  const expertReceivedMessage = (!isAdmin && currentUser) ? data[currentUser.name]?.managerMessage : null;

  useEffect(() => {
    if (!isAdmin && currentUser && expertReceivedMessage) {
      const timer = setTimeout(() => {
        saveToSupabase(currentUser.name, { managerMessage: '' });
      }, MESSAGE_DURATION_MS);
      return () => clearTimeout(timer);
    }
  }, [expertReceivedMessage, currentUser, isAdmin]);

  const renderWelcomeMessage = () => {
    if (isAdmin) {
      return (
        <div className="flex items-center gap-4 bg-slate-900/5 p-5 rounded-3xl border border-slate-200 animate-in fade-in slide-in-from-left-4 duration-700">
           <div className="bg-slate-900 p-2.5 rounded-2xl shadow-md"><User className="w-5 h-5 text-orange-500" /></div>
           <div>
              <p className="text-sm font-black text-slate-800">Olá, Administrador!</p>
              <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wide">O painel de controle está atualizado com os últimos registros da nuvem.</p>
           </div>
        </div>
      );
    }

    if (currentUser) {
      const stats = data[currentUser.name];
      const name = currentUser.name.split(' ')[0];
      const goal = stats?.goal || 0;
      const finished = stats?.finalizado || 0;
      const metGoal = goal > 0 && finished >= goal;

      let message = "Pronto para começar mais um dia de excelentes atendimentos? 💪";
      let icon = <Sun className="w-5 h-5 text-yellow-500" />;

      if (metGoal) {
        message = `Sensacional, ${name}! Você já atingiu sua meta de hoje. Ótimo trabalho! 🎯`;
        icon = <Trophy className="w-5 h-5 text-orange-600" />;
      } else if (finished > 0) {
        message = `Olá, ${name}! Você está no caminho certo, com ${finished} casos finalizados hoje. 🚀`;
        icon = <Rocket className="w-5 h-5 text-orange-600" />;
      }

      return (
        <div className="flex items-center gap-4 bg-orange-50/50 p-5 rounded-3xl border border-orange-100 animate-in fade-in slide-in-from-left-4 duration-700">
           <div className="bg-white p-2.5 rounded-2xl shadow-sm border border-orange-100">{icon}</div>
           <div>
              <p className="text-sm font-black text-slate-800">Olá, {name}!</p>
              <p className="text-[11px] text-slate-500 font-bold leading-relaxed">{message}</p>
           </div>
        </div>
      );
    }
    return null;
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-orange-950 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-10 space-y-8 text-center">
            <div className="bg-orange-100 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-3 shadow-orange-200/50 shadow-lg">
              <Palette className="w-10 h-10 text-orange-600" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Suvinil <span className="text-orange-600">Service</span></h1>
            <p className="text-slate-400 text-sm mt-2 font-medium">Controle de Produtividade</p>
          <form onSubmit={handleLogin} className="space-y-6 mt-6">
            <div className="relative">
              <input 
                type="text" 
                value={loginInput} 
                onChange={(e) => setLoginInput(e.target.value)} 
                className={`w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 transition-all outline-none text-center text-2xl font-black text-slate-800 ${loginError ? 'border-red-500' : 'border-slate-100 focus:border-orange-500 focus:bg-white'}`} 
                placeholder="Matrícula ou Login" 
                autoFocus 
              />
              {loginInput.trim().length > 0 && loginInput.trim().length < 6 && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-600 text-white text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-tighter">Incompleta</div>
              )}
            </div>
            {loginError && <p className="text-sm text-red-600 font-bold text-center bg-red-50 py-2 rounded-xl border border-red-100">{loginError}</p>}
            <button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-orange-600/30 transition-all transform hover:-translate-y-1 active:scale-95">ACESSAR PAINEL</button>
          </form>
          {!isSupabaseConfigured && <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2 text-xs text-red-700 font-medium"><AlertCircle className="w-4 h-4 mt-0.5 shrink-0" /> Cloud Desconectada.</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {showSqlHelp && (
          <div className="bg-red-600 text-white p-5 rounded-3xl shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4 border-b-8 border-red-800">
             <div className="flex items-center gap-4">
                <AlertTriangle className="w-10 h-10 animate-pulse text-red-200" />
                <div><p className="font-black text-xl leading-tight uppercase tracking-tight">Banco de Dados não Colorido!</p><p className="text-sm opacity-90">A estrutura de dados precisa ser inicializada no Supabase.</p></div>
             </div>
             <button onClick={copySql} className="bg-white text-red-700 px-8 py-3 rounded-2xl font-black text-sm hover:bg-red-50 shadow-lg flex items-center gap-2 transition-all"><Terminal className="w-5 h-5" /> Copiar SQL de Ajuste</button>
          </div>
        )}

        <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 gap-6">
          <div className="flex items-center gap-5">
            <div className="bg-slate-900 p-3 rounded-2xl shadow-lg shadow-slate-900/20 rotate-2"><ClipboardList className="w-8 h-8 text-orange-500" /></div>
            <div>
              <h1 className="text-2xl font-black tracking-tight">Painel <span className="text-orange-600">Cloud</span></h1>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Colaborador: <span className="text-slate-900">{isAdmin ? 'ADMINISTRADOR' : currentUser?.name}</span></p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             {isAdmin && (
               <div className="hidden lg:flex items-center gap-2 mr-4">
                  <button onClick={handleExportCSV} className="p-3 bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-xl transition-all shadow-sm" title="Exportar CSV"><FileSpreadsheet className="w-5 h-5" /></button>
                  <button onClick={handleCopyReport} className="p-3 bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-xl transition-all shadow-sm" title="Copiar Markdown"><FileText className="w-5 h-5" /></button>
                  <button onClick={handleGenerateAnalysis} disabled={isAnalyzing} className={`p-3 rounded-xl transition-all shadow-md flex items-center gap-2 ${isAnalyzing ? 'bg-orange-200 text-orange-400 animate-pulse' : 'bg-orange-600 text-white hover:bg-orange-700'}`} title="Análise IA">
                    {isAnalyzing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <BrainCircuit className="w-5 h-5" />}
                  </button>
               </div>
             )}
             {isSyncing && <div className="flex items-center gap-2 text-[10px] text-orange-600 font-black animate-pulse uppercase tracking-widest mr-2"><Database className="w-4 h-4" /> Sincronizando...</div>}
             <button onClick={handleLogout} className="flex items-center gap-2 px-5 py-2.5 text-sm font-black text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all"><LogOut className="w-5 h-5" /> SAIR</button>
          </div>
        </div>

        {renderWelcomeMessage()}

        {expertReceivedMessage && (
          <div className="bg-orange-600 text-white p-6 rounded-3xl shadow-2xl relative overflow-hidden flex items-center gap-5 border-b-8 border-orange-800 animate-in fade-in slide-in-from-top-4 duration-500">
             <div className="absolute bottom-0 left-0 h-2 bg-white/30 transition-all ease-linear" style={{ width: '100%', animation: `shrinkWidth ${MESSAGE_DURATION_MS}ms linear forwards` }}></div>
             <div className="bg-orange-500 p-4 rounded-2xl shrink-0 shadow-lg relative overflow-hidden group">
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                <Mail className="w-8 h-8 relative z-10" />
             </div>
             <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[10px] uppercase font-black tracking-[0.2em] opacity-80 flex items-center gap-2"><BellRing className="w-3 h-3 animate-bounce" /> Mensagem de Gestão</p>
                  <div className="flex items-center gap-1.5 text-[10px] font-black bg-orange-700/50 px-3 py-1 rounded-full border border-orange-400/50">
                    <Clock className="w-4 h-4" /> desaparece em 3m
                  </div>
                </div>
                <p className="text-xl font-black italic tracking-tight drop-shadow-sm">"{expertReceivedMessage}"</p>
             </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="bg-white px-5 py-3 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-3 w-full md:w-auto">
            <Calendar className="w-5 h-5 text-orange-600" />
            <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="text-sm font-black text-slate-700 outline-none bg-transparent w-full" />
          </div>
        </div>

        <div className="bg-white shadow-2xl rounded-[2.5rem] overflow-hidden border border-slate-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                <tr>
                  <th className="px-3 py-5 text-center w-14">Urg</th>
                  <th className="py-5 pl-6 pr-3 text-left">Expert de Atendimento</th>
                  {isAdmin && <th className="px-3 py-5 text-center bg-orange-50 text-orange-700 w-20">Meta</th>}
                  <th className="px-3 py-5 text-center bg-yellow-50/50 text-yellow-700 w-24">Tratativa</th>
                  <th className="px-3 py-5 text-center bg-orange-50/30 text-orange-700 w-24">Finalizado</th>
                  <th className="px-3 py-5 text-center bg-slate-900 text-white w-20">Total</th>
                  <th className="px-2 py-5 text-center bg-slate-100 text-slate-600 w-16">%</th>
                  {isAdmin && <th className="px-3 py-5 text-left min-w-[150px]">Obs</th>}
                  {isAdmin && <th className="px-3 py-5 text-left bg-orange-50/20 text-orange-900">Comunicação Instantânea</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {visibleExperts.map((name, index) => {
                  const entry = data[name];
                  const info = EXPERT_MAP[name];
                  const metGoal = entry.goal > 0 && entry.finalizado >= entry.goal;
                  const total = (entry.tratado || 0) + (entry.finalizado || 0);
                  const eff = getEfficiency(name);
                  return (
                    <tr key={name} className={`transition-colors group ${entry.isUrgent ? 'bg-red-50/50' : (metGoal && isAdmin) ? 'bg-orange-50/40' : 'hover:bg-slate-50/50'}`}>
                      <td className="px-3 py-4 text-center">
                        <input type="checkbox" className="w-5 h-5 rounded-lg cursor-pointer accent-red-600 border-2 border-slate-200" checked={entry.isUrgent} onChange={() => toggleUrgency(name)} />
                      </td>
                      <td className="px-6 py-4">
                         <div className="flex flex-col">
                            <span className="text-sm font-black text-slate-800">{name}</span>
                            <div className="flex items-center gap-2">
                               <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">{info?.login || '---'}</span>
                               {info?.supervisor && <span className="text-[8px] text-slate-300 font-black uppercase">• {info.supervisor.split(' ')[0]}</span>}
                            </div>
                         </div>
                      </td>
                      {isAdmin && (
                        <td className="px-1 py-4 bg-orange-50/10">
                          <input id={`input-${index}-goal`} type="number" value={entry.goal || ''} onChange={(e) => handleInputChange(name, 'goal', e.target.value)} onKeyDown={(e) => handleKeyDown(e, index, 'goal', visibleExperts.length)} className="w-full text-center text-sm font-black text-orange-700 bg-transparent border-none focus:ring-0" placeholder="-" />
                        </td>
                      )}
                      <td className="px-1 py-4 bg-yellow-50/10">
                        <input id={`input-${index}-tratado`} type="number" value={entry.tratado || ''} onChange={(e) => handleInputChange(name, 'tratado', e.target.value)} onKeyDown={(e) => handleKeyDown(e, index, 'tratado', visibleExperts.length)} className="w-full text-center text-sm font-black text-yellow-600 bg-transparent border-none focus:ring-0" placeholder="0" />
                      </td>
                      <td className={`px-1 py-4 ${metGoal && isAdmin ? 'bg-orange-100' : 'bg-orange-50/10'}`}>
                        <input id={`input-${index}-finalizado`} type="number" value={entry.finalizado || ''} onChange={(e) => handleInputChange(name, 'finalizado', e.target.value)} onKeyDown={(e) => handleKeyDown(e, index, 'finalizado', visibleExperts.length)} className={`w-full text-center text-sm font-black border-none focus:ring-0 ${metGoal && isAdmin ? 'text-orange-900' : 'text-orange-600'}`} placeholder="0" />
                      </td>
                      <td className="px-1 py-4 text-center text-sm font-black text-white bg-slate-900/90">{total}</td>
                      <td className={`px-1 py-4 text-center text-[11px] font-black ${eff >= 80 ? 'text-orange-600' : 'text-slate-400'}`}>{total > 0 ? `${eff}%` : '-'}</td>
                      {isAdmin && (
                        <td className="px-3 py-4">
                          <input id={`input-${index}-observacao`} type="text" value={entry.observacao} onChange={(e) => handleInputChange(name, 'observacao', e.target.value)} onKeyDown={(e) => handleKeyDown(e, index, 'observacao', visibleExperts.length)} className="w-full text-xs font-bold px-3 py-1.5 rounded-lg bg-slate-50 border border-transparent focus:border-orange-200 focus:bg-white outline-none" placeholder="Justificativa..." />
                        </td>
                      )}
                      {isAdmin && (
                        <td className="px-3 py-4 bg-orange-50/10">
                          <div className="flex items-center gap-2">
                            <input 
                              id={`input-${index}-managerMessage`} 
                              type="text" 
                              value={tempMessages[name] || ''} 
                              onChange={(e) => setTempMessages(prev => ({ ...prev, [name]: e.target.value }))} 
                              onKeyDown={(e) => handleKeyDown(e, index, 'managerMessage', visibleExperts.length, name)} 
                              className="flex-1 text-xs font-bold px-3 py-1.5 rounded-lg bg-white/50 border border-transparent focus:border-orange-300 outline-none" 
                              placeholder="Falar com expert..." 
                            />
                            <button 
                              onClick={() => handleSendMessage(name)}
                              disabled={!(tempMessages[name]?.trim())}
                              className="bg-orange-600 text-white p-2 rounded-lg hover:bg-orange-700 disabled:bg-slate-200 disabled:text-slate-400 transition-all shadow-sm active:scale-90"
                              title="Enviar Beep"
                            >
                              <Send className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {isAdmin && aiAnalysis && (
          <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl border-l-8 border-orange-600 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none"><BrainCircuit className="w-32 h-32" /></div>
             <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black flex items-center gap-3"><Sparkles className="w-6 h-6 text-orange-500" /> Insight do Consultor IA</h3>
                <button onClick={() => setAiAnalysis(null)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
             </div>
             <div className="prose prose-invert prose-orange max-w-none text-slate-300 leading-relaxed font-medium">
                {aiAnalysis.split('\n').map((line, i) => (
                  <p key={i} className="mb-2">{line}</p>
                ))}
             </div>
          </div>
        )}

        {isAdmin && <PerformanceChart data={data} />}

        {showSqlHelp && (
          <div className="bg-slate-900 text-slate-300 p-8 rounded-[2rem] font-mono text-xs overflow-hidden relative border border-slate-700 shadow-2xl">
             <div className="flex items-center justify-between mb-6 border-b border-slate-700 pb-4">
                <span className="flex items-center gap-3 text-orange-500 font-black text-sm uppercase tracking-widest"><Code className="w-5 h-5" /> Inicialização do Schema</span>
                <button onClick={() => setShowSqlHelp(false)} className="hover:text-white bg-slate-800 p-2 rounded-xl"><X className="w-5 h-5" /></button>
             </div>
             <pre className="overflow-x-auto whitespace-pre-wrap leading-relaxed">{SQL_SETUP_SCRIPT}</pre>
             <button onClick={copySql} className="mt-6 w-full bg-orange-600 hover:bg-orange-500 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-orange-600/20 transition-all">
                <Copy className="w-5 h-5" /> COPIAR SCRIPT DE CONFIGURAÇÃO
             </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes shrinkWidth { from { width: 100%; } to { width: 0%; } }
        .animate-in { animation: fadeIn 0.5s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        ::selection { background-color: #F47321; color: white; }
      `}</style>

      {notification?.visible && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[60] animate-bounce">
          <div className={`px-8 py-4 rounded-[2rem] shadow-2xl flex items-center gap-4 text-white font-black border-b-4 ${notification.type === 'error' ? 'bg-red-600 border-red-800' : notification.type === 'info' ? 'bg-slate-900 border-slate-700' : 'bg-orange-600 border-orange-800'}`}>
             {notification.type === 'success' && <Volume2 className="w-5 h-5 animate-pulse" />}
             <span>{notification.message}</span>
            <button onClick={() => setNotification(null)} className="ml-4 bg-white/20 p-1 rounded-full"><X className="w-4 h-4" /></button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
