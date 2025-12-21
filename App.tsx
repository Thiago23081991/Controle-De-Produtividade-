import React, { useState, useEffect } from 'react';
import { ClipboardList, Sparkles, Copy, RefreshCw, AlertTriangle, Calendar, Siren, FileSpreadsheet, Trophy, Award, LogIn, LogOut, User, CheckCircle, X, Send, BellRing, MessageSquareText, Mail } from 'lucide-react';
import { EXPERT_ROSTER, EXPERT_MAP, EXPERT_LIST } from './utils/parser';
import { analyzeProductivity } from './services/geminiService';
import { ManualEntryData, ExpertInfo } from './types';
import { PerformanceChart } from './components/PerformanceChart';

const ADMIN_MATRICULA = '301052';

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

const playBipSound = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    // BIP curto e agudo
    osc.type = 'square';
    osc.frequency.setValueAtTime(1200, ctx.currentTime);
    gainNode.gain.setValueAtTime(0.05, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  } catch (e) {}
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<ExpertInfo | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loginInput, setLoginInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [adminMessage, setAdminMessage] = useState('');

  const [selectedDate, setSelectedDate] = useState<string>(getTodayString());
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [notification, setNotification] = useState<{ message: string; visible: boolean; type?: 'success' | 'info' } | null>(null);

  const [data, setData] = useState<ManualEntryData>(() => {
    const today = getTodayString();
    const storageKey = `productivity_${today}`;
    const stored = localStorage.getItem(storageKey);
    const sortedRoster = [...EXPERT_ROSTER].sort((a, b) => a.localeCompare(b));
    const emptyData = sortedRoster.reduce((acc, name) => {
      acc[name] = { tratado: 0, finalizado: 0, observacao: '', isUrgent: false, goal: 0, managerMessage: '' };
      return acc;
    }, {} as ManualEntryData);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return { ...emptyData, ...parsed };
      } catch (e) {
        return emptyData;
      }
    }
    return emptyData;
  });

  useEffect(() => {
    const storageKey = `productivity_${selectedDate}`;
    localStorage.setItem(storageKey, JSON.stringify(data));
  }, [data, selectedDate]);

  useEffect(() => {
    if (notification?.visible) {
      const timer = setTimeout(() => {
        setNotification(prev => prev ? { ...prev, visible: false } : null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

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
      setLoginError('Matrícula inválida ou não cadastrada.');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setIsAdmin(false);
    setLoginInput('');
  };

  const handleSendMessage = () => {
    if (!adminMessage.trim()) return;
    
    playBipSound();
    setNotification({ 
      message: 'Comunicado enviado com sucesso para toda a equipe!', 
      visible: true,
      type: 'info'
    });
    setAdminMessage('');
  };

  const handleSendIndividualMessage = (expert: string) => {
    const msg = data[expert]?.managerMessage;
    if (!msg?.trim()) return;

    playBipSound();
    setNotification({
      message: `Mensagem individual enviada para ${expert.split(' ')[0]}!`,
      visible: true,
      type: 'info'
    });
  };

  const handleInputChange = (expert: string, field: 'tratado' | 'finalizado' | 'observacao' | 'goal' | 'managerMessage', value: string) => {
    if (field === 'observacao' || field === 'managerMessage') {
      setData(prev => ({ ...prev, [expert]: { ...prev[expert], [field]: value } }));
      return;
    }
    const numValue = value === '' ? 0 : parseInt(value);
    if (isNaN(numValue)) return;
    if (field === 'finalizado') {
      const currentGoal = data[expert].goal || 0;
      const previousFinalizado = data[expert].finalizado || 0;
      if (currentGoal > 0 && previousFinalizado < currentGoal && numValue >= currentGoal) {
        playSuccessSound();
        setNotification({ 
          message: `🎉 Parabéns! Você atingiu sua meta de ${currentGoal} casos!`, 
          visible: true,
          type: 'success'
        });
      }
    }
    setData(prev => ({ ...prev, [expert]: { ...prev[expert], [field]: Math.max(0, numValue) } }));
  };

  const toggleUrgency = (expert: string) => {
    setData(prev => ({ ...prev, [expert]: { ...prev[expert], isUrgent: !prev[expert].isUrgent } }));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number, field: string, listLen: number) => {
    const focusInput = (idx: number, f: string) => {
      const el = document.getElementById(`input-${idx}-${f}`);
      if (el) (el as HTMLInputElement).focus();
    };

    const allFields = ['goal', 'tratado', 'finalizado', 'observacao', 'managerMessage'];
    const visibleFields = allFields.filter(f => {
      if (!isAdmin && (f === 'goal' || f === 'observacao' || f === 'managerMessage')) return false;
      return true;
    });

    const currentFieldIndex = visibleFields.indexOf(field);

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const nextField = visibleFields[currentFieldIndex + 1];
      if (nextField) focusInput(index, nextField);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prevField = visibleFields[currentFieldIndex - 1];
      if (prevField) focusInput(index, prevField);
    } else if (e.key === 'ArrowDown' && index + 1 < listLen) {
      e.preventDefault();
      focusInput(index + 1, field);
    } else if (e.key === 'ArrowUp' && index - 1 >= 0) {
      e.preventDefault();
      focusInput(index - 1, field);
    }
  };

  const getEfficiency = (expert: string) => {
    const total = (data[expert]?.tratado || 0) + (data[expert]?.finalizado || 0);
    return total === 0 ? 0 : Math.round(((data[expert]?.finalizado || 0) / total) * 100);
  };

  const handleReset = () => {
    if (window.confirm("Zerar a produção global? As metas e mensagens serão mantidas.")) {
      setData(prev => {
        const newData = { ...prev };
        Object.keys(newData).forEach(key => {
          newData[key] = { ...newData[key], tratado: 0, finalizado: 0, observacao: '', isUrgent: false };
        });
        return newData;
      });
      setAiAnalysis(null);
    }
  };

  const handleExportCSV = () => {
    const [y, m, d] = selectedDate.split('-');
    const dateFmt = `${d}-${m}-${y}`;
    let csv = "data:text/csv;charset=utf-8,\uFEFFData,Matrícula,Expert,Tratado,Finalizado,Meta,Eficiência,Observação,Mensagem Gestor\n";
    Object.keys(data).sort().forEach(exp => {
      const info = EXPERT_MAP[exp];
      const { tratado, finalizado, goal, observacao, managerMessage } = data[exp];
      csv += `${dateFmt},"${info?.matricula}","${exp}",${tratado},${finalizado},${goal},${getEfficiency(exp)}%,"${observacao}","${managerMessage}"\n`;
    });
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csv));
    link.setAttribute("download", `produtividade_${dateFmt}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAiAnalysis = async () => {
    setIsAnalyzing(true);
    setAiAnalysis(null);
    try {
      const analysis = await analyzeProductivity(data);
      setAiAnalysis(analysis);
    } catch (e) {
      setAiAnalysis("❌ Erro ao gerar análise.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const visibleExperts = isAdmin ? Object.keys(data).sort() : (currentUser ? [currentUser.name] : []);
  
  const grandTotals = isAdmin ? Object.values(data).reduce<{ tratado: number; finalizado: number; total: number }>(
    (acc, curr: any) => ({
      tratado: acc.tratado + (curr.tratado || 0),
      finalizado: acc.finalizado + (curr.finalizado || 0),
      total: acc.total + (curr.tratado || 0) + (curr.finalizado || 0)
    }),
    { tratado: 0, finalizado: 0, total: 0 }
  ) : null;

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
            <p className="text-sm text-gray-500">Digite sua matrícula para entrar</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="text" 
              value={loginInput}
              onChange={(e) => setLoginInput(e.target.value)}
              placeholder=""
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none text-center text-xl font-bold tracking-widest"
              autoFocus
            />
            {loginError && <p className="text-xs text-red-600 font-bold text-center">{loginError}</p>}
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg transition-all">OK</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 sm:px-6 lg:px-8 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-600 p-2 rounded-lg"><ClipboardList className="w-6 h-6 text-white" /></div>
            <div>
              <h1 className="text-xl font-black">Painel de Lançamento</h1>
              <p className="text-xs text-gray-500">Olá, <strong className="text-indigo-600">{isAdmin ? 'Admin' : currentUser?.name}</strong> {!isAdmin && `(#${currentUser?.matricula})`}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-1.5 text-sm font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors"><LogOut className="w-4 h-4" /> Sair</button>
        </div>

        {/* Notificação Especial p/ o Expert */}
        {expertReceivedMessage && (
          <div className="bg-indigo-600 text-white p-4 rounded-2xl shadow-lg animate-pulse flex items-center gap-4 border-l-8 border-indigo-400">
             <div className="bg-indigo-400 p-3 rounded-full"><Mail className="w-6 h-6" /></div>
             <div>
                <p className="text-[10px] uppercase font-bold tracking-widest opacity-80">Mensagem do Gestor:</p>
                <p className="text-lg font-black italic">"{expertReceivedMessage}"</p>
             </div>
          </div>
        )}

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="bg-white px-3 py-2 rounded-lg shadow-sm border border-gray-200 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="text-sm font-bold text-gray-700 outline-none bg-transparent" />
          </div>
          {isAdmin && (
            <div className="flex gap-2">
              <button onClick={handleReset} className="px-3 py-2 text-xs font-bold bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 flex items-center gap-1"><RefreshCw className="w-3.5 h-3.5" /> Zerar Produção</button>
              <button onClick={handleExportCSV} className="px-3 py-2 text-xs font-bold bg-white border border-green-200 text-green-700 rounded-lg hover:bg-green-50 flex items-center gap-1"><FileSpreadsheet className="w-3.5 h-3.5" /> Exportar CSV</button>
              <button onClick={() => navigator.clipboard.writeText(JSON.stringify(data))} className="px-3 py-2 text-xs font-bold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-1"><Copy className="w-3.5 h-3.5" /> Copiar Dados</button>
            </div>
          )}
        </div>

        {/* Admin Broadcast Area */}
        {isAdmin && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-indigo-100">
            <h3 className="text-sm font-black text-indigo-900 mb-4 flex items-center gap-2 uppercase tracking-widest">
              <BellRing className="w-4 h-4 text-indigo-600" /> Comunicado Geral à Equipe
            </h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <textarea 
                value={adminMessage}
                onChange={(e) => setAdminMessage(e.target.value)}
                placeholder="Digite um aviso para aparecer para TODOS os usuários..."
                className="flex-1 p-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none h-20 bg-gray-50"
              />
              <button 
                onClick={handleSendMessage}
                disabled={!adminMessage.trim()}
                className="sm:w-32 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-100"
              >
                <Send className="w-4 h-4" /> Enviar Geral
              </button>
            </div>
          </div>
        )}

        {/* Main Productivity Table */}
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-3.5 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest w-12">Urg..</th>
                  <th className="px-4 py-3.5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest w-24">Matrícula</th>
                  <th className="py-3.5 pl-2 pr-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">Expert</th>
                  {isAdmin && (
                    <th className="px-3 py-3.5 text-center text-xs font-bold text-indigo-700 bg-indigo-50 uppercase tracking-wider w-16">Meta</th>
                  )}
                  <th className="px-3 py-3.5 text-center text-xs font-bold text-yellow-700 bg-yellow-50 uppercase tracking-wider w-20">Tratado</th>
                  <th className="px-3 py-3.5 text-center text-xs font-bold text-green-700 bg-green-50 uppercase tracking-wider w-20">Finalizado</th>
                  <th className="px-3 py-3.5 text-center text-xs font-bold text-gray-900 bg-gray-100 uppercase tracking-wider w-16">Total</th>
                  <th className="px-2 py-3.5 text-center text-[10px] font-bold text-blue-700 bg-blue-50 uppercase tracking-widest w-14">%</th>
                  {isAdmin && (
                    <th className="px-3 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider min-w-[150px]">Observação Expert</th>
                  )}
                  {isAdmin && (
                    <th className="px-3 py-3.5 text-left text-xs font-bold text-purple-700 bg-purple-50 uppercase tracking-wider min-w-[200px]">Mensagem p/ Expert (Feedback)</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {visibleExperts.map((name, index) => {
                  const info = EXPERT_MAP[name];
                  const entry = data[name];
                  const metGoal = entry.goal > 0 && entry.finalizado >= entry.goal;
                  const total = entry.tratado + entry.finalizado;
                  const eff = getEfficiency(name);
                  return (
                    <tr key={name} className={`${entry.isUrgent ? 'bg-red-50' : (metGoal && isAdmin) ? 'bg-green-50/30' : ''}`}>
                      <td className="px-3 py-2 text-center">
                        <input type="checkbox" checked={entry.isUrgent} onChange={() => toggleUrgency(name)} className="w-4 h-4 text-red-600 rounded cursor-pointer" />
                      </td>
                      <td className="px-4 py-2 text-xs font-mono text-gray-400">{info?.matricula || '-'}</td>
                      <td className="px-2 py-2 text-sm font-bold">
                        <div className="flex items-center gap-1.5">
                          {name}
                          {metGoal && isAdmin && <Award className="w-3.5 h-3.5 text-green-500 animate-pulse" />}
                          {entry.isUrgent && <Siren className="w-3.5 h-3.5 text-red-500" />}
                        </div>
                      </td>
                      {isAdmin && (
                        <td className="px-1 py-2 bg-indigo-50/20">
                          <input id={`input-${index}-goal`} type="number" value={entry.goal || ''} onChange={(e) => handleInputChange(name, 'goal', e.target.value)} onKeyDown={(e) => handleKeyDown(e, index, 'goal', visibleExperts.length)} className="w-full text-center text-sm font-bold text-indigo-700 bg-transparent outline-none" placeholder="-" />
                        </td>
                      )}
                      <td className="px-1 py-2 bg-yellow-50/20">
                        <input id={`input-${index}-tratado`} type="number" value={entry.tratado || ''} onChange={(e) => handleInputChange(name, 'tratado', e.target.value)} onKeyDown={(e) => handleKeyDown(e, index, 'tratado', visibleExperts.length)} className="w-full text-center text-sm font-bold text-yellow-700 bg-transparent outline-none" placeholder="0" />
                      </td>
                      <td className={`px-1 py-2 ${metGoal && isAdmin ? 'bg-green-100' : 'bg-green-50/20'}`}>
                        <input id={`input-${index}-finalizado`} type="number" value={entry.finalizado || ''} onChange={(e) => handleInputChange(name, 'finalizado', e.target.value)} onKeyDown={(e) => handleKeyDown(e, index, 'finalizado', visibleExperts.length)} className={`w-full text-center text-sm font-black outline-none ${metGoal && isAdmin ? 'text-green-800' : 'text-green-700'}`} placeholder="0" />
                      </td>
                      <td className="px-1 py-2 text-center text-sm font-black text-gray-600 bg-gray-50">{total}</td>
                      <td className={`px-1 py-2 text-center text-[10px] font-black ${eff >= 80 ? 'text-green-600' : eff < 50 ? 'text-red-500' : 'text-blue-500'}`}>{total > 0 ? `${eff}%` : '-'}</td>
                      {isAdmin && (
                        <td className="px-2 py-2">
                          <input id={`input-${index}-observacao`} type="text" value={entry.observacao} onChange={(e) => handleInputChange(name, 'observacao', e.target.value)} onKeyDown={(e) => handleKeyDown(e, index, 'observacao', visibleExperts.length)} className="w-full text-xs px-2 py-1 border-b border-gray-100 focus:border-indigo-400 outline-none transition-all bg-transparent" placeholder="Observação..." />
                        </td>
                      )}
                      {isAdmin && (
                        <td className="px-2 py-2 bg-purple-50/10">
                           <div className="flex items-center gap-1.5">
                            <input 
                              id={`input-${index}-managerMessage`} 
                              type="text" 
                              value={entry.managerMessage || ''} 
                              onChange={(e) => handleInputChange(name, 'managerMessage', e.target.value)} 
                              onKeyDown={(e) => handleKeyDown(e, index, 'managerMessage', visibleExperts.length)}
                              className="w-full text-xs px-2 py-1 border-b border-purple-200 focus:border-purple-600 outline-none transition-all bg-transparent font-medium" 
                              placeholder="Feedback privado..." 
                            />
                            <button 
                              onClick={() => handleSendIndividualMessage(name)}
                              disabled={!entry.managerMessage?.trim()}
                              className="p-1.5 text-purple-600 hover:bg-purple-100 rounded-lg disabled:opacity-30 transition-colors"
                              title="Enviar BIP p/ este expert"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </button>
                           </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
              {isAdmin && grandTotals && (
                <tfoot className="bg-gray-100 font-black text-gray-900 border-t-2 border-gray-200">
                  <tr>
                    <td colSpan={3} className="px-4 py-3">TOTAIS DA EQUIPE</td>
                    <td className="text-center text-indigo-700">-</td>
                    <td className="text-center text-yellow-700">{grandTotals.tratado}</td>
                    <td className="text-center text-green-700">{grandTotals.finalizado}</td>
                    <td className="text-center text-gray-800">{grandTotals.total}</td>
                    <td className="text-center text-blue-700">{grandTotals.total > 0 ? `${Math.round((grandTotals.finalizado/grandTotals.total)*100)}%` : '-'}</td>
                    <td colSpan={2}></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>

        {/* Performance Chart Section */}
        {isAdmin && (
          <div className="space-y-6">
            <PerformanceChart data={data} />
            
            {/* AI Analysis Section */}
            <div className={`shadow-md rounded-2xl p-6 border ${aiAnalysis?.startsWith('❌') ? 'bg-red-50 border-red-200' : 'bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-100'}`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-black flex items-center gap-2 text-indigo-900"><Sparkles className="w-5 h-5 text-purple-600" /> Insights da Gestão (IA)</h3>
                <button 
                  onClick={handleAiAnalysis} 
                  disabled={isAnalyzing} 
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition disabled:opacity-50 shadow-md"
                >
                  {isAnalyzing ? 'Analisando dados...' : 'Gerar Análise Completa'}
                </button>
              </div>
              {aiAnalysis && (
                <div className="p-4 rounded-xl border bg-white/80 border-indigo-100 text-sm text-gray-700 prose prose-indigo max-w-none shadow-inner" dangerouslySetInnerHTML={{ __html: aiAnalysis.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Floating Notifications */}
      {notification && notification.visible && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[60] animate-bounce">
          <div className={`text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 ${notification.type === 'info' ? 'bg-indigo-600 border-2 border-indigo-300' : 'bg-green-600 border-2 border-green-300'}`}>
            {notification.type === 'info' ? <BellRing className="w-8 h-8 text-indigo-200" /> : <Trophy className="w-8 h-8 text-yellow-200" />}
            <div className="flex flex-col">
              <span className="font-black text-lg">{notification.type === 'info' ? 'Mensagem Enviada!' : 'Meta Atingida!'}</span>
              <span className="text-sm opacity-95">{notification.message}</span>
            </div>
            <button onClick={() => setNotification(null)} className="ml-4 hover:opacity-70 p-1"><X className="w-5 h-5" /></button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;