#!/bin/bash

# Acrely V2 - Create Fresh Vercel Project
# This script creates a new Vercel project named 'acrely-web'

set -e

cd /Users/lordkay/Development/Acrely

echo "🚀 Creating fresh Vercel project: acrely-web"
echo ""
echo "When prompted, please answer:"
echo "  - Set up and deploy? → YES (y)"
echo "  - Which scope? → (select your team/personal account)"
echo "  - Link to existing project? → NO (n)"
echo "  - What's your project's name? → acrely-web"
echo "  - In which directory is your code located? → ./ (press Enter)"
echo ""
echo "The settings from vercel.json will be auto-detected:"
echo "  - Build Command: pnpm --filter=@acrely/web run build"
echo "  - Install Command: pnpm install --frozen-lockfile"
echo "  - Output Directory: apps/web/.next"
echo "  - Framework: Next.js"
echo ""
echo "Press Enter to continue..."
read

vercel
