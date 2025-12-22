
import React, { useState, useEffect, useCallback } from 'react';
import { ClipboardList, Sparkles, Copy, RefreshCw, AlertTriangle, Calendar, Siren, FileSpreadsheet, Trophy, Award, LogIn, LogOut, User, CheckCircle, X, Send, BellRing, MessageSquareText, Mail, Database, AlertCircle, Terminal, Code } from 'lucide-react';
import { EXPERT_ROSTER, EXPERT_MAP, EXPERT_LIST } from './utils/parser';
import { analyzeProductivity } from './services/geminiService';
import { ManualEntryData, ExpertInfo } from './types';
import { PerformanceChart } from './components/PerformanceChart';
import { supabase, isSupabaseConfigured } from './services/supabaseClient';

const ADMIN_MATRICULA = '301052';

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

  const [selectedDate, setSelectedDate] = useState<string>(getTodayString());
  const [notification, setNotification] = useState<{ message: string; visible: boolean; type?: 'success' | 'info' | 'error' } | null>(null);

  const [data, setData] = useState<ManualEntryData>(() => {
    const sortedRoster = [...EXPERT_ROSTER].sort((a, b) => a.localeCompare(b));
    return sortedRoster.reduce((acc, name) => {
      acc[name] = { tratado: 0, finalizado: 0, observacao: '', isUrgent: false, goal: 0, managerMessage: '' };
      return acc;
    }, {} as ManualEntryData);
  });

  const loadSupabaseData = useCallback(async (date: string) => {
    if (!isSupabaseConfigured) return;

    setIsSyncing(true);
    try {
      const { data: records, error } = await supabase
        .from('productivity_records')
        .select('*')
        .eq('date', date);

      if (error) {
        const errorMsg = error.message || JSON.stringify(error);
        console.error('Erro ao carregar dados:', errorMsg);
        
        // Detecta especificamente erro de tabela ausente
        if (errorMsg.includes('productivity_records') && errorMsg.includes('not found')) {
          setNotification({ 
            message: `Tabela não encontrada! Clique em "Ajustar Banco" no topo.`, 
            visible: true, 
            type: 'error' 
          });
          setShowSqlHelp(true);
        } else {
          setNotification({ 
            message: `Erro Cloud: ${errorMsg}`, 
            visible: true, 
            type: 'error' 
          });
        }
      } else if (records) {
        setData(prev => {
          const newData = { ...prev };
          records.forEach(rec => {
            if (newData[rec.expert_name]) {
              newData[rec.expert_name] = {
                tratado: rec.tratado,
                finalizado: rec.finalizado,
                goal: rec.goal,
                observacao: rec.observacao,
                isUrgent: rec.is_urgent,
                managerMessage: rec.manager_message
              };
            }
          });
          return newData;
        });
      }
    } catch (err: any) {
      console.error('Erro inesperado:', err.message || JSON.stringify(err));
    } finally {
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    loadSupabaseData(selectedDate);

    const channel = supabase
      .channel(`prod-changes-${selectedDate}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'productivity_records', filter: `date=eq.${selectedDate}` },
        (payload) => {
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
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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

    if (error) {
       console.error('Erro ao salvar no Supabase:', error.message || JSON.stringify(error));
       if (error.message?.includes('not found')) setShowSqlHelp(true);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (loginInput === ADMIN_MATRICULA) {
      setIsAdmin(true);
      setIsLoggedIn(true);
      return;
    }
    const expert = EXPERT_LIST.find(e => e.matricula === loginInput);
    if (expert) {
      setCurrentUser(expert);
      setIsAdmin(false);
      setIsLoggedIn(true);
    } else {
      setLoginError('Matrícula inválida.');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setIsAdmin(false);
    setLoginInput('');
    setShowSqlHelp(false);
  };

  const handleInputChange = (expert: string, field: 'tratado' | 'finalizado' | 'observacao' | 'goal' | 'managerMessage', value: string) => {
    const isText = field === 'observacao' || field === 'managerMessage';
    const numValue = isText ? 0 : (value === '' ? 0 : parseInt(value));
    const finalValue = isText ? value : Math.max(0, isNaN(numValue) ? 0 : numValue);

    if (field === 'finalizado') {
      const currentGoal = data[expert].goal || 0;
      if (currentGoal > 0 && data[expert].finalizado < currentGoal && numValue >= currentGoal) {
        playSuccessSound();
        setNotification({ message: `🎉 Meta Batida!`, visible: true, type: 'success' });
      }
    }

    setData(prev => ({ ...prev, [expert]: { ...prev[expert], [field]: finalValue } }));
    saveToSupabase(expert, { [field]: finalValue });
  };

  const toggleUrgency = (expert: string) => {
    const newValue = !data[expert].isUrgent;
    setData(prev => ({ ...prev, [expert]: { ...prev[expert], isUrgent: newValue } }));
    saveToSupabase(expert, { isUrgent: newValue });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number, field: string, listLen: number) => {
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

  const copySql = () => {
    navigator.clipboard.writeText(SQL_SETUP_SCRIPT);
    setNotification({ message: 'Script SQL copiado!', visible: true, type: 'info' });
  };

  const visibleExperts = isAdmin ? Object.keys(data).sort() : (currentUser ? [currentUser.name] : []);
  const expertReceivedMessage = (!isAdmin && currentUser) ? data[currentUser.name]?.managerMessage : null;

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 space-y-6">
          <div className="text-center">
            <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <LogIn className="w-8 h-8 text-indigo-600" />
            </div>
            <h1 className="text-2xl font-black text-gray-900">Acesso ao Painel</h1>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="text" value={loginInput} onChange={(e) => setLoginInput(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none text-center text-xl font-bold" autoFocus />
            {loginError && <p className="text-xs text-red-600 font-bold text-center">{loginError}</p>}
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl">Entrar</button>
          </form>
          {!isSupabaseConfigured && <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2 text-xs text-red-700 font-medium"><AlertCircle className="w-4 h-4 mt-0.5 shrink-0" /> Cloud Desconectada.</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Banner de Erro Crítico (Tabela Faltando) */}
        {showSqlHelp && (
          <div className="bg-red-600 text-white p-4 rounded-2xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 border-2 border-red-400">
             <div className="flex items-center gap-3">
                <AlertTriangle className="w-8 h-8 animate-pulse" />
                <div>
                  <p className="font-black text-lg leading-tight">Configuração Pendente no Banco!</p>
                  <p className="text-xs opacity-90">A tabela 'productivity_records' não foi encontrada no seu Supabase.</p>
                </div>
             </div>
             <button 
               onClick={copySql}
               className="bg-white text-red-600 px-6 py-2 rounded-xl font-black text-sm hover:bg-red-50 flex items-center gap-2 whitespace-nowrap transition-all"
             >
               <Terminal className="w-4 h-4" /> Copiar Script SQL
             </button>
          </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-center bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-600 p-2 rounded-lg"><ClipboardList className="w-6 h-6 text-white" /></div>
            <div>
              <h1 className="text-xl font-black">Painel de Lançamento Cloud</h1>
              <p className="text-xs text-gray-500">Logado como: <strong className="text-indigo-600">{isAdmin ? 'Admin' : currentUser?.name}</strong></p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             {isSyncing && <div className="flex items-center gap-2 text-xs text-indigo-500 font-bold animate-pulse"><Database className="w-4 h-4" /> Sincronizando...</div>}
             <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-1.5 text-sm font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors"><LogOut className="w-4 h-4" /> Sair</button>
          </div>
        </div>

        {expertReceivedMessage && (
          <div className="bg-indigo-600 text-white p-4 rounded-2xl shadow-lg animate-pulse flex items-center gap-4">
             <div className="bg-indigo-400 p-3 rounded-full"><Mail className="w-6 h-6" /></div>
             <div>
                <p className="text-[10px] uppercase font-bold opacity-80">Mensagem do Gestor:</p>
                <p className="text-lg font-black italic">"{expertReceivedMessage}"</p>
             </div>
          </div>
        )}

        <div className="flex items-center justify-between gap-4">
          <div className="bg-white px-3 py-2 rounded-lg shadow-sm border border-gray-200 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="text-sm font-bold text-gray-700 outline-none bg-transparent" />
          </div>
          {showSqlHelp && (
            <div className="flex items-center gap-2 text-[10px] text-red-600 font-black uppercase">
               <AlertTriangle className="w-3 h-3" /> Erro de Schema Detectado
            </div>
          )}
        </div>

        <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 text-xs font-bold text-gray-400 uppercase">
                <tr>
                  <th className="px-3 py-3.5 text-center w-12">Urg</th>
                  <th className="py-3.5 pl-4 pr-3 text-left">Expert</th>
                  {isAdmin && <th className="px-3 py-3.5 text-center bg-indigo-50 text-indigo-700 w-16">Meta</th>}
                  <th className="px-3 py-3.5 text-center bg-yellow-50 text-yellow-700 w-20">Trat</th>
                  <th className="px-3 py-3.5 text-center bg-green-50 text-green-700 w-20">Fin</th>
                  <th className="px-3 py-3.5 text-center bg-gray-100 text-gray-900 w-16">Tot</th>
                  <th className="px-2 py-3.5 text-center bg-blue-50 text-blue-700 w-14">%</th>
                  {isAdmin && <th className="px-3 py-3.5 text-left">Obs</th>}
                  {isAdmin && <th className="px-3 py-3.5 text-left bg-purple-50 text-purple-700">Feed</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {visibleExperts.map((name, index) => {
                  const entry = data[name];
                  const metGoal = entry.goal > 0 && entry.finalizado >= entry.goal;
                  const total = entry.tratado + entry.finalizado;
                  const eff = getEfficiency(name);
                  return (
                    <tr key={name} className={`${entry.isUrgent ? 'bg-red-50' : (metGoal && isAdmin) ? 'bg-green-50/30' : ''}`}>
                      <td className="px-3 py-2 text-center">
                        <input type="checkbox" className="w-4 h-4 rounded cursor-pointer accent-red-600" checked={entry.isUrgent} onChange={() => toggleUrgency(name)} />
                      </td>
                      <td className="px-4 py-2 text-sm font-bold text-slate-800">{name}</td>
                      {isAdmin && (
                        <td className="px-1 py-2 bg-indigo-50/20">
                          <input id={`input-${index}-goal`} type="number" value={entry.goal || ''} onChange={(e) => handleInputChange(name, 'goal', e.target.value)} onKeyDown={(e) => handleKeyDown(e, index, 'goal', visibleExperts.length)} className="w-full text-center text-sm font-bold text-indigo-700 bg-transparent border-none focus:ring-0" placeholder="-" />
                        </td>
                      )}
                      <td className="px-1 py-2 bg-yellow-50/20">
                        <input id={`input-${index}-tratado`} type="number" value={entry.tratado || ''} onChange={(e) => handleInputChange(name, 'tratado', e.target.value)} onKeyDown={(e) => handleKeyDown(e, index, 'tratado', visibleExperts.length)} className="w-full text-center text-sm font-bold text-yellow-700 bg-transparent border-none focus:ring-0" placeholder="0" />
                      </td>
                      <td className={`px-1 py-2 ${metGoal && isAdmin ? 'bg-green-100' : 'bg-green-50/20'}`}>
                        <input id={`input-${index}-finalizado`} type="number" value={entry.finalizado || ''} onChange={(e) => handleInputChange(name, 'finalizado', e.target.value)} onKeyDown={(e) => handleKeyDown(e, index, 'finalizado', visibleExperts.length)} className={`w-full text-center text-sm font-black border-none focus:ring-0 ${metGoal && isAdmin ? 'text-green-800' : 'text-green-700'}`} placeholder="0" />
                      </td>
                      <td className="px-1 py-2 text-center text-sm font-black text-gray-600 bg-gray-50">{total}</td>
                      <td className={`px-1 py-2 text-center text-[10px] font-black ${eff >= 80 ? 'text-green-600' : 'text-blue-500'}`}>{total > 0 ? `${eff}%` : '-'}</td>
                      {isAdmin && (
                        <td className="px-2 py-2">
                          <input id={`input-${index}-observacao`} type="text" value={entry.observacao} onChange={(e) => handleInputChange(name, 'observacao', e.target.value)} onKeyDown={(e) => handleKeyDown(e, index, 'observacao', visibleExperts.length)} className="w-full text-xs px-2 py-1 bg-transparent border-none focus:ring-0 border-b border-transparent focus:border-indigo-300" placeholder="..." />
                        </td>
                      )}
                      {isAdmin && (
                        <td className="px-2 py-2 bg-purple-50/10">
                          <input id={`input-${index}-managerMessage`} type="text" value={entry.managerMessage || ''} onChange={(e) => handleInputChange(name, 'managerMessage', e.target.value)} onKeyDown={(e) => handleKeyDown(e, index, 'managerMessage', visibleExperts.length)} className="w-full text-xs px-2 py-1 bg-transparent border-none focus:ring-0 border-b border-transparent focus:border-purple-300" placeholder="Feedback..." />
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {isAdmin && <PerformanceChart data={data} />}

        {/* Instruções de SQL Expandidas (Apenas se houver erro) */}
        {showSqlHelp && (
          <div className="bg-slate-900 text-slate-300 p-6 rounded-2xl font-mono text-xs overflow-hidden relative border border-slate-700 shadow-2xl">
             <div className="flex items-center justify-between mb-4 border-b border-slate-700 pb-2">
                <span className="flex items-center gap-2 text-indigo-400 font-bold"><Code className="w-4 h-4" /> RESOLVER ERRO DE TABELA</span>
                <button onClick={() => setShowSqlHelp(false)} className="hover:text-white"><X className="w-4 h-4" /></button>
             </div>
             <p className="mb-4 text-slate-400 italic">// Copie este script, abra o painel do Supabase, vá em "SQL Editor" e execute para criar a tabela necessária.</p>
             <pre className="overflow-x-auto whitespace-pre-wrap">{SQL_SETUP_SCRIPT}</pre>
             <button onClick={copySql} className="mt-4 w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-2 rounded-lg flex items-center justify-center gap-2">
                <Copy className="w-4 h-4" /> COPIAR SCRIPT COMPLETO
             </button>
          </div>
        )}
      </div>

      {notification?.visible && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[60] animate-bounce">
          <div className={`px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 text-white ${
            notification.type === 'error' ? 'bg-red-600 shadow-red-500/50' : 
            notification.type === 'info' ? 'bg-blue-600 shadow-blue-500/50' : 
            'bg-indigo-600 shadow-indigo-500/50'
          }`}>
            <span className="font-black">{notification.message}</span>
            <button onClick={() => setNotification(null)} className="ml-4 hover:opacity-70"><X className="w-5 h-5" /></button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
