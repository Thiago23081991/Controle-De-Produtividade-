# Produtividade Service Desk

Ferramenta para gestão e análise de produtividade da equipe de atendimento, permitindo o registro manual de casos e fornecendo insights via Inteligência Artificial.

## Funcionalidades

- **Gestão de Produtividade**:
  - Registro de casos "Tratados" (em andamento) e "Finalizados".
  - Definição e acompanhamento de **Metas** individuais.
  - Checkbox para sinalizar **Casos Urgentes** (🚨).
  - Campo de observação para justificativas (Atestados, falhas, etc.).

- **Indicadores Visuais**:
  - Cálculo automático de eficiência (%).
  - Destaque para **Top Performer** (🏆).
  - Indicador de **Meta Batida** (🎯).
  - Gráfico de barras comparativo (Tratado vs Finalizado vs Meta).

- **Inteligência Artificial (Gemini)**:
  - Geração de resumos executivos detalhados.
  - Análise de performance e pontos de atenção.

- **Utilitários**:
  - Persistência de dados local (LocalStorage).
  - Exportação para **CSV** (Excel).
  - Cópia de relatório em formato **Markdown** para comunicação rápida.
  - Navegação via teclado para preenchimento rápido.

## Tecnologias Utilizadas

- **Frontend**: React 19, TypeScript, Tailwind CSS.
- **AI**: Google GenAI SDK (Gemini 2.5 Flash).
- **Ícones**: Lucide React.

## Como Executar

Este projeto foi desenhado para rodar em ambientes web modernos que suportam ES Modules.

1. Configure a variável de ambiente `API_KEY` com sua chave do Google Gemini.
2. Inicie a aplicação.

## Estrutura do Projeto

- `App.tsx`: Componente principal e lógica de estado.
- `services/geminiService.ts`: Integração com a API do Google Gemini.
- `utils/parser.ts`: Lista de Experts e utilitários de parsing.
- `components/`: Componentes de UI (Gráficos, Tabelas).
