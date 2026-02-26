-- ══════════════════════════════════════════════════════
-- Knowledge Base — Seed Data
-- Run after schema.sql: psql -d knowledge_base -f seed.sql
-- ══════════════════════════════════════════════════════

-- 1. Roles
INSERT INTO roles (name) VALUES ('viewer'), ('contributor'), ('admin'), ('super_admin')
ON CONFLICT (name) DO NOTHING;

-- 2. Super Admin User (password: admin123, bcrypt hash with 12 rounds)
-- Generate a fresh hash: node -e "require('bcrypt').hash('admin123',12).then(h=>console.log(h))"
-- Below is a pre-computed hash for 'admin123':
INSERT INTO users (email, name, password_hash, auth_source)
VALUES ('admin@company.com', 'Super Admin', '$2b$12$LJ3m4ys3GiMNXBQ8WqJ5/.YCGQEYm0zQXZDjOFGdN2RV3E9rKrXnW', 'local')
ON CONFLICT (email) DO NOTHING;

-- Assign super_admin role to admin user
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r
WHERE u.email = 'admin@company.com' AND r.name = 'super_admin'
ON CONFLICT DO NOTHING;

-- 3. Sections
INSERT INTO sections (name, slug, "order") VALUES
    ('Home', 'home', 0),
    ('Training', 'training', 1),
    ('Knowledge', 'knowledge', 2),
    ('Adoption', 'adoption', 3),
    ('Contact & Suggest', 'contact-suggest', 4)
ON CONFLICT (slug) DO NOTHING;

-- 4. Settings
INSERT INTO settings (key, value) VALUES
    ('site_brand_icon', '🚀'),
    ('favicon', 'favicon.ico')
ON CONFLICT (key) DO NOTHING;
