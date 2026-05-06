ALTER TABLE productivity_records ADD COLUMN IF NOT EXISTS lojas_online INT DEFAULT 0;
ALTER TABLE monthly_productivity ADD COLUMN IF NOT EXISTS lojas_online INT DEFAULT 0;
