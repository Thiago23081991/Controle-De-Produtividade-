
import { MatrixData, ManualEntryData } from "../types";

export const analyzeProductivity = async (data: MatrixData | ManualEntryData): Promise<string> => {
  const keys = Object.keys(data);
  if (keys.length === 0) {
    return "⚠️ Não há dados suficientes para análise.";
  }

  const dataString = JSON.stringify(data, null, 2);
  
  // Instrução de sistema mais robusta, orientada a consultoria de performance e mentoria técnica
  const systemInstruction = `
    Você é um Consultor de Excelência Operacional e Mentor Sênior de Customer Success da Suvinil. 
    Sua missão vai além de ler números: você deve diagnosticar a *causa raiz* da performance e prescrever *treinamentos específicos*.
    
    Diretrizes de Análise:
    1. **Diagnóstico de Habilidade**: Diferencie quem tem dificuldade de **Ritmo** (muito tempo por caso) de quem tem dificuldade de **Resolução** (muita tratativa, pouca finalização).
    2. **Mentoria Prática**: Ao sugerir melhorias, nunca diga apenas "melhorar agilidade". Diga COMO. Ex: "Uso de Text Expanders", "Técnica Pomodoro", "Revisão de Scripts de Sondagem".
    3. **Tom de Voz**: Profissional, analítico, mas focado no crescimento humano (Growth Mindset).
    4. **Estrutura**: Use Markdown rico (tabelas, listas, negrito) para facilitar a leitura rápida pelo supervisor.
  `;

  const prompt = `
        Analise minuciosamente estes dados de produtividade da equipe de atendimento Suvinil:
        
        DADOS BRUTOS:
        ${dataString}

        Por favor, gere um RELATÓRIO DE INTELIGÊNCIA OPERACIONAL estruturado nos seguintes tópicos:
        
        1. **📊 Resumo Executivo**
           - Diagnóstico rápido da saúde da operação hoje (Meta atingida? Gargalos críticos?).
        
        2. **🔍 Análise de Eficiência (Matriz de Competência)**
           - Identifique os **Top Performers** (Alta Entrega / Alta Resolução).
           - Identifique os casos de **Atenção** (Alto Esforço / Baixa Entrega).
        
        3. **🛠️ Plano de Desenvolvimento de Habilidades (PDI Prático)**
           *Esta é a parte mais importante. Para os experts com performance abaixo da média, sugira ações concretas.*
           - Liste o **Nome do Expert**.
           - Identifique a **Habilidade a Desenvolver**: (Ex: Gestão de Tempo, Conhecimento de Produto, Negociação, Uso de Ferramentas).
           - Sugira um **Exercício Prático**: (Ex: "Criar 5 atalhos de teclado para saudações", "Acompanhar 3 atendimentos do expert [Top Performer]", "Revisar fluxo de troca de tintas").
        
        4. **💡 Melhoria de Processos**
           - Baseado nos números, existe algum gargalo sistêmico? (Ex: Todos estão com muitas tratativas acumuladas? Isso indica problema no sistema ou processo complexo?).
        
        5. **📝 Insights de Gestão**
           - Observações sobre as justificativas/observações lançadas pelos experts (se houver).
        
        Seja direto, específico e evite obviedades. Foque em ações que o supervisor pode aplicar amanhã.
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
