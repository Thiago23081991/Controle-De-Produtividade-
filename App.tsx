import React, { useState, useEffect } from 'react';
import { ClipboardList, Sparkles, Copy, RefreshCw, AlertTriangle, Keyboard, Calendar, Siren, FileSpreadsheet } from 'lucide-react';
import { EXPERT_ROSTER } from './utils/parser';
import { analyzeProductivity } from './services/geminiService';
import { ManualEntryData } from './types';
import { PerformanceChart } from './components/PerformanceChart';

// Helper to get YYYY-MM-DD
const getTodayString = () => new Date().toISOString().split('T')[0];

function App() {
  const [selectedDate, setSelectedDate] = useState<string>(getTodayString());
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Initialize data based on the selected date (load from LocalStorage or default)
  const [data, setData] = useState<ManualEntryData>(() => {
    const storageKey = `productivity_${getTodayString()}`;
    const stored = localStorage.getItem(storageKey);
    
    // Base empty structure based on current Roster
    const sortedRoster = [...EXPERT_ROSTER].sort((a, b) => a.localeCompare(b));
    const emptyData = sortedRoster.reduce((acc, name) => {
      acc[name] = { tratado: 0, finalizado: 0, observacao: '', isUrgent: false };
      return acc;
    }, {} as ManualEntryData);

    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Merge stored data with current roster (handles cases where roster changed)
        return { ...emptyData, ...parsed };
      } catch (e) {
        return emptyData;
      }
    }
    return emptyData;
  });

  // Effect: Save to LocalStorage whenever data changes
  useEffect(() => {
    const storageKey = `productivity_${selectedDate}`;
    localStorage.setItem(storageKey, JSON.stringify(data));
  }, [data, selectedDate]);

  // Handle Date Change
  const handleDateChange = (newDate: string) => {
    if (!newDate) return;
    
    setSelectedDate(newDate);
    
    // Load data for the new date
    const storageKey = `productivity_${newDate}`;
    const stored = localStorage.getItem(storageKey);
    
    const sortedRoster = [...EXPERT_ROSTER].sort((a, b) => a.localeCompare(b));
    const emptyData = sortedRoster.reduce((acc, name) => {
      acc[name] = { tratado: 0, finalizado: 0, observacao: '', isUrgent: false };
      return acc;
    }, {} as ManualEntryData);

    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Merge to ensure all experts exist even in old records
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
    
    // Reset Analysis when date changes
    setAiAnalysis(null);
  };

  const handleInputChange = (expert: string, field: 'tratado' | 'finalizado' | 'observacao', value: string) => {
    if (field === 'observacao') {
      setData(prev => ({
        ...prev,
        [expert]: {
          ...prev[expert],
          observacao: value
        }
      }));
      return;
    }

    // Allow empty string for better typing experience, convert to 0 for logic
    const numValue = value === '' ? 0 : parseInt(value);
    
    if (isNaN(numValue)) return;

    setData(prev => ({
      ...prev,
      [expert]: {
        ...prev[expert],
        [field]: Math.max(0, numValue)
      }
    }));
  };

  const toggleUrgency = (expert: string) => {
    setData(prev => ({
      ...prev,
      [expert]: {
        ...prev[expert],
        isUrgent: !prev[expert].isUrgent
      }
    }));
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
    field: 'tratado' | 'finalizado' | 'observacao',
    expertListLength: number
  ) => {
    // Helper function to focus specific input by ID
    const focusInput = (idx: number, f: 'tratado' | 'finalizado' | 'observacao') => {
      const el = document.getElementById(`input-${idx}-${f}`);
      if (el) {
        (el as HTMLInputElement).focus();
      }
    };

    if (e.key === 'ArrowRight') {
      // Allow default behavior if cursor is not at end of text, but for numbers we usually just navigate
      // Only prevent default if we actually move focus
      if (field === 'tratado') {
        e.preventDefault();
        focusInput(index, 'finalizado');
      } else if (field === 'finalizado') {
        e.preventDefault();
        focusInput(index, 'observacao');
      } else {
        // From observation, go to next row's tratado
        if (index + 1 < expertListLength) {
          // e.preventDefault(); // Optional: Keep default behavior in text field or move? Usually move is better for power users
          // focusInput(index + 1, 'tratado');
        }
      }
    } else if (e.key === 'ArrowLeft') {
      if (field === 'observacao') {
        // Check if cursor is at start? Simplified: just move
        // e.preventDefault(); 
        // focusInput(index, 'finalizado');
      } else if (field === 'finalizado') {
        e.preventDefault();
        focusInput(index, 'tratado');
      } else {
        // From tratado, go to prev row's observacao
        if (index - 1 >= 0) {
           e.preventDefault();
           focusInput(index - 1, 'observacao');
        }
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (index + 1 < expertListLength) {
        focusInput(index + 1, field);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (index - 1 >= 0) {
        focusInput(index - 1, field);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      // Enter behaves like Tab/Next
      if (field === 'tratado') {
        focusInput(index, 'finalizado');
      } else if (field === 'finalizado') {
        focusInput(index, 'observacao');
      } else if (index + 1 < expertListLength) {
        focusInput(index + 1, 'tratado');
      }
    }
  };

  const calculateTotal = (expert: string) => {
    return (data[expert]?.tratado || 0) + (data[expert]?.finalizado || 0);
  };

  const getEfficiency = (expert: string) => {
    const tratado = data[expert]?.tratado || 0;
    const finalizado = data[expert]?.finalizado || 0;
    const total = tratado + finalizado;
    if (total === 0) return 0;
    return Math.round((finalizado / total) * 100);
  };

  const getGrandTotals = () => {
    let tratado = 0;
    let finalizado = 0;
    let urgentes = 0;
    Object.values(data).forEach((entry: any) => {
      tratado += entry.tratado || 0;
      finalizado += entry.finalizado || 0;
      if (entry.isUrgent) urgentes++;
    });
    return { tratado, finalizado, total: tratado + finalizado, urgentes };
  };

  const generateMarkdown = () => {
    // Format date for the report
    const [y, m, d] = selectedDate.split('-');
    const dateFormatted = `${d}/${m}/${y}`;

    let md = `## Relatório de Produtividade - ${dateFormatted}\n\n`;
    md += `| Expert | Tratado (Em andamento) | Finalizado | Total | Eficiência | Observação |\n`;
    md += `| :--- | :---: | :---: | :---: | :---: | :--- |\n`;

    // Sort keys to ensure deterministic order in report
    const sortedExperts = Object.keys(data).sort((a, b) => a.localeCompare(b));

    sortedExperts.forEach(expert => {
      const { tratado, finalizado, observacao, isUrgent } = data[expert];
      const total = tratado + finalizado;
      const efficiency = total > 0 ? Math.round((finalizado / total) * 100) : 0;
      const obsSafe = observacao ? observacao.replace(/\|/g, '-') : ''; 
      
      // Add Urgency Indicator to Name or Observation
      const nameDisplay = isUrgent ? `${expert} 🚨` : expert;
      const obsDisplay = isUrgent ? `**[URGÊNCIA]** ${obsSafe}` : obsSafe;

      md += `| ${nameDisplay} | ${tratado} | ${finalizado} | ${total} | ${efficiency}% | ${obsDisplay} |\n`;
    });

    const grand = getGrandTotals();
    const grandEfficiency = grand.total > 0 ? Math.round((grand.finalizado / grand.total) * 100) : 0;
    md += `| **TOTAL GERAL** | **${grand.tratado}** | **${grand.finalizado}** | **${grand.total}** | **${grandEfficiency}%** | **${grand.urgentes} Casos Urgentes** |`;
    
    return md;
  };

  const handleCopyMarkdown = () => {
    const md = generateMarkdown();
    navigator.clipboard.writeText(md);
    alert('Relatório copiado para a área de transferência!');
  };

  const handleExportCSV = () => {
    // Format date for the filename
    const [y, m, d] = selectedDate.split('-');
    const dateFormatted = `${d}-${m}-${y}`;
    
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; // UTF-8 BOM for Excel
    csvContent += "Data,Expert,Urgente,Tratado,Finalizado,Total,Eficiência (%),Observação\n";

    const sortedExperts = Object.keys(data).sort((a, b) => a.localeCompare(b));

    sortedExperts.forEach(expert => {
      const { tratado, finalizado, observacao, isUrgent } = data[expert];
      const total = tratado + finalizado;
      const efficiency = total > 0 ? Math.round((finalizado / total) * 100) : 0;
      
      // Escape quotes for CSV
      const obsSafe = observacao ? `"${observacao.replace(/"/g, '""')}"` : "";
      const urgentFlag = isUrgent ? "SIM" : "NAO";

      csvContent += `${dateFormatted},"${expert}",${urgentFlag},${tratado},${finalizado},${total},${efficiency}%,${obsSafe}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `produtividade_equipe_${dateFormatted}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = (e: React.MouseEvent) => {
    e.preventDefault();
    if (window.confirm("Tem certeza que deseja zerar todos os campos para esta data?")) {
      const resetData = EXPERT_ROSTER.reduce((acc, name) => {
        acc[name] = { tratado: 0, finalizado: 0, observacao: '', isUrgent: false };
        return acc;
      }, {} as ManualEntryData);
      
      setData(resetData);
      setAiAnalysis(null);
    }
  };

  const handleAiAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const analysis = await analyzeProductivity(data);
      setAiAnalysis(analysis);
    } catch (e) {
      setAiAnalysis("Erro ao gerar análise. Verifique o console.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const grandTotals = getGrandTotals();
  const experts = Object.keys(data).sort((a, b) => a.localeCompare(b));

  if (experts.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg border border-red-100 max-w-md">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800">Erro no Carregamento</h2>
          <p className="text-gray-600 mt-2">
            A lista de Experts não foi carregada corretamente. Verifique o arquivo de configuração.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-indigo-700 flex justify-center items-center gap-3">
            <ClipboardList className="w-10 h-10" />
            Controle de Produtividade
          </h1>
          <p className="mt-2 text-gray-600">
            Gerencie a produção diária da equipe.
          </p>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col xl:flex-row justify-between items-center gap-4 sticky top-4 z-10 bg-gray-100/90 py-3 backdrop-blur-sm border-b border-gray-200/50">
           
           {/* Date Picker */}
           <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-sm border border-gray-300">
              <Calendar className="w-5 h-5 text-indigo-600" />
              <input 
                type="date"
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className="text-gray-700 text-sm font-medium focus:outline-none"
              />
           </div>

           <div className="hidden xl:flex items-center gap-2 text-xs text-gray-500 bg-white px-3 py-2 rounded-full shadow-sm border border-gray-200">
              <Keyboard className="w-4 h-4" />
              <span>Navegação: <strong>Setas</strong> | <strong>Enter</strong></span>
           </div>

           <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-center sm:justify-end">
             <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium text-red-600 bg-white border border-red-200 rounded-md hover:bg-red-50 shadow-sm transition-colors cursor-pointer active:bg-red-100"
            >
              <RefreshCw className="w-4 h-4" />
              Limpar
            </button>
            <button
              type="button"
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium text-green-700 bg-white border border-green-200 rounded-md hover:bg-green-50 shadow-sm transition-colors cursor-pointer active:bg-green-100"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Exportar CSV
            </button>
            <button
              type="button"
              onClick={handleCopyMarkdown}
              className="flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 shadow-sm transition-colors cursor-pointer active:bg-indigo-800"
            >
              <Copy className="w-4 h-4" />
              Copiar Relatório
            </button>
           </div>
        </div>

        {/* Manual Entry Grid */}
        <div className="bg-white shadow-xl rounded-xl overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-3 py-3.5 text-center text-xs font-bold text-gray-500 uppercase tracking-wider w-12" title="Marcar Caso Urgente">
                    Urg.
                  </th>
                  <th scope="col" className="py-3.5 pl-2 pr-3 text-left text-sm font-bold text-gray-900 uppercase tracking-wider min-w-[200px]">
                    Expert
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-center text-sm font-bold text-yellow-700 bg-yellow-50 uppercase tracking-wider w-24">
                    Tratado
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-center text-sm font-bold text-green-700 bg-green-50 uppercase tracking-wider w-24">
                    Finalizado
                  </th>
                   <th scope="col" className="px-3 py-3.5 text-center text-sm font-bold text-gray-900 bg-gray-100 uppercase tracking-wider w-20">
                    Total
                  </th>
                  <th scope="col" className="px-2 py-3.5 text-center text-xs font-bold text-blue-700 bg-blue-50 uppercase tracking-wider w-16" title="Eficiência (Finalizado / Total)">
                    % Efic.
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-bold text-gray-600 bg-gray-50 uppercase tracking-wider min-w-[200px]">
                    Observação (Justificativa)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {experts.map((expert, index) => {
                  const isUrgent = data[expert].isUrgent || false;
                  const efficiency = getEfficiency(expert);
                  
                  // Color coding for efficiency
                  let effColor = 'text-gray-500';
                  let effBg = '';
                  const total = calculateTotal(expert);
                  
                  if (total > 0) {
                    if (efficiency >= 80) { effColor = 'text-green-700'; effBg = 'bg-green-50'; }
                    else if (efficiency < 50) { effColor = 'text-red-600'; effBg = 'bg-red-50'; }
                    else { effColor = 'text-blue-600'; }
                  }

                  return (
                    <tr key={expert} className={`transition-colors ${isUrgent ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-gray-50'}`}>
                      <td className="px-3 py-2 text-center">
                        <input
                            type="checkbox"
                            checked={isUrgent}
                            onChange={() => toggleUrgency(expert)}
                            className="w-5 h-5 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 focus:ring-2 cursor-pointer accent-red-600"
                            title="Marcar como Urgente"
                        />
                      </td>
                      <td className="whitespace-nowrap py-3 pl-2 pr-3 text-sm font-medium text-gray-900">
                        {expert}
                        {isUrgent && <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">Urgente</span>}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-center bg-yellow-50/30">
                        <input
                          id={`input-${index}-tratado`}
                          type="number"
                          min="0"
                          value={data[expert].tratado === 0 ? '' : data[expert].tratado}
                          onChange={(e) => handleInputChange(expert, 'tratado', e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, index, 'tratado', experts.length)}
                          className="block w-full text-center rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm py-1.5"
                          placeholder="0"
                        />
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-center bg-green-50/30">
                        <input
                          id={`input-${index}-finalizado`}
                          type="number"
                          min="0"
                          value={data[expert].finalizado === 0 ? '' : data[expert].finalizado}
                          onChange={(e) => handleInputChange(expert, 'finalizado', e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, index, 'finalizado', experts.length)}
                          className="block w-full text-center rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm py-1.5"
                          placeholder="0"
                        />
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-center text-sm font-bold text-gray-700 bg-gray-50">
                        {calculateTotal(expert)}
                      </td>
                      <td className={`whitespace-nowrap px-2 py-2 text-center text-xs font-bold ${effColor} ${effBg}`}>
                         {total > 0 ? `${efficiency}%` : '-'}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2">
                        <input
                          id={`input-${index}-observacao`}
                          type="text"
                          value={data[expert].observacao || ''}
                          onChange={(e) => handleInputChange(expert, 'observacao', e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, index, 'observacao', experts.length)}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-1.5 px-3"
                          placeholder="Ex: Atestado, Erro Sistêmico..."
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-gray-100 border-t-2 border-gray-300">
                <tr>
                   <td className="px-3 py-4"></td>
                   <td className="py-4 pl-2 pr-3 text-left text-base font-bold text-gray-900">
                     TOTAL DA EQUIPE
                   </td>
                   <td className="px-3 py-4 text-center text-base font-bold text-yellow-700">
                     {grandTotals.tratado}
                   </td>
                   <td className="px-3 py-4 text-center text-base font-bold text-green-700">
                     {grandTotals.finalizado}
                   </td>
                   <td className="px-3 py-4 text-center text-lg font-extrabold text-indigo-700">
                     {grandTotals.total}
                   </td>
                   <td className="px-3 py-4 text-center text-xs font-bold text-blue-700">
                      {grandTotals.total > 0 ? `${Math.round((grandTotals.finalizado / grandTotals.total) * 100)}%` : '-'}
                   </td>
                   <td className="px-3 py-4 text-xs text-gray-500 italic text-center">
                     {grandTotals.urgentes > 0 ? `${grandTotals.urgentes} urgência(s)` : ''}
                   </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Chart Section */}
        <PerformanceChart data={data} />

        {/* AI Analysis Section */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 shadow-md rounded-xl p-6 border border-indigo-100">
          <div className="flex justify-between items-start mb-4">
            <div>
                <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                Análise Inteligente (IA)
              </h3>
              <p className="text-sm text-indigo-700 mt-1">
                Obtenha um resumo executivo sobre a performance da equipe hoje.
              </p>
            </div>
            {!aiAnalysis && (
              <button 
                type="button"
                onClick={handleAiAnalysis}
                disabled={isAnalyzing}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {isAnalyzing ? 'Analisando...' : 'Gerar Análise'}
              </button>
            )}
          </div>
          
          {aiAnalysis && (
            <div className="bg-white/80 p-5 rounded-lg border border-indigo-100 text-gray-800 prose prose-sm max-w-none">
              <div dangerouslySetInnerHTML={{ __html: aiAnalysis.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default App;