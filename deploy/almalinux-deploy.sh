#!/usr/bin/env bash
# ─────────────────────────────────────────────────────
# AlmaLinux Bare-Metal Deployment Script
# Enterprise Knowledge Base (Antigravity)
# ─────────────────────────────────────────────────────
set -euo pipefail

APP_DIR="/opt/knowledge-base"
UPLOAD_DIR="/var/lib/kb"
DB_NAME="knowledge_base"
DB_USER="postgres"
NODE_VERSION="24"

echo "═══════════════════════════════════════════════"
echo "  Enterprise Knowledge Base - AlmaLinux Setup"
echo "═══════════════════════════════════════════════"

# 1. System packages
echo "→ Installing system dependencies..."
sudo dnf install -y epel-release
sudo dnf install -y nginx postgresql-server postgresql certbot python3-certbot-nginx
sudo postgresql-setup --initdb 2>/dev/null || true
sudo systemctl enable --now postgresql nginx

# 2. Node.js (LTS)
echo "→ Installing Node.js ${NODE_VERSION}..."
curl -fsSL https://rpm.nodesource.com/setup_${NODE_VERSION}.x | sudo bash -
sudo dnf install -y nodejs
sudo npm install -g pm2

# 3. Database
echo "→ Setting up PostgreSQL..."
sudo -u postgres psql -c "CREATE DATABASE ${DB_NAME};" 2>/dev/null || true
sudo -u postgres psql -c "ALTER USER ${DB_USER} WITH PASSWORD 'changeme';" 2>/dev/null || true

# 4. File storage
echo "→ Creating upload directories..."
sudo mkdir -p ${UPLOAD_DIR}/{pdfs,videos}
sudo chown -R $(whoami):$(whoami) ${UPLOAD_DIR}

# 5. Application
echo "→ Deploying application..."
echo "→ Deploying application..."
sudo mkdir -p ${APP_DIR}
sudo rsync -av --exclude 'node_modules' --exclude '.next' --exclude 'dist' ./ ${APP_DIR}/
cd ${APP_DIR}

npm install --legacy-peer-deps
PGPASSWORD="$DB_PASS" psql -h localhost -U "$DB_USER" -d "$DB_NAME" -f packages/db/schema.sql
cd apps/backend && npx nest build && cd ../..
cd apps/antigravity && npm run build && cd ../..

# 6. PM2 process management
echo "→ Starting services with PM2..."
cd ${APP_DIR}/apps/backend
pm2 start dist/main.js --name kb-backend --env PORT=4000

cd ${APP_DIR}/apps/antigravity
pm2 start "npx next start" --name kb-frontend

pm2 save
pm2 startup

echo ""
echo "═══════════════════════════════════════════════"
echo "  ✅ Deployment complete!"
echo "  Backend:   http://localhost:4000"
echo "  Frontend:  http://localhost:3000"
echo "  Nginx:     http://localhost:80"
echo "  HTTPS:     Run 'sudo certbot --nginx' to configure secure port 443"
echo "═══════════════════════════════════════════════"
