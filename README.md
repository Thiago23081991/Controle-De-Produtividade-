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
- **Deploy**: Vercel (Serverless Functions).

## Configuração e Instalação

### 1. Obter API Key
Gere uma chave gratuita no [Google AI Studio](https://aistudio.google.com/app/apikey).

### 2. Ambiente Local
Crie um arquivo chamado `.env` na raiz do projeto e adicione sua chave:

```env
API_KEY=AIzaSuaChaveAqui
VITE_API_KEY=AIzaSuaChaveAqui
```

### 3. Produção (Vercel)
Se estiver hospedando na Vercel:
1. Vá em **Settings** > **Environment Variables**.
2. Adicione uma chave chamada `API_KEY` com o valor da sua credencial Google.
3. Faça um **Redeploy** para aplicar as alterações.

## Estrutura do Projeto

- `App.tsx`: Componente principal e lógica de estado.
- `api/analyze.ts`: Função Serverless (Backend Vercel) para proteger a API Key.
- `services/geminiService.ts`: Integração híbrida (Serverless + Fallback Client-Side).
- `utils/parser.ts`: Lista de Experts e utilitários de parsing.
- `components/`: Componentes de UI (Gráficos, Tabelas).