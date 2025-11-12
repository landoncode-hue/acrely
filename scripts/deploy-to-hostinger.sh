#!/bin/bash
# =============================================================================
# Acrely v2 - Hostinger Deployment Script
# =============================================================================
# Deploy built application to Hostinger via FTP
# Requires: lftp (install via: brew install lftp)
# =============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Load environment
if [ -f ".env.production" ]; then
    set -a
    source .env.production
    set +a
fi

# Configuration
FTP_SERVER="${FTP_SERVER:-ftp.pinnaclegroups.ng}"
FTP_USERNAME="${FTP_USERNAME}"
FTP_PASSWORD="${FTP_PASSWORD}"
FTP_PATH="${FTP_PATH:-/public_html/acrely/}"
LOCAL_BUILD_DIR="apps/web/.next"
LOCAL_PUBLIC_DIR="apps/web/public"

section() {
    echo -e "\n${CYAN}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║ $1${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════════════════════════╝${NC}\n"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Header
clear
section "Acrely v2 - Hostinger Deployment"

# Pre-flight checks
section "Pre-flight Checks"

# Check FTP credentials
if [ -z "$FTP_USERNAME" ] || [ -z "$FTP_PASSWORD" ]; then
    error "FTP credentials not set in .env.production"
    echo ""
    echo "Please set the following in .env.production:"
    echo "  FTP_SERVER=ftp.pinnaclegroups.ng"
    echo "  FTP_USERNAME=your-ftp-username"
    echo "  FTP_PASSWORD=your-ftp-password"
    echo "  FTP_PATH=/public_html/acrely/"
    exit 1
fi
success "FTP credentials found"

# Check if lftp is installed
if ! command -v lftp &> /dev/null; then
    error "lftp is not installed"
    echo ""
    echo "Install with: brew install lftp"
    exit 1
fi
success "lftp is installed"

# Check build directory
if [ ! -d "$LOCAL_BUILD_DIR" ]; then
    error "Build directory not found: $LOCAL_BUILD_DIR"
    echo ""
    echo "Please run: pnpm build"
    exit 1
fi
success "Build directory found"

# Check public directory
if [ ! -d "$LOCAL_PUBLIC_DIR" ]; then
    warning "Public directory not found: $LOCAL_PUBLIC_DIR"
else
    success "Public directory found"
fi

# Confirm deployment
section "Deployment Confirmation"
echo -e "${YELLOW}You are about to deploy to:${NC}"
echo -e "  Server: ${CYAN}$FTP_SERVER${NC}"
echo -e "  Path: ${CYAN}$FTP_PATH${NC}"
echo -e "  Username: ${CYAN}$FTP_USERNAME${NC}"
echo ""
read -p "Continue with deployment? (yes/no): " -r
echo
if [[ ! $REPLY =~ ^[Yy]es$ ]]; then
    warning "Deployment cancelled"
    exit 0
fi

# Create backup of existing deployment
section "Creating Backup"
BACKUP_DIR="backups/deployment-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

info "Downloading current deployment for backup..."
lftp -u "$FTP_USERNAME","$FTP_PASSWORD" "$FTP_SERVER" <<EOF
set ftp:ssl-allow no
mirror --verbose "$FTP_PATH" "$BACKUP_DIR"
bye
EOF

if [ $? -eq 0 ]; then
    success "Backup created: $BACKUP_DIR"
else
    warning "Backup failed, but continuing..."
fi

# Deploy .next directory
section "Deploying Build Files"
info "Uploading .next directory..."

lftp -u "$FTP_USERNAME","$FTP_PASSWORD" "$FTP_SERVER" <<EOF
set ftp:ssl-allow no
set mirror:use-pget-n 5
lcd $LOCAL_BUILD_DIR
cd ${FTP_PATH}.next
mirror --reverse --delete --verbose --parallel=5
bye
EOF

if [ $? -eq 0 ]; then
    success "Build files deployed"
else
    error "Build deployment failed!"
    exit 1
fi

# Deploy public directory
if [ -d "$LOCAL_PUBLIC_DIR" ]; then
    section "Deploying Static Assets"
    info "Uploading public directory..."
    
    lftp -u "$FTP_USERNAME","$FTP_PASSWORD" "$FTP_SERVER" <<EOF
set ftp:ssl-allow no
set mirror:use-pget-n 5
lcd $LOCAL_PUBLIC_DIR
cd ${FTP_PATH}public
mirror --reverse --delete --verbose --parallel=5
bye
EOF

    if [ $? -eq 0 ]; then
        success "Static assets deployed"
    else
        warning "Static assets deployment had issues"
    fi
fi

# Deploy package.json and other necessary files
section "Deploying Configuration Files"
info "Uploading configuration files..."

cd apps/web
lftp -u "$FTP_USERNAME","$FTP_PASSWORD" "$FTP_SERVER" <<EOF
set ftp:ssl-allow no
cd $FTP_PATH
put package.json
bye
EOF

if [ $? -eq 0 ]; then
    success "Configuration files deployed"
else
    warning "Configuration deployment had issues"
fi

cd ../..

# Create/update server.js for Node.js
section "Deploying Server Configuration"
info "Creating server.js..."

cat > /tmp/server.js <<'SERVERJS'
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = false;
const hostname = process.env.HOSTNAME || 'localhost';
const port = process.env.PORT || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  })
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
SERVERJS

lftp -u "$FTP_USERNAME","$FTP_PASSWORD" "$FTP_SERVER" <<EOF
set ftp:ssl-allow no
cd $FTP_PATH
put /tmp/server.js
bye
EOF

if [ $? -eq 0 ]; then
    success "Server configuration deployed"
    rm /tmp/server.js
else
    warning "Server configuration deployment had issues"
fi

# Deployment summary
section "Deployment Complete!"
success "Build files deployed to: ${FTP_PATH}.next/"
success "Static assets deployed to: ${FTP_PATH}public/"
success "Configuration deployed to: $FTP_PATH"

echo ""
echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}Next Steps:${NC}"
echo -e "  1. ${YELLOW}SSH into Hostinger and install dependencies:${NC}"
echo -e "     ${GREEN}ssh $FTP_USERNAME@$FTP_SERVER${NC}"
echo -e "     ${GREEN}cd $FTP_PATH${NC}"
echo -e "     ${GREEN}npm install --production${NC}"
echo ""
echo -e "  2. ${YELLOW}Configure Node.js app in Hostinger cPanel:${NC}"
echo -e "     - Application Root: $FTP_PATH"
echo -e "     - Application Startup File: server.js"
echo -e "     - Node.js Version: 20"
echo ""
echo -e "  3. ${YELLOW}Set environment variables in cPanel:${NC}"
echo -e "     - NEXT_PUBLIC_SUPABASE_URL"
echo -e "     - NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo ""
echo -e "  4. ${YELLOW}Restart the Node.js application${NC}"
echo ""
echo -e "  5. ${YELLOW}Verify deployment:${NC}"
echo -e "     ${GREEN}./scripts/verify-production.sh${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${GREEN}Backup saved to: $BACKUP_DIR${NC}"
echo -e "${GREEN}Deployment completed at: $(date)${NC}"
echo ""
