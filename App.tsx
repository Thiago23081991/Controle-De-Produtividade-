import React, { useState, useEffect } from 'react';
import { ClipboardList, Sparkles, Copy, RefreshCw, AlertTriangle, Keyboard, Calendar } from 'lucide-react';
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
      acc[name] = { tratado: 0, finalizado: 0, observacao: '' };
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
      acc[name] = { tratado: 0, finalizado: 0, observacao: '' };
      return acc;
    }, {} as ManualEntryData);

    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Merge to ensure all experts exist even in old records
        const mergedData = { ...emptyData };
        Object.keys(parsed).forEach(key => {
            if (mergedData[key]) {
                mergedData[key] = parsed[key];
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
      e.preventDefault();
      if (field === 'tratado') {
        focusInput(index, 'finalizado');
      } else if (field === 'finalizado') {
        focusInput(index, 'observacao');
      } else {
        // From observation, go to next row's tratado
        if (index + 1 < expertListLength) {
          focusInput(index + 1, 'tratado');
        }
      }
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      if (field === 'observacao') {
        focusInput(index, 'finalizado');
      } else if (field === 'finalizado') {
        focusInput(index, 'tratado');
      } else {
        // From tratado, go to prev row's observacao
        if (index - 1 >= 0) {
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

  const getGrandTotals = () => {
    let tratado = 0;
    let finalizado = 0;
    Object.values(data).forEach((entry: any) => {
      tratado += entry.tratado || 0;
      finalizado += entry.finalizado || 0;
    });
    return { tratado, finalizado, total: tratado + finalizado };
  };

  const generateMarkdown = () => {
    // Format date for the report
    const [y, m, d] = selectedDate.split('-');
    const dateFormatted = `${d}/${m}/${y}`;

    let md = `## Relatório de Produtividade - ${dateFormatted}\n\n`;
    md += `| Expert | Tratado (Em andamento) | Finalizado | Total | Observação |\n`;
    md += `| :--- | :---: | :---: | :---: | :--- |\n`;

    // Sort keys to ensure deterministic order in report
    const sortedExperts = Object.keys(data).sort((a, b) => a.localeCompare(b));

    sortedExperts.forEach(expert => {
      const { tratado, finalizado, observacao } = data[expert];
      const total = tratado + finalizado;
      const obsSafe = observacao ? observacao.replace(/\|/g, '-') : ''; // Prevent breaking md table
      md += `| ${expert} | ${tratado} | ${finalizado} | ${total} | ${obsSafe} |\n`;
    });

    const grand = getGrandTotals();
    md += `| **TOTAL GERAL** | **${grand.tratado}** | **${grand.finalizado}** | **${grand.total}** | - |`;
    
    return md;
  };

  const handleCopyMarkdown = () => {
    const md = generateMarkdown();
    navigator.clipboard.writeText(md);
    alert('Relatório copiado para a área de transferência!');
  };

  const handleReset = (e: React.MouseEvent) => {
    e.preventDefault();
    if (window.confirm("Tem certeza que deseja zerar todos os campos para esta data?")) {
      const resetData = EXPERT_ROSTER.reduce((acc, name) => {
        acc[name] = { tratado: 0, finalizado: 0, observacao: '' };
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
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sticky top-4 z-10 bg-gray-100/90 py-3 backdrop-blur-sm border-b border-gray-200/50">
           
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

           <div className="hidden lg:flex items-center gap-2 text-xs text-gray-500 bg-white px-3 py-2 rounded-full shadow-sm border border-gray-200">
              <Keyboard className="w-4 h-4" />
              <span>Navegação: <strong>Setas</strong> | <strong>Enter</strong></span>
           </div>

           <div className="flex gap-3 w-full sm:w-auto justify-end">
             <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-md hover:bg-red-50 shadow-sm transition-colors cursor-pointer active:bg-red-100"
            >
              <RefreshCw className="w-4 h-4" />
              Limpar
            </button>
            <button
              type="button"
              onClick={handleCopyMarkdown}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 shadow-sm transition-colors cursor-pointer active:bg-indigo-800"
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
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-bold text-gray-900 sm:pl-6 uppercase tracking-wider w-1/4">
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
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-bold text-gray-600 bg-gray-50 uppercase tracking-wider">
                    Observação (Justificativa)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {experts.map((expert, index) => (
                  <tr key={expert} className="hover:bg-gray-50 transition-colors">
                    <td className="whitespace-nowrap py-3 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                      {expert}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-center bg-yellow-50/30">
                      <input
                        id={`input-${index}-tratado`}
                        type="number"
                        min="0"
                        value={data[expert].tratado || ''}
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
                        value={data[expert].finalizado || ''}
                        onChange={(e) => handleInputChange(expert, 'finalizado', e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, index, 'finalizado', experts.length)}
                        className="block w-full text-center rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm py-1.5"
                        placeholder="0"
                      />
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-center text-sm font-bold text-gray-700 bg-gray-50">
                      {calculateTotal(expert)}
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
                ))}
              </tbody>
              <tfoot className="bg-gray-100 border-t-2 border-gray-300">
                <tr>
                   <td className="py-4 pl-4 pr-3 text-left text-base font-bold text-gray-900 sm:pl-6">
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
                   <td className="px-3 py-4"></td>
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