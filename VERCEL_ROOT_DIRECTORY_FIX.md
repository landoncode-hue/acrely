# Vercel Root Directory Fix - Complete Guide

## 🎯 Problem Identified
Vercel deployment fails with error:
```
Error: No Next.js version detected. Make sure your package.json has "next" in either "dependencies" or "devDependencies". Also check your Root Directory setting matches the directory of your package.json file.
```

**Root Cause**: Vercel's Root Directory dashboard setting is incorrectly configured, preventing it from detecting the Next.js app in the monorepo structure.

## ✅ Completed Steps

### Phase 1: Purged Incorrect Vercel Links ✓
- Removed `.vercel` folder from project root
- Removed `.vercel` folder from `apps/web`
- Clean state achieved

### Phase 2: Re-linked Correct Project ✓
- Linked to correct project: `acrely-web`
- Project ID: `prj_XLWZyyXR0qPwK6l8VP4B86ETaVhu`
- Team: `landon-digitals-projects`
- Link file location: `apps/web/.vercel/project.json`

### Phase 3: Configured Build Commands ✓
Updated configuration files:

**Root `vercel.json`**:
```json
{
  "buildCommand": "pnpm --filter=@acrely/web run build",
  "devCommand": "pnpm --filter=@acrely/web run dev",
  "installCommand": "pnpm install --frozen-lockfile",
  "outputDirectory": "apps/web/.next",
  "framework": "nextjs",
  "git": {
    "deploymentEnabled": {
      "main": true
    }
  }
}
```

**`apps/web/vercel.json`**:
```json
{
  "buildCommand": "cd ../.. && pnpm --filter=@acrely/web run build",
  "installCommand": "cd ../.. && pnpm install --frozen-lockfile",
  "framework": "nextjs",
  "outputDirectory": ".next",
  "git": {
    "deploymentEnabled": {
      "main": true
    }
  }
}
```

## 🔧 Required Manual Fix

### Option 1: Update via Vercel Dashboard (Recommended)

1. **Navigate to Project Settings**
   - Go to: https://vercel.com/landon-digitals-projects/acrely-web/settings
   - Click on "General" tab

2. **Update Root Directory**
   - Find "Root Directory" setting
   - **CRITICAL**: Either:
     - Clear the field completely (leave blank), OR
     - Set it to `.` (dot for repository root)
   - **DO NOT** set it to `apps/web` (this causes the current error)

3. **Verify Build Settings**
   - Build Command: `pnpm --filter=@acrely/web run build`
   - Install Command: `pnpm install --frozen-lockfile`
   - Output Directory: `apps/web/.next`
   - Framework Preset: Next.js

4. **Save Settings**
   - Click "Save" button
   - Settings will apply to next deployment

### Option 2: Update via API (Advanced)

If you have a Vercel API token:

```bash
# Set your Vercel token
export VERCEL_TOKEN="your_token_here"

# Run the fix script
node scripts/fix-vercel-root-dir.mjs
```

To create a token:
1. Go to: https://vercel.com/account/tokens
2. Click "Create Token"
3. Name it "Acrely Deployment"
4. Copy the token and use it above

## 🚀 Deploy After Fix

Once the Root Directory is corrected:

```bash
# Deploy from repository root
cd /Users/lordkay/Development/Acrely
vercel --prod --yes
```

Or deploy from apps/web:

```bash
# Deploy from apps/web
cd /Users/lordkay/Development/Acrely/apps/web
vercel --prod --yes
```

## ✨ Expected Success Output

```
Vercel CLI 48.9.0
🔍  Inspect: https://vercel.com/...
✅  Production: https://acrely-web-...vercel.app
⠦ Building
   ▲ Next.js 16.0.1 detected
   Creating an optimized production build ...
   ✓ Compiled successfully
   Generating static pages (16/16)
   ✓ Build completed
   ✓ Uploading Build Output
   ✓ Deployment ready
```

## 📋 Verification Checklist

After deployment succeeds:

- [ ] No "No Next.js version detected" error
- [ ] Build output shows "Next.js 16.0.1 detected"
- [ ] 16 routes generated successfully
- [ ] Production URL loads without 404
- [ ] Dashboard displays correctly
- [ ] All API routes accessible

## 🎓 Lessons Learned

From memory: **Vercel Root Directory Configuration Criticality**
> When deploying monorepos to Vercel, the Root Directory setting in project configuration is critical - if set incorrectly (e.g., to 'apps/web'), it can cause deployment failures due to path resolution issues, even when local builds succeed.

**Key Takeaways**:
1. For monorepos, deploy from repository root with Root Directory left blank or set to `.`
2. Use `pnpm --filter` syntax for build commands instead of `cd` commands
3. The `vercel.json` commands execute from the Root Directory context
4. Local builds succeeding ≠ Vercel builds succeeding (path context matters)

## 📞 Support Resources

- Vercel Monorepo Docs: https://vercel.com/docs/monorepos
- Project Settings: https://vercel.com/landon-digitals-projects/acrely-web/settings
- Vercel Support: https://vercel.com/help

---

**Status**: Manual dashboard configuration required to complete deployment
**Next Step**: Update Root Directory setting via Vercel Dashboard
**Estimated Time**: 2-3 minutes
