<<<<<<< HEAD
# Enterprise Knowledge Base (Antigravity)

Secure, maintainable, on-prem enterprise knowledge-base platform built with **NestJS** + **Next.js 14** + **PostgreSQL** + **Prisma**.

---

## Architecture

```
knowledge_base/
├── apps/
│   ├── antigravity/         # Next.js 14 frontend (port 3000)
│   └── backend/             # NestJS backend (port 4000)
├── packages/
│   └── db/                  # Prisma schema + seed
├── deploy/
│   ├── nginx/nginx.conf     # Reverse proxy + security headers
│   └── almalinux-deploy.sh  # Bare-metal deploy script
├── docker-compose.yml       # Full-stack containerised deployment
└── .github/workflows/ci.yml # CI/CD pipeline
```

## Quick Start (Development)

```bash
# 1. Prerequisites: PostgreSQL running, database "knowledge_base" created

# 2. Environment
cp apps/backend/.env.example apps/backend/.env
# Edit DATABASE_URL, JWT_SECRET

# 3. Install & Generate
npm install
cd packages/db && npx prisma db push && npx prisma generate

# 4. Seed (12 Copilot Adoption pages + admin user)
npx ts-node packages/db/prisma/seed.ts

# 5. Run
cd apps/backend && npm run start:dev   # → http://localhost:4000
cd apps/antigravity && npm run dev     # → http://localhost:3000
```

**Default admin:** `admin@company.com` / `admin123`

## Deployment (Production)

### Docker Compose
```bash
DB_PASSWORD=secure_password JWT_SECRET=your_secret docker compose up -d
```

### AlmaLinux Bare-Metal
```bash
chmod +x deploy/almalinux-deploy.sh
./deploy/almalinux-deploy.sh
```

## API Endpoints

| Module | Endpoints | Auth |
|--------|-----------|------|
| Auth | `POST /api/auth/login`, `/register` | Public |
| Users | `GET/PATCH /api/users` | Admin |
| Sections | `CRUD /api/sections` | Mixed |
| Pages | `CRUD /api/pages` + `/publish`, `/archive` | Mixed |
| Modules | `CRUD /api/modules` + `/reorder` | Mixed |
| Menus | `CRUD /api/menus` + `/tree` | Mixed |
| Files | `POST /api/files/upload`, `GET /api/files/:id` | Auth |

## Security (VAPT-Hardened)

- **Headers:** HSTS, CSP strict, X-Frame-Options DENY, nosniff, Referrer-Policy
- **Auth:** JWT (8h expiry) + bcrypt (12 rounds) + RBAC guards
- **Files:** Multer validation (PDF ≤100MB, Video ≤500MB), permission-checked serving
- **Audit:** Every mutating API call logged with before/after JSONB snapshots
- **Rate Limiting:** Nginx (30r/s API, 5r/m login)

## Content: Copilot Adoption Package (Pre-loaded)

The seed script includes **12 ready-to-use pages** covering Microsoft Copilot adoption:

| Section | Pages |
|---------|-------|
| Adoption | Roadmap, Business Value & ROI, Security & Privacy |
| Training | Chat, Excel Mastery, PowerPoint, Word, Role Playbooks |
| Knowledge | Prompt Library (200+), Top 20 Use Cases, Troubleshooting, Success Stories |

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14 + React 19 + Tailwind CSS |
| Backend | NestJS + TypeScript |
| Database | PostgreSQL 16 + Prisma |
| Auth | JWT + bcrypt + RBAC guards |
| Deployment | Docker / PM2 + Nginx |

---

*SOW Version 1.0 · Prepared by Jyotirmoy Bhowmik · 25 February 2026*
=======
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
>>>>>>> 8304246ff015c9067439e928a3fe448d0116dc11
