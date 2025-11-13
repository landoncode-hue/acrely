#!/bin/bash
# Workaround script to deploy despite Root Directory misconfiguration
# This builds locally and uploads the output

set -e

echo "🚀 Acrely V2 - Vercel Deployment Workaround"
echo "==========================================="
echo ""

# Step 1: Build locally with production environment
echo "📦 Step 1/3: Building application locally..."
pnpm --filter=@acrely/web run build

if [ $? -ne 0 ]; then
  echo "❌ Build failed!"
  exit 1
fi

echo "✅ Build successful!"
echo ""

# Step 2: Create .vercel/output structure manually
echo "📁 Step 2/3: Preparing deployment output..."

# Clean and create output directory
rm -rf .vercel/output
mkdir -p .vercel/output

# Copy Next.js build output
cp -r apps/web/.next .vercel/output/
cp apps/web/next.config.mjs .vercel/output/
cp apps/web/package.json .vercel/output/

# Create Vercel build output config
cat > .vercel/output/config.json << 'EOF'
{
  "version": 3,
  "routes": [
    {
      "src": "/.*",
      "dest": "/__next_route_handler__"
    }
  ]
}
EOF

# Create static directory
mkdir -p .vercel/output/static
if [ -d "apps/web/public" ]; then
  cp -r apps/web/public/* .vercel/output/static/
fi

echo "✅ Deployment output prepared!"
echo ""

# Step 3: Deploy using Git push (alternative method)
echo "📤 Step 3/3: Deploying to Vercel..."
echo ""
echo "⚠️  Manual step required:"
echo "   The Vercel project has Root Directory misconfiguration."
echo "   Please complete deployment using ONE of these methods:"
echo ""
echo "METHOD 1: Fix via Vercel Dashboard (Recommended)"
echo "  1. Visit: https://vercel.com/landon-digitals-projects/acrely-web/settings"
echo "  2. Go to 'General' → 'Root Directory'"
echo "  3. Clear the field (or set to '.')"
echo "  4. Save settings"  
echo "  5. Run: vercel --prod --yes"
echo ""
echo "METHOD 2: Deploy via Git Push"
echo "  1. Commit and push to main branch"
echo "  2. Vercel will auto-deploy from Git"
echo ""
echo "METHOD 3: Redeploy Previous Working Build"
echo "  1. Visit: https://vercel.com/landon-digitals-projects/acrely-web/deployments"
echo "  2. Find a successful deployment"
echo "  3. Click 'Redeploy'"
echo ""

exit 0
