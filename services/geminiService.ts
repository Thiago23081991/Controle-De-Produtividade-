import { GoogleGenAI } from "@google/genai";
import { MatrixData, ManualEntryData, TimeSlot } from "../types";

export const analyzeProductivity = async (data: MatrixData | ManualEntryData): Promise<string> => {
  // Utilizando a API Key fornecida explicitamente.
  const apiKey = "sk-0f2650b9f3384bd288f46137cfe37ae7";

  if (!apiKey) {
    return "API Key não configurada. Não é possível gerar análise com IA.";
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
        - "Observacao": Justificativas operacionais (ex: atestado, falha sistêmica, treinamento, feedback).
        - "isUrgent": Booleano (true/false) que indica se o expert está focado em "Tratativa de Caso de Urgência".
        
        DADOS:
        ${dataString}

        Forneça um resumo executivo estratégico em Português do Brasil seguindo estritamente esta estrutura:

        1. **Destaques de Performance**: Quem é o Top Performer em volume TOTAL e quem mais converteu em FINALIZADOS.
        2. **Eficiência Operacional**: Visão geral da equipe (Proporção de Finalizados vs Tratados).
        3. **Casos de Urgência & Observações**:
           - Liste explicitamente os Experts marcados com urgência ("isUrgent": true) e explique que eles estão em atendimento prioritário, o que justifica números diferentes.
           - Agrupe e sumarize as outras justificativas do campo "Observacao".
        4. **Pontos de Atenção**: Aponte experts com baixa produção não justificada. IMPORTANTE: Se houver "Observacao" (como Atestado) ou "Urgência", ISENTE o expert de crítica negativa.

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