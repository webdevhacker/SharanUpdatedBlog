#!/bin/bash
# =============================================================================
# TechBlog — Production Deploy Script
# Usage: bash deploy.sh [--skip-build]
# =============================================================================
set -e

APP_DIR="/var/www/techblog"
BRANCH="main"

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
success "Server dependencies installed"

# ── Build frontend (unless --skip-build) ─────────────────────────────────────
if [[ "$1" != "--skip-build" ]]; then
    log "Installing & building frontend..."
    cd "$APP_DIR/client"
    npm ci
    npm run build
    success "Frontend built → client/dist/"
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
nginx -t || error "NGINX config test failed!"
systemctl reload nginx
success "NGINX reloaded"

# ── Done ──────────────────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}╔══════════════════════════════════════╗${NC}"
echo -e "${GREEN}║       🚀 Deploy Complete! 🚀          ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════╝${NC}"
echo ""
log "PM2 status:"
pm2 status techblog-api
