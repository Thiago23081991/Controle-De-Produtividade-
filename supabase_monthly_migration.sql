
-- Create monthly_productivity table
CREATE TABLE IF NOT EXISTS monthly_productivity (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    expert_name TEXT NOT NULL,
    month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
    year INTEGER NOT NULL CHECK (year >= 2000),
    tratado INTEGER DEFAULT 0,
    finalizado INTEGER DEFAULT 0,
    goal INTEGER DEFAULT 0,
    observacao TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    
    -- Constraint to ensure one record per expert per month
    UNIQUE(expert_name, month, year)
);

-- Index for faster lookup
CREATE INDEX IF NOT EXISTS idx_monthly_prod_expert_date ON monthly_productivity(expert_name, month, year);
