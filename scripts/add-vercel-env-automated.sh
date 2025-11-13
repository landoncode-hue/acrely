#!/bin/bash

# Acrely V2 - Add Environment Variables to Vercel
# This script adds all required environment variables to the acrely-web project

set -e

cd /Users/lordkay/Development/Acrely

echo "🔐 Adding environment variables to Vercel project: acrely-web"
echo ""

# Load environment variables from .env.local
if [ -f "apps/web/.env.local" ]; then
    source apps/web/.env.local
elif [ -f ".env.local" ]; then
    source .env.local
else
    echo "❌ Error: .env.local file not found"
    exit 1
fi

# Function to add environment variable
add_env() {
    local var_name=$1
    local var_value=$2
    
    echo "Adding $var_name..."
    echo "$var_value" | vercel env add "$var_name" production --yes 2>/dev/null || echo "  ⚠️  Already exists or failed"
    echo "$var_value" | vercel env add "$var_name" preview --yes 2>/dev/null || echo "  ⚠️  Already exists or failed"
    echo "$var_value" | vercel env add "$var_name" development --yes 2>/dev/null || echo "  ⚠️  Already exists or failed"
}

# Add required environment variables
echo "📋 Adding Supabase configuration..."
add_env "NEXT_PUBLIC_SUPABASE_URL" "$NEXT_PUBLIC_SUPABASE_URL"
add_env "NEXT_PUBLIC_SUPABASE_ANON_KEY" "$NEXT_PUBLIC_SUPABASE_ANON_KEY"

echo ""
echo "✅ Environment variables added successfully!"
echo ""
echo "To verify, run: vercel env ls"
