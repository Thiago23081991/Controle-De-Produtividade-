import { GoogleGenAI } from "@google/genai";
import { MatrixData, ManualEntryData } from "../types";

export const analyzeProductivity = async (data: MatrixData | ManualEntryData): Promise<string> => {
  if (!process.env.API_KEY) {
    return "API Key não configurada. Não é possível gerar análise com IA.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Prepare data for the prompt
    const dataString = JSON.stringify(data, null, 2);

    const prompt = `
      Atue como um Gerente de Atendimento Sênior. 
      Analise os dados de produtividade abaixo, que foram inseridos manualmente.
      Os campos são: 
      - "Tratado": Casos em andamento/análise.
      - "Finalizado": Casos resolvidos/vendidos com sucesso.
      
      DADOS:
      ${dataString}

      Forneça um resumo executivo curto (máximo 3 parágrafos) em Português do Brasil destacando:
      1. Quem é o Top Performer em volume TOTAL (Tratado + Finalizado) e quem mais Finalizou.
      2. Visão geral da eficiência da equipe (Proporção de Finalizados vs Tratados).
      3. Pontos de atenção (ex: experts com baixa produção ou muitos casos apenas "tratados" sem finalização).
      
      Use formatação Markdown simples (negrito, bullet points). Seja direto e profissional.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Não foi possível gerar a análise.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "Erro ao conectar com a IA para análise.";
  }
};
