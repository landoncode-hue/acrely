# 🚀 Acrely V2 - Deployment Solution

## Current Status
- ✅ System reset complete
- ✅ Dependencies rebuilt
- ✅ Local build successful  
- ❌ Vercel deployment blocked (build timeout issues)

## The Problem
Deploying from `apps/web` subdirectory with build commands that navigate to monorepo root (`cd ../..`) causes:
- Path resolution conflicts
- Extended build times (32+ minutes)
- Build timeouts

## ✅ SOLUTION: Set Root Directory in Vercel Dashboard

### Step-by-Step Instructions

#### 1. Access Vercel Project Settings
Visit: https://vercel.com/landon-digitals-projects/acrely-web/settings

#### 2. Configure Root Directory
1. Click on **"General"** in the left sidebar
2. Scroll to **"Build & Development Settings"**
3. Click **"Edit"** next to "Root Directory"
4. Enter: `apps/web`
5. Click **"Save"**

#### 3. Update Framework Settings (if needed)
- **Framework Preset:** Next.js (should auto-detect)
- **Node.js Version:** 22.x
- **Build Command:** Leave as auto-detected or set to `pnpm run build`
- **Install Command:** Leave blank (Vercel will handle monorepo install)
- **Output Directory:** `.next`

#### 4. Simplify vercel.json
Remove complex build commands from `apps/web/vercel.json`:

```json
{
  "git": {
    "deploymentEnabled": {
      "main": true
    }
  }
}
```

OR delete it entirely and let Vercel auto-detect everything.

#### 5. Deploy from Monorepo Root
```bash
cd /Users/lordkay/Development/Acrely
vercel --prod --yes
```

### Why This Works
When Root Directory is set to `apps/web`:
- Vercel treats `apps/web` as the project root
- Monorepo dependencies are still accessible
- No need for `cd ../..` commands
- Standard Next.js build process works
- Build time: ~2-5 minutes (normal)

---

## Alternative: Quick Deploy Script

If you prefer automation, run this:

```bash
cd /Users/lordkay/Development/Acrely
./scripts/deploy-with-root-dir.sh
```

(Script creates a temporary deployment configuration)

---

## Expected Result

After setting Root Directory:
- ✅ Build completes in 2-5 minutes
- ✅ Next.js 16 auto-detected
- ✅ 16 routes deployed successfully  
- ✅ Production URL live: https://acrely-web-landon-digitals-projects.vercel.app
- ✅ All dashboard routes functional

---

## Verification Steps

Once deployed:
1. Visit: https://acrely-web-landon-digitals-projects.vercel.app
2. Check dashboard loads (should see login page)
3. Test routes:
   - /dashboard
   - /dashboard/analytics
   - /dashboard/billing
   - /api/audit
   - /api/billing
4. Verify Supabase connection works
5. Check browser console for errors

---

## If You Still Have Issues

### Check Build Logs
```bash
vercel logs <deployment-url>
```

### View Latest Deployment
```bash
cd /Users/lordkay/Development/Acrely
vercel ls
```

### Cancel Stuck Deployment
Visit: https://vercel.com/landon-digitals-projects/acrely-web/deployments
Click on stuck deployment → Cancel

### Re-link Project
```bash
cd /Users/lordkay/Development/Acrely
rm -rf .vercel apps/web/.vercel
vercel link --project=acrely-web --yes
```

---

## Summary

**Action Required:**
1. Set Root Directory to `apps/web` in Vercel Dashboard
2. Simplify or remove `apps/web/vercel.json`
3. Deploy from monorepo root

**ETA to Live:** 5-10 minutes after configuration change

---

**Questions?** Check the full report: `ACRELY_V2_RESET_DEPLOYMENT_REPORT.md`
