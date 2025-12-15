import { GoogleGenAI } from "@google/genai";
import { MatrixData, ManualEntryData, TimeSlot } from "../types";

export const analyzeProductivity = async (data: MatrixData | ManualEntryData): Promise<string> => {
  const keys = Object.keys(data);
  if (keys.length === 0) {
    return "⚠️ Não há dados suficientes para análise.";
  }

  // --- 1. PREPARAÇÃO DO PROMPT (Comum para ambos os métodos) ---
  
  // Detect data type to customize the prompt
  const isManualEntry = typeof ((data as any)[keys[0]] || {}).tratado !== 'undefined';
  const dataString = JSON.stringify(data, null, 2);
  
  const systemInstruction = "Você é um Controlador de Produtividade de Atendimento. Sua função é ler uma lista de registros de suporte, identificar tendências de produtividade, avaliar a eficiência da equipe e destacar pontos de atenção e destaque.";

  let userPrompt = "";

  if (isManualEntry) {
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

  // --- 2. TENTATIVA VIA API SERVERLESS (Vercel) ---
  // Isso protege a chave de API em produção
  try {
    // Verifica se estamos rodando em um ambiente que suporta API routes relativas ou absolutas
    const apiEndpoint = '/api/analyze';
    
    const apiResponse = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userPrompt, systemInstruction })
    });

    if (apiResponse.ok) {
        const result = await apiResponse.json();
        if (result.text) return result.text;
    } else {
        // Se a API retornar erro (ex: 404 localmente), loga e segue para fallback
        console.warn("API Serverless indisponível, tentando Client-Side...", apiResponse.status);
    }
  } catch (e) {
    console.warn("Falha na conexão com API Serverless, tentando Client-Side.", e);
  }

  // --- 3. FALLBACK: EXECUÇÃO CLIENT-SIDE (Local/Browser) ---
  
  let apiKey = '';

  // Tenta recuperar do process.env (Node/Webpack/Polyfill)
  try {
    if (typeof process !== 'undefined' && process.env) {
      apiKey = process.env.API_KEY || '';
    }
  } catch (e) {}

  // Tenta recuperar do import.meta.env (Padrão Vite)
  if (!apiKey) {
    try {
      // @ts-ignore
      if (typeof import.meta !== 'undefined' && import.meta.env) {
        // @ts-ignore
        apiKey = import.meta.env.API_KEY || import.meta.env.VITE_API_KEY || import.meta.env.GOOGLE_API_KEY || '';
      }
    } catch (e) {}
  }

  // Tenta recuperar do window object
  if (!apiKey && typeof window !== 'undefined') {
    const win = window as any;
    apiKey = win.process?.env?.API_KEY || win.API_KEY || '';
  }

  if (!apiKey) {
    return "⚠️ **Configuração Necessária**: Não foi possível acessar a API Key.\n\nPara **Produção (Vercel)**: Adicione `API_KEY` nas Environment Variables do projeto.\nPara **Local**: Configure seu `.env` ou variável global.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: apiKey });
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ text: userPrompt }],
      config: {
        systemInstruction: systemInstruction,
      }
    });

    return response.text || "⚠️ A IA processou a solicitação mas não retornou texto.";

  } catch (error: any) {
    console.error("Gemini Analysis Error:", error);
    let errorMsg = error.message || JSON.stringify(error);
    
    if (errorMsg.includes("401") || errorMsg.includes("INVALID_ARGUMENT")) {
      return `❌ **Erro de Autenticação**: A API Key fornecida é inválida.`;
    }
    
    return `❌ **Erro de Conexão**: ${errorMsg}`;
  }
};