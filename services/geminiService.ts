
import { GoogleGenAI } from "@google/genai";
import { MatrixData, ManualEntryData } from "../types";

export const analyzeProductivity = async (data: MatrixData | ManualEntryData): Promise<string> => {
  const keys = Object.keys(data);
  if (keys.length === 0) {
    return "⚠️ Não há dados suficientes para análise.";
  }

  const dataString = JSON.stringify(data, null, 2);
  const systemInstruction = "Você é um Controlador de Produtividade de Atendimento Sênior da Suvinil. Analise os dados, calcule atingimento de metas e sugira melhorias.";

  try {
    // Inicialização direta conforme diretrizes
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analise o seguinte relatório de produtividade em formato JSON e forneça um resumo executivo em Markdown: ${dataString}`,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    return response.text || "⚠️ O modelo não retornou uma análise válida.";
  } catch (error: any) {
    console.error("Gemini Error:", error);
    return `❌ Erro na análise: ${error.message || "Falha na comunicação com a IA"}`;
  }
};
