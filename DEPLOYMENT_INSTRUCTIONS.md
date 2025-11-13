# 🚀 Acrely V2 Production Deployment - Final Steps

## ✅ What's Already Done

All CLI-based preparation steps have been completed successfully:

1. ✅ Vercel CLI authenticated (v48.9.0)
2. ✅ Project linked to `acrely-web`
3. ✅ All 9 environment variables configured for production
4. ✅ Build configuration tested and working
5. ✅ Local production build successful (14s)
6. ✅ All 16 routes generated correctly

## ⚠️ Current Blocker

**Issue**: Vercel project has `Root Directory = apps/web` in dashboard settings, causing deployment to fail.

**Error**: When deploying from repository root, Vercel tries to build from `apps/web/apps/web` (doubled path).

**Why CLI can't fix it**: The `Root Directory` setting is stored server-side and cannot be changed via `vercel.json` or CLI flags without API authentication tokens.

## 🔧 REQUIRED: Fix Vercel Dashboard Settings (5 minutes)

### Step 1: Access Project Settings
Navigate to: **https://vercel.com/landon-digitals-projects/acrely-web/settings**

### Step 2: Update Root Directory
1. Scroll to **"Root Directory"** section
2. **Current value**: `apps/web`
3. **Action**: Click "Edit" and **clear the field** (or enter `.`)
4. **Click "Save"**

### Step 3: Update Build & Development Settings
While in settings, verify/update these:

- **Framework Preset**: Next.js
- **Build Command**: `cd apps/web && pnpm run build`
- **Install Command**: `pnpm install --frozen-lockfile`
- **Output Directory**: `apps/web/.next`
- **Node.js Version**: 20.x

**Click "Save"** after making changes.

## 🎯 Deploy to Production

Once dashboard settings are fixed, run this command from the repository root:

```bash
cd /Users/lordkay/Development/Acrely
vercel --prod --yes
```

Expected output:
```
✅  Production: https://acrely-web-landon-digitals-projects.vercel.app
```

## 🧪 Verify Deployment

After successful deployment:

### 1. Check Deployment Status
```bash
vercel ls
```
Should show: `✓ Ready` (not `● Error`)

### 2. Test Production URL
```bash
curl -I https://acrely-web-landon-digitals-projects.vercel.app
```
Should return: `HTTP/2 200`

### 3. Test Application Routes
- Homepage: https://acrely-web-landon-digitals-projects.vercel.app/
- Dashboard: https://acrely-web-landon-digitals-projects.vercel.app/dashboard
- Login: Test authentication flow
- API Routes: Verify Supabase connection

### 4. Check Build Logs
```bash
vercel logs https://acrely-web-landon-digitals-projects.vercel.app
```

## 🔄 Alternative: Git-Based Deployment

If you prefer automatic deployments from Git:

### Option A: Push to Main Branch
```bash
git add .
git commit -m "Deploy to production"
git push origin main
```
Vercel will automatically deploy (once Root Directory is fixed).

### Option B: Manual Redeploy in Dashboard
1. Go to: https://vercel.com/landon-digitals-projects/acrely-web/deployments
2. Find the most recent commit
3. Click "Redeploy" button

## 📋 Post-Deployment Checklist

- [ ] Root Directory fixed in dashboard
- [ ] Deployment successful (status: Ready)
- [ ] Homepage loads correctly
- [ ] Dashboard accessible
- [ ] Authentication works
- [ ] Supabase connection verified
- [ ] All routes render properly
- [ ] No console errors in browser
- [ ] Environment variables working
- [ ] SMS notifications functional (if enabled)

## 🆘 Troubleshooting

### Problem: Still getting "Error" status

**Check**:
1. Ensure Root Directory is cleared (not `apps/web`)
2. Verify Build Command includes `cd apps/web &&`
3. Check deployment logs: `vercel logs <url>`

### Problem: Build fails with "Cannot find module"

**Fix**:
1. Ensure Install Command is: `pnpm install --frozen-lockfile`
2. Check that `pnpm-workspace.yaml` is in repository root
3. Verify all workspace dependencies in `apps/web/package.json`

### Problem: Environment variables not working

**Fix**:
```bash
# Verify variables are set
vercel env ls

# Add missing variable
echo "VALUE" | vercel env add VAR_NAME production
```

### Problem: Routes return 404

**Check**:
1. Output Directory is `apps/web/.next` (not just `.next`)
2. Build completed successfully
3. Next.js app.js/page.js files exist

## 📊 Deployment Architecture

```
Repository Root (/)
│
├── .vercel/
│   ├── project.json          # Project link
│   └── output/               # Local build output
│
├── apps/
│   └── web/                  # ← Root Directory should point HERE
│       ├── src/
│       ├── package.json
│       ├── next.config.mjs
│       └── .next/            # Build output
│
├── packages/                 # Shared packages
│   ├── ui/
│   ├── services/
│   └── utils/
│
└── pnpm-workspace.yaml       # Monorepo config
```

**Current Issue**: Vercel Root Directory = `apps/web` but deploying from `/`  
**Result**: Vercel looks for `apps/web/apps/web` (doesn't exist)  
**Solution**: Set Root Directory to `.` or empty

## 🎓 Key Learnings

1. **Vercel Monorepos**: Root Directory setting is critical and must match deployment context
2. **CLI Limitations**: Some settings (like Root Directory) can only be changed via dashboard or API with proper authentication
3. **Build vs Deploy**: Local builds work fine, but cloud deployments fail if Root Directory is misconfigured
4. **Environment Variables**: Successfully managed via CLI with `vercel env add`
5. **Workarounds Attempted**:
   - ❌ Symbolic links (`apps/web/apps -> .`)
   - ❌ Custom vercel.json configurations
   - ❌ Deploying from subdirectory
   - ❌ Pre-built deployments
   - ✅ Only solution: Fix dashboard settings

## 📞 Support

- **Vercel Dashboard**: https://vercel.com/landon-digitals-projects/acrely-web
- **Documentation**: https://vercel.com/docs/monorepos/turborepo
- **CLI Help**: `vercel help deploy`

---

**Status**: Ready for final deployment (dashboard update required)  
**Last Local Build**: Successful (November 13, 2025)  
**Environment**: Production variables configured  
**Next Action**: Update Vercel dashboard Root Directory setting
