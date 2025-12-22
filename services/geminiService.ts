
import { GoogleGenAI } from "@google/genai";
import { MatrixData, ManualEntryData } from "../types";

export const analyzeProductivity = async (data: MatrixData | ManualEntryData): Promise<string> => {
  const keys = Object.keys(data);
  if (keys.length === 0) {
    return "⚠️ Não há dados suficientes para análise.";
  }

  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    return "⚠️ **Configuração Necessária**: A chave de API não foi detectada. Verifique as configurações de ambiente.";
  }

  // Detect data type
  const isManualEntry = typeof ((data as any)[keys[0]] || {}).tratado !== 'undefined';
  const dataString = JSON.stringify(data, null, 2);
  
  const systemInstruction = "Você é um Controlador de Produtividade de Atendimento Sênior da Suvinil. Sua função é analisar dados de suporte, calcular métricas de atingimento de metas, identificar gargalos e fornecer feedback executivo preciso.";

  let prompt = "";

  if (isManualEntry) {
    prompt = `
      Analise os dados de produtividade da equipe Suvinil Service.
      DADOS: ${dataString}

      Estruture sua resposta em Markdown:
      1. **Resumo Geral**: Como está a produtividade hoje?
      2. **Atingimento de Metas**: Quem bateu a meta e quem precisa de suporte?
      3. **Eficiência**: Relação entre casos tratados e finalizados.
      4. **Ações Recomendadas**: O que o gestor deve fazer agora?
    `;
  } else {
    prompt = `Analise esta matriz de produtividade por horários e sugira melhorias no fluxo: ${dataString}`;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      },
    });

    return response.text || "⚠️ O modelo não retornou uma análise válida.";
  } catch (error: any) {
    console.error("Gemini Error:", error);
    return `❌ Erro na análise: ${error.message || "Falha na comunicação com a IA"}`;
  }
};
