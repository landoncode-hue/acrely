# 🚀 Acrely Quick Reference Card

**Last Updated:** November 2025 | **Version:** 2.1.0

---

## 📱 Mobile Development

```bash
# Start dev server
pnpm dev:mobile

# Build commands
cd apps/mobile
pnpm build:preview           # Preview APK
pnpm build:production        # Production AAB
pnpm build:apk               # Local APK build
```

**Test on device:** Start server → Scan QR with Expo Go

---

## 🌐 Web Development

```bash
# Start dev server
pnpm --filter=@acrely/web run dev

# Build for production
pnpm --filter=@acrely/web run build

# Deploy
vercel --prod
```

**Access:** http://localhost:3001

---

## 🧪 E2E Testing

```bash
# Run all tests
pnpm test:e2e

# Specific suites
pnpm test:e2e:auth
pnpm test:e2e:critical
pnpm test:e2e:regression

# UI mode
pnpm test:e2e:ui

# View reports
pnpm test:e2e:report

# Reset test DB
./scripts/reset-test-schema.sh
```

---

## 🔄 CI/CD

**Triggers:**
- Push to `main` → Production deployment
- Push to `develop` → Staging deployment
- Pull request → Preview build + tests

**Monitor:**
- GitHub: `https://github.com/[user]/[repo]/actions`
- Vercel: `https://vercel.com/[user]/[project]`
- Expo: `https://expo.dev/accounts/[account]/projects/acrely-mobile/builds`

---

## 📦 Build Artifacts

**Web:** Vercel deployment URL  
**Mobile:** Expo build download link  
**Tests:** `playwright-report/` directory

---

## 🔐 Required Secrets

**GitHub Actions:**
```
EXPO_TOKEN
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

**Setup Guide:** See `CI_CD_SETUP.md`

---

## 🐛 Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| Mobile build fails | `eas build:list` → Check logs |
| E2E tests timeout | Check dev server at :3001 |
| Vercel deploy fails | Verify secrets, try `vercel --debug` |
| Auth not working | Check Supabase URL/keys |

---

## 📚 Documentation

- **Mobile Guide:** `MOBILE_BUILD_DEPLOYMENT_GUIDE.md`
- **CI/CD Setup:** `CI_CD_SETUP.md`
- **Completion Report:** `SUPERQUEST_3_COMPLETION_REPORT.md`

---

## ⚡ Emergency Commands

```bash
# Clean rebuild
pnpm clean
pnpm install

# Reset everything
rm -rf node_modules apps/*/node_modules packages/*/node_modules
pnpm install --frozen-lockfile

# Check project health
pnpm verify:runtime
```

---

**Need Help?** Check the full guides in the repository root.
