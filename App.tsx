import React, { useState, useMemo } from 'react';
import { ClipboardList, Sparkles, Copy, RefreshCw, AlertTriangle } from 'lucide-react';
import { EXPERT_ROSTER } from './utils/parser';
import { analyzeProductivity } from './services/geminiService';
import { ManualEntryData } from './types';

function App() {
  // Use lazy initialization for state to avoid re-calculating on every render
  const [data, setData] = useState<ManualEntryData>(() => {
    // Create a safe copy of the roster and sort it
    const sortedRoster = [...EXPERT_ROSTER].sort((a, b) => a.localeCompare(b));
    return sortedRoster.reduce((acc, name) => {
      acc[name] = { tratado: 0, finalizado: 0 };
      return acc;
    }, {} as ManualEntryData);
  });

  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleInputChange = (expert: string, field: 'tratado' | 'finalizado', value: string) => {
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

  const calculateTotal = (expert: string) => {
    return (data[expert]?.tratado || 0) + (data[expert]?.finalizado || 0);
  };

  const getGrandTotals = () => {
    let tratado = 0;
    let finalizado = 0;
    Object.values(data).forEach(entry => {
      tratado += entry.tratado || 0;
      finalizado += entry.finalizado || 0;
    });
    return { tratado, finalizado, total: tratado + finalizado };
  };

  const generateMarkdown = () => {
    let md = `| Expert | Tratado (Em andamento) | Finalizado | Total |\n`;
    md += `| :--- | :---: | :---: | :---: |\n`;

    Object.keys(data).forEach(expert => {
      const { tratado, finalizado } = data[expert];
      const total = tratado + finalizado;
      md += `| ${expert} | ${tratado} | ${finalizado} | ${total} |\n`;
    });

    const grand = getGrandTotals();
    md += `| **TOTAL GERAL** | **${grand.tratado}** | **${grand.finalizado}** | **${grand.total}** |`;
    
    return md;
  };

  const handleCopyMarkdown = () => {
    const md = generateMarkdown();
    navigator.clipboard.writeText(md);
    alert('Relatório copiado para a área de transferência!');
  };

  const handleReset = () => {
    if (confirm("Tem certeza que deseja zerar todos os campos?")) {
      const sortedRoster = [...EXPERT_ROSTER].sort((a, b) => a.localeCompare(b));
      const resetData = sortedRoster.reduce((acc, name) => {
        acc[name] = { tratado: 0, finalizado: 0 };
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
  const experts = Object.keys(data);

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
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-indigo-700 flex justify-center items-center gap-3">
            <ClipboardList className="w-10 h-10" />
            Controle de Produtividade Manual
          </h1>
          <p className="mt-2 text-gray-600">
            Insira os dados de produção diária para cada Expert.
          </p>
        </div>

        {/* Action Bar */}
        <div className="flex justify-end gap-3 sticky top-4 z-10 bg-gray-100/90 py-2 backdrop-blur-sm">
           <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-md hover:bg-red-50 shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Limpar Tudo
          </button>
          <button
            onClick={handleCopyMarkdown}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 shadow-sm"
          >
            <Copy className="w-4 h-4" />
            Copiar Relatório
          </button>
        </div>

        {/* Manual Entry Grid */}
        <div className="bg-white shadow-xl rounded-xl overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-bold text-gray-900 sm:pl-6 uppercase tracking-wider">
                    Expert
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-center text-sm font-bold text-yellow-700 bg-yellow-50 uppercase tracking-wider w-32">
                    Tratado
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-center text-sm font-bold text-green-700 bg-green-50 uppercase tracking-wider w-32">
                    Finalizado
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-center text-sm font-bold text-gray-900 bg-gray-100 uppercase tracking-wider w-24">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {experts.map((expert) => (
                  <tr key={expert} className="hover:bg-gray-50 transition-colors">
                    <td className="whitespace-nowrap py-3 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                      {expert}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-center bg-yellow-50/30">
                      <input
                        type="number"
                        min="0"
                        value={data[expert].tratado === 0 ? '' : data[expert].tratado}
                        onChange={(e) => handleInputChange(expert, 'tratado', e.target.value)}
                        className="block w-full text-center rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm py-1.5"
                        placeholder="0"
                      />
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-center bg-green-50/30">
                      <input
                        type="number"
                        min="0"
                        value={data[expert].finalizado === 0 ? '' : data[expert].finalizado}
                        onChange={(e) => handleInputChange(expert, 'finalizado', e.target.value)}
                        className="block w-full text-center rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm py-1.5"
                        placeholder="0"
                      />
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-center text-sm font-bold text-gray-700 bg-gray-50">
                      {calculateTotal(expert)}
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
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

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
                onClick={handleAiAnalysis}
                disabled={isAnalyzing}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition shadow-sm disabled:opacity-50"
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