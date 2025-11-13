#!/bin/bash
# Script to add environment variables to Vercel project
# Usage: ./scripts/add-vercel-env.sh

set -e

echo "🔧 Adding environment variables to Vercel project: acrely-web"
echo "============================================================"

# Read from .env.local
ENV_FILE="apps/web/.env.local"

if [ ! -f "$ENV_FILE" ]; then
  echo "❌ Error: $ENV_FILE not found"
  exit 1
fi

# Function to add or update env var
add_env_var() {
  local var_name=$1
  local var_value=$2
  local env_type=${3:-"production preview development"}
  
  if [ -z "$var_value" ]; then
    echo "⚠️  Skipping $var_name (empty value)"
    return
  fi
  
  echo "📝 Adding $var_name..."
  
  # Remove existing var if it exists (ignore errors)
  vercel env rm "$var_name" production -y 2>/dev/null || true
  vercel env rm "$var_name" preview -y 2>/dev/null || true
  vercel env rm "$var_name" development -y 2>/dev/null || true
  
  # Add the variable to all environments
  echo "$var_value" | vercel env add "$var_name" production -y
  echo "$var_value" | vercel env add "$var_name" preview -y
  echo "$var_value" | vercel env add "$var_name" development -y
}

# Extract values from .env.local
SUPABASE_URL=$(grep "^SUPABASE_URL=" "$ENV_FILE" | cut -d'=' -f2)
SUPABASE_ANON_KEY=$(grep "^SUPABASE_ANON_KEY=" "$ENV_FILE" | cut -d'=' -f2)
SUPABASE_SERVICE_ROLE_KEY=$(grep "^SUPABASE_SERVICE_ROLE_KEY=" "$ENV_FILE" | cut -d'=' -f2)
NEXT_PUBLIC_SUPABASE_URL=$(grep "^NEXT_PUBLIC_SUPABASE_URL=" "$ENV_FILE" | cut -d'=' -f2)
NEXT_PUBLIC_SUPABASE_ANON_KEY=$(grep "^NEXT_PUBLIC_SUPABASE_ANON_KEY=" "$ENV_FILE" | cut -d'=' -f2)
TERMII_API_KEY=$(grep "^TERMII_API_KEY=" "$ENV_FILE" | cut -d'=' -f2)
TERMII_SENDER_ID=$(grep "^TERMII_SENDER_ID=" "$ENV_FILE" | cut -d'=' -f2)
TERMII_API_URL=$(grep "^TERMII_API_URL=" "$ENV_FILE" | cut -d'=' -f2)
COMPANY_NAME=$(grep "^COMPANY_NAME=" "$ENV_FILE" | cut -d'=' -f2)
COMPANY_EMAIL=$(grep "^COMPANY_EMAIL=" "$ENV_FILE" | cut -d'=' -f2)
COMPANY_PHONE=$(grep "^COMPANY_PHONE=" "$ENV_FILE" | cut -d'=' -f2)
COMPANY_ADDRESS=$(grep "^COMPANY_ADDRESS=" "$ENV_FILE" | cut -d'=' -f2)
COMPANY_SLOGAN=$(grep "^COMPANY_SLOGAN=" "$ENV_FILE" | cut -d'=' -f2)
SITE_URL=$(grep "^SITE_URL=" "$ENV_FILE" | cut -d'=' -f2)
APP_NAME=$(grep "^APP_NAME=" "$ENV_FILE" | cut -d'=' -f2)
RECEIPT_BUCKET=$(grep "^RECEIPT_BUCKET=" "$ENV_FILE" | cut -d'=' -f2)
DOCUMENTS_BUCKET=$(grep "^DOCUMENTS_BUCKET=" "$ENV_FILE" | cut -d'=' -f2)

# Add all required environment variables
echo ""
echo "Adding Supabase variables..."
add_env_var "SUPABASE_URL" "$SUPABASE_URL"
add_env_var "SUPABASE_ANON_KEY" "$SUPABASE_ANON_KEY"
add_env_var "SUPABASE_SERVICE_ROLE_KEY" "$SUPABASE_SERVICE_ROLE_KEY"
add_env_var "NEXT_PUBLIC_SUPABASE_URL" "$NEXT_PUBLIC_SUPABASE_URL"
add_env_var "NEXT_PUBLIC_SUPABASE_ANON_KEY" "$NEXT_PUBLIC_SUPABASE_ANON_KEY"

echo ""
echo "Adding Termii variables..."
add_env_var "TERMII_API_KEY" "$TERMII_API_KEY"
add_env_var "TERMII_SENDER_ID" "$TERMII_SENDER_ID"
add_env_var "TERMII_API_URL" "$TERMII_API_URL"

echo ""
echo "Adding company information..."
add_env_var "COMPANY_NAME" "$COMPANY_NAME"
add_env_var "COMPANY_EMAIL" "$COMPANY_EMAIL"
add_env_var "COMPANY_PHONE" "$COMPANY_PHONE"
add_env_var "COMPANY_ADDRESS" "$COMPANY_ADDRESS"
add_env_var "COMPANY_SLOGAN" "$COMPANY_SLOGAN"

echo ""
echo "Adding application configuration..."
add_env_var "SITE_URL" "$SITE_URL"
add_env_var "APP_NAME" "$APP_NAME"
add_env_var "RECEIPT_BUCKET" "$RECEIPT_BUCKET"
add_env_var "DOCUMENTS_BUCKET" "$DOCUMENTS_BUCKET"

echo ""
echo "✅ All environment variables added successfully!"
echo "============================================================"
echo ""
echo "📋 To verify, run: vercel env ls"
