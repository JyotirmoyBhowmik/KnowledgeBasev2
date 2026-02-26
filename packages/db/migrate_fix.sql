-- ══════════════════════════════════════════════════════
-- Migration Fix: Switch existing tables from uuid_generate_v4() to gen_random_uuid()
-- and create any missing tables
-- Run this ONCE on the production server
-- ══════════════════════════════════════════════════════

-- Fix existing table defaults (Prisma had set uuid_generate_v4 which needs an extension)
ALTER TABLE users ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE roles ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE sections ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE pages ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE modules ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE audit_logs ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE suggestions ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Add missing columns to pages (if not already present from Prisma migration)
DO $$ BEGIN
    ALTER TABLE pages ADD COLUMN IF NOT EXISTS template_id TEXT;
    ALTER TABLE pages ADD COLUMN IF NOT EXISTS reviewed_by_id UUID REFERENCES users(id) ON DELETE SET NULL;
    ALTER TABLE pages ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Add missing column to modules
DO $$ BEGIN
    ALTER TABLE modules ADD COLUMN IF NOT EXISTS metadata JSONB;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Create missing tables
CREATE TABLE IF NOT EXISTS page_versions (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id    UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
    version    INT NOT NULL,
    snapshot   JSONB NOT NULL,
    changed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS page_templates (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT UNIQUE NOT NULL,
    description TEXT,
    modules     JSONB NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS activity_logs (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action      TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id   TEXT NOT NULL,
    details     TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS settings (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key        TEXT UNIQUE NOT NULL,
    value      TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for new tables
CREATE INDEX IF NOT EXISTS idx_activity_user ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_page_versions_page ON page_versions(page_id);
