import React, { useState, useEffect } from 'react';
import { ClipboardList, Sparkles, Copy, RefreshCw, AlertTriangle, Keyboard, Calendar, Siren, FileSpreadsheet, Trophy, Target, CheckCircle, X, Award } from 'lucide-react';
import { EXPERT_ROSTER } from './utils/parser';
import { analyzeProductivity } from './services/geminiService';
import { ManualEntryData } from './types';
import { PerformanceChart } from './components/PerformanceChart';

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
  } catch (e) {
    console.error("Audio playback failed", e);
  }
};

function App() {
  const [selectedDate, setSelectedDate] = useState<string>(getTodayString());
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [notification, setNotification] = useState<{ message: string; visible: boolean } | null>(null);

  const [data, setData] = useState<ManualEntryData>(() => {
    const today = getTodayString();
    const storageKey = `productivity_${today}`;
    const stored = localStorage.getItem(storageKey);
    
    const sortedRoster = [...EXPERT_ROSTER].sort((a, b) => a.localeCompare(b));
    const emptyData = sortedRoster.reduce((acc, name) => {
      acc[name] = { tratado: 0, finalizado: 0, observacao: '', isUrgent: false, goal: 0 };
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

  const handleDateChange = (newDate: string) => {
    if (!newDate) return;
    setSelectedDate(newDate);
    const storageKey = `productivity_${newDate}`;
    const stored = localStorage.getItem(storageKey);
    const sortedRoster = [...EXPERT_ROSTER].sort((a, b) => a.localeCompare(b));
    const emptyData = sortedRoster.reduce((acc, name) => {
      acc[name] = { tratado: 0, finalizado: 0, observacao: '', isUrgent: false, goal: 0 };
      return acc;
    }, {} as ManualEntryData);

    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const mergedData = { ...emptyData };
        Object.keys(parsed).forEach(key => {
            if (mergedData[key]) {
                mergedData[key] = { ...mergedData[key], ...parsed[key] };
            }
        });
        setData(mergedData);
      } catch (e) {
        setData(emptyData);
      }
    } else {
      setData(emptyData);
    }
    setAiAnalysis(null);
  };

  const handleInputChange = (expert: string, field: 'tratado' | 'finalizado' | 'observacao' | 'goal', value: string) => {
    if (field === 'observacao') {
      setData(prev => ({ ...prev, [expert]: { ...prev[expert], observacao: value } }));
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
                message: `🎉 Parabéns! ${expert} bateu a meta de ${currentGoal} casos!`,
                visible: true
            });
        }
    }
    setData(prev => ({ ...prev, [expert]: { ...prev[expert], [field]: Math.max(0, numValue) } }));
  };

  const toggleUrgency = (expert: string) => {
    setData(prev => ({ ...prev, [expert]: { ...prev[expert], isUrgent: !prev[expert].isUrgent } }));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number, field: 'tratado' | 'finalizado' | 'observacao' | 'goal', expertListLength: number) => {
    const focusInput = (idx: number, f: 'tratado' | 'finalizado' | 'observacao' | 'goal') => {
      const el = document.getElementById(`input-${idx}-${f}`);
      if (el) (el as HTMLInputElement).focus();
    };

    if (e.key === 'ArrowRight') {
      if (field === 'goal') { e.preventDefault(); focusInput(index, 'tratado'); }
      else if (field === 'tratado') { e.preventDefault(); focusInput(index, 'finalizado'); }
      else if (field === 'finalizado') { e.preventDefault(); focusInput(index, 'observacao'); }
    } else if (e.key === 'ArrowLeft') {
      if (field === 'finalizado') { e.preventDefault(); focusInput(index, 'tratado'); }
      else if (field === 'tratado') { e.preventDefault(); focusInput(index, 'goal'); }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (index + 1 < expertListLength) focusInput(index + 1, field);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (index - 1 >= 0) focusInput(index - 1, field);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (field === 'goal') focusInput(index, 'tratado');
      else if (field === 'tratado') focusInput(index, 'finalizado');
      else if (field === 'finalizado') focusInput(index, 'observacao');
      else if (index + 1 < expertListLength) focusInput(index + 1, 'goal');
    }
  };

  const calculateTotal = (expert: string) => (data[expert]?.tratado || 0) + (data[expert]?.finalizado || 0);
  const getEfficiency = (expert: string) => {
    const total = calculateTotal(expert);
    if (total === 0) return 0;
    return Math.round(((data[expert]?.finalizado || 0) / total) * 100);
  };

  const getGrandTotals = () => {
    let tratado = 0, finalizado = 0, urgentes = 0;
    Object.values(data).forEach((entry: any) => {
      tratado += entry.tratado || 0;
      finalizado += entry.finalizado || 0;
      if (entry.isUrgent) urgentes++;
    });
    return { tratado, finalizado, total: tratado + finalizado, urgentes };
  };

  const maxFinalized = React.useMemo(() => Math.max(...Object.values(data).map((d: any) => d.finalizado || 0)), [data]);

  const generateMarkdown = () => {
    const [y, m, d] = selectedDate.split('-');
    const dateFormatted = `${d}/${m}/${y}`;
    let md = `## Relatório de Produtividade - ${dateFormatted}\n\n`;
    md += `| Expert | Meta | Tratado | Finalizado | Total | Eficiência | Observação |\n`;
    md += `| :--- | :---: | :---: | :---: | :---: | :---: | :--- |\n`;
    const sortedExperts = Object.keys(data).sort((a, b) => a.localeCompare(b));
    sortedExperts.forEach(expert => {
      const { tratado, finalizado, observacao, isUrgent, goal } = data[expert];
      const total = tratado + finalizado;
      const efficiency = total > 0 ? Math.round((finalizado / total) * 100) : 0;
      const metGoal = (goal || 0) > 0 && finalizado >= (goal || 0);
      let nameDisplay = expert;
      if (isUrgent) nameDisplay += " 🚨";
      if (maxFinalized > 0 && finalizado === maxFinalized) nameDisplay += " 🏆";
      if (metGoal) nameDisplay += " 🎯";
      const obsDisplay = isUrgent ? `**[URGÊNCIA]** ${observacao}` : observacao;
      md += `| ${nameDisplay} | ${goal || '-'} | ${tratado} | ${finalizado} | ${total} | ${efficiency}% | ${obsDisplay} |\n`;
    });
    const grand = getGrandTotals();
    md += `| **TOTAL GERAL** | - | **${grand.tratado}** | **${grand.finalizado}** | **${grand.total}** | **${grand.total > 0 ? Math.round((grand.finalizado/grand.total)*100) : 0}%** | **${grand.urgentes} Casos Urgentes** |`;
    return md;
  };

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(generateMarkdown());
    alert('Relatório copiado para a área de transferência!');
  };

  const handleExportCSV = () => {
    const [y, m, d] = selectedDate.split('-');
    const dateFormatted = `${d}-${m}-${y}`;
    let csvContent = "data:text/csv;charset=utf-8,\uFEFFData,Expert,Urgente,Meta,Tratado,Finalizado,Total,Eficiência (%),Observação\n";
    Object.keys(data).sort().forEach(expert => {
      const { tratado, finalizado, observacao, isUrgent, goal } = data[expert];
      csvContent += `${dateFormatted},"${expert}",${isUrgent?"SIM":"NAO"},${goal||0},${tratado},${finalizado},${tratado+finalizado},${getEfficiency(expert)}%,"${observacao}"\n`;
    });
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `produtividade_${dateFormatted}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = (e: React.MouseEvent) => {
    e.preventDefault();
    if (window.confirm("Zerar a produção de hoje? (As Metas serão mantidas)")) {
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

  const handleAiAnalysis = async () => {
    setIsAnalyzing(true);
    setAiAnalysis(null);
    try {
      const analysis = await analyzeProductivity(data);
      setAiAnalysis(analysis);
    } catch (e) {
      setAiAnalysis("❌ **Erro Inesperado**.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const grandTotals = getGrandTotals();
  const experts = Object.keys(data).sort((a, b) => a.localeCompare(b));

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 sm:px-6 lg:px-8 font-sans relative">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-indigo-700 flex justify-center items-center gap-3">
            <ClipboardList className="w-10 h-10" />
            Controle de Produtividade
          </h1>
          <p className="mt-2 text-gray-600">Gestão de produção e metas da equipe de Service Desk.</p>
        </div>

        <div className="flex flex-col xl:flex-row justify-between items-center gap-4 sticky top-4 z-10 bg-gray-100/90 py-3 backdrop-blur-sm border-b border-gray-200/50">
           <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-sm border border-gray-300">
              <Calendar className="w-5 h-5 text-indigo-600" />
              <input type="date" value={selectedDate} onChange={(e) => handleDateChange(e.target.value)} className="text-gray-700 text-sm font-medium focus:outline-none" />
           </div>
           <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-center sm:justify-end">
             <button onClick={handleReset} className="flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium text-red-600 bg-white border border-red-200 rounded-md hover:bg-red-50 shadow-sm transition-colors cursor-pointer"><RefreshCw className="w-4 h-4" />Zerar</button>
             <button onClick={handleExportCSV} className="flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium text-green-700 bg-white border border-green-200 rounded-md hover:bg-green-50 shadow-sm transition-colors cursor-pointer"><FileSpreadsheet className="w-4 h-4" />Exportar CSV</button>
             <button onClick={handleCopyMarkdown} className="flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 shadow-sm transition-colors cursor-pointer"><Copy className="w-4 h-4" />Copiar Relatório</button>
           </div>
        </div>

        <div className="bg-white shadow-xl rounded-xl overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-3.5 text-center text-xs font-bold text-gray-500 uppercase tracking-wider w-12">Urg.</th>
                  <th className="py-3.5 pl-2 pr-3 text-left text-sm font-bold text-gray-900 uppercase tracking-wider min-w-[200px]">Expert</th>
                  <th className="px-3 py-3.5 text-center text-sm font-bold text-indigo-700 bg-indigo-50 uppercase tracking-wider w-20">Meta</th>
                  <th className="px-3 py-3.5 text-center text-sm font-bold text-yellow-700 bg-yellow-50 uppercase tracking-wider w-24">Tratado</th>
                  <th className="px-3 py-3.5 text-center text-sm font-bold text-green-700 bg-green-50 uppercase tracking-wider w-24">Finalizado</th>
                  <th className="px-3 py-3.5 text-center text-sm font-bold text-gray-900 bg-gray-100 uppercase tracking-wider w-20">Total</th>
                  <th className="px-2 py-3.5 text-center text-xs font-bold text-blue-700 bg-blue-50 uppercase tracking-wider w-16">% Efic.</th>
                  <th className="px-3 py-3.5 text-left text-sm font-bold text-gray-600 bg-gray-50 uppercase tracking-wider min-w-[200px]">Observação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {experts.map((expert, index) => {
                  const isUrgent = data[expert].isUrgent || false;
                  const finalizado = data[expert].finalizado || 0;
                  const goal = data[expert].goal || 0;
                  const metGoal = goal > 0 && finalizado >= goal;
                  const isTopPerformer = maxFinalized > 0 && finalizado === maxFinalized;
                  const efficiency = getEfficiency(expert);
                  const total = calculateTotal(expert);

                  return (
                    <tr key={expert} className={`transition-all duration-300 ${isUrgent ? 'bg-red-50' : metGoal ? 'bg-green-50/40' : 'hover:bg-gray-50'} ${metGoal ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-transparent'}`}>
                      <td className="px-3 py-2 text-center">
                        <input type="checkbox" checked={isUrgent} onChange={() => toggleUrgency(expert)} className="w-5 h-5 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 cursor-pointer" />
                      </td>
                      <td className="whitespace-nowrap py-3 pl-2 pr-3 text-sm font-medium text-gray-900">
                        <div className="flex items-center gap-2">
                            <span className={metGoal ? 'text-green-800 font-bold' : ''}>{expert}</span>
                            {isUrgent && <Siren className="w-4 h-4 text-red-600 animate-pulse" />}
                            {isTopPerformer && <Trophy className="w-4 h-4 text-yellow-500 animate-bounce" />}
                            {metGoal && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700 border border-green-200 animate-pulse">
                                <Award className="w-3 h-3" />
                                META OK
                              </span>
                            )}
                        </div>
                      </td>
                      <td className={`whitespace-nowrap px-3 py-2 text-center ${metGoal ? 'bg-green-100/50' : 'bg-indigo-50/20'}`}>
                        <input id={`input-${index}-goal`} type="number" min="0" value={data[expert].goal === 0 ? '' : data[expert].goal} onChange={(e) => handleInputChange(expert, 'goal', e.target.value)} onKeyDown={(e) => handleKeyDown(e, index, 'goal', experts.length)} className={`block w-full text-center rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 sm:text-sm py-1.5 ${metGoal ? 'border-green-400 font-bold text-green-700 bg-white' : 'border-dashed text-gray-400'}`} placeholder="-" />
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-center bg-yellow-50/30">
                        <input id={`input-${index}-tratado`} type="number" min="0" value={data[expert].tratado === 0 ? '' : data[expert].tratado} onChange={(e) => handleInputChange(expert, 'tratado', e.target.value)} onKeyDown={(e) => handleKeyDown(e, index, 'tratado', experts.length)} className="block w-full text-center rounded-md border-gray-300 shadow-sm focus:ring-yellow-500 sm:text-sm py-1.5" placeholder="0" />
                      </td>
                      <td className={`whitespace-nowrap px-3 py-2 text-center ${metGoal ? 'bg-green-100' : isTopPerformer ? 'bg-yellow-100' : 'bg-green-50/30'}`}>
                        <input id={`input-${index}-finalizado`} type="number" min="0" value={data[expert].finalizado === 0 ? '' : data[expert].finalizado} onChange={(e) => handleInputChange(expert, 'finalizado', e.target.value)} onKeyDown={(e) => handleKeyDown(e, index, 'finalizado', experts.length)} className={`block w-full text-center rounded-md border-gray-300 shadow-sm sm:text-sm py-1.5 ${metGoal ? 'ring-2 ring-green-500 font-bold text-green-900' : isTopPerformer ? 'ring-2 ring-yellow-500 font-bold text-yellow-900' : ''}`} placeholder="0" />
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-center text-sm font-bold text-gray-700 bg-gray-50">{total}</td>
                      <td className={`whitespace-nowrap px-2 py-2 text-center text-xs font-bold ${total > 0 ? (efficiency >= 80 ? 'text-green-700 bg-green-50' : efficiency < 50 ? 'text-red-600 bg-red-50' : 'text-blue-600') : 'text-gray-300'}`}>{total > 0 ? `${efficiency}%` : '-'}</td>
                      <td className="whitespace-nowrap px-3 py-2">
                        <input id={`input-${index}-observacao`} type="text" value={data[expert].observacao || ''} onChange={(e) => handleInputChange(expert, 'observacao', e.target.value)} onKeyDown={(e) => handleKeyDown(e, index, 'observacao', experts.length)} className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 sm:text-sm py-1.5 px-3" placeholder="..." />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-gray-100 border-t-2 border-gray-300">
                <tr className="font-bold text-gray-900">
                   <td colSpan={2} className="py-4 pl-4 text-left">TOTAL EQUIPE</td>
                   <td className="text-center">-</td>
                   <td className="text-center text-yellow-700">{grandTotals.tratado}</td>
                   <td className="text-center text-green-700">{grandTotals.finalizado}</td>
                   <td className="text-center text-indigo-700 text-lg">{grandTotals.total}</td>
                   <td className="text-center text-blue-700">{grandTotals.total > 0 ? `${Math.round((grandTotals.finalizado / grandTotals.total) * 100)}%` : '-'}</td>
                   <td className="text-xs text-gray-500 italic px-4">{grandTotals.urgentes > 0 ? `${grandTotals.urgentes} urgência(s)` : ''}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <PerformanceChart data={data} />

        <div className={`shadow-md rounded-xl p-6 border ${aiAnalysis?.startsWith('❌') ? 'bg-red-50 border-red-200' : 'bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-100'}`}>
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-bold flex items-center gap-2 text-indigo-900"><Sparkles className="w-5 h-5 text-purple-600" />Análise Inteligente (IA)</h3>
            <button onClick={handleAiAnalysis} disabled={isAnalyzing} className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition disabled:opacity-50">{isAnalyzing ? 'Analisando...' : aiAnalysis ? 'Regerar' : 'Gerar Análise'}</button>
          </div>
          {aiAnalysis && (
            <div className="p-5 rounded-lg border bg-white/80 border-indigo-100 text-gray-800 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: aiAnalysis.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
          )}
        </div>
      </div>

      {notification && notification.visible && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
            <div className="bg-indigo-900 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-4 border border-indigo-500">
                <CheckCircle className="w-8 h-8 text-green-400" />
                <div className="flex flex-col">
                    <span className="font-bold text-lg">Meta Batida!</span>
                    <span className="text-sm text-indigo-200">{notification.message}</span>
                </div>
                <button onClick={() => setNotification(null)} className="ml-2 text-indigo-300 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
        </div>
      )}
    </div>
  );
}

export default App;