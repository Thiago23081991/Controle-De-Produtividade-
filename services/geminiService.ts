
import { GoogleGenAI } from "@google/genai";
import { MatrixData, ManualEntryData, TimeSlot } from "../types";

export const analyzeProductivity = async (data: MatrixData | ManualEntryData): Promise<string> => {
  const keys = Object.keys(data);
  if (keys.length === 0) {
    return "⚠️ Não há dados suficientes para análise.";
  }

  // --- 1. PREPARAÇÃO DO PROMPT ---
  
  // Detect data type to customize the prompt
  const isManualEntry = typeof ((data as any)[keys[0]] || {}).tratado !== 'undefined';
  const dataString = JSON.stringify(data, null, 2);
  
  const systemInstruction = "Você é um Controlador de Produtividade de Atendimento Sênior da Suvinil. Sua função é analisar dados de suporte, calcular métricas de atingimento de metas, identificar gargalos e fornecer feedback executivo preciso para a gestão.";

  let userPrompt = "";

  if (isManualEntry) {
    userPrompt = `
      Analise os dados de produtividade manual da equipe Suvinil Service.
      
      DADOS (JSON):
      ${dataString}

      Campos disponíveis por Expert:
      - "tratado": Casos iniciados/em andamento.
      - "finalizado": Casos concluídos com sucesso.
      - "goal": Meta de finalização definida para o dia.
      - "isUrgent": Se o expert está em uma operação crítica.
      - "observacao": Justificativa de performance.

      ESTRUTURA DA ANÁLISE (Markdown):
      1. **Comparativo de Metas (Real vs. Esperado)**: 
         - Para cada expert com meta > 0, calcule o percentual de atingimento: (finalizado / goal * 100).
         - Liste quem SUPEROU a meta (>100%), quem está NO CAMINHO (70-99%) e quem está ABAIXO (<70%).
      2. **Eficiência de Conversão**:
         - Analise a relação entre Casos Tratados e Finalizados. Um alto volume de tratados sem finalização indica gargalo técnico ou complexidade excessiva?
      3. **Destaques Positivos**: 
         - Identifique o expert com melhor performance absoluta e o com melhor performance relativa (atingimento de meta).
      4. **Gestão de Exceções**: 
         - Analise os experts marcados como 'isUrgent' e valide se as 'observações' justificam eventuais baixas produtividades.
      5. **Plano de Ação Sugerido**: 
         - 2 ou 3 pontos acionáveis para melhorar a produtividade do time amanhã.

      Mantenha um tom profissional, analítico e focado em resultados.
    `;
  } else {
    userPrompt = `
      Analise a Matriz de Produtividade (Time Slots) abaixo para a equipe Suvinil.
      
      DADOS:
      ${dataString}

      Gere um resumo em Português do Brasil:
      1. **Análise de Fluxo**: Qual faixa de horário concentra o maior fechamento de casos?
      2. **Consistência do Time**: Identifique quem mantém entregas constantes ao longo do dia vs quem tem picos de produtividade.
      3. **Recomendação**: Baseado nos horários de maior volume, sugira ajustes de escala ou pausas.
    `;
  }

  // --- 2. TENTATIVA VIA API SERVERLESS (Vercel) ---
  try {
    const apiEndpoint = '/api/analyze';
    
    const apiResponse = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userPrompt, systemInstruction })
    });

    if (apiResponse.ok) {
        const result = await apiResponse.json();
        if (result.text) return result.text;
    }
  } catch (e) {
    console.warn("API Serverless unavailable.");
  }

  // --- 3. FALLBACK: CLIENT-SIDE EXECUTION ---
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    return "⚠️ **Configuração Necessária**: Não foi possível acessar a API Key. Verifique se process.env.API_KEY está configurado.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: apiKey });
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: userPrompt,
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
