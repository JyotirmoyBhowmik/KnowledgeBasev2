-- ══════════════════════════════════════════════════════
-- Migration Fix v2: Matches Prisma's actual column types (TEXT ids, no updated_at default)
-- Run ONCE on production server
-- ══════════════════════════════════════════════════════

-- Fix UUID defaults on existing tables (Prisma used text, gen_random_uuid returns uuid, so set to text cast)
ALTER TABLE users ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE roles ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE sections ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE pages ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE modules ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE audit_logs ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE suggestions ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;

-- Fix updated_at to have a default so INSERTs don't fail
ALTER TABLE users ALTER COLUMN updated_at SET DEFAULT NOW();
ALTER TABLE sections ALTER COLUMN updated_at SET DEFAULT NOW();
ALTER TABLE pages ALTER COLUMN updated_at SET DEFAULT NOW();
ALTER TABLE modules ALTER COLUMN updated_at SET DEFAULT NOW();

-- Add missing columns to pages
ALTER TABLE pages ADD COLUMN IF NOT EXISTS template_id TEXT;
ALTER TABLE pages ADD COLUMN IF NOT EXISTS reviewed_by_id TEXT REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE pages ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;

-- Add missing column to modules
ALTER TABLE modules ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Create missing tables (using TEXT for ids to match Prisma schema)
CREATE TABLE IF NOT EXISTS page_versions (
    id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    page_id    TEXT NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
    version    INT NOT NULL,
    snapshot   JSONB NOT NULL,
    changed_by TEXT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS page_templates (
    id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name        TEXT UNIQUE NOT NULL,
    description TEXT,
    modules     JSONB NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS activity_logs (
    id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action      TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id   TEXT NOT NULL,
    details     TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS settings (
    id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    key        TEXT UNIQUE NOT NULL,
    value      TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_activity_user ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_page_versions_page ON page_versions(page_id);
