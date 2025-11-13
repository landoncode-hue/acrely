#!/bin/bash
# Script to update Vercel project root directory via API
set -e

# Get Vercel token
VERCEL_TOKEN=$(vercel whoami --token 2>/dev/null || echo "")

if [ -z "$VERCEL_TOKEN" ]; then
  echo "Getting Vercel token..."
  VERCEL_TOKEN=$(cat ~/.vercel/auth.json | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
fi

PROJECT_ID="prj_XLWZyyXR0qPwK6l8VP4B86ETaVhu"
TEAM_ID="team_rCC4DeP3VKAU2jXtNx24WvsV"

echo "Updating project root directory to apps/web..."

curl -X PATCH \
  "https://api.vercel.com/v9/projects/$PROJECT_ID?teamId=$TEAM_ID" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "rootDirectory": "apps/web",
    "framework": "nextjs",
    "buildCommand": "pnpm run build",
    "installCommand": "pnpm install",
    "devCommand": "pnpm run dev"
  }'

echo ""
echo "✅ Project settings updated!"
