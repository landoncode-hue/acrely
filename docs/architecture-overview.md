# Acrely v2 - Architecture Overview

## System Architecture

Acrely is a modern, full-stack real estate management platform built for Pinnacle Builders Homes & Properties. The system follows a monorepo architecture with clear separation of concerns between frontend, backend, and shared packages.

### Technology Stack

#### Frontend
- **Web Application**: Next.js 15.1.4 (React 19)
- **Mobile Application**: React Native (Expo)
- **UI Framework**: Tailwind CSS
- **State Management**: React Hooks & Context API
- **Animation**: Framer Motion
- **Charts**: Recharts
- **Forms**: React Hook Form (recommended)
- **Notifications**: React Hot Toast

#### Backend
- **Platform**: Supabase (PostgreSQL + Edge Functions)
- **Database**: PostgreSQL 15+
- **Edge Functions**: Deno runtime
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Realtime**: Supabase Realtime (WebSockets)

#### Infrastructure
- **Monorepo**: Turborepo
- **Package Manager**: pnpm
- **CI/CD**: GitHub Actions
- **Hosting (Web)**: Hostinger (acrely.pinnaclegroups.ng)
- **Hosting (Mobile)**: Expo EAS
- **Backend**: Supabase Cloud

### Architecture Layers

```
┌─────────────────────────────────────────────────────────┐
│                    Client Layer                         │
│  ┌──────────────────┐    ┌──────────────────┐          │
│  │   Web App        │    │   Mobile App     │          │
│  │   (Next.js)      │    │   (React Native) │          │
│  └──────────────────┘    └──────────────────┘          │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                  Shared Packages                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐ │
│  │ Services │  │    UI    │  │  Utils   │  │ Config │ │
│  └──────────┘  └──────────┘  └──────────┘  └────────┘ │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│              Backend Layer (Supabase)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  Database    │  │ Edge Functions│ │   Storage    │ │
│  │ (PostgreSQL) │  │    (Deno)     │ │  (S3-like)   │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│  ┌──────────────┐  ┌──────────────┐                   │
│  │     Auth     │  │   Realtime   │                   │
│  │  (GoTrue)    │  │ (WebSockets) │                   │
│  └──────────────┘  └──────────────┘                   │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│              External Services                          │
│  ┌──────────────┐  ┌──────────────┐                   │
│  │   Termii     │  │   pg_cron    │                   │
│  │  (SMS API)   │  │  (Scheduler) │                   │
│  └──────────────┘  └──────────────┘                   │
└─────────────────────────────────────────────────────────┘
```

## Project Structure

```
/Users/lordkay/Development/Acrely/
├── apps/
│   ├── web/                    # Next.js web application
│   │   ├── src/
│   │   │   ├── app/           # App router pages
│   │   │   ├── components/    # React components
│   │   │   ├── hooks/         # Custom hooks
│   │   │   └── providers/     # Context providers
│   │   └── public/            # Static assets
│   └── mobile/                # React Native mobile app
│       ├── app/               # Expo router
│       ├── components/        # Mobile components
│       ├── screens/           # Screen components
│       ├── contexts/          # React contexts
│       └── hooks/             # Custom hooks
├── packages/
│   ├── services/              # Supabase client & API
│   ├── ui/                    # Shared UI components
│   ├── utils/                 # Utility functions
│   └── config/                # Shared configurations
├── supabase/
│   ├── functions/             # Edge Functions (Deno)
│   │   ├── send-sms/
│   │   ├── generate-receipt/
│   │   ├── commission-calculation/
│   │   ├── check-overdue-payments/
│   │   ├── generate-billing-summary/
│   │   ├── predict-trends/
│   │   └── ...
│   ├── migrations/            # Database migrations
│   └── seed/                  # Seed data
├── scripts/                   # Deployment & utility scripts
├── tests/                     # Test suites
│   ├── e2e/                   # End-to-end tests
│   └── unit/                  # Unit tests
└── docs/                      # Documentation
```

## Core Modules

### 1. Authentication & Authorization
- **Implementation**: Supabase Auth with email/password
- **Roles**: CEO, MD, SysAdmin, Frontdesk, Agent
- **Row Level Security (RLS)**: Enforced on all tables
- **Email Domain Whitelist**: Only `@pinnaclegroups.ng` allowed

### 2. Customer Management
- Customer profiles with KYC information
- Next of kin details
- Customer history and activity tracking
- Audit trail for all customer changes

### 3. Estate & Plot Management
- Estate catalog (Adron, Pebble Court, etc.)
- Plot inventory with availability status
- Plot allocation tracking
- Plot reservation system

### 4. Allocation System
- Customer-to-plot allocation
- Payment plan configuration (Outright, Installment)
- Balance calculation
- Allocation status workflow

### 5. Payment Processing
- Payment recording with multiple methods
- Automatic receipt generation (PDF)
- SMS receipt delivery via Termii API
- Payment history and audit trail
- Overdue payment tracking

### 6. Commission Management
- Agent commission calculation
- Commission approval workflow
- Commission payment tracking
- Commission claims

### 7. Field Reports
- Mobile field report submission
- Photo upload support
- Location tracking
- Report approval workflow

### 8. Analytics & Reporting
- Business overview dashboard
- Revenue analytics
- Agent performance metrics
- Estate performance tracking
- Billing summaries
- Trend predictions

### 9. Audit System
- Comprehensive audit logging
- User activity tracking
- Data change history
- Security event monitoring

### 10. Training & Documentation
- Interactive onboarding tours
- Role-specific help center
- Video tutorials integration
- Feedback and support system

## Database Schema

### Core Tables

#### users
- Extends `auth.users`
- Stores user profile and role
- Links to all user actions

#### customers
- Customer master data
- KYC information
- Contact details

#### plots
- Plot inventory
- Estate association
- Pricing and availability

#### allocations
- Customer-plot assignments
- Payment plan configuration
- Balance tracking

#### payments
- Payment transactions
- Receipt generation
- Payment method tracking

#### commissions
- Agent commission records
- Approval workflow
- Payment status

#### field_reports
- Field activity reports
- Photo attachments
- Location data

#### user_feedback
- User feedback submissions
- Bug reports
- Feature requests

#### audit_logs
- System-wide audit trail
- User actions
- Data changes

### Analytics Views

- `billing_summary` - Monthly revenue aggregations
- `monthly_estate_performance` - Estate-level metrics
- `agent_performance_monthly` - Agent productivity
- `revenue_analytics` - Revenue trends

## Security

### Authentication
- Email/password with Supabase Auth
- Session management
- Password reset via admin

### Authorization
- Role-based access control (RBAC)
- Row Level Security (RLS) on all tables
- Function-level permissions

### Data Protection
- All sensitive data encrypted at rest
- HTTPS/TLS for data in transit
- Environment variables for secrets
- API key rotation policy

### Audit Trail
- All database changes logged
- User action tracking
- IP address logging
- Timestamp tracking

## Performance Optimization

### Database
- Strategic indexes on frequently queried columns
- Materialized views for analytics
- Connection pooling
- Query optimization

### Frontend
- Code splitting
- Lazy loading
- Image optimization
- Bundle size monitoring

### Caching
- Supabase realtime for live data
- Client-side caching with React Query (recommended)
- Edge caching for static assets

## Scalability

### Current Capacity
- Supports 1000+ concurrent users
- Handles 10,000+ transactions/day
- 99.9% uptime SLA (Supabase)

### Scaling Strategy
- Vertical scaling via Supabase plan upgrades
- Horizontal scaling via read replicas
- CDN for global distribution
- Background job processing via Edge Functions

## Monitoring & Observability

### Logging
- Application logs via console
- Edge Function logs in Supabase
- Audit logs in database

### Metrics
- System health checks (cron)
- Database performance metrics
- API response times
- Error rates

### Alerts
- SMS alerts for critical errors
- Email notifications for urgent issues
- In-app notifications for users

## Disaster Recovery

### Backup Strategy
- Daily automated database backups
- 7-day retention policy
- Stored in Supabase Storage
- Manual backup capability

### Recovery Procedures
- Point-in-time recovery available
- Backup restoration scripts
- Documented recovery process

## Development Workflow

### Local Development
```bash
# Install dependencies
pnpm install

# Run web app
cd apps/web
pnpm dev

# Run mobile app
cd apps/mobile
pnpm start

# Run Supabase locally
supabase start
```

### Testing
```bash
# Run unit tests
pnpm test

# Run E2E tests
pnpm test:e2e

# Run specific test
pnpm test:e2e tests/e2e/auth.spec.ts
```

### Deployment
```bash
# Deploy web app
./scripts/deploy-to-hostinger.sh

# Deploy database migrations
supabase db push

# Deploy Edge Functions
supabase functions deploy
```

## API Conventions

### REST Endpoints
- Base URL: `https://your-project.supabase.co/rest/v1`
- Authentication: Bearer token in header
- Response format: JSON

### Edge Functions
- Base URL: `https://your-project.supabase.co/functions/v1`
- Authentication: Bearer token or Service Role key
- Request/Response: JSON

### Realtime Subscriptions
- Protocol: WebSockets
- Channel format: `table:*` or `table:id=123`
- Events: INSERT, UPDATE, DELETE

## Error Handling

### Client-Side
- Try-catch blocks for async operations
- Toast notifications for user feedback
- Error boundaries for React components
- Graceful degradation

### Server-Side
- HTTP status codes
- Structured error responses
- Error logging
- Retry mechanisms

## Best Practices

### Code Quality
- TypeScript for type safety
- ESLint for linting
- Prettier for formatting
- Consistent naming conventions

### Git Workflow
- Feature branches
- Pull request reviews
- Squash and merge
- Semantic commit messages

### Documentation
- Inline code comments
- README files
- API documentation
- Architecture diagrams

---

**Version**: 2.5.0
**Last Updated**: 2025-01-19
**Maintained By**: Kennedy — Landon Digital
