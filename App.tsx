import React, { useState } from 'react';
import { ClipboardList, Sparkles, Copy, RefreshCw } from 'lucide-react';
import { EXPERT_ROSTER } from './utils/parser';
import { analyzeProductivity } from './services/geminiService';
import { ManualEntryData } from './types';

function App() {
  // Initialize state with roster names, sorted alphabetically
  const initialData: ManualEntryData = EXPERT_ROSTER.sort().reduce((acc, name) => {
    acc[name] = { tratado: 0, finalizado: 0 };
    return acc;
  }, {} as ManualEntryData);

  const [data, setData] = useState<ManualEntryData>(initialData);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleInputChange = (expert: string, field: 'tratado' | 'finalizado', value: string) => {
    const numValue = parseInt(value) || 0;
    setData(prev => ({
      ...prev,
      [expert]: {
        ...prev[expert],
        [field]: Math.max(0, numValue)
      }
    }));
  };

  const calculateTotal = (expert: string) => {
    return data[expert].tratado + data[expert].finalizado;
  };

  const getGrandTotals = () => {
    let tratado = 0;
    let finalizado = 0;
    Object.values(data).forEach(entry => {
      tratado += entry.tratado;
      finalizado += entry.finalizado;
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
      setData(initialData);
      setAiAnalysis(null);
    }
  };

  const handleAiAnalysis = async () => {
    setIsAnalyzing(true);
    const analysis = await analyzeProductivity(data);
    setAiAnalysis(analysis);
    setIsAnalyzing(false);
  };

  const grandTotals = getGrandTotals();

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
                {Object.keys(data).map((expert) => (
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
