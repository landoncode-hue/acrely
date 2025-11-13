# 🚀 Acrely V2 - Quick Deploy Guide

## ⚡ 30-Second Deployment

### Step 1: Fix Dashboard (ONE TIME ONLY)
Visit: **https://vercel.com/landon-digitals-projects/acrely-web/settings**

- Find "Root Directory" → Click "Edit"
- **CLEAR the field** (change from `apps/web` to empty or `.`)
- Click **Save**

### Step 2: Deploy
```bash
cd /Users/lordkay/Development/Acrely
vercel --prod --yes
```

### Step 3: Verify
```bash
curl -I https://acrely-web-landon-digitals-projects.vercel.app
```

Expected: `HTTP/2 200`

---

## ✅ Pre-Deployment Checklist

- [x] Vercel CLI installed (v48.9.0)
- [x] Authenticated as landoncode-hue
- [x] Project linked to acrely-web
- [x] 9 environment variables configured
- [x] Local build tested and working
- [ ] Dashboard Root Directory fixed
- [ ] Production deployment successful

---

## 🔍 Quick Commands

```bash
# Check deployment status
vercel ls

# View environment variables
vercel env ls

# Test local build
pnpm --filter=@acrely/web run build

# Deploy to production
vercel --prod --yes

# View deployment logs
vercel logs <deployment-url>

# Inspect deployment
vercel inspect <deployment-url>
```

---

## 📊 Current Status

**Ready to Deploy**: ✅ YES (after dashboard fix)

**Build Time**: ~8-14 seconds  
**Routes**: 16 (12 static, 4 dynamic)  
**Environment**: Production configured  
**Blocker**: Dashboard Root Directory setting

---

## 🆘 Need Help?

See detailed docs:
- `DEPLOYMENT_INSTRUCTIONS.md` - Full guide
- `VERCEL_CLI_DEPLOYMENT_SUMMARY.md` - Technical summary  
- `VERCEL_DEPLOYMENT_COMPLETE.md` - Complete report

Run automated guide:
```bash
./scripts/complete-deployment.sh
```

---

**Last Updated**: November 13, 2025  
**Status**: 95% Complete - Ready for final step
