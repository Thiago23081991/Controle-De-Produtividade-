import { GoogleGenAI } from "@google/genai";
import { MatrixData, ManualEntryData, TimeSlot } from "../types";

export const analyzeProductivity = async (data: MatrixData | ManualEntryData): Promise<string> => {
  // API Key must be obtained exclusively from process.env.API_KEY
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    return "API Key não configurada ou inacessível no ambiente. Não é possível gerar análise com IA.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: apiKey });
    
    // Detect data type to customize the prompt
    // Check the first entry to see if it has 'tratado' property
    const keys = Object.keys(data);
    const isManualEntry = keys.length > 0 && 'tratado' in (data[keys[0]] as any);

    const dataString = JSON.stringify(data, null, 2);
    let prompt = "";

    if (isManualEntry) {
      // Prompt for Manual Entry (Tratado vs Finalizado)
      prompt = `
        Atue como um Gerente de Atendimento Sênior. 
        Analise os dados de produtividade abaixo, que foram inseridos manualmente.
        Os campos são: 
        - "Tratado": Casos em andamento/análise.
        - "Finalizado": Casos resolvidos/vendidos com sucesso.
        - "Observacao": Justificativas para baixa produtividade (ex: atestado, falha sistêmica, treinamento).
        
        DADOS:
        ${dataString}

        Forneça um resumo executivo curto (máximo 3 parágrafos) em Português do Brasil destacando:
        1. Quem é o Top Performer em volume TOTAL (Tratado + Finalizado) e quem mais Finalizou.
        2. Visão geral da eficiência da equipe (Proporção de Finalizados vs Tratados).
        3. Pontos de atenção. IMPORTANTE: Ao apontar baixa produtividade, verifique se existe uma "Observacao" justificando (ex: atestado). Se houver justificativa, mencione isso para não penalizar o expert injustamente.
        
        Use formatação Markdown simples (negrito, bullet points). Seja direto e profissional.
      `;
    } else {
      // Prompt for Matrix Data (Time Slots)
      prompt = `
        Atue como um Controlador de Produtividade Sênior.
        Analise a Matriz de Produtividade abaixo.
        Os dados mostram a quantidade de casos FINALIZADOS por faixa de horário (Time Slots).
        
        DADOS:
        ${dataString}

        As faixas de horário são:
        - ${TimeSlot.EARLY}
        - ${TimeSlot.MORNING}
        - ${TimeSlot.LUNCH}
        - ${TimeSlot.AFTERNOON}
        - ${TimeSlot.LATE}

        Forneça um resumo executivo curto (máximo 3 parágrafos) em Português do Brasil destacando:
        1. **Top Performers**: Quem teve maior entrega total de casos finalizados.
        2. **Análise de Horários**: Qual foi o período do dia mais produtivo da equipe em geral?
        3. **Consistência**: Identifique quem manteve um ritmo constante vs. quem teve picos de produção em horários específicos.

        Use formatação Markdown simples (negrito, bullet points). Seja conciso.
      `;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Não foi possível gerar a análise.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "Erro ao conectar com a IA para análise. Verifique o console para mais detalhes.";
  }
};