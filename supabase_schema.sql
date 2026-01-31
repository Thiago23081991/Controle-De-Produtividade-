-- Enable Row Level Security (RLS)
-- alter table productivity_records enable row level security;

-- Tabela Principal de Registros de Produtividade
CREATE TABLE IF NOT EXISTS productivity_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE NOT NULL,
    expert_name TEXT NOT NULL,
    tratado INTEGER DEFAULT 0,
    finalizado INTEGER DEFAULT 0,
    goal INTEGER DEFAULT 0,
    observacao TEXT,
    is_urgent BOOLEAN DEFAULT FALSE,
    manager_message TEXT,
    expert_message TEXT,
    target_supervisor TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    
    -- Constraint to prevent duplicate records for same expert on same day
    UNIQUE(date, expert_name)
);

-- Index for faster querying by date and expert
CREATE INDEX IF NOT EXISTS idx_productivity_date ON productivity_records(date);
CREATE INDEX IF NOT EXISTS idx_productivity_expert ON productivity_records(expert_name);

-- Tabela de Experts (Para substituir o hardcoded)
CREATE TABLE IF NOT EXISTS experts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    matricula TEXT UNIQUE NOT NULL,
    login TEXT UNIQUE,
    name TEXT NOT NULL,
    supervisor TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Index for lookup by matricula or login
CREATE INDEX IF NOT EXISTS idx_experts_matricula ON experts(matricula);
CREATE INDEX IF NOT EXISTS idx_experts_login ON experts(login);

-- RLS Policies (Opcional - Como o app usa chave anon e não auth real por enquanto, pode ser permissivo ou restritivo dependendo do setup)
-- Para desenvolvimento rápido sem Auth, geralmente desabilita RLS ou cria policy publica:
-- create policy "Enable all access for all users" on productivity_records for all using (true) with check (true);
-- create policy "Enable read access for all users" on experts for select using (true);
