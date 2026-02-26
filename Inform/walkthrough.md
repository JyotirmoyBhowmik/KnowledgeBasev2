# Prisma → Raw PostgreSQL Migration — Walkthrough

## What Changed

Completely removed **Prisma ORM** from the project and replaced it with **`pg` (node-postgres)** for direct PostgreSQL access.

### New Files Created
| File | Purpose |
|------|---------|
| [schema.sql](file:///home/genai/knowledge_base/packages/db/schema.sql) | Standalone DDL — 11 tables with indexes and constraints |
| [seed.sql](file:///home/genai/knowledge_base/packages/db/seed.sql) | SQL seed — roles, admin user, sections, settings |
| [database.service.ts](file:///home/genai/knowledge_base/apps/backend/src/database/database.service.ts) | `pg.Pool` wrapper with `query()`, `queryOne()`, `execute()`, `transaction()` |
| [database.module.ts](file:///home/genai/knowledge_base/apps/backend/src/database/database.module.ts) | Global NestJS module (replaces PrismaModule) |

### 12 Services Rewritten (Prisma → Raw SQL)

| Service | Key Changes |
|---------|-------------|
| `auth.service.ts` | LEFT JOIN for user+roles, parameterized queries |
| `users.service.ts` | JSON aggregation for roles, ON CONFLICT for upserts |
| `sections.service.ts` | JSON aggregation for pages, transaction-based reorder |
| `pages.service.ts` | Dynamic UPDATE builder, approval workflow, trash management |
| `modules.service.ts` | Dynamic UPDATE builder, transaction-based reorder |
| `files.controller.ts` | Single query for module file lookup |
| `settings.service.ts` | ON CONFLICT upsert pattern |
| `suggestions.service.ts` | LEFT JOIN for user info |
| `versions.service.ts` | JSON snapshot/restore with module recreation |
| `templates.service.ts` | JSONB storage for template modules |
| `activity.service.ts` | Dynamic WHERE filter building |
| `audit-log.interceptor.ts` | Direct INSERT with JSON.stringify |

### Files Deleted
- `apps/backend/src/prisma/prisma.service.ts`
- `apps/backend/src/prisma/prisma.module.ts`

### Dependencies Changed
- **Removed**: `@prisma/client`, `@prisma/adapter-pg`, `prisma`, `@prisma/config`
- **Added**: `pg`, `@types/pg` (in backend)
- **Removed**: `@antigravity/db` workspace dependency from backend

## Deployment (Updated)

```bash
# 1. Initialize/update database schema (replaces prisma db push)
PGPASSWORD="yourpass" psql -h localhost -U kb_user -d knowledge_base -f packages/db/schema.sql

# 2. Seed (first time only)
PGPASSWORD="yourpass" psql -h localhost -U kb_user -d knowledge_base -f packages/db/seed.sql

# 3. Build backend
cd apps/backend && npx nest build

# 4. Build frontend
cd apps/antigravity && npm run build

# 5. Restart
pm2 restart all
```

## Build Verification
- ✅ `npx nest build` — compiles successfully, zero errors
- ✅ Zero Prisma references in source code (`grep -r prisma src/` returns nothing)
- ✅ `npm install` succeeds without Prisma Node.js version conflicts
