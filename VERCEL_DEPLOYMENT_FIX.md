# 🚨 Vercel Deployment - Manual Configuration Required

## Issue
The Acrely monorepo structure requires specific Vercel project settings that cannot be fully automated via CLI.

## Root Cause
- Monorepo with dependencies at root level (`/pnpm-workspace.yaml`)
- Next.js app located in `/apps/web`
- Vercel needs to know where to find the app AND have access to workspace dependencies

## ✅ Solution: Configure Vercel Project Settings

### Option 1: Vercel Dashboard (Recommended)

1. Go to: https://vercel.com/landon-digitals-projects/acrely-web/settings

2. **Build & Development Settings**:
   - Framework Preset: **Next.js**
   - Root Directory: **apps/web**
   - Build Command: Leave default or use: `pnpm build`
   - Output Directory: Leave default (`.next`)
   - Install Command: `pnpm install` (at root)

3. **Environment Variables** (add these):
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://qenqilourxtfxchkawek.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your_supabase_anon_key>
   SUPABASE_SERVICE_ROLE_KEY=<your_supabase_service_role_key>
   ```

4. Click **Save**

5. Trigger new deployment:
   - Push to `main` branch, OR
   - Click "Redeploy" in deployments tab

### Option 2: Using vercel.json (Alternative)

Update `/apps/web/vercel.json`:
```json
{
  "buildCommand": "cd ../.. && pnpm --filter=@acrely/web run build",
  "installCommand": "cd ../.. && pnpm install",
  "framework": "nextjs"
}
```

Then deploy from root:
```bash
cd /Users/lordkay/Development/Acrely
vercel --prod
```

### Option 3: Link Existing Project Correctly

```bash
cd /Users/lordkay/Development/Acrely
rm -rf .vercel apps/web/.vercel
vercel link
# Select existing project: acrely-web
# Set Root Directory when prompted: apps/web
vercel --prod
```

## 🎯 Expected Result

After proper configuration:
- ✅ Build should complete successfully
- ✅ All 18 routes should be accessible
- ✅ Production URL: https://acrely-web-landon-digitals-projects.vercel.app

## 📊 Current Status

- ✅ Local build: **SUCCESS** (18 routes)
- ✅ Supabase: **DEPLOYED** (migrations + functions)
- ⚠️ Vercel: **REQUIRES DASHBOARD CONFIGURATION**
- ✅ Mobile: **CONFIGURED** (ready for build)

## 🔗 Quick Links

- Project: https://vercel.com/landon-digitals-projects/acrely-web
- Settings: https://vercel.com/landon-digitals-projects/acrely-web/settings
- Deployments: https://vercel.com/landon-digitals-projects/acrely-web/deployments

## 📝 Notes

- Previous deployments failed due to incorrect root directory
- The app builds perfectly locally (verified)
- Issue is purely configuration, not code
- Once configured correctly, future deployments will work automatically

---

**Next Step**: Configure Root Directory = `apps/web` in Vercel Dashboard Settings
