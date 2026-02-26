-- Add missing icon column to pages table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name='pages' AND column_name='icon'
    ) THEN
        ALTER TABLE pages ADD COLUMN icon TEXT;
    END IF;
END $$;
