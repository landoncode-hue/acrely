# 🚀 Acrely Mobile - Quick Start Guide

## ⚡ Quick Start (5 Minutes)

### 1. Navigate to Mobile App
```bash
cd apps/mobile
```

### 2. Set Environment Variables
```bash
# Copy example file
cp .env.example .env

# Edit .env with your credentials
nano .env
```

**Required Variables:**
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_COMPANY_NAME=Pinnacle Builders Homes & Properties
```

### 3. Install Dependencies (Already Done)
```bash
# Dependencies are already installed
# If you need to reinstall:
pnpm install
```

### 4. Start Development Server
```bash
pnpm start
```

**You should see:**
```
› Metro waiting on exp://192.168.x.x:8081
› Scan the QR code with Expo Go (Android) or Camera app (iOS)

› Press a │ open Android
› Press i │ open iOS simulator
› Press w │ open web

› Press r │ reload app
› Press m │ toggle menu
› Press ? │ show all commands
```

### 5. Run on Simulator

**iOS (Mac only):**
```bash
# Press 'i' in terminal
# OR
pnpm ios
```

**Android:**
```bash
# Press 'a' in terminal
# OR
pnpm android
```

**Web:**
```bash
# Press 'w' in terminal
# OR
pnpm web
```

---

## 📱 Test the App

### Login Credentials
Use existing Supabase users with roles:
- **Agent**: Any user with `role = 'Agent'`
- **Frontdesk**: Any user with `role = 'Frontdesk'`
- **SysAdmin**: Any user with `role = 'SysAdmin'`

### Test Flow
1. **Login** → Enter email and password
2. **Dashboard** → View stats and quick actions
3. **Customers** → Browse and search customers
4. **Record Payment** → Tap "Record Payment" button
   - Select customer allocation
   - Enter amount
   - Add payment reference
   - Submit
5. **View Receipts** → Navigate to Receipts tab
   - View generated receipt
   - Share receipt

---

## 🔧 Development Commands

```bash
# Start dev server
pnpm start

# Start with cache clearing
pnpm start --clear

# Run on iOS
pnpm ios

# Run on Android
pnpm android

# Run on web
pnpm web
```

---

## 📦 Build Commands

```bash
# Build Android APK
pnpm build:android

# Build iOS (simulator)
pnpm build:ios

# Build both platforms
pnpm build:all
```

---

## 🐛 Common Issues

### Issue: "Metro bundler not starting"
```bash
# Clear cache and restart
pnpm start --clear
```

### Issue: "Environment variables not loading"
```bash
# Ensure .env exists
ls -la .env

# Restart dev server
# Kill terminal and run pnpm start again
```

### Issue: "Supabase connection failed"
- Verify `EXPO_PUBLIC_SUPABASE_URL` is correct
- Verify `EXPO_PUBLIC_SUPABASE_ANON_KEY` is correct
- Check internet connection
- Ensure Supabase project is active

### Issue: "iOS build fails"
```bash
# Install CocoaPods
cd ios
pod install
cd ..
pnpm ios
```

---

## 📂 Project Structure

```
apps/mobile/
├── app/                    # Routes (Expo Router)
│   ├── _layout.tsx        # Root layout
│   ├── auth/              # Login routes
│   ├── (tabs)/            # Tab navigation
│   └── payments/          # Payment routes
├── screens/               # Screen components
│   ├── auth/             # Login, Loading
│   ├── dashboard/        # Dashboard
│   ├── customers/        # Customer management
│   ├── payments/         # Payment recording
│   └── receipts/         # Receipt viewing
├── components/           # Reusable components
├── contexts/             # React contexts
├── hooks/                # Custom hooks
├── lib/                  # Config & utilities
│   ├── supabase.ts      # Supabase client
│   └── theme.ts         # Landon UI v3
├── .env                  # Environment variables
├── app.config.js         # Expo config
├── eas.json              # EAS Build config
└── package.json          # Dependencies
```

---

## ✅ Testing Checklist

- [ ] App starts without errors
- [ ] Login works with valid credentials
- [ ] Dashboard displays correct stats
- [ ] Customer list loads
- [ ] Search filters customers
- [ ] Customer details show allocations
- [ ] Payment form validates input
- [ ] Payment submits successfully
- [ ] Receipt generates automatically
- [ ] Receipt list displays
- [ ] Receipt opens in browser
- [ ] Share receipt works
- [ ] Logout clears session

---

## 🎯 Key Features

✅ **Authentication** - Secure login with role checks  
✅ **Dashboard** - Real-time stats and quick actions  
✅ **Customers** - View and search customer data  
✅ **Payments** - Record payments with validation  
✅ **Receipts** - Auto-generate and share receipts  
✅ **Offline** - Session persistence  
✅ **Theme** - Landon UI v3 design system  

---

## 📞 Need Help?

**Documentation:**
- Full guide: `apps/mobile/README.md`
- Implementation details: `MOBILE_APP_COMPLETE.md`

**Common Commands:**
```bash
# Clear Metro cache
pnpm start --clear

# Check TypeScript errors
npx tsc --noEmit

# Check Expo config
npx expo config

# View Expo diagnostics
npx expo-doctor
```

---

## 🚀 Next Steps

1. ✅ Test app on simulator
2. ⏭️ Test on physical device (Expo Go app)
3. ⏭️ Build preview APK/IPA
4. ⏭️ Share with Pinnacle field agents
5. ⏭️ Collect feedback
6. ⏭️ Deploy to TestFlight/Play Store

---

**Quest**: acrely-v2-mobile-app  
**Status**: ✅ Complete  
**Version**: 2.1.0

**Author**: Kennedy — Landon Digital
