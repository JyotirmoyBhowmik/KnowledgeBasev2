-- ══════════════════════════════════════════════════════
-- Knowledge Base — PostgreSQL Schema (standalone, no Prisma)
-- Uses gen_random_uuid() — built into PostgreSQL 13+
-- ══════════════════════════════════════════════════════

-- ─── Auth & Users ────────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email         TEXT UNIQUE NOT NULL,
    name          TEXT,
    auth_source   TEXT NOT NULL DEFAULT 'local',
    password_hash TEXT,
    status        TEXT NOT NULL DEFAULT 'active',
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS roles (
    id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS user_roles (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- ─── Content Engine ──────────────────────────────────

CREATE TABLE IF NOT EXISTS sections (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id     UUID REFERENCES sections(id) ON DELETE SET NULL,
    name          TEXT NOT NULL,
    slug          TEXT UNIQUE NOT NULL,
    route         TEXT,
    roles_allowed JSONB,
    "order"       INT NOT NULL DEFAULT 0,
    icon          TEXT,
    visible       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pages (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_id      UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
    title           TEXT NOT NULL,
    slug            TEXT UNIQUE NOT NULL,
    status          TEXT NOT NULL DEFAULT 'draft',
    show_author     BOOLEAN NOT NULL DEFAULT TRUE,
    show_metrics    BOOLEAN NOT NULL DEFAULT TRUE,
    icon            TEXT,
    template_id     TEXT,
    created_by_id   UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_by_id   UUID REFERENCES users(id) ON DELETE SET NULL,
    reviewed_by_id  UUID REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at     TIMESTAMPTZ,
    deleted_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS modules (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id    UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
    type       TEXT NOT NULL,
    content    TEXT,
    file_path  TEXT,
    url        TEXT,
    title      TEXT,
    metadata   JSONB,
    "order"    INT NOT NULL DEFAULT 0,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Versioning ──────────────────────────────────────

CREATE TABLE IF NOT EXISTS page_versions (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id    UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
    version    INT NOT NULL,
    snapshot   JSONB NOT NULL,
    changed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Templates ───────────────────────────────────────

CREATE TABLE IF NOT EXISTS page_templates (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT UNIQUE NOT NULL,
    description TEXT,
    modules     JSONB NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Activity Tracking ──────────────────────────────

CREATE TABLE IF NOT EXISTS activity_logs (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action      TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id   TEXT NOT NULL,
    details     TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Audit & Suggestions ────────────────────────────

CREATE TABLE IF NOT EXISTS audit_logs (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
    action      TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id   TEXT NOT NULL,
    before      JSONB,
    after       JSONB,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS suggestions (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID REFERENCES users(id) ON DELETE SET NULL,
    message    TEXT NOT NULL,
    status     TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Settings ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS settings (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key        TEXT UNIQUE NOT NULL,
    value      TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Indexes ─────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_pages_section ON pages(section_id);
CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);
CREATE INDEX IF NOT EXISTS idx_pages_status ON pages(status);
CREATE INDEX IF NOT EXISTS idx_modules_page ON modules(page_id);
CREATE INDEX IF NOT EXISTS idx_sections_slug ON sections(slug);
CREATE INDEX IF NOT EXISTS idx_sections_parent ON sections(parent_id);
CREATE INDEX IF NOT EXISTS idx_activity_user ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_page_versions_page ON page_versions(page_id);
