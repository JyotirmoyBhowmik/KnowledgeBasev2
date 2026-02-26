# Knowledge Bites (Enterprise Knowledge Platform)

A secure, maintainable, on-prem enterprise knowledge-base platform unifying Training, Knowledge, Adoption, and Suggestion workflows under a single, role-controlled interface.

Built with **Next.js 16** + **React 19** + **NestJS 11** + **PostgreSQL 18** + **Prisma 7**.

---

## Architecture

```text
knowledge_base/
├── apps/
│   ├── antigravity/         # Next.js 16 frontend (port 3000)
│   └── backend/             # NestJS 11 backend (port 4000)
├── packages/
│   └── db/                  # Prisma 7 schema + seed
├── deploy/
│   ├── nginx/nginx.conf     # Reverse proxy + security headers
│   └── almalinux-deploy.sh  # Bare-metal deploy script
├── docker-compose.yml       # Full-stack containerized deployment
└── .github/workflows/ci.yml # CI/CD pipeline
```

## Quick Start (Development)

```bash
# 1. Prerequisites: PostgreSQL running, database "knowledge_base" created

# 2. Environment
cp apps/backend/.env.example apps/backend/.env
# Edit DATABASE_URL, JWT_SECRET

# 3. Install
npm install

# 4. Database Setup & Generate
cd packages/db && npx prisma db push && npx prisma generate

# 5. Seed (14 Copilot Adoption pages + admin user)
npx ts-node packages/db/prisma/seed.ts

# 6. Run
cd apps/backend && npm run start:dev   # → http://localhost:4000
cd apps/antigravity && npm run dev     # → http://localhost:3000
```

**Default admin:** `admin@company.com` / `admin123`

## Deployment (Production)

### Docker Compose
```bash
docker-compose up -d --build
```

### AlmaLinux Bare-Metal
```bash
chmod +x deploy/almalinux-deploy.sh
./deploy/almalinux-deploy.sh
```
A complete deployment guide with Certbot TLS configuration is available.

## API Endpoints

| Module | Endpoints | Auth |
|--------|-----------|------|
| Auth | `POST /api/auth/login`, `/register` | Public |
| Users | `GET/PATCH /api/users` | Admin |
| Sections | `CRUD /api/sections` + `/tree` | Mixed |
| Pages | `CRUD /api/pages` + `/publish`, `/archive` | Mixed |
| Modules | `CRUD /api/modules` + `/reorder` | Mixed |
| Suggestions| `POST /api/suggestions`, `GET /api/suggestions` | Mixed |
| Files | `POST /api/files/upload`, `GET /api/files/:id` | Auth |

## Security (VAPT-Hardened)

- **Headers:** HSTS, CSP strict, X-Frame-Options DENY, nosniff, Referrer-Policy
- **Auth:** JWT (8h expiry) + bcrypt (12 rounds) + RBAC guards
- **Files:** Multer validation (PDF ≤100MB, Video ≤500MB), permission-checked serving
- **Audit:** Every mutating API call logged with before/after JSONB snapshots
- **Rate Limiting:** Nginx (30r/s API, 5r/m login)

## Content: Copilot Adoption Package (Pre-loaded)

The seed script includes **14 ready-to-use pages** covering Microsoft Copilot adoption:

| Section | Pages |
|---------|-------|
| Adoption | Roadmap, Business Value & ROI, Security & Privacy |
| Training | Chat, Excel Mastery, PowerPoint, Word, Role Playbooks |
| Knowledge | Prompt Library (200+), Top 20 Use Cases, Troubleshooting, Success Stories |

## Tech Stack (2026 LTS)

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16.1.x + React 19.2.x + Tailwind CSS 4.2.x |
| Backend | NestJS 11.x + Node.js 24 LTS |
| Database | PostgreSQL 18.x + Prisma 7.4.x |
| Auth | JWT + bcrypt + RBAC guards |
| Deployment | Docker / PM2 + Nginx (AlmaLinux 9) |

---
*Prepared by Jyotirmoy Bhowmik · February 2026*
