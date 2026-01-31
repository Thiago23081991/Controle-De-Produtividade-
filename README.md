
# Produtividade Service Desk

Ferramenta para gestão e análise de produtividade da equipe de atendimento, permitindo o registro manual de casos e fornecendo insights via Inteligência Artificial.

## 🛠️ Como rodar este projeto

1. **Clone o repositório:**
   ```bash
   git clone <seu-repo-url>
   cd <nome-da-pasta>
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

## 🚀 Configuração do Banco de Dados (Supabase)

Para que o sistema funcione corretamente, é necessário criar a tabela no Supabase.

1. Crie um projeto em [Supabase.com](https://supabase.com).
2. Vá no menu **SQL Editor** no dashboard do Supabase.
3. Clique em **New Query**.
4. Copie todo o conteúdo do arquivo `supabase_setup.sql` que está na raiz deste projeto.
5. Cole no editor do Supabase e clique em **Run**.

Isso criará a tabela `productivity_records`, configurará as permissões e habilitará o Realtime.

## 🔑 Variáveis de Ambiente

O projeto já possui credenciais de demonstração configuradas em `services/supabaseClient.ts`. Para usar seu próprio projeto, crie um arquivo `.env` na raiz:

```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima
```

## Funcionalidades

- **Gestão de Produtividade**:
  - Registro de casos "Tratados" e "Finalizados".
  - Metas individuais e alertas de urgência.
  - Chat em tempo real entre Expert e Supervisão.

- **Inteligência Artificial (Gemini)**:
  - Análise de eficiência e sugestões de PDI (Plano de Desenvolvimento Individual).

## Tecnologias

- React 19 + TypeScript
- Tailwind CSS
- Supabase (PostgreSQL + Realtime)
- Google Gemini API
