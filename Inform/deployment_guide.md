# Knowledge Base — Deployment Guide (Desktop → Production)

## Prerequisites on Production Server
- **Node.js ≥ 20** (your server has Node 24 ✅)
- **PostgreSQL** running
- **Nginx** configured as reverse proxy
- **PM2** for process management
- **Git** access to the repo

---

## Step 1: Pull Latest Code on Server

```bash
# SSH into your server
ssh your-user@your-server-ip

# Navigate to app directory
cd /opt/knowledge_base   # or wherever your app lives

# Pull latest changes
git pull origin main
```

> [!TIP]
> If pulling fails with merge conflicts: `git stash && git pull origin main && git stash pop`

---

## Step 2: Install Dependencies

```bash
npm install --legacy-peer-deps
```

> [!IMPORTANT]
> `--legacy-peer-deps` is required because some packages have peer dependency mismatches.

---

## Step 3: Run Database Schema Migration

```bash
# Apply schema (safe — uses IF NOT EXISTS, won't destroy existing data)
PGPASSWORD="your_db_password" psql -h localhost -U kb_user -d knowledge_base -f packages/db/schema.sql
```

**First time only — run seed:**
```bash
PGPASSWORD="your_db_password" psql -h localhost -U kb_user -d knowledge_base -f packages/db/seed.sql
```

> [!IMPORTANT]
> Replace `kb_user`, `knowledge_base`, and `your_db_password` with your actual DB credentials from your `.env` file.

---

## Step 4: Build Backend

```bash
cd apps/backend
npx nest build
cd ../..
```

Expected output: **silent success** (no output = no errors).

---

## Step 5: Build Frontend

```bash
cd apps/antigravity
npm run build
cd ../..
```

Expected: Shows route compilation, ends with `✓ Compiled successfully`.

---

## Step 6: Restart Services

```bash
pm2 restart all
# Or restart individually:
pm2 restart kb-backend
pm2 restart kb-frontend
```

**Verify processes are running:**
```bash
pm2 status
```

Both should show `online` status with green indicators.

---

## Step 7: Verify Deployment

```bash
# Test backend health
curl http://localhost:3001/api/health

# Test frontend
curl -I http://localhost:3000

# Test login API
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@company.com","password":"admin123"}'
```

All should return `200 OK`.

---

## Troubleshooting

### 🔴 `npm install` fails
```bash
# Clear cache and retry
rm -rf node_modules package-lock.json
npm cache clean --force
npm install --legacy-peer-deps
```

### 🔴 `psql: connection refused`
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql
sudo systemctl start postgresql

# Check pg_hba.conf allows local connections
sudo cat /var/lib/pgsql/data/pg_hba.conf | grep -v '^#'
```

### 🔴 `FATAL: role "kb_user" does not exist`
```bash
sudo -u postgres psql -c "CREATE USER kb_user WITH PASSWORD 'your_password';"
sudo -u postgres psql -c "CREATE DATABASE knowledge_base OWNER kb_user;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE knowledge_base TO kb_user;"
```

### 🔴 `nest build` errors
```bash
# Check Node version (must be ≥20)
node -v

# Common fix: clear build cache
rm -rf apps/backend/dist
npx nest build
```

### 🔴 `npm run build` (frontend) fails
```bash
# Check .env.local exists
cat apps/antigravity/.env.local
# Should contain:
# NEXT_PUBLIC_API_URL=/api

# Clear Next.js cache
rm -rf apps/antigravity/.next
npm run build
```

### 🔴 PM2 shows `errored` status
```bash
# Check logs
pm2 logs kb-backend --lines 50
pm2 logs kb-frontend --lines 50

# Common: DATABASE_URL not set
# Fix: ensure .env file exists in apps/backend/
cat apps/backend/.env
# Should contain: DATABASE_URL=postgresql://kb_user:pass@localhost:5432/knowledge_base
```

### 🔴 Nginx 502 Bad Gateway
```bash
# Check if backend is actually listening
curl http://localhost:3001/api/health

# Check Nginx config
sudo nginx -t
sudo cat /etc/nginx/conf.d/knowledge_base.conf

# Restart Nginx
sudo systemctl restart nginx

# Check SELinux (AlmaLinux specific)
sudo setsebool -P httpd_can_network_connect 1
```

### 🔴 Login works but pages show "Failed to fetch"
```bash
# Nginx not proxying /api correctly
# In your nginx config, ensure:
# location /api/ {
#     proxy_pass http://localhost:3001;
# }
sudo nginx -t && sudo systemctl reload nginx
```

### 🔴 File uploads fail (PDF/Video/Image)
```bash
# Check upload directory exists and has permissions
ls -la /var/lib/kb/
sudo mkdir -p /var/lib/kb/{pdfs,videos,images}
sudo chown -R $(whoami):$(whoami) /var/lib/kb/
```

### 🔴 Database tables missing after schema.sql
```bash
# Verify tables exist
PGPASSWORD="pass" psql -h localhost -U kb_user -d knowledge_base -c "\dt"
# Should list: users, roles, user_roles, sections, pages, modules, etc.

# Re-run schema if needed
PGPASSWORD="pass" psql -h localhost -U kb_user -d knowledge_base -f packages/db/schema.sql
```

---

## Quick Reference — Complete Deploy Command

```bash
ssh user@server
cd /opt/knowledge_base
git pull origin main
npm install --legacy-peer-deps
PGPASSWORD="pass" psql -h localhost -U kb_user -d knowledge_base -f packages/db/schema.sql
cd apps/backend && npx nest build && cd ../..
cd apps/antigravity && npm run build && cd ../..
pm2 restart all
pm2 status
```
