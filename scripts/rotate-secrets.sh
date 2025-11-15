#!/bin/bash
# Secret Rotation Script for Acrely v2
# Purpose: Securely rotate all API keys and secrets
# Run this ONLY after generating new keys in respective dashboards

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔐 Acrely v2 - Secret Rotation Script${NC}"
echo "========================================"
echo ""

# Function to prompt for secret
prompt_secret() {
    local var_name=$1
    local description=$2
    local current_value=$3
    
    echo -e "${YELLOW}$description${NC}"
    if [ -n "$current_value" ]; then
        echo -e "Current (first 20 chars): ${current_value:0:20}..."
    fi
    read -p "Enter new value (or press Enter to skip): " new_value
    
    if [ -z "$new_value" ]; then
        echo -e "${RED}Skipped${NC}"
        echo ""
        return 1
    else
        eval "$var_name='$new_value'"
        echo -e "${GREEN}✓ Set${NC}"
        echo ""
        return 0
    fi
}

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}❌ Supabase CLI not found${NC}"
    echo "Install with: npm install -g supabase"
    exit 1
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}⚠️  Vercel CLI not found (optional)${NC}"
    echo "Install with: npm install -g vercel"
    VERCEL_AVAILABLE=false
else
    VERCEL_AVAILABLE=true
fi

echo -e "${BLUE}Step 1: Collect New Secrets${NC}"
echo "----------------------------"
echo ""

# Supabase Service Role Key
prompt_secret NEW_SERVICE_KEY "1. Supabase Service Role Key (CRITICAL)" && SERVICE_KEY_CHANGED=true

# Termii API Key
prompt_secret NEW_TERMII_KEY "2. Termii API Key (CRITICAL)" && TERMII_KEY_CHANGED=true

# Supabase Anon Key (optional)
prompt_secret NEW_ANON_KEY "3. Supabase Anon Key (optional)" && ANON_KEY_CHANGED=true

# Verify at least one secret was provided
if [ "$SERVICE_KEY_CHANGED" != true ] && [ "$TERMII_KEY_CHANGED" != true ]; then
    echo -e "${RED}❌ No secrets provided. Exiting.${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}Step 2: Update Supabase Edge Function Secrets${NC}"
echo "----------------------------------------------"
echo ""

# Link to Supabase project
echo "Linking to Supabase project..."
if supabase link --project-ref qenqilourxtfxchkawek; then
    echo -e "${GREEN}✓ Linked successfully${NC}"
else
    echo -e "${RED}❌ Failed to link. Please run 'supabase login' first.${NC}"
    exit 1
fi
echo ""

# Update Service Role Key
if [ "$SERVICE_KEY_CHANGED" = true ]; then
    echo "Updating SUPABASE_SERVICE_ROLE_KEY..."
    if supabase secrets set SUPABASE_SERVICE_ROLE_KEY="$NEW_SERVICE_KEY"; then
        echo -e "${GREEN}✓ SUPABASE_SERVICE_ROLE_KEY updated${NC}"
    else
        echo -e "${RED}❌ Failed to update SUPABASE_SERVICE_ROLE_KEY${NC}"
    fi
    echo ""
fi

# Update Termii API Key
if [ "$TERMII_KEY_CHANGED" = true ]; then
    echo "Updating TERMII_API_KEY..."
    if supabase secrets set TERMII_API_KEY="$NEW_TERMII_KEY"; then
        echo -e "${GREEN}✓ TERMII_API_KEY updated${NC}"
    else
        echo -e "${RED}❌ Failed to update TERMII_API_KEY${NC}"
    fi
    echo ""
fi

echo ""
echo -e "${BLUE}Step 3: Update Local Environment Files${NC}"
echo "----------------------------------------"
echo ""

# Update .env.local
if [ -f ".env.local" ]; then
    echo "Updating .env.local..."
    cp .env.local .env.local.backup.$(date +%Y%m%d_%H%M%S)
    
    if [ "$SERVICE_KEY_CHANGED" = true ]; then
        if grep -q "SUPABASE_SERVICE_ROLE_KEY" .env.local; then
            sed -i.bak "s|SUPABASE_SERVICE_ROLE_KEY=.*|SUPABASE_SERVICE_ROLE_KEY=$NEW_SERVICE_KEY|" .env.local
            echo -e "${GREEN}✓ Updated SUPABASE_SERVICE_ROLE_KEY in .env.local${NC}"
        else
            echo "SUPABASE_SERVICE_ROLE_KEY=$NEW_SERVICE_KEY" >> .env.local
            echo -e "${GREEN}✓ Added SUPABASE_SERVICE_ROLE_KEY to .env.local${NC}"
        fi
    fi
    
    if [ "$TERMII_KEY_CHANGED" = true ]; then
        if grep -q "TERMII_API_KEY" .env.local; then
            sed -i.bak "s|TERMII_API_KEY=.*|TERMII_API_KEY=$NEW_TERMII_KEY|" .env.local
            echo -e "${GREEN}✓ Updated TERMII_API_KEY in .env.local${NC}"
        else
            echo "TERMII_API_KEY=$NEW_TERMII_KEY" >> .env.local
            echo -e "${GREEN}✓ Added TERMII_API_KEY to .env.local${NC}"
        fi
    fi
    
    rm -f .env.local.bak
fi

# Update apps/web/.env.local
if [ -f "apps/web/.env.local" ]; then
    echo "Updating apps/web/.env.local..."
    cp apps/web/.env.local apps/web/.env.local.backup.$(date +%Y%m%d_%H%M%S)
    
    if [ "$SERVICE_KEY_CHANGED" = true ]; then
        if grep -q "SUPABASE_SERVICE_ROLE_KEY" apps/web/.env.local; then
            sed -i.bak "s|SUPABASE_SERVICE_ROLE_KEY=.*|SUPABASE_SERVICE_ROLE_KEY=$NEW_SERVICE_KEY|" apps/web/.env.local
            echo -e "${GREEN}✓ Updated SUPABASE_SERVICE_ROLE_KEY in apps/web/.env.local${NC}"
        fi
    fi
    
    if [ "$ANON_KEY_CHANGED" = true ]; then
        if grep -q "NEXT_PUBLIC_SUPABASE_ANON_KEY" apps/web/.env.local; then
            sed -i.bak "s|NEXT_PUBLIC_SUPABASE_ANON_KEY=.*|NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEW_ANON_KEY|" apps/web/.env.local
            echo -e "${GREEN}✓ Updated NEXT_PUBLIC_SUPABASE_ANON_KEY in apps/web/.env.local${NC}"
        fi
    fi
    
    rm -f apps/web/.env.local.bak
fi

echo ""
echo -e "${BLUE}Step 4: Update Vercel Environment Variables (Optional)${NC}"
echo "-------------------------------------------------------"
echo ""

if [ "$VERCEL_AVAILABLE" = true ]; then
    read -p "Update Vercel environment variables? (y/n): " update_vercel
    
    if [ "$update_vercel" = "y" ]; then
        echo "Note: You'll need to set these manually in Vercel Dashboard:"
        echo ""
        
        if [ "$SERVICE_KEY_CHANGED" = true ]; then
            echo -e "${YELLOW}SUPABASE_SERVICE_ROLE_KEY${NC}"
            echo "Value: ${NEW_SERVICE_KEY:0:50}..."
            echo ""
        fi
        
        if [ "$ANON_KEY_CHANGED" = true ]; then
            echo -e "${YELLOW}NEXT_PUBLIC_SUPABASE_ANON_KEY${NC}"
            echo "Value: ${NEW_ANON_KEY:0:50}..."
            echo ""
        fi
        
        echo -e "${BLUE}To update via CLI:${NC}"
        echo "cd apps/web"
        if [ "$SERVICE_KEY_CHANGED" = true ]; then
            echo "vercel env add SUPABASE_SERVICE_ROLE_KEY production"
        fi
        if [ "$ANON_KEY_CHANGED" = true ]; then
            echo "vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production"
        fi
        echo ""
    fi
else
    echo -e "${YELLOW}Vercel CLI not available. Update manually at:${NC}"
    echo "https://vercel.com/landon-digitals-projects/acrely-web/settings/environment-variables"
fi

echo ""
echo -e "${BLUE}Step 5: Verification${NC}"
echo "--------------------"
echo ""

echo "Verifying Supabase secrets..."
supabase secrets list
echo ""

echo -e "${GREEN}✅ Secret Rotation Complete!${NC}"
echo ""
echo -e "${YELLOW}⚠️  Next Steps:${NC}"
echo "1. Test Edge Functions (especially send-sms and generate-receipt)"
echo "2. Test web app authentication"
echo "3. Redeploy Vercel after updating environment variables"
echo "4. Revoke old credentials in respective dashboards:"
echo "   - Supabase: Generate new Service Role Key and delete old one"
echo "   - Termii: Deactivate old API key"
echo ""
echo -e "${RED}⚠️  IMPORTANT: Delete backup .env files after verification${NC}"
echo "   rm .env.local.backup.* apps/web/.env.local.backup.*"
echo ""
echo -e "${BLUE}📋 Rotation completed at: $(date)${NC}"
echo ""
