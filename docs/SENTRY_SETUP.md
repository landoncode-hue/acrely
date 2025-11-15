# Sentry Configuration Guide for Acrely

## Installation

### Web Application
```bash
cd apps/web
pnpm add @sentry/nextjs
```

### Mobile Application
```bash
cd apps/mobile
pnpm add @sentry/react-native
```

## Configuration

### Web (apps/web/sentry.client.config.ts)
```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_APP_ENV || "development",
  
  // Performance Monitoring
  tracesSampleRate: 1.0,
  
  // Session Replay
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  
  // Error filtering
  beforeSend(event, hint) {
    // Don't send errors in development
    if (process.env.NEXT_PUBLIC_APP_ENV === "development") {
      return null;
    }
    return event;
  },
});
```

### Web Server (apps/web/sentry.server.config.ts)
```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_APP_ENV || "development",
  tracesSampleRate: 1.0,
});
```

### Mobile (apps/mobile/App.tsx)
```typescript
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  environment: process.env.EXPO_PUBLIC_APP_ENV || "development",
  tracesSampleRate: 1.0,
  enableAutoSessionTracking: true,
  sessionTrackingIntervalMillis: 30000,
});

// Wrap your App component
export default Sentry.wrap(App);
```

## Environment Variables

### Vercel (Web)
```env
NEXT_PUBLIC_SENTRY_DSN=https://YOUR_KEY@YOUR_ORG.ingest.sentry.io/YOUR_PROJECT
NEXT_PUBLIC_SENTRY_ORG=your-org-name
NEXT_PUBLIC_SENTRY_PROJECT=acrely-web
```

### EAS (Mobile)
Add to `apps/mobile/eas.json`:
```json
{
  "build": {
    "production": {
      "env": {
        "EXPO_PUBLIC_SENTRY_DSN": "https://YOUR_KEY@YOUR_ORG.ingest.sentry.io/YOUR_PROJECT"
      }
    }
  }
}
```

## Setup Steps

1. **Create Sentry Account**: https://sentry.io/signup/
2. **Create Projects**:
   - Project 1: acrely-web (Platform: Next.js)
   - Project 2: acrely-mobile (Platform: React Native)
3. **Get DSN**: From Project Settings > Client Keys (DSN)
4. **Add to Environment Variables**: Vercel and EAS
5. **Deploy**: Redeploy applications

## Verification

### Test Error Tracking
```typescript
// Trigger test error
throw new Error("Sentry test error");
```

### Check Sentry Dashboard
1. Go to Sentry dashboard
2. Navigate to Issues
3. Verify error appears within 1 minute

## Alert Configuration

### Critical Errors
1. Go to Alerts > Create Alert Rule
2. Condition: Error count > 10 in 5 minutes
3. Action: Send email to team@pinnaclegroups.ng

### Performance Degradation
1. Condition: Transaction duration > 2s
2. Frequency: > 100 occurrences in 1 hour
3. Action: Send notification

## Best Practices

- ✅ Enable in production only
- ✅ Filter sensitive data
- ✅ Set appropriate sample rates
- ✅ Configure alert thresholds
- ✅ Review errors daily
