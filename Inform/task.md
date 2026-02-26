# Remove Prisma → Raw PostgreSQL Migration

## Phase 1: Database Schema Export
- [x] `packages/db/schema.sql` — standalone DDL (11 tables, indexes)
- [x] `packages/db/seed.sql` — roles, admin user, sections, settings

## Phase 2: DatabaseService
- [x] `database/database.service.ts` — pg.Pool with query/queryOne/execute/transaction
- [x] `database/database.module.ts` — global NestJS module

## Phase 3: Rewrite Services (12 files)
- [x] `auth/auth.service.ts`
- [x] `users/users.service.ts`
- [x] `sections/sections.service.ts`
- [x] `pages/pages.service.ts`
- [x] `modules/modules.service.ts`
- [x] `files/files.controller.ts`
- [x] `settings/settings.service.ts`
- [x] `suggestions/suggestions.service.ts`
- [x] `versions/versions.service.ts`
- [x] `templates/templates.service.ts`
- [x] `activity/activity.service.ts`
- [x] `common/interceptors/audit-log.interceptor.ts`

## Phase 4-5: Cleanup
- [x] Updated `app.module.ts` — DatabaseModule replaces PrismaModule
- [x] Removed PrismaModule imports from 4 child modules
- [x] Deleted `apps/backend/src/prisma/` directory
- [x] Removed Prisma from `packages/db/package.json`
- [x] Replaced `@antigravity/db` with `pg` in backend dependencies
- [x] Updated `deploy/almalinux-deploy.sh`

## Phase 6-7: Verification
- [x] Backend builds cleanly (`npx nest build`)
- [x] Zero Prisma references in source code
