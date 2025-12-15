import { GoogleGenAI } from "@google/genai";
import { MatrixData, ManualEntryData, TimeSlot } from "../types";

export const analyzeProductivity = async (data: MatrixData | ManualEntryData): Promise<string> => {
  let apiKey: string | undefined;
  
  // 1. Try accessing standard process.env (Node/Bundler environment)
  try {
    apiKey = process.env.API_KEY;
  } catch (e) {
    // Ignore ReferenceError if process is not defined
  }

  // 2. Fallback: Access via window object (Browser Polyfill from index.tsx)
  if (!apiKey && typeof window !== 'undefined') {
    const win = window as any;
    apiKey = win.process?.env?.API_KEY;
  }

  if (!apiKey) {
    return "⚠️ **Configuração Necessária**: A variável de ambiente `API_KEY` não foi encontrada. Certifique-se de que sua chave do Google Gemini está configurada.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: apiKey });
    
    const keys = Object.keys(data);
    if (keys.length === 0) {
      return "⚠️ Não há dados suficientes para análise.";
    }

    // Detect data type to customize the prompt
    // We check if the first entry has the 'tratado' property which is specific to ManualEntryData
    const isManualEntry = typeof (data[keys[0]] as any).tratado !== 'undefined';
    const dataString = JSON.stringify(data, null, 2);
    
    const systemInstruction = "Você é um Controlador de Produtividade de Atendimento. Sua função é ler uma lista de registros de suporte, identificar tendências de produtividade, avaliar a eficiência da equipe e destacar pontos de atenção e destaque.";

    let userPrompt = "";

    if (isManualEntry) {
      // Prompt for Manual Entry
      userPrompt = `
        Analise os dados de produtividade abaixo (Manual Entry).
        Campos: "Tratado" (andamento), "Finalizado" (resolvido), "Observacao" (justificativa), "isUrgent" (prioridade), "goal" (meta).
        
        DADOS:
        ${dataString}

        Gere um resumo executivo em Português do Brasil:
        1. **Destaques de Performance**: Top Performer (maior 'Finalizado') e quem bateu a Meta.
        2. **Eficiência**: Análise da taxa de conversão (Finalizado/Total).
        3. **Gestão de Urgência**: Liste quem está marcado como urgente ('isUrgent': true) e isente-os de cobrança por volume.
        4. **Observações**: Resuma as justificativas do campo 'Observacao'.
        5. **Pontos de Atenção**: Baixa performance sem justificativa.

        Seja direto, profissional e use Markdown.
      `;
    } else {
      // Prompt for Matrix Data
      userPrompt = `
        Analise a Matriz de Produtividade (Time Slots) abaixo.
        Dados: Quantidade de casos FINALIZADOS por faixa de horário.
        
        DADOS:
        ${dataString}

        Faixas: ${TimeSlot.EARLY}, ${TimeSlot.MORNING}, ${TimeSlot.LUNCH}, ${TimeSlot.AFTERNOON}, ${TimeSlot.LATE}.

        Gere um resumo em Português do Brasil (max 3 parágrafos):
        1. **Top Performers**: Maior volume total.
        2. **Pico de Produtividade**: Qual horário a equipe produz mais.
        3. **Consistência**: Quem mantém ritmo constante vs picos isolados.
      `;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ text: userPrompt }], // Using explicit parts array for best practice
      config: {
        systemInstruction: systemInstruction,
      }
    });

    return response.text || "⚠️ A IA processou a solicitação mas não retornou texto.";

  } catch (error: any) {
    console.error("Gemini Analysis Error:", error);
    
    let errorMsg = error.message || JSON.stringify(error);
    
    if (errorMsg.includes("401") || errorMsg.includes("INVALID_ARGUMENT")) {
      return `❌ **Erro de Autenticação (401)**: A API Key fornecida é inválida ou expirou. Verifique se você está usando uma chave Google ('AIza...') válida.`;
    }
    if (errorMsg.includes("403")) {
        return `❌ **Acesso Negado (403)**: A chave de API não tem permissão para usar este modelo ou está restrita por região.`;
    }
    if (errorMsg.includes("404") || errorMsg.includes("NOT_FOUND")) {
      return `❌ **Modelo não encontrado (404)**: O modelo 'gemini-2.5-flash' pode não estar disponível para sua chave atual.`;
    }
    
    return `❌ **Erro de Conexão**: ${errorMsg}`;
  }
};