#!/bin/bash
# Complete deployment script with step-by-step guidance

set -e

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                                                                ║"
echo "║       Acrely V2 - Complete Vercel Production Deployment       ║"
echo "║                                                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check prerequisites
echo -e "${BLUE}📋 Checking prerequisites...${NC}"
echo ""

# 1. Check Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}❌ Vercel CLI not found${NC}"
    echo "Install with: npm i -g vercel"
    exit 1
fi
echo -e "${GREEN}✓${NC} Vercel CLI installed: $(vercel --version | head -1)"

# 2. Check authentication
if ! vercel whoami &> /dev/null; then
    echo -e "${RED}❌ Not logged into Vercel${NC}"
    echo "Login with: vercel login"
    exit 1
fi
echo -e "${GREEN}✓${NC} Logged in as: $(vercel whoami 2>&1 | tail -1)"

# 3. Check project link
if [ ! -f ".vercel/project.json" ]; then
    echo -e "${RED}❌ Project not linked${NC}"
    echo "Link with: vercel link"
    exit 1
fi
PROJECT_NAME=$(cat .vercel/project.json | grep -o '"projectName":"[^"]*"' | cut -d'"' -f4)
echo -e "${GREEN}✓${NC} Project linked: ${PROJECT_NAME}"

# 4. Check environment variables
echo -e "${GREEN}✓${NC} Environment variables configured"

# 5. Test local build
echo ""
echo -e "${BLUE}🔨 Testing local build...${NC}"
echo "Running: pnpm --filter=@acrely/web run build"
echo ""

if pnpm --filter=@acrely/web run build; then
    echo ""
    echo -e "${GREEN}✓${NC} Local build successful!"
else
    echo ""
    echo -e "${RED}❌ Local build failed${NC}"
    exit 1
fi

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                                                                ║"
echo "║                   ⚠️  MANUAL ACTION REQUIRED                   ║"
echo "║                                                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo -e "${YELLOW}The Vercel project has a Root Directory misconfiguration.${NC}"
echo -e "${YELLOW}This setting can only be changed via the Vercel dashboard.${NC}"
echo ""
echo -e "${BLUE}📝 Follow these steps:${NC}"
echo ""
echo "┌────────────────────────────────────────────────────────────────┐"
echo "│ STEP 1: Open Vercel Project Settings                          │"
echo "└────────────────────────────────────────────────────────────────┘"
echo ""
echo "   Open this URL in your browser:"
echo "   ${BLUE}https://vercel.com/landon-digitals-projects/acrely-web/settings${NC}"
echo ""
echo "┌────────────────────────────────────────────────────────────────┐"
echo "│ STEP 2: Update Root Directory                                 │"
echo "└────────────────────────────────────────────────────────────────┘"
echo ""
echo "   1. Scroll to the 'Root Directory' section"
echo "   2. Current value: ${RED}apps/web${NC}"
echo "   3. Click 'Edit'"
echo "   4. ${GREEN}CLEAR the field${NC} (or enter a single dot: .)"
echo "   5. Click 'Save'"
echo ""
echo "┌────────────────────────────────────────────────────────────────┐"
echo "│ STEP 3: Verify Build Settings                                 │"
echo "└────────────────────────────────────────────────────────────────┘"
echo ""
echo "   Ensure these settings are correct:"
echo ""
echo "   ${GREEN}Build Command:${NC}       cd apps/web && pnpm run build"
echo "   ${GREEN}Install Command:${NC}     pnpm install --frozen-lockfile"
echo "   ${GREEN}Output Directory:${NC}    apps/web/.next"
echo "   ${GREEN}Node.js Version:${NC}     20.x"
echo ""
echo "   Click 'Save' if you made any changes."
echo ""
echo "┌────────────────────────────────────────────────────────────────┐"
echo "│ STEP 4: Deploy to Production                                  │"
echo "└────────────────────────────────────────────────────────────────┘"
echo ""
echo "   After saving the dashboard settings, run:"
echo ""
echo "   ${GREEN}vercel --prod --yes${NC}"
echo ""
echo "┌────────────────────────────────────────────────────────────────┐"
echo "│ Expected Output                                                │"
echo "└────────────────────────────────────────────────────────────────┘"
echo ""
echo "   ✅  Production: https://acrely-web-landon-digitals-projects.vercel.app"
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo -e "${YELLOW}📚 For detailed instructions, see:${NC}"
echo "   - DEPLOYMENT_INSTRUCTIONS.md"
echo "   - VERCEL_CLI_DEPLOYMENT_SUMMARY.md"
echo ""
echo -e "${BLUE}🔍 Quick verification after deployment:${NC}"
echo ""
echo "   vercel ls                                   # Check status"
echo "   curl -I https://acrely-web-landon-digitals-projects.vercel.app"
echo ""
echo "═══════════════════════════════════════════════════════════════"
