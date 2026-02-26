-- Add views column to pages table (run on server)
ALTER TABLE pages ADD COLUMN IF NOT EXISTS views INT NOT NULL DEFAULT 0;
