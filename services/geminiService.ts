
import { MatrixData, ManualEntryData } from "../types";

export const analyzeProductivity = async (data: MatrixData | ManualEntryData): Promise<string> => {
  const keys = Object.keys(data);
  if (keys.length === 0) {
    return "⚠️ Não há dados suficientes para análise.";
  }

  const dataString = JSON.stringify(data, null, 2);
  
  // Instrução de sistema mais robusta e orientada a consultoria de performance
  const systemInstruction = `
    Você é um Consultor de Excelência Operacional e Gestor de Talentos Sênior da Suvinil. 
    Sua missão é atuar como um braço direito da supervisão, transformando números em inteligência estratégica.
    
    Ao analisar os dados:
    1. Identifique padrões de alta performance (experts que batem metas consistentemente com alta taxa de finalização).
    2. Detecte gargalos operacionais (muitas tratativas iniciadas mas poucas concluídas).
    3. Proponha melhorias de processo específicas (ex: redistribuição de carga, foco em janelas de horário).
    4. Sugira planos de desenvolvimento humano (quem precisa de reciclagem técnica e quem pode atuar como mentor para o time).
    5. Mantenha um tom profissional, motivador, porém pragmático e direto ao ponto.
    6. Use Markdown rico para estruturar a resposta.
  `;

  const prompt = `
        Analise minuciosamente estes dados de produtividade da equipe de atendimento Suvinil:
        
        DADOS:
        ${dataString}

        POR FAVOR, ESTRUTURE SEU RELATÓRIO NOS SEGUINTES TÓPICOS:
        
        1. **Resumo Executivo**: Diagnóstico rápido da saúde da operação hoje.
        2. **Análise de Eficiência Operacional**: Destaque quem são os "finalizadores" e quem está com excesso de "pendências/tratativas".
        3. **Sugestões de Melhoria de Processos**: Cite 3 ações práticas para otimizar o fluxo de trabalho com base nestes números.
        4. **Plano de Desenvolvimento de Equipe**:
           - **Mentores**: Quem pode ensinar os outros?
           - **Desenvolvimento**: Quem precisa de suporte imediato e em qual aspecto?
        5. **Insights de Gestão**: Observações baseadas nas notas/justificativas enviadas pelos experts (se houver).
        
        Utilize emojis para facilitar a leitura e destaque métricas importantes em negrito.
  `;

  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        systemInstruction
      }),
    });

    if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Erro na comunicação com o servidor de análise.');
    }

    const json = await response.json();
    return json.text || "⚠️ O modelo não retornou uma análise válida.";
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return `❌ Erro na análise: ${error.message || "Falha na comunicação com o servidor de IA"}`;
  }
};
