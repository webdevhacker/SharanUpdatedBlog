#!/bin/bash

# =============================================================================
# TechBlog — Production Deploy Script
# Usage: bash deploy.sh [--skip-build]
# =============================================================================

set -e

APP_DIR="/var/www/blog.isharankumar.com"
BRANCH="main"

# Define your NGINX cache path here (if you use one)
NGINX_CACHE_DIR="/var/cache/nginx"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log()    { echo -e "${BLUE}[$(date '+%H:%M:%S')]${NC} $1"; }
success(){ echo -e "${GREEN}✅ $1${NC}"; }
warn()   { echo -e "${YELLOW}⚠️  $1${NC}"; }
error()  { echo -e "${RED}❌ $1${NC}"; exit 1; }

echo ""
echo -e "${BLUE}╔══════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     TechBlog Deployment Script       ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════╝${NC}"
echo ""

# ── Check we're in the right directory ──────────────────────────────────────
cd "$APP_DIR" || error "App directory not found: $APP_DIR"

# ── Pull latest code ─────────────────────────────────────────────────────────
log "Pulling latest code from $BRANCH..."
git fetch origin
git reset --hard origin/$BRANCH
success "Code updated"

# ── Install server dependencies ───────────────────────────────────────────────
log "Installing server dependencies..."
cd "$APP_DIR/server"
npm ci --omit=dev

# NOTE: If you use a database ORM like Prisma or Sequelize,
# you should run your migration commands right here.
# e.g., npx prisma migrate deploy

success "Server dependencies installed"

# ── Build frontend (unless --skip-build) ─────────────────────────────────────
if [ "$1" != "--skip-build" ]; then
    log "Installing & building frontend..."
    cd "$APP_DIR/client"
    npm ci
    npm run build
    success "Frontend built → client/dist/"

    # Optional: Clear NGINX cache so new frontend assets are served immediately
    if [ -d "$NGINX_CACHE_DIR" ]; then
        log "Clearing NGINX static cache..."
        # Using sudo here in case the script is run as a normal user
        sudo rm -rf ${NGINX_CACHE_DIR}/*
        success "NGINX cache cleared"
    fi
else
    warn "Skipping frontend build (--skip-build)"
fi

cd "$APP_DIR"

# ── Reload PM2 (zero-downtime) ────────────────────────────────────────────────
log "Reloading PM2..."
if pm2 list | grep -q "techblog-api"; then
    pm2 reload ecosystem.config.js --env production
    success "PM2 reloaded"
else
    pm2 start ecosystem.config.js --env production
    pm2 save
    success "PM2 started"
fi

# ── Test & reload NGINX ───────────────────────────────────────────────────────
log "Testing NGINX config..."

# We add 'sudo' here. If you run this script as a non-root user (which is safer),
# standard users do not have permission to test or reload NGINX.
sudo nginx -t || error "NGINX config test failed!"
sudo systemctl reload nginx
success "NGINX reloaded"

# ── Done ──────────────────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}╔══════════════════════════════════════╗${NC}"
echo -e "${GREEN}║        🚀 Deploy Complete! 🚀        ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════╝${NC}"
echo ""
log "PM2 status:"
pm2 status techblog-api