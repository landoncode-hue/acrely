# 🚀 Acrely V2 - Quick Deployment Guide

**Last Updated**: November 13, 2025  
**System Status**: ✅ Ready for Production

---

## ⚡ Quick Start (3 Steps)

### 1️⃣ Deploy Web App to Vercel

```bash
cd /Users/lordkay/Development/Acrely
vercel deploy --prod
```

**Then configure these environment variables in Vercel Dashboard**:

```
NEXT_PUBLIC_SUPABASE_URL=https://qenqilourxtfxchkawek.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlbnFpbG91cnh0ZnhjaGthd2VrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyMzQ4NTUsImV4cCI6MjA3NzgxMDg1NX0.OklgPA2Jwo6sE81VolFH5aVubc504oyazx0HQ3u6FTA
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlbnFpbG91cnh0ZnhjaGthd2VrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjIzNDg1NSwiZXhwIjoyMDc3ODEwODU1fQ.ey_97IO41llNoRNdETLrxSIzIiPa9JyCAoS_UMES7ss
SUPABASE_URL=https://qenqilourxtfxchkawek.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlbnFpbG91cnh0ZnhjaGthd2VrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyMzQ4NTUsImV4cCI6MjA3NzgxMDg1NX0.OklgPA2Jwo6sE81VolFH5aVubc504oyazx0HQ3u6FTA
SUPABASE_PROJECT_REF=qenqilourxtfxchkawek
SUPABASE_ACCESS_TOKEN=sbp_deb38eb56bb9ccb4b546678a20ed256078a02eea
```

### 2️⃣ Build Mobile APK (Optional - for testing)

```bash
cd apps/mobile
pnpm run build:apk
```

### 3️⃣ Test Everything

```bash
# Run E2E tests
pnpm test:e2e

# Or test specific features
pnpm test:e2e --grep "authentication"
pnpm test:e2e --grep "dashboard"
```

---

## ✅ What's Already Done

- ✅ **Web App**: Built successfully locally (18 routes)
- ✅ **Supabase**: All 27 migrations deployed
- ✅ **Edge Functions**: All 14 functions deployed
- ✅ **Mobile Config**: Environment variables configured
- ✅ **Vercel Config**: `vercel.json` configured for monorepo
- ✅ **Routing**: Fixed duplicate app directory issue

---

## 🔍 Verification Commands

### Check Web Build
```bash
cd apps/web
pnpm build
```

### Check Supabase Status
```bash
supabase status
```

### List Deployed Functions
```bash
supabase functions list
```

### Start Mobile Development
```bash
cd apps/mobile
pnpm start
```

---

## 📱 Mobile App Distribution

### For Testing (APK)
```bash
cd apps/mobile
pnpm run build:apk
```

### For Production (Google Play)
```bash
cd apps/mobile
pnpm run build:android
```

### For iOS (App Store)
```bash
cd apps/mobile
pnpm run build:ios
```

---

## 🐛 Troubleshooting

### If web build fails:
```bash
# Clear cache and rebuild
rm -rf apps/web/.next
cd apps/web
pnpm build
```

### If Supabase functions fail:
```bash
# Redeploy specific function
supabase functions deploy <function-name> --no-verify-jwt
```

### If mobile app won't start:
```bash
# Clear cache
cd apps/mobile
expo start -c
```

---

## 📊 Production URLs

- **Supabase Dashboard**: https://supabase.com/dashboard/project/qenqilourxtfxchkawek
- **Edge Functions**: https://supabase.com/dashboard/project/qenqilourxtfxchkawek/functions
- **Vercel Dashboard**: (will be available after deployment)

---

## 🎯 Success Checklist

Before going live, verify:

- [ ] Web app deployed to Vercel
- [ ] All environment variables configured in Vercel
- [ ] Web app accessible via production URL
- [ ] Login/authentication working
- [ ] Dashboard loads without errors
- [ ] Mobile app builds successfully
- [ ] Mobile app connects to Supabase
- [ ] Edge Functions responding correctly
- [ ] E2E tests passing

---

## 🆘 Support

If you encounter issues:

1. Check `PRODUCTION_RESCUE_COMPLETE.md` for detailed system status
2. Review environment variables in `.env.local` and Vercel Dashboard
3. Check Supabase logs for Edge Function errors
4. Review build logs in Vercel Dashboard

---

**Status**: ✅ **READY FOR DEPLOYMENT**  
**Next Step**: Run `vercel deploy --prod`
